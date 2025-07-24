import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { type User } from "@shared/schema";
import { getStoredUser, storeUser, clearStoredUser } from "@/lib/auth";

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  setUser: (user: Omit<User, 'password'> | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const updateUser = (newUser: Omit<User, 'password'> | null) => {
    setUser(newUser);
    if (newUser) {
      storeUser(newUser);
    } else {
      clearStoredUser();
    }
  };

  const logout = () => {
    updateUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
