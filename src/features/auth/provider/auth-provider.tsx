import { pbClient } from '@/lib/pocketbase';
import { router } from '@/main';
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { USERS_COLLECTION } from '../auth-constants';
import type { LoginUser, SignupUser, User } from '../auth-model';
import { createUser, getUser } from '../auth-service';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(
    getUser(pbClient.authStore.record),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const unsubscribe = pbClient.authStore.onChange((_, record) => {
      setIsLoading(true);
      const nextUser = getUser(record);

      setUser(nextUser);
      setIsLoading(false);
    }, true);

    return () => unsubscribe();
  }, []);

  const login = useCallback(
    async ({ email, password }: LoginUser, redirect?: string) => {
      setIsAuthenticating(true);
      try {
        await pbClient
          .collection(USERS_COLLECTION)
          .authWithPassword(email, password);
        router.navigate({ to: redirect ?? '/home' });
      } catch (error) {
        console.error('Error logging in user');
        throw error;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [],
  );

  const signup = useCallback(async (input: SignupUser) => {
    setIsAuthenticating(true);
    try {
      const result = await createUser(input);
      setUser(getUser(result));
      router.navigate({ to: '/home' });
    } catch (error) {
      console.error('Error signing up user');
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const logout = useCallback(() => {
    pbClient.authStore.clear();
    setUser(null);
    router.navigate({ to: '/login' });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticating,
        isAuthenticated: !!user && !isLoading,

        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
