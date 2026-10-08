import type { BookEntry, TallySettings } from "./booksData";
import { budgetCategories } from "./budgetCategories";

export interface TallyImportPreview { entries: BookEntry[]; issues: string[]; duplicates: number; vouchers: number }
const direct = (element: Element, tag: string) => Array.from(element.children).filter(child => child.tagName === tag);
const value = (element: Element, tag: string) => direct(element, tag)[0]?.textContent?.trim() ?? "";
const normalize = (text: string) => text.trim().toLowerCase();
function amountInPaise(text: string) {
  // Reject foreign currency expressions rather than silently changing their value.
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(text)) throw new Error("Unsupported amount; export plain INR amounts.");
  const result = Math.round(Number(text) * 100);
  if (!Number.isSafeInteger(result)) throw new Error("Amount is outside the supported range.");
  return result;
}
export function decodeTallyFile(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const encoding = bytes[0] === 0xff && bytes[1] === 0xfe || bytes[0] === 0x3c && bytes[1] === 0
    ? "utf-16le" : bytes[0] === 0xfe && bytes[1] === 0xff || bytes[0] === 0 && bytes[1] === 0x3c ? "utf-16be" : "utf-8";
  try { return new TextDecoder(encoding, { fatal: true }).decode(bytes); }
  catch { throw new Error("Unable to decode this export. Export the Day Book as UTF-8 or Unicode XML and try again."); }
}
function readTallyDocument(xml: string) {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error("XML document declarations are not supported. Use a standard Tally Day Book export.");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("This file is not valid XML. Export the Day Book as XML from Tally.");
  if (!doc.getElementsByTagName("VOUCHER").length) throw new Error("No vouchers found. Upload a Day Book XML export, not a report or masters file.");
  return doc;
}
export function inspectTallyFile(xml: string) {
  const doc = readTallyDocument(xml);
  const names = (tag: string) => [...new Set(Array.from(doc.getElementsByTagName(tag)).map(element => element.textContent?.trim() ?? "").filter(Boolean))];
  return {
    company: doc.querySelector("SVCURRENTCOMPANY")?.textContent?.trim() ?? "",
    ledgers: names("LEDGERNAME"), categories: names("CATEGORY"),
    centres: [...new Set(Array.from(doc.getElementsByTagName("COSTCENTREALLOCATIONS.LIST")).map(element => value(element, "NAME")).filter(Boolean))],
  };
}
export function parseTallyImport(xml: string, settings: TallySettings, projectId: string, existing: BookEntry[], openingIncluded: boolean): TallyImportPreview {
  if (!settings.company.trim() || !settings.costCentres[projectId]?.trim() || !settings.costCategory.trim()) throw new Error("Save your Tally company, cost category and project cost centre in Tally setup first.");
  const doc = readTallyDocument(xml);
  const company = doc.querySelector("SVCURRENTCOMPANY")?.textContent?.trim();
  if (company && normalize(company) !== normalize(settings.company)) throw new Error(`The file company (${company}) does not match your configured company.`);
  const vouchers = Array.from(doc.getElementsByTagName("VOUCHER"));
  if (!vouchers.length) throw new Error("No vouchers found. Upload a Day Book XML export, not a report or masters file.");
  const result: TallyImportPreview = { entries: [], issues: [], duplicates: 0, vouchers: vouchers.length };
  const processedVouchers = new Set<string>();
  const seen = new Set(existing.map(entry => entry.id));
  for (const voucher of vouchers) {
    const number = value(voucher, "VOUCHERNUMBER") || "Unnumbered voucher";
    try {
      if (normalize(value(voucher, "ISCANCELLED")) === "yes" || normalize(value(voucher, "ISOPTIONAL")) === "yes") throw new Error("Cancelled or optional voucher skipped.");
      if (normalize(value(voucher, "VOUCHERTYPENAME") || voucher.getAttribute("VCHTYPE") || "") !== "payment") throw new Error("Only Payment vouchers are supported by this paid-expenditure register.");
      const identity = value(voucher, "GUID") || value(voucher, "MASTERID") || voucher.getAttribute("REMOTEID");
      if (!identity) throw new Error("Missing stable voucher ID. Re-export with full voucher details.");
      if (processedVouchers.has(identity)) { result.duplicates++; continue; }
      const alreadyImported = existing.some(entry => entry.source === "tally" && normalize(entry.sourceCompany ?? "") === normalize(settings.company) && entry.sourceVoucherId === identity && normalize(entry.sourceCostCentre ?? "") === normalize(settings.costCentres[projectId]));
      if (alreadyImported) { result.duplicates++; continue; }
      const rawDate = value(voucher, "DATE");
      const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
      if (!/^\d{8}$/.test(rawDate) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || date < "2026-04-01" || date > "2027-03-31") throw new Error("Date is invalid or outside FY 2026–27.");
      const ledgers = [...direct(voucher, "ALLLEDGERENTRIES.LIST"), ...direct(voucher, "LEDGERENTRIES.LIST")];
      const groups = new Map<string, { head: BookEntry["head"]; amount: number }>();
      for (const ledger of ledgers) {
        const ledgerName = value(ledger, "LEDGERNAME");
        for (const category of direct(ledger, "CATEGORYALLOCATIONS.LIST")) {
          if (normalize(value(category, "CATEGORY")) !== normalize(settings.costCategory)) continue;
          const centres = direct(category, "COSTCENTREALLOCATIONS.LIST").filter(centre => normalize(value(centre, "NAME")) === normalize(settings.costCentres[projectId]));
          if (!centres.length) continue;
          const matches = budgetCategories.filter(head => normalize(settings.ledgers[head]) === normalize(ledgerName));
          if (matches.length !== 1) throw new Error(`Map expense ledger “${ledgerName}” to exactly one budget head in Tally setup.`);
          const ledgerAmount = amountInPaise(value(ledger, "AMOUNT"));
          if (ledgerAmount >= 0) throw new Error("Credit expense allocations require reconciliation and were skipped.");
          const amount = centres.reduce((sum, centre) => sum + amountInPaise(value(centre, "AMOUNT")), 0);
          if (amount >= 0 || Math.abs(amount) > Math.abs(ledgerAmount)) throw new Error("Invalid cost centre allocation amount.");
          const key = normalize(ledgerName);
          const previous = groups.get(key);
          groups.set(key, { head: matches[0], amount: (previous?.amount ?? 0) - amount });
        }
      }
      if (!groups.size) throw new Error("No mapped expense allocation for the selected project cost centre.");
      processedVouchers.add(identity);
      // Stage the whole voucher before accepting any of its lines.
      for (const [ledger, group] of groups) {
        const id = `tally:${JSON.stringify([normalize(settings.company), identity, normalize(settings.costCategory), normalize(settings.costCentres[projectId]), ledger])}`;
        if (seen.has(id) || existing.some(entry => entry.id === identity)) { result.duplicates++; continue; }
        seen.add(id);
        result.entries.push({ id, projectId, head: group.head, amount: group.amount / 100, date, payee: value(voucher, "PARTYLEDGERNAME") || ledger, reference: number, narration: value(voucher, "NARRATION") || "Imported from Tally", source: "tally", importedAt: new Date().toISOString(), sourceCompany: settings.company.trim(), sourceVoucherId: identity, sourceCostCentre: settings.costCentres[projectId].trim(), openingIncluded });
      }
    } catch (error) { result.issues.push(`${number}: ${error instanceof Error ? error.message : "Unable to read voucher."}`); }
  }
  return result;
}
