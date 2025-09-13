export const GAME_TABS = {
  TASKS: 'tasks',
  NOTES: 'notes',
  RESOURCES: 'resources',
} as const;

export const gameTabs = Object.values(GAME_TABS);
export type GameTab = (typeof gameTabs)[number];
