import type { LoginUser, SignupUser, User } from '../auth-model';

import { createContext } from 'react';

export type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  login: (input: LoginUser, redirect?: string) => Promise<void>;
  signup: (input: SignupUser) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);
