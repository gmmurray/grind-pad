import PocketBase from 'pocketbase';
import z from 'zod';

export const pbClient = new PocketBase(import.meta.env.VITE_PB_URL);

export const PB_COLLECTION_PREFIX = 'gp_';

export const TimestampSchema = z.object({
  created: z
    .string()
    .transform(str => str.replace(' ', 'T'))
    .pipe(z.iso.datetime()),
  updated: z
    .string()
    .transform(str => str.replace(' ', 'T'))
    .pipe(z.iso.datetime()),
});
