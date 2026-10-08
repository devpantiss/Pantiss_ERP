export const budgetCategories = ["Personnel", "Programme activities", "Equipment & materials", "Travel & field operations", "Monitoring & evaluation", "Administration"] as const;
export type BudgetCategory = typeof budgetCategories[number];
export const allocationShares: Record<BudgetCategory, number> = { Personnel: .24, "Programme activities": .31, "Equipment & materials": .18, "Travel & field operations": .11, "Monitoring & evaluation": .08, Administration: .08 };
