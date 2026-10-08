import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { money, type BookEntry, type TallySettings } from "./booksData";
import { budgetCategories } from "./budgetCategories";
import { decodeTallyFile, inspectTallyFile, parseTallyImport, type TallyImportPreview } from "./tallyImport";

interface Props {
  projectId: string;
  projectName: string;
  settings: TallySettings;
  entries: BookEntry[];
  onImport: (entries: BookEntry[]) => boolean;
  onSaveSettings: (settings: TallySettings) => boolean;
}
export function TallyImportPanel({ projectId, projectName, settings, entries, onImport, onSaveSettings }: Props) {
  const [draft, setDraft] = useState(settings);
  const [editing, setEditing] = useState(!settings.company.trim());
  const [options, setOptions] = useState<ReturnType<typeof inspectTallyFile> | null>(null);
  const [preview, setPreview] = useState<TallyImportPreview | null>(null);
  const [filename, setFilename] = useState("");
  const [xml, setXml] = useState("");
  const [openingIncluded, setOpeningIncluded] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const request = useRef(0);
  const inspect = (content: string, included: boolean, mapping = draft) => {
    setPreview(null); setError(""); setConfirmed(false);
    try { setPreview(parseTallyImport(content, mapping, projectId, entries, included)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to read file."); }
  };
  return <div className="books-form">
    <div className="books-import-route"><span>Tally company</span><strong>{settings.company || "Set up company first"}</strong><span>↓ {settings.costCentres[projectId] || "Map cost centre"}</span><strong>{projectName}</strong></div>
    <p>In Tally, export your Day Book for FY 2026–27 as XML (Data Interchange), including cost centre details and narrations. Upload the file to review paid expenditure for this project.</p>
    <a href="https://help.tallysolutions.com/import-data-faq/" target="_blank" rel="noreferrer">How to export your Tally Day Book ↗</a>
    <button className="books-button" onClick={() => { setEditing(true); setConfirmed(false); }}>Edit company and ledger mappings</button>
    {editing && <form className="books-inline-mapping" onSubmit={event => {
      event.preventDefault();
      if (!draft.company.trim() || !draft.costCategory.trim() || !draft.costCentres[projectId]?.trim()) { setError("Enter the company, cost category and project cost centre."); return; }
      const ledgers = budgetCategories.map(head => draft.ledgers[head].trim().toLowerCase()).filter(Boolean);
      if (new Set(ledgers).size !== ledgers.length) { setError("Map each expense ledger to only one budget head."); return; }
      if (!onSaveSettings(draft)) { setError("Could not save mappings in this browser."); return; }
      setEditing(false); setError(""); if (xml) inspect(xml, openingIncluded, draft);
    }}>
      <fieldset disabled={loading} className="books-inline-mapping-fields"><p>Upload your file to see the ledger and cost centre names it contains. Map the expense ledgers you use; other heads can be left blank.</p>
      <label className="books-field">Tally company<input required value={draft.company} onChange={event => setDraft({ ...draft, company: event.target.value })} /></label>
      <label className="books-field">Cost category<input required list="tally-categories" value={draft.costCategory} onChange={event => setDraft({ ...draft, costCategory: event.target.value })} /></label>
      <label className="books-field">Project cost centre<input required list="tally-centres" value={draft.costCentres[projectId] ?? ""} onChange={event => setDraft({ ...draft, costCentres: { ...draft.costCentres, [projectId]: event.target.value } })} /></label>
      {budgetCategories.map(head => <label key={head} className="books-field">{head}<input list="tally-ledgers" value={draft.ledgers[head]} onChange={event => setDraft({ ...draft, ledgers: { ...draft.ledgers, [head]: event.target.value } })} /></label>)}
      <datalist id="tally-categories">{options?.categories.map(name => <option key={name} value={name} />)}</datalist>
      <datalist id="tally-centres">{options?.centres.map(name => <option key={name} value={name} />)}</datalist>
      <datalist id="tally-ledgers">{options?.ledgers.map(name => <option key={name} value={name} />)}</datalist>
      <button className="books-button books-primary" type="submit">Save mappings and refresh preview</button></fieldset>
    </form>}
    <label className="books-upload"><Upload size={24} /><strong>Choose Tally XML file</strong><span>Day Book · XML · up to 10 MB</span><input type="file" accept=".xml,application/xml,text/xml" onChange={async event => {
      const current = ++request.current;
      const file = event.target.files?.[0];
      setPreview(null); setOptions(null); setXml(""); setError(""); setFilename(file?.name ?? ""); setConfirmed(false); setLoading(false);
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) { setError("Choose an XML file smaller than 10 MB. Export a shorter period if needed."); return; }
      setLoading(true);
      try { const content = decodeTallyFile(await file.arrayBuffer()); if (current !== request.current) return;
        const discovered = inspectTallyFile(content); setOptions(discovered); setXml(content);
        const mapping = { ...draft, company: draft.company || discovered.company };
        setDraft(mapping); inspect(content, openingIncluded, mapping);
        if (!settings.company || !discovered.centres.includes(mapping.costCentres[projectId])) setEditing(true); }
      catch (cause) { if (current === request.current) setError(cause instanceof Error ? cause.message : "The file could not be read. Please choose it again."); }
      finally { if (current === request.current) setLoading(false); }
    }} /></label>
    <label className="books-check"><input type="checkbox" checked={openingIncluded} disabled={loading} onChange={event => { setOpeningIncluded(event.target.checked); if (xml) inspect(xml, event.target.checked); }} /><span>These expenses are already included in the project's opening expenditure.<small>Keep checked when importing historical detail. Uncheck only for additional expenditure to reduce the available balance.</small></span></label>
    {loading && <p role="status">Reading vouchers…</p>}
    {error && <p role="alert">{error}</p>}
    {preview && !editing && <>
      <div className="books-import-summary"><strong>{preview.entries.length} expense lines ready · {money(preview.entries.reduce((sum, entry) => sum + entry.amount, 0))}</strong><p>{filename} · {preview.vouchers} vouchers scanned · {preview.duplicates} duplicates skipped · {preview.issues.length} vouchers excluded</p></div>
      {preview.entries.length > 0 && <div className="books-table-scroll books-import-preview"><table><thead><tr><th>Date / voucher</th><th>Budget head</th><th>Amount</th></tr></thead><tbody>{preview.entries.map(entry => <tr key={entry.id}><td>{entry.date}<small>{entry.reference}</small></td><td>{entry.head}</td><td>{money(entry.amount)}</td></tr>)}</tbody></table></div>}
      {!!preview.issues.length && <details><summary>Review excluded vouchers ({preview.issues.length})</summary><ul className="books-import-issues">{preview.issues.map((issue, index) => <li key={index}>{issue}</li>)}</ul></details>}
      {!preview.entries.length && <p>No new matching expenditure. Check the selected project, cost centre and ledger mappings, or review excluded vouchers.</p>}
      <label className="books-check"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /><span>I confirm this file is from {draft.company || "my configured company"} and I have reviewed the project mapping and opening-balance treatment.</span></label>
      <button className="books-button books-primary" disabled={!preview.entries.length || !confirmed || loading || editing} onClick={() => {
        // Re-parse at commit time so the saved entries match current duplicate checks.
        try { const latest = parseTallyImport(xml, draft, projectId, entries, openingIncluded); if (!latest.entries.length) { setError("No new entries remain to import."); return; } if (!onImport(latest.entries)) setError("Unable to save the import. Check browser storage and try again."); }
        catch (cause) { setError(cause instanceof Error ? cause.message : "Import failed."); }
      }}>Import {preview.entries.length} expense lines</button>
    </>}
    <p className="books-footnote">File import works without sharing your Tally password. Only Payment vouchers with mapped INR expense allocations are supported. Purchases, journals, credit adjustments and changed versions of previously imported vouchers require separate reconciliation. This is not a live account connection.</p>
  </div>;
}
