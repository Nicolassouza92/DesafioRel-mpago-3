import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as authService from '../api/authservice'; // Criaremos este arquivo a seguir

interface User {
  id: number;
  nome: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Para saber se estamos verificando a sessão
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>; // Função para verificar no carregamento
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Começa true para verificar a sessão

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const currentUser = await authService.getProfile();
      setUser(currentUser);
    } catch {
      setUser(null); // Não autenticado ou erro
      // Não precisa logar o erro aqui, pois é esperado se não houver sessão
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, senha: string) => {
    const loggedInUser = await authService.login(email, senha);
    setUser(loggedInUser);
  };

  const register = async (nome: string, email: string, senha: string) => {
    const registeredUser = await authService.register(nome, email, senha);
    // Opcional: Fazer login automaticamente após o registro bem-sucedido
    // Se o backend não loga automaticamente:
    // setUser(registeredUser);
    // Se o backend já loga (seta o cookie e retorna o usuário):
    setUser(registeredUser); // Assumindo que registerService retorna o usuário como loginService
    // Ou chamar o login aqui se o backend de registro não loga automaticamente
    // await login(email, senha);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};