import PocketBase from 'pocketbase';

export const pbClient = new PocketBase(import.meta.env.VITE_PB_URL);
