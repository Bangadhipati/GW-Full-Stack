import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import api from '../api'; // Import your API client

export type UserRole = "admin" | "editor" | "ad_manager";

// User interface from backend response
export interface AppUser {
  _id: string; // MongoDB _id
  email: string;
  name: string;
  role: UserRole;
  token?: string; // JWT token, stored on client
}

interface AuthContextType {
  user: Omit<AppUser, "token"> | null; // User object without the token for context
  token: string | null; // JWT token
  isAdmin: boolean;
  hasRole: (role: UserRole) => boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => void;
  accounts: AppUser[]; // Only email, name, role (no password or token)
  userCount: number;
  fetchAccounts: () => void;
  updatePassword: (email: string, userId: string, newPassword: string) => Promise<string | null>;
  addAccount: (account: { name: string; email: string; password: string; role: UserRole }) => Promise<string | null>;
  removeAccount: (userId: string) => Promise<string | null>;
  updateAccountRole: (userId: string, role: UserRole) => Promise<string | null>;
  updateAccountDetails: (userId: string, updates: { name?: string; email?: string }) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Omit<AppUser, "token"> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AppUser[]>([]); // To store user list for admin dashboard
  const [userCount, setUserCount] = useState(0);

  // Load user and token from session storage on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem("gw-user");
    const storedToken = sessionStorage.getItem("gw-token");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error("Failed to parse stored user or token:", error);
        sessionStorage.removeItem("gw-user");
        sessionStorage.removeItem("gw-token");
      }
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    try {
      const response = await api.login(email, password);
      const { token: jwtToken, ...userData } = response;
      setUser(userData);
      setToken(jwtToken);
      sessionStorage.setItem("gw-user", JSON.stringify(userData));
      sessionStorage.setItem("gw-token", jwtToken);
      return null;
    } catch (error: any) {
      return error.message;
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("gw-user");
    sessionStorage.removeItem("gw-token");
  };

  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  const hasRole = (role: UserRole) => user?.role === role;

  const fetchAccounts = useCallback(async () => {
    if (!token) return;
    
    // Always fetch the count for everyone
    try {
      const { count } = await api.getUserCount(token);
      setUserCount(count);
    } catch (error: any) {
      console.error("Failed to fetch user count:", error.message);
    }

    // Only fetch full list for admins
    if (user?.role === 'admin') {
      try {
        const fetchedAccounts = await api.getUsers(token);
        setAccounts(fetchedAccounts.map(acc => ({ _id: acc._id, name: acc.name, email: acc.email, role: acc.role })));
      } catch (error: any) {
        console.error("Failed to fetch accounts list:", error.message);
      }
    } else {
      setAccounts([]);
    }
  }, [token, user]);

  useEffect(() => {
    if (user && token) {
      fetchAccounts();
    } else {
      setAccounts([]);
    }
  }, [user, token, fetchAccounts]);

  const updatePassword = async (email: string, userId: string, newPassword: string): Promise<string | null> => {
    if (!token) return "Authentication required to update password.";
    if (!newPassword || newPassword.length < 4) return "Password must be at least 4 characters.";
    try {
      await api.updateUserPassword(userId, newPassword, token);
      fetchAccounts(); // Refresh the list
      return null;
    } catch (error: any) {
      return error.message;
    }
  };

  const addAccount = async (account: { name: string; email: string; password: string; role: UserRole }): Promise<string | null> => {
    if (!token) return "Authentication required to add an account.";
    try {
      await api.addUser(account, token);
      fetchAccounts(); // Refresh the list
      return null;
    } catch (error: any) {
      return error.message;
    }
  };

  const removeAccount = async (userId: string): Promise<string | null> => {
    if (!token) return "Authentication required to remove an account.";
    try {
      await api.deleteUser(userId, token);
      fetchAccounts(); // Refresh the list
      return null;
    } catch (error: any) {
      return error.message;
    }
  };

  const updateAccountRole = async (userId: string, role: UserRole): Promise<string | null> => {
    if (!token) return "Authentication required to update roles.";
    try {
      await api.updateUserRole(userId, role, token);
      fetchAccounts(); // Refresh the list
      return null;
    } catch (error: any) {
      return error.message;
    }
  };

  const updateAccountDetails = async (userId: string, updates: { name?: string; email?: string }): Promise<string | null> => {
    if (!token) return "Authentication required to update account details.";
    try {
      await api.updateUserDetails(userId, updates, token);
      fetchAccounts(); // Refresh the list
      // If the current user updated their own details, update context user as well
      if (user && user._id === userId) {
        setUser(prev => ({ ...prev!, ...updates }));
      }
      return null;
    } catch (error: any) {
      return error.message;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        hasRole,
        signIn,
        signOut,
        accounts,
        userCount,
        fetchAccounts,
        updatePassword,
        addAccount,
        removeAccount,
        updateAccountRole,
        updateAccountDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};