import { pbClient } from '@/lib/pocketbase';
import type { AuthRecord } from 'pocketbase';
import { USERS_COLLECTION } from './auth-constants';
import { type SignupUser, SignupUserSchema, UserSchema } from './auth-model';

export const getUser = (input?: AuthRecord) => {
  const authRecord = input ?? pbClient.authStore.record ?? null;

  if (!authRecord) {
    return null;
  }

  const validated = UserSchema.safeParse(authRecord);

  if (!validated.success) {
    console.log('Invalid user provided');
    return null;
  }

  return validated.data;
};

export const createUser = async (input: SignupUser) => {
  const validated = SignupUserSchema.parse(input);

  return await pbClient.collection(USERS_COLLECTION).create(validated);
};
