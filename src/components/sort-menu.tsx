import { Button, Menu, Portal } from '@chakra-ui/react';

import type { SortDir } from '@/lib/zod/common';
import { LuArrowUpDown } from 'react-icons/lu';

export type SortMenuOptions = Record<
  string,
  {
    label: string;
    value: {
      sortBy: string;
      sortDir: SortDir;
    };
  }
>;

type SortMenuProps = {
  value: string;
  options: SortMenuOptions;
  disabled: boolean;
  onChange: (value: string) => void;
};

function SortMenu({ value, options, disabled, onChange }: SortMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild disabled={disabled}>
        <Button size="sm" variant="subtle">
          <LuArrowUpDown /> Sort
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="10rem">
            <Menu.RadioItemGroup
              value={value}
              onValueChange={e => onChange(e.value)}
            >
              {Object.entries(options).map(([key, def]) => (
                <Menu.RadioItem key={key} value={key}>
                  {def.label}
                  <Menu.ItemIndicator />
                </Menu.RadioItem>
              ))}
            </Menu.RadioItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

export default SortMenu;
