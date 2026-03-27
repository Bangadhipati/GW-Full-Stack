import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "editor" | "ad_manager";

export interface AppUser {
  email: string;
  name: string;
  role: UserRole;
  password: string;
}

interface AuthContextType {
  user: Omit<AppUser, "password"> | null;
  isAdmin: boolean;
  hasRole: (role: UserRole) => boolean;
  signIn: (email: string, password: string) => string | null;
  signOut: () => void;
  accounts: AppUser[];
  updatePassword: (email: string, newPassword: string) => string | null;
  addAccount: (account: AppUser) => string | null;
  removeAccount: (email: string) => string | null;
  updateAccountRole: (email: string, role: UserRole) => string | null;
  updateAccountDetails: (oldEmail: string, updates: { name?: string; email?: string }) => string | null;
}

const ACCOUNTS_KEY = "gw-accounts";

const DEFAULT_ACCOUNTS: AppUser[] = [
  { email: "bangadhipati@gmail.com", password: "1234", name: "Bangadhipati", role: "admin" },
  { email: "vangadhipati@gmail.com", password: "1234", name: "Vangadhipati", role: "editor" },
  { email: "debarghya.bhowmick@yahoo.com", password: "1234", name: "Debarghya Bhowmick", role: "ad_manager" },
];

function loadAccounts(): AppUser[] {
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_ACCOUNTS;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useState<AppUser[]>(loadAccounts);
  const [user, setUser] = useState<Omit<AppUser, "password"> | null>(null);

  const persistAccounts = (accs: AppUser[]) => {
    setAccounts(accs);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accs));
  };

  const signIn = (email: string, password: string): string | null => {
    const account = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!account) return "Invalid email address";
    if (account.password !== password) return "Incorrect password";
    setUser({ email: account.email, name: account.name, role: account.role });
    return null;
  };

  const signOut = () => setUser(null);

  const isAdmin = user?.role === "admin";

  const hasRole = (role: UserRole) => user?.role === role;

  const updatePassword = (email: string, newPassword: string): string | null => {
    if (!user || user.role !== "admin") return "Only admins can change passwords";
    if (!newPassword || newPassword.length < 4) return "Password must be at least 4 characters";
    const updated = accounts.map((a) =>
      a.email.toLowerCase() === email.toLowerCase() ? { ...a, password: newPassword } : a
    );
    persistAccounts(updated);
    return null;
  };

  const addAccount = (account: AppUser): string | null => {
    if (!user || user.role !== "admin") return "Only admins can add accounts";
    if (accounts.find((a) => a.email.toLowerCase() === account.email.toLowerCase())) {
      return "Email already exists";
    }
    persistAccounts([...accounts, account]);
    return null;
  };

  const removeAccount = (email: string): string | null => {
    if (!user || user.role !== "admin") return "Only admins can remove accounts";
    if (email.toLowerCase() === "bangadhipati@gmail.com") return "Cannot remove the primary admin";
    persistAccounts(accounts.filter((a) => a.email.toLowerCase() !== email.toLowerCase()));
    return null;
  };

  const updateAccountRole = (email: string, role: UserRole): string | null => {
    if (!user || user.role !== "admin") return "Only admins can change roles";
    if (email.toLowerCase() === "bangadhipati@gmail.com") return "Cannot change primary admin role";
    const updated = accounts.map((a) =>
      a.email.toLowerCase() === email.toLowerCase() ? { ...a, role } : a
    );
    persistAccounts(updated);
    return null;
  };

  const updateAccountDetails = (oldEmail: string, updates: { name?: string; email?: string }): string | null => {
    if (!user || user.role !== "admin") return "Only admins can update accounts";
    if (updates.email && updates.email.toLowerCase() !== oldEmail.toLowerCase()) {
      if (accounts.find((a) => a.email.toLowerCase() === updates.email!.toLowerCase())) {
        return "Email already exists";
      }
    }
    const updated = accounts.map((a) =>
      a.email.toLowerCase() === oldEmail.toLowerCase()
        ? { ...a, ...(updates.name && { name: updates.name }), ...(updates.email && { email: updates.email }) }
        : a
    );
    persistAccounts(updated);
    return null;
  };

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, hasRole, signIn, signOut, accounts, updatePassword, addAccount, removeAccount, updateAccountRole, updateAccountDetails }}
    >
      {children}
    </AuthContext.Provider>
  );
};
