import { Group, IconButton, Input, InputGroup, Stack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LuCheck, LuPlus, LuX } from 'react-icons/lu';

import { TagChips } from '@/components/tags';

type EditGameTagsProps = {
  initialValue: string[];
  disabled?: boolean;
  onSave: (value: string[]) => Promise<void>;
};

function EditGameTags({
  initialValue,
  disabled = false,
  onSave,
}: EditGameTagsProps) {
  const [value, setValue] = useState<string[]>(initialValue);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const inputIsValid = tagInput && !value.includes(tagInput);

  const handleAdd = () => {
    if (!inputIsValid) {
      return;
    }

    setValue(state => [...state, tagInput]);
    setTagInput('');
  };

  const handleRemove = (tag: string) => {
    setValue(state => state.filter(t => t !== tag));
  };

  const handleReset = () => {
    setValue(initialValue);
    setTagInput('');
  };

  const handleSave = () => onSave(value);

  return (
    <Stack gap={2}>
      <Group gap={1}>
        <InputGroup
          endElement={
            <IconButton
              type="button"
              colorPalette="gray"
              onClick={() => setTagInput('')}
              variant="ghost"
              rounded="full"
              size="xs"
              display={!tagInput ? 'none' : undefined}
            >
              <LuX />
            </IconButton>
          }
        >
          <Input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e =>
              e.key === 'Enter' && inputIsValid ? handleAdd() : undefined
            }
            placeholder="add tag..."
          />
        </InputGroup>
        <IconButton
          colorPalette="gray"
          onClick={handleAdd}
          variant="ghost"
          rounded="full"
          disabled={!inputIsValid}
        >
          <LuPlus />
        </IconButton>
      </Group>

      {value.length > 0 && (
        <TagChips
          tags={value}
          onClose={value => handleRemove(value)}
          disabled={disabled}
        />
      )}

      <Group gap="1">
        <IconButton
          onClick={handleSave}
          variant="ghost"
          rounded="full"
          size="sm"
          disabled={disabled || initialValue === value}
        >
          <LuCheck />
        </IconButton>
        <IconButton
          colorPalette="gray"
          onClick={handleReset}
          variant="ghost"
          rounded="full"
          size="sm"
          disabled={disabled}
        >
          <LuX />
        </IconButton>
      </Group>
    </Stack>
  );
}

export default EditGameTags;
