import { Card, Grid, GridItem, Heading } from '@chakra-ui/react';
import { DesktopGameSelector, MobileGameSelector } from './game-selector';

import type { GameTab } from '../../game-constants';
import type { Game } from '../../game-model';
import GameTabs from '../tabs/game-tabs';

type GameDashboardProps = {
  games: Game[];
  selectedGame: Game;
  selectedTab: GameTab;
  onSelectGame: (id: string) => void;
  onTabChange: (value: GameTab) => void;
};

function GameDashboard({
  games,
  selectedGame,
  selectedTab,
  onSelectGame,
  onTabChange,
}: GameDashboardProps) {
  return (
    <Grid
      flex="1"
      templateColumns={{ base: 'none', md: 'repeat(4, 1fr)' }}
      display={{ base: 'flex', md: 'grid' }}
      flexDir={{ base: 'column', md: 'unset' }}
      gap="4"
    >
      {/* GAME SELECTOR */}
      <GridItem colSpan={{ base: 1, md: 1 }}>
        <Card.Root h="full" size={{ base: 'sm', md: 'md' }}>
          <Card.Body>
            <DesktopGameSelector
              games={games}
              selectedGame={selectedGame}
              onSelectGame={onSelectGame}
            />

            <MobileGameSelector
              games={games}
              selectedGame={selectedGame}
              onSelectGame={onSelectGame}
            />
          </Card.Body>
        </Card.Root>
      </GridItem>

      {/* MAIN AREA */}
      <GridItem colSpan={{ base: 1, md: 3 }} flex={{ base: '1', md: 'unset' }}>
        <Card.Root h="full" size={{ base: 'sm', md: 'md' }}>
          <Card.Body>
            <Heading
              size="4xl"
              mb="4"
              display={{ base: 'none', md: 'initial' }}
            >
              {selectedGame.title}
            </Heading>

            {/* TABS */}
            <GameTabs
              gameId={selectedGame.id}
              tab={selectedTab}
              onTabChange={newTab => onTabChange(newTab)}
            />
          </Card.Body>
        </Card.Root>
      </GridItem>
    </Grid>
  );
}

export default GameDashboard;
