import { IconButton, Input, InputGroup } from '@chakra-ui/react';

import type { KeyboardEventHandler } from 'react';
import { LuSearch } from 'react-icons/lu';

type SearchBarProps = {
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
  onSearch: (value?: string) => void;
};

function SearchBar({ value, disabled, onChange, onSearch }: SearchBarProps) {
  const handleSearch = () => {
    const trimmed = value.trim();
    onSearch(trimmed ? trimmed : undefined);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <InputGroup
      endElement={
        <IconButton
          type="button"
          size="xs"
          variant="ghost"
          colorPalette="gray"
          rounded="full"
          onClick={handleSearch}
          disabled={disabled}
        >
          <LuSearch />
        </IconButton>
      }
    >
      <Input
        placeholder="Search..."
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        onKeyDown={handleKeyDown}
      />
    </InputGroup>
  );
}

export default SearchBar;
