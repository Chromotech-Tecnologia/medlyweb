import { useState, createContext, useContext, useEffect, ReactNode } from 'react';
import type { UserProfile } from '@/lib/mocks/types';
import {
  STORAGE_KEYS,
  getFromStorage,
  setCurrentUser,
  getCurrentUserId,
  clearSession,
  isAuthenticated as checkAuth,
  simulateLatency,
  logAudit,
} from '@/lib/mocks/storage';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const userId = getCurrentUserId();
      if (userId && checkAuth()) {
        const users = getFromStorage<UserProfile>(STORAGE_KEYS.USERS);
        const currentUser = users.find((u) => u.id === userId && !u.deletedAt);
        if (currentUser) {
          setUser(currentUser);
        } else {
          clearSession();
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    await simulateLatency(300, 800);

    try {
      const users = getFromStorage<UserProfile>(STORAGE_KEYS.USERS);
      const foundUser = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && !u.deletedAt
      );

      if (!foundUser) {
        return { success: false, error: 'Email ou senha inválidos' };
      }

      // In a real app, we'd check password hash here
      // For mock, we accept any password for existing users
      if (foundUser.status === 'inativo') {
        return { success: false, error: 'Usuário inativo. Contate o administrador.' };
      }

      setCurrentUser(foundUser.id);
      setUser(foundUser);
      logAudit(foundUser.id, foundUser.name, 'LOGIN', 'User', foundUser.id);

      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    await simulateLatency(500, 1000);

    try {
      const users = getFromStorage<UserProfile>(STORAGE_KEYS.USERS);
      
      // Check if email already exists
      const existingUser = users.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase() && !u.deletedAt
      );
      if (existingUser) {
        return { success: false, error: 'Este email já está cadastrado' };
      }

      // Check if CPF already exists
      const existingCpf = users.find(
        (u) => u.cpf === data.cpf && !u.deletedAt
      );
      if (existingCpf) {
        return { success: false, error: 'Este CPF já está cadastrado' };
      }

      // Create new user
      const now = new Date().toISOString();
      const newUser: UserProfile = {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        role: 'medico', // Default role for new registrations
        status: 'pendente', // Requires admin approval
        address: data.address,
        avatarUrl: `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=b6e3f4`,
        averageRating: 0,
        completedScales: 0,
        cancellationRate: 0,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };

      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      logAudit(newUser.id, newUser.name, 'REGISTER', 'User', newUser.id);

      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (user) {
      logAudit(user.id, user.name, 'LOGOUT', 'User', user.id);
    }
    clearSession();
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    await simulateLatency(500, 1000);

    const users = getFromStorage<UserProfile>(STORAGE_KEYS.USERS);
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && !u.deletedAt
    );

    // Always return success to prevent email enumeration
    if (foundUser) {
      logAudit(foundUser.id, foundUser.name, 'FORGOT_PASSWORD', 'User', foundUser.id);
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
