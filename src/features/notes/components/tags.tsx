import {
  Button,
  Combobox,
  Portal,
  createListCollection,
} from '@chakra-ui/react';
import { type ReactNode, useMemo, useState } from 'react';

type TagSelectProps = {
  options: string[];
  selectedTags: string[];
  searchValue: string;
  loading?: boolean;
  usePortal?: boolean;
  onChange: (value: string[]) => void;
  onSearchValueChange: (value: string) => void;
  renderEmpty?: () => ReactNode;
};

export function TagSelect({
  options,
  selectedTags,
  searchValue,
  loading = false,
  usePortal = false,
  onChange,
  onSearchValueChange,
  renderEmpty,
}: TagSelectProps) {
  const filteredTags = useMemo(
    () =>
      options.filter(o => o.toLowerCase().includes(searchValue.toLowerCase())),
    [searchValue, options],
  );

  const collection = useMemo(
    () => createListCollection({ items: filteredTags }),
    [filteredTags],
  );

  const positioner = (
    <Combobox.Positioner>
      <Combobox.Content>
        <Combobox.ItemGroup>
          {filteredTags.map(item => (
            <Combobox.Item key={item} item={item}>
              {item}
              <Combobox.ItemIndicator />
            </Combobox.Item>
          ))}
          <Combobox.Empty>
            {renderEmpty ? renderEmpty() : 'No tags found'}
          </Combobox.Empty>
        </Combobox.ItemGroup>
      </Combobox.Content>
    </Combobox.Positioner>
  );

  return (
    <Combobox.Root
      disabled={loading}
      multiple
      closeOnSelect
      value={selectedTags}
      collection={collection}
      onValueChange={details => onChange(details.value)}
      onInputValueChange={details => onSearchValueChange(details.inputValue)}
    >
      <Combobox.Control>
        <Combobox.Input placeholder="Filter by tags" />
        <Combobox.IndicatorGroup>
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>

      {usePortal ? <Portal>{positioner}</Portal> : positioner}
    </Combobox.Root>
  );
}

type TagInputProps = {
  initialTags: string[];
  selectedTags: string[];
  onChange: (value: string[]) => void;
};
export function TagInput({
  initialTags,
  selectedTags,
  onChange,
}: TagInputProps) {
  const [options, setOptions] = useState<string[]>(initialTags);
  const [searchValue, setSearchValue] = useState('');

  const handleAdd = () => {
    setOptions(state => [...state, searchValue]);
    onChange([...selectedTags, searchValue]);
    setSearchValue('');
  };

  return (
    <TagSelect
      options={options}
      selectedTags={selectedTags}
      searchValue={searchValue}
      onChange={onChange}
      onSearchValueChange={setSearchValue}
      renderEmpty={() => (
        <Button onClick={handleAdd} size="xs" variant="plain">
          Add {searchValue}
        </Button>
      )}
    />
  );
}

type TagFilterProps = {
  selectedTags: string[];
  options: string[];
  loading: boolean;
  onChange: (value: string[]) => void;
};
export function TagFilter({
  selectedTags,
  options,
  loading,
  onChange,
}: TagFilterProps) {
  const [searchValue, setSearchValue] = useState('');

  return (
    <TagSelect
      options={options}
      selectedTags={selectedTags}
      searchValue={searchValue}
      onChange={onChange}
      onSearchValueChange={setSearchValue}
      loading={loading}
      usePortal
    />
  );
}
