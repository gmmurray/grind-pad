import { IconButton, Input, InputGroup } from '@chakra-ui/react';
import { LuSearch, LuX } from 'react-icons/lu';

import type { KeyboardEventHandler } from 'react';

type SearchBarProps = {
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
  onSearch: (value?: string) => void;
  onClear: () => void;
};

function SearchBar({
  value,
  disabled,
  onChange,
  onSearch,
  onClear,
}: SearchBarProps) {
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
      startElement={<LuSearch />}
      endElement={
        <IconButton
          type="button"
          size="xs"
          variant="ghost"
          colorPalette="gray"
          display={value === '' ? 'none' : undefined}
          rounded="full"
          onClick={onClear}
        >
          <LuX />
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
