import { createContext } from "react";
import type { CategorySlug } from "../types/modules";

export interface CategoryContextValue {
  selectedCategory: CategorySlug | null;
  selectCategory: (category: CategorySlug | null) => void;
}

export const CategoryContext = createContext<CategoryContextValue | null>(null);
