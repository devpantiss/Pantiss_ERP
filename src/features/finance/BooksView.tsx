import { useState, type FormEvent, type ReactNode } from "react";
import { BookOpen, Download, Plus, Settings2, ArrowUpRight, FileCheck2, Upload } from "lucide-react";
import { Overlay } from "../../components/ui/Overlay";
import { budgetCategories, allocationShares, type BudgetCategory } from "./budgetCategories";
import { booksProjects, money, tallyXml, booksCsv, downloadBookFile, type BookEntry, type TallySettings } from "./booksData";
import { financeAreas } from "./data";
import { TallyImportPanel } from "./TallyImportPanel";
import "./books.css";
import { loadBooks, storageKey, type BooksState } from "./booksStore";
import { useAuth } from "../../hooks/useAuth";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="books-field"><span>{label}</span>{children}</label>;
}

export function BooksView() {
  const { user } = useAuth();
  const auditEvent = (action: string, detail: string) => ({ id: crypto.randomUUID(), at: new Date().toISOString(), actor: user ? `${user.name} · ${user.roleLabel}` : "Local operator (identity unavailable)", action, detail });
  const [state, setState] = useState(loadBooks);
  const [areaId, setAreaId] = useState(financeAreas[0].id);
  const area = financeAreas.find(item => item.id === areaId)!;
  const [projectId, setProjectId] = useState(booksProjects[0].id);
  const [head, setHead] = useState("all");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("all");
  const [panel, setPanel] = useState<"entry" | "settings" | "import" | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(state.error ?? "");
  const project = booksProjects.find(p => p.id === projectId)!;
  const projectEntries = state.entries.filter(entry => entry.projectId === projectId);
  const added = projectEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const additional = projectEntries.filter(entry => !entry.openingIncluded).reduce((sum, entry) => sum + entry.amount, 0);
  const imported = projectEntries.filter(entry => entry.source === "tally");
  const approved = project.approved * 100000;
  const opening = project.spent * 100000;
  const committed = project.committed * 100000;
  const remaining = approved - opening - committed - additional;
  const visible = projectEntries.filter(entry => (head === "all" || entry.head === head) && (!from || entry.date >= from) && (!to || entry.date <= to) && (status === "all" || (status === "imported" ? entry.source === "tally" : status === "manual" ? entry.source !== "tally" : status === "exported" ? !!entry.exportedAt : !entry.exportedAt && entry.source !== "tally")) && `${entry.payee} ${entry.reference} ${entry.narration} ${entry.id}`.toLowerCase().includes(query.toLowerCase()));
  const pending = visible.filter(entry => !entry.exportedAt && entry.source !== "tally");
  const persist = (next: BooksState) => {
    if (state.error) { setError(state.error); return false; }
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setState(next); setError(""); return true; }
    catch { setError("Unable to save in this browser. Free up browser storage and try again."); return false; }
  };
  const resetFilters = () => { setHead("all"); setQuery(""); setFrom(""); setTo(""); setStatus("all"); setNotice(""); setError(""); };
  const importEntries = (entries: BookEntry[]) => {
    const ids = new Set(state.entries.map(entry => entry.id));
    const fresh = entries.filter(entry => !ids.has(entry.id)).map(entry => ({ ...entry, audit: [...(entry.audit ?? []), auditEvent("Imported from Tally", `${entry.sourceCompany ?? "Company not recorded"} · Voucher ${entry.sourceVoucherId ?? entry.reference} · ${entry.head} · ${money(entry.amount)} · ${entry.openingIncluded ? "Included in opening expenditure" : "Additional expenditure"}`)] }));
    if (!fresh.length) return false;
    if (!persist({ ...state, entries: [...fresh, ...state.entries] })) return false;
    resetFilters(); setPanel(null); setNotice(`${fresh.length} expense lines imported from Tally into ${project.name}.`); return true;
  };
  const open = (next: typeof panel) => { setError(""); setPanel(next); };
  const saveEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    const amount = Number(text("amount"));
    const date = text("date");
    const category = text("head") as BudgetCategory;
    if (!text("payee") || !text("reference") || !text("narration") || !budgetCategories.includes(category) || !Number.isFinite(amount) || amount <= 0 || Math.abs(amount * 100 - Math.round(amount * 100)) > .00001 || date < "2026-04-01" || date > "2027-03-31") { setError("Complete all fields with a valid FY 2026–27 date and a positive amount with up to two decimal places."); return; }
    if (amount > remaining) { setError("This payment exceeds the available project budget after commitments."); return; }
    const headPosted = projectEntries.filter(entry => entry.head === category).reduce((sum, entry) => sum + entry.amount, 0);
    if (headPosted + amount > approved * allocationShares[category]) { setError("This payment exceeds the approved allocation for this budget head."); return; }
    if (projectEntries.some(entry => entry.reference.toLowerCase() === text("reference").toLowerCase() && entry.payee.toLowerCase() === text("payee").toLowerCase())) { setError("This payee and reference already exist in this project's books."); return; }
    const entry: BookEntry = { id: `BK-${crypto.randomUUID()}`, projectId, head: category, amount: Math.round(amount * 100) / 100, date, payee: text("payee"), reference: text("reference"), narration: text("narration"), audit: [auditEvent("Expenditure recorded", `${category} · ${money(amount)} paid to ${text("payee")} · Reference ${text("reference")} · Payment date ${date} · ${text("narration")}`)] };
    if (persist({ ...state, entries: [entry, ...state.entries] })) { setPanel(null); setNotice("Expenditure recorded in this browser. Ready for Tally export."); }
  };
  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();
    if (["company", "costCategory", "centre"].some(name => !value(name))) { setError("Complete all company, ledger and cost centre mappings."); return; }
    if (new Set(budgetCategories.map(category => value(category).toLowerCase()).filter(Boolean)).size !== budgetCategories.filter(category => value(category)).length) { setError("Map each expense ledger to only one budget head."); return; }
    const settings: TallySettings = { company: value("company"), bankLedger: value("bankLedger"), costCategory: value("costCategory"), ledgers: Object.fromEntries(budgetCategories.map(category => [category, value(category)])) as TallySettings["ledgers"], costCentres: { ...state.settings.costCentres, [projectId]: value("centre") } };
    if (persist({ ...state, settings })) { setPanel(null); setNotice("Tally mappings saved. No live connection has been established."); }
  };
  const exportTally = () => {
    try {
      const xml = tallyXml(pending, state.settings);
      const timestamp = new Date().toISOString();
      // Persist export history before handing the file to the browser.
      if (!persist({ ...state, entries: state.entries.map(entry => pending.some(p => p.id === entry.id) ? { ...entry, exportedAt: timestamp, audit: [...(entry.audit ?? []), auditEvent("Tally export prepared", `${money(entry.amount)} · Company ${state.settings.company} · Expense ledger ${state.settings.ledgers[entry.head]} · Cost centre ${state.settings.costCentres[entry.projectId]} · Bank ${state.settings.bankLedger}. Export does not confirm posting in Tally.`)] } : entry) })) return;
      downloadBookFile(xml, `tally-${projectId}-${Date.now()}.xml`, "application/xml");
      setNotice(`${pending.length} payment voucher(s) exported. Import and verify them in Tally; export does not confirm posting.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Export failed."); }
  };
  return (
    <div className="books-workspace">
      <div className="books-heading"><div><p className="books-eyebrow">Project accounting</p><h2>Books</h2><p>Every expenditure, against the right project and budget.</p></div><div className="books-actions"><button className="books-button" onClick={() => open("settings")}><Settings2 size={16} />Tally setup</button><button className="books-button" onClick={() => open("entry")}><Plus size={16} />Record expenditure</button><button className="books-button books-primary" onClick={() => open("import")}><Upload size={16} />Import from Tally</button></div></div>
      <div className="books-scope"><Field label="Thematic area"><select value={areaId} onChange={event => { const selected = financeAreas.find(item => item.id === event.target.value)!; setAreaId(selected.id); setProjectId(selected.projects[0].id); resetFilters(); }}>{financeAreas.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Project"><select value={projectId} onChange={event => { setProjectId(event.target.value); resetFilters(); }}>{area.projects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><div><strong>{project.id}</strong><p>{project.donor} · {project.location}</p></div><span className="books-pill">FY 2026–27 · INR</span></div>
      <div className="books-metrics">{[["Approved budget", approved], ["Opening expenditure", opening], ["Books detail (incl. imports)", added], ["Available after commitments", remaining]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{money(Number(value))}</strong></div>)}</div>
      <div className="books-overview"><section className="books-card"><div className="books-section-heading"><div><h3>Budget allocation</h3><p>Approved allocation and recorded expenditure</p></div><BookOpen size={20} /></div><div className="books-budget-list">{budgetCategories.map(category => {
        const allocation = approved * allocationShares[category];
        const spent = projectEntries.filter(entry => entry.head === category).reduce((sum, entry) => sum + entry.amount, 0);
        return <button key={category} className="books-budget-row" aria-pressed={head === category} onClick={() => setHead(head === category ? "all" : category)}><span><strong>{category}</strong><small>{money(spent)} recorded <span aria-hidden="true">/</span> {money(allocation)} allocated</small></span><span className="books-track"><span style={{ width: `${Math.min(100, spent / allocation * 100)}%` }} /></span><ArrowUpRight size={15} /></button>;
      })}</div><p className="books-footnote">Budget-head totals include manual entries and imported Tally detail. Imports marked as opening detail do not reduce the project balance again. Commitments: {money(committed)}.</p></section>
      <section className="books-card books-integration"><div className="books-section-heading"><span className="books-integration-icon"><FileCheck2 size={24} /></span><span className="books-pill">XML exchange</span></div><h3>Bring your Tally books here</h3><p>Import project expenditure from your Tally company, organised by budget head.</p><dl><div><dt>Company</dt><dd>{state.settings.company || "Not configured"}</dd></div><div><dt>Connection</dt><dd>Manual import · no live sync</dd></div><div><dt>Imported to this project</dt><dd>{imported.length} expense lines</dd></div><div><dt>Last import</dt><dd>{imported[0]?.importedAt ? new Date(imported[0].importedAt).toLocaleDateString("en-IN") : "No imports yet"}</dd></div></dl><button className="books-button books-primary" onClick={() => open("import")}><Upload size={16} />Import from Tally</button><button className="books-text-button" disabled={!pending.length} onClick={exportTally}>Export {pending.length} new manual entries to Tally</button><button className="books-text-button" onClick={() => open("settings")}>Manage ledger mappings <ArrowUpRight size={14} /></button><p className="books-footnote">Upload a Day Book XML export, review matched vouchers, then import. Previously imported entries are skipped automatically.</p></section></div>
      {notice && <p className="books-notice" role="status">{notice}</p>}{error && !panel && <p className="books-notice" role="alert">{error}</p>}
      <section className="books-card books-register"><div className="books-section-heading"><div><h3>Expenditure register</h3><p>{visible.length} entries · {money(visible.reduce((sum, entry) => sum + entry.amount, 0))} in this view</p></div><button className="books-button" disabled={!visible.length} onClick={() => downloadBookFile(booksCsv(visible), `books-${projectId}.csv`, "text/csv;charset=utf-8")}><Download size={15} />Export CSV</button></div>
        <div className="books-filters"><Field label="Search"><input type="search" placeholder="Payee or reference…" value={query} onChange={event => setQuery(event.target.value)} /></Field><Field label="Budget head"><select value={head} onChange={event => setHead(event.target.value)}><option value="all">All budget heads</option>{budgetCategories.map(category => <option key={category}>{category}</option>)}</select></Field><Field label="From"><input type="date" value={from} max={to || undefined} onChange={event => setFrom(event.target.value)} /></Field><Field label="To"><input type="date" value={to} min={from || undefined} onChange={event => setTo(event.target.value)} /></Field><Field label="Source / Tally status"><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All entries</option><option value="imported">Imported from Tally</option><option value="manual">Manual entries</option><option value="pending">Not exported</option><option value="exported">Exported</option></select></Field></div>
        {visible.length ? <div className="books-table-scroll"><table><caption className="sr-only">Project expenditure in Indian rupees</caption><thead><tr>{["Date / reference", "Payee / narration", "Budget head", "Amount", "Tally"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{visible.map(entry => <tr key={entry.id}><td>{entry.date}<small>{entry.reference}</small></td><td><strong>{entry.payee}</strong><small>{entry.narration}</small></td><td>{entry.head}</td><td className="books-amount">{money(entry.amount)}</td><td><span className="books-pill">{entry.source === "tally" ? "Tally import" : entry.exportedAt ? "Exported" : "Manual"}</span>{entry.source === "tally" && <small>{entry.sourceCompany}<br />{entry.openingIncluded ? "Opening detail" : "Additional expense"}</small>}{entry.exportedAt && entry.source !== "tally" && <button className="books-text-button" onClick={() => { try { downloadBookFile(tallyXml([entry], state.settings), `${entry.id}.xml`, "application/xml"); setNotice("Voucher downloaded again. Verify the original import before importing a second time."); } catch (cause) { setError(String(cause)); } }}>Download again</button>}</td></tr>)}</tbody></table></div> : <div className="books-empty"><BookOpen size={28} /><h4>{projectEntries.length ? "No matching expenditure" : "Start this project's register"}</h4><p>{projectEntries.length ? "Adjust your filters to find an entry." : "Import expenditure from Tally or record a paid expense."}</p><button className="books-button" onClick={() => { if (projectEntries.length) { setQuery(""); setHead("all"); setFrom(""); setTo(""); setStatus("all"); } else open("import"); }}>{projectEntries.length ? "Clear filters" : "Import from Tally"}</button></div>}
      </section><p className="books-footnote">Local workspace · Books entries and mappings are saved in this browser. Existing finance figures are demo data; new entries update this Books view only.</p>
      <Overlay open={panel !== null} onClose={() => setPanel(null)} title={panel === "entry" ? "Record expenditure" : panel === "import" ? "Import from Tally" : "Tally integration setup"} description={`${area.name} · ${project.name}`} size="lg">
        {panel === "import" ? <TallyImportPanel key={projectId} projectId={projectId} projectName={project.name} settings={state.settings} entries={state.entries} onImport={importEntries} onSaveSettings={settings => persist({ ...state, settings })} /> : panel === "entry" ? <form className="books-form" onSubmit={saveEntry}><p>Record a paid expense in INR. Available project balance: <strong>{money(remaining)}</strong>.</p><Field label="Budget head"><select name="head" defaultValue={head === "all" ? budgetCategories[0] : head}>{budgetCategories.map(category => <option key={category}>{category}</option>)}</select></Field><div className="books-form-grid"><Field label="Payment date"><input required name="date" type="date" min="2026-04-01" max="2027-03-31" defaultValue={new Date().toLocaleDateString("en-CA")} /></Field><Field label="Amount (INR)"><input required name="amount" type="number" step="0.01" min="0.01" max={Math.max(0, remaining)} placeholder="0.00" /></Field></div><Field label="Payee"><input required name="payee" maxLength={160} /></Field><Field label="Invoice / payment reference"><input required name="reference" maxLength={100} /></Field><Field label="Narration"><textarea required name="narration" rows={3} maxLength={500} /></Field><p className="books-footnote">Use this register for new payments only. Expenses already included in opening expenditure should not be entered again.</p>{error && <p role="alert">{error}</p>}<button className="books-button books-primary" type="submit">Save expenditure</button></form> : panel === "settings" ? <form className="books-form" onSubmit={saveSettings}><p>Enter your Tally company and map its expense ledgers to budget heads. The project cost centre determines which expenditure is imported.</p><Field label="Tally company"><input required name="company" defaultValue={state.settings.company} /></Field><Field label="Payment bank / cash ledger (only for export)"><input name="bankLedger" defaultValue={state.settings.bankLedger} /></Field><Field label="Cost category"><input required name="costCategory" defaultValue={state.settings.costCategory} /></Field><Field label="Cost centre for this project"><input required name="centre" defaultValue={state.settings.costCentres[projectId]} /></Field><h3>Budget head → expense ledger</h3>{budgetCategories.map(category => <Field key={category} label={category}><input name={category} defaultValue={state.settings.ledgers[category]} /></Field>)}<p className="books-footnote">Company and expense ledgers apply across projects. Cost centre is saved for this project. Use Import from Tally to upload a Day Book XML export into this project.</p><a href="https://help.tallysolutions.com/export-data-in-tally/" target="_blank" rel="noreferrer">Tally export instructions ↗</a>{error && <p role="alert">{error}</p>}<button className="books-button books-primary" type="submit">Save mappings</button></form> : null}
      </Overlay>
    </div>
  );
}
