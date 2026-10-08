import { useEffect, useState } from "react";
import { createHRState, type HRState } from "./model";

const storageKey = "pantiss:hr:workspace:v2";
const changeEvent = "pantiss:hr:changed";
function readState(): { data: HRState; error: string } {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { data: createHRState(), error: "" };
    const parsed = JSON.parse(raw) as HRState;
    if (!parsed || ![parsed.employees, parsed.designations, parsed.assignments, parsed.assessments, parsed.appraisals, parsed.attendance].every(Array.isArray) || !parsed.leaveDecisions || typeof parsed.leaveDecisions !== "object") throw new Error("Invalid HR data");
    // Backfill salaries for workspaces saved before salary tracking was introduced.
    const initial = createHRState();
    if (parsed.employees.some(e => e.annualSalary === undefined)) {
      const seeded = new Map(initial.employees.map(e => [e.id, e.annualSalary]));
      parsed.employees = parsed.employees.map(e => e.annualSalary === undefined && seeded.get(e.id) ? { ...e, annualSalary: seeded.get(e.id) } : e);
    }
    // Backfill recruitment collections if missing from saved workspace
    if (!Array.isArray(parsed.jobPostings)) parsed.jobPostings = initial.jobPostings;
    if (!Array.isArray(parsed.candidates)) parsed.candidates = initial.candidates;
    if (!Array.isArray(parsed.interviews)) parsed.interviews = initial.interviews;
    if (!Array.isArray(parsed.offerLetters)) parsed.offerLetters = initial.offerLetters;

    return { data: parsed, error: "" };
  } catch { return { data: createHRState(), error: "Saved HR data could not be loaded. Sample data is shown; changes are blocked to protect saved records." }; }
}
export function useHRStore() {
  const [state, setState] = useState(readState);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const refresh = () => setState(readState());
    window.addEventListener("storage", refresh);
    window.addEventListener(changeEvent, refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener(changeEvent, refresh); };
  }, []);
  function commit(transform: (state: HRState) => HRState, message: string): boolean {
    try {
      const latest = readState();
      if (latest.error) throw new Error(latest.error);
      const next = transform(latest.data);
      localStorage.setItem(storageKey, JSON.stringify(next));
      setState({ data: next, error: "" });
      setNotice(message);
      window.dispatchEvent(new Event(changeEvent));
      return true;
    } catch (error) {
      setState(previous => ({ ...previous, error: error instanceof Error ? error.message : "Changes could not be saved. Check browser storage and try again." }));
      return false;
    }
  }
  return { ...state, notice, commit };
}
export type HRStore = ReturnType<typeof useHRStore>;
