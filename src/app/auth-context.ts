import { createContext } from "react";
import dummyUsers from "../../dummy-users.json";

export type CoreOperationsRole =
  | "finance-manager"
  | "hr-manager"
  | "me-manager"
  | "communications-manager"
  | "business-development-manager"
  | "strategy-manager";
export type MESection = "dashboard" | "projects" | "reports" | "employee-status";

export interface AuthUser {
  id: string;
  name: string;
  initials: string;
  role: CoreOperationsRole | "ceo" | "coo" | "cfo";
  roleLabel: string;
  moduleId: string;
  allowedSections: MESection[];
}

export interface DemoAccount extends AuthUser {
  password: string;
}

export const demoAccounts = dummyUsers.users as DemoAccount[];

export interface AuthContextValue {
  user: AuthUser | null;
  login: (id: string, password: string, remember: boolean) => AuthUser | null;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
