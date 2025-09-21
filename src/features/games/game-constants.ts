import { PB_COLLECTION_PREFIX } from '@/lib/pocketbase';

export const GAMES_COLLECTION = `${PB_COLLECTION_PREFIX}games`;

export const LAST_GAME_STORAGE_KEY = 'gp:lastGameId';

export const GAME_TABS = {
  TASKS: 'tasks',
  NOTES: 'notes',
  RESOURCES: 'resources',
} as const;

export const gameTabs = Object.values(GAME_TABS);
export type GameTab = (typeof gameTabs)[number];
