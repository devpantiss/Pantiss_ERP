import {
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { CategorySlug } from "../types/modules";
import { CategoryContext } from "./category-context";
const STORAGE_KEY = "pantiss:selected-category";

export function CategoryProvider({ children }: PropsWithChildren) {
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | null>(
    () => {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored as CategorySlug | null;
    },
  );

  const selectCategory = useCallback((category: CategorySlug | null) => {
    setSelectedCategory(category);
    if (category) sessionStorage.setItem(STORAGE_KEY, category);
    else sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ selectedCategory, selectCategory }),
    [selectedCategory, selectCategory],
  );

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}
