import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { AuthContext, demoAccounts, type AuthUser, type DemoAccount } from "./auth-context";

const SESSION_KEY = "pantiss:demo-auth";

function toAuthUser(account: DemoAccount): AuthUser {
  return {
    id: account.id,
    name: account.name,
    initials: account.initials,
    role: account.role,
    roleLabel: account.roleLabel,
    moduleId: account.moduleId,
    allowedSections: account.allowedSections,
  };
}

function readStoredUser(): AuthUser | null {
  const stored = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as AuthUser;
    const account = demoAccounts.find((candidate) => candidate.id === parsed.id && candidate.role === parsed.role);
    return account ? toAuthUser(account) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const login = useCallback((id: string, password: string, remember: boolean) => {
    const account = demoAccounts.find(
      (candidate) => candidate.id.toLowerCase() === id.trim().toLowerCase() && candidate.password === password,
    );
    if (!account) return null;

    const authenticatedUser = toAuthUser(account);
    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;
    otherStorage.removeItem(SESSION_KEY);
    storage.setItem(SESSION_KEY, JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [login, logout, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
