import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface MockUser {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

interface MockAuthContextType {
  user: MockUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, username: string) => Promise<{ error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<MockUser>) => void;
}

const MockAuthContext = createContext<MockAuthContextType | null>(null);

const USERS_KEY = "mock_users";
const CURRENT_USER_KEY = "mock_current_user";

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      localStorage.setItem("isAuthenticated", "true");
    } else {
      localStorage.removeItem("isAuthenticated");
    }
    setIsLoading(false);
  }, []);

  const getUsers = (): Record<string, { password: string; user: MockUser }> => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  };

  const saveUsers = (users: Record<string, { password: string; user: MockUser }>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const users = getUsers();
    const userRecord = users[email.toLowerCase()];

    if (!userRecord) {
      return { error: "User not found" };
    }

    if (userRecord.password !== password) {
      return { error: "Invalid password" };
    }

    setUser(userRecord.user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userRecord.user));
    localStorage.setItem("isAuthenticated", "true");
    localStorage.removeItem("isNewUser");
    return {};
  };

  const signup = async (
    email: string,
    password: string,
    username: string
  ): Promise<{ error?: string }> => {
    const users = getUsers();
    const emailLower = email.toLowerCase();

    if (users[emailLower]) {
      return { error: "User already exists with this email" };
    }

    // Check username uniqueness
    const usernameExists = Object.values(users).some(
      (u) => u.user.username.toLowerCase() === username.toLowerCase()
    );
    if (usernameExists) {
      return { error: "Username already taken" };
    }

    const newUser: MockUser = {
      id: crypto.randomUUID(),
      email: emailLower,
      username,
      created_at: new Date().toISOString(),
    };

    users[emailLower] = { password, user: newUser };
    saveUsers(users);

    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("isNewUser", "true");
    return {};
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isNewUser");
  };

  const updateProfile = (updates: Partial<MockUser>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    // Update in users store
    const users = getUsers();
    if (users[user.email]) {
      users[user.email].user = updatedUser;
      saveUsers(users);
    }
  };

  return (
    <MockAuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error("useMockAuth must be used within MockAuthProvider");
  }
  return context;
}
