import type { AuthRecord } from 'pocketbase';
import { UserSchema } from './auth-model';

export const getUser = (record: AuthRecord) => {
  if (!record) {
    return null;
  }

  const validated = UserSchema.safeParse(record);

  if (!validated.success) {
    console.log('Invalid user provided');
    return null;
  }

  return validated.data;
};
