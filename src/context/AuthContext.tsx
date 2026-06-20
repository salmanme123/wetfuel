import { createContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AuthState, AuthUser, UserRole } from '@/types';
import { mockUsers } from '@/mock';

type AuthAction =
  | { type: 'LOGIN'; payload: AuthUser }
  | { type: 'LOGOUT' };

function authReducer(_state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      sessionStorage.setItem('wetfuel_user', JSON.stringify(action.payload));
      return { user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      sessionStorage.removeItem('wetfuel_user');
      return { user: null, isAuthenticated: false };
  }
}

const initialState: AuthState = { user: null, isAuthenticated: false };

export interface AuthContextValue {
  state: AuthState;
  login: (role: UserRole) => void;
  loginAsUser: (user: AuthUser) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const stored = sessionStorage.getItem('wetfuel_user');
    if (stored) {
      dispatch({ type: 'LOGIN', payload: JSON.parse(stored) });
    }
  }, []);

  const login = (role: UserRole) => {
    const user = mockUsers.find((u) => u.role === role);
    if (user) {
      dispatch({
        type: 'LOGIN',
        payload: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
          organizationId: user.organizationId,
        },
      });
    }
  };

  const loginAsUser = (user: AuthUser) => {
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const switchRole = (role: UserRole) => {
    login(role);
  };

  return (
    <AuthContext.Provider value={{ state, login, loginAsUser, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}
