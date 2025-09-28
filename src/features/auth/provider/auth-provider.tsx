import { pbClient } from '@/lib/pocketbase';
import { router } from '@/lib/router';
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
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAndRefresh() {
      try {
        // if there's a record, but token is expired
        if (pbClient.authStore.record && !pbClient.authStore.isValid) {
          await pbClient.collection(USERS_COLLECTION).authRefresh();
        }

        // after refresh (or if already valid), update user state
        if (!cancelled) {
          setUser(getUser(pbClient.authStore.record));
        }
      } catch (err) {
        console.error('Failed to refresh auth', err);

        // refresh failed -> clear auth and redirect
        pbClient.authStore.clear();
        if (!cancelled) {
          setUser(null);
          router.navigate({ to: '/login' });
        }
      }
    }

    checkAndRefresh();

    // still want to react to auth changes
    const unsubscribe = pbClient.authStore.onChange((_, record) => {
      if (!cancelled) {
        setUser(getUser(record));
      }
    }, true);

    return () => {
      cancelled = true;
      unsubscribe();
    };
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
        isAuthenticating,
        isAuthenticated: !!user,

        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
