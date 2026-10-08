import { budgetCategories } from "./budgetCategories";
import { booksProjects, defaultTallySettings, type BookEntry, type TallySettings } from "./booksData";

export const storageKey = "pantiss:finance-books:v1";
export interface BooksState { entries: BookEntry[]; settings: TallySettings; error?: string }
export function loadBooks(): BooksState {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (saved && Array.isArray(saved.entries) && saved.entries.every((entry: BookEntry) => typeof entry.id === "string" && booksProjects.some(p => p.id === entry.projectId) && budgetCategories.includes(entry.head) && Number.isFinite(entry.amount) && entry.amount > 0 && [entry.date, entry.payee, entry.reference, entry.narration].every(value => typeof value === "string"))) {
      return { entries: saved.entries, settings: { ...defaultTallySettings, ...saved.settings, ledgers: { ...defaultTallySettings.ledgers, ...saved.settings?.ledgers }, costCentres: { ...defaultTallySettings.costCentres, ...saved.settings?.costCentres } } };
    }
    if (saved !== null) throw new Error("Invalid saved books");
  } catch { return { entries: [], settings: defaultTallySettings, error: "Saved books could not be loaded. Restore browser storage before recording expenditure." }; }
  return { entries: [], settings: defaultTallySettings };
}
