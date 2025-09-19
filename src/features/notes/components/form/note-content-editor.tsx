import './note-content-editor.css';

import { Box, Icon, IconButton, Menu, Separator, Wrap } from '@chakra-ui/react';
import { EditorContent, useCurrentEditor, useEditorState } from '@tiptap/react';
import {
  LuAlignCenter,
  LuAlignJustify,
  LuAlignLeft,
  LuAlignRight,
  LuBold,
  LuCode,
  LuHeading,
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuHeading4,
  LuHeading5,
  LuHeading6,
  LuItalic,
  LuList,
  LuListOrdered,
  LuMinus,
  LuRedo,
  LuRemoveFormatting,
  LuSquareTerminal,
  LuStrikethrough,
  LuTextQuote,
  LuUnderline,
  LuUndo,
} from 'react-icons/lu';

import { Tooltip } from '@/components/ui/tooltip';
import type { HeadingOptions } from '@tiptap/extension-heading';
import type { Editor } from '@tiptap/react';
import type { IconType } from 'react-icons/lib';

function NoteContentEditor() {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return;
  }

  return (
    <Box
      p="4"
      borderWidth="1px"
      borderColor="border.disabled"
      borderRadius="sm"
    >
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </Box>
  );
}

export default NoteContentEditor;

function MenuBar({ editor }: { editor: Editor }) {
  // Read the current editor's state, and re-render the component when it changes
  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,

        isItalic: ctx.editor.isActive('italic') ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,

        isStrike: ctx.editor.isActive('strike') ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,

        isCode: ctx.editor.isActive('code') ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,

        isUnderline: ctx.editor.isActive('underline') ?? false,
        canUnderline: ctx.editor.can().chain().toggleUnderline().run() ?? false,

        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,

        isLeftAlign: ctx.editor.isActive({ textAlign: 'left' }) ?? false,
        canLeftAlign:
          ctx.editor.can().chain().setTextAlign('left').run() ?? false,

        isCenterAlign: ctx.editor.isActive({ textAlign: 'center' }) ?? false,
        canCenterAlign:
          ctx.editor.can().chain().setTextAlign('center').run() ?? false,

        isRightAlign: ctx.editor.isActive({ textAlign: 'right' }) ?? false,
        canRightAlign:
          ctx.editor.can().chain().setTextAlign('right').run() ?? false,

        isJustifyAlign: ctx.editor.isActive({ textAlign: 'justify' }) ?? false,
        canJustifyAlign:
          ctx.editor.can().chain().setTextAlign('justify').run() ?? false,

        isParagraph: ctx.editor.isActive('paragraph') ?? false,
        isHeading: {
          1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
          2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
          3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
          4: ctx.editor.isActive('heading', { level: 4 }) ?? false,
          5: ctx.editor.isActive('heading', { level: 5 }) ?? false,
          6: ctx.editor.isActive('heading', { level: 6 }) ?? false,
        },

        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
        isBlockquote: ctx.editor.isActive('blockquote') ?? false,

        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      };
    },
  });

  return (
    <Box mb="4">
      <Wrap gap="1">
        <MenuBarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState.canUndo}
          icon={LuUndo}
        />
        <MenuBarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState.canRedo}
          icon={LuRedo}
        />

        <Separator orientation="vertical" />

        <MenuBarButton
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
          isActive={editorState.isBold}
          icon={LuBold}
        />
        <MenuBarButton
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
          isActive={editorState.isItalic}
          icon={LuItalic}
        />
        <MenuBarButton
          title="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
          isActive={editorState.isStrike}
          icon={LuStrikethrough}
        />
        <MenuBarButton
          title="Code"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editorState.canCode}
          isActive={editorState.isCode}
          icon={LuCode}
        />
        <MenuBarButton
          title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editorState.canUnderline}
          isActive={editorState.isUnderline}
          icon={LuUnderline}
        />
        <MenuBarButton
          title="Clear"
          onClick={() => {
            editor.chain().focus().unsetAllMarks().run();
            editor.chain().focus().clearNodes().run();
          }}
          icon={LuRemoveFormatting}
        />

        <Separator orientation="vertical" />

        <MenuBarButton
          title="Align left"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          disabled={!editorState.canLeftAlign}
          isActive={editorState.isLeftAlign}
          icon={LuAlignLeft}
        />
        <MenuBarButton
          title="Align center"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          disabled={!editorState.canCenterAlign}
          isActive={editorState.isCenterAlign}
          icon={LuAlignCenter}
        />
        <MenuBarButton
          title="Align right"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          disabled={!editorState.canRightAlign}
          isActive={editorState.isRightAlign}
          icon={LuAlignRight}
        />
        <MenuBarButton
          title="Align justify"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          disabled={!editorState.canJustifyAlign}
          isActive={editorState.isJustifyAlign}
          icon={LuAlignJustify}
        />

        <Separator orientation="vertical" />

        <Menu.Root>
          <Menu.Trigger>
            <MenuBarButton
              title="Heading"
              isActive={
                editorState.isHeading[1] ||
                editorState.isHeading[2] ||
                editorState.isHeading[3]
              }
              icon={LuHeading}
            />
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              {[...new Array(3)].map((_, idx) => (
                <HeadingMenuItem
                  key={idx}
                  level={(idx + 1) as HeadingOptions['levels'][number]}
                  active={
                    editorState.isHeading[
                      (idx + 1) as keyof typeof editorState.isHeading
                    ] ?? false
                  }
                />
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>

        <Separator orientation="vertical" />

        <MenuBarButton
          title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editorState.isBulletList}
          icon={LuList}
        />
        <MenuBarButton
          title="Ordered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editorState.isOrderedList}
          icon={LuListOrdered}
        />
        <MenuBarButton
          title="Code block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editorState.isCodeBlock}
          icon={LuSquareTerminal}
        />
        <MenuBarButton
          title="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editorState.isBlockquote}
          icon={LuTextQuote}
        />
        <MenuBarButton
          title="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={LuMinus}
        />
      </Wrap>
    </Box>
  );
}

type MenuBarButtonProps = {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  isActive?: boolean;
  icon: IconType;
};
function MenuBarButton({
  title,
  onClick,
  disabled = false,
  isActive = false,
  icon: IconProp,
}: MenuBarButtonProps) {
  const { editor } = useCurrentEditor();
  if (!editor) {
    return;
  }
  return (
    <Tooltip content={title}>
      <IconButton
        type="button"
        onClick={onClick}
        disabled={disabled}
        size="xs"
        variant={isActive ? 'subtle' : 'ghost'}
        colorPalette={isActive ? 'inherit' : 'gray'}
      >
        <Icon>
          <IconProp />
        </Icon>
      </IconButton>
    </Tooltip>
  );
}

type HeadingMenuItemProps = {
  level: HeadingOptions['levels'][number];
  active: boolean;
};
function HeadingMenuItem({ level, active }: HeadingMenuItemProps) {
  const { editor } = useCurrentEditor();
  if (!editor) {
    return;
  }
  let HeadingIcon: IconType | undefined;
  switch (level) {
    case 1:
      HeadingIcon = LuHeading1;
      break;
    case 2:
      HeadingIcon = LuHeading2;
      break;
    case 3:
      HeadingIcon = LuHeading3;
      break;
    case 4:
      HeadingIcon = LuHeading4;
      break;
    case 5:
      HeadingIcon = LuHeading5;
      break;
    case 6:
      HeadingIcon = LuHeading6;
      break;
    default:
      HeadingIcon = undefined;
  }
  return (
    <Menu.Item
      value={`h${level}`}
      onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
      bg={active ? 'colorPalette.subtle' : undefined}
    >
      {HeadingIcon && <HeadingIcon />} Heading {level}
    </Menu.Item>
  );
}
