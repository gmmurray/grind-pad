import { Tabs } from '@chakra-ui/react';

import type { JSX } from 'react';
import { GAME_TABS, type GameTab } from './constants';
import NotesTab from './notes-tab';
import TasksTab from './tasks-tab';

type GameTabsProps = {
  gameId: string;
  tab: GameTab;
  onTabChange: (tab: GameTab) => void;
};

function GameTabs({ gameId, tab, onTabChange }: GameTabsProps) {
  return (
    <Tabs.Root
      variant="enclosed"
      fitted
      value={tab}
      onValueChange={e => onTabChange(e.value as GameTab)}
    >
      <Tabs.List>
        {tabConfigs.map(({ value, title }) => (
          <Tabs.Trigger key={value} value={value}>
            {title}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {tabConfigs.map(({ value, Component }) => (
        <Tabs.Content key={value} value={value}>
          <Component gameId={gameId} />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

export default GameTabs;

const tabConfigs: {
  value: GameTab;
  title: string;
  Component: (props: { gameId: string }) => JSX.Element;
}[] = [
  {
    value: GAME_TABS.TASKS,
    title: 'tasks',
    Component: TasksTab,
  },
  {
    value: GAME_TABS.NOTES,
    title: 'notes',
    Component: NotesTab,
  },
  {
    value: GAME_TABS.RESOURCES,
    title: 'resources',
    Component: () => <>RESOURCES</>,
  },
];
