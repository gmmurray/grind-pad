import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { Placeholder } from '@tiptap/extensions';
import { EditorContext, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { type PropsWithChildren, useMemo } from 'react';
import type { Note } from '../../note-model';

const extensions = [
  TextStyleKit,
  StarterKit,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Placeholder.configure({
    placeholder: 'Write something...',
  }),
];

type NoteContentEditorProviderProps = {
  note?: Note | null;
} & PropsWithChildren;

function NoteContentEditorProvider({
  note,
  children,
}: NoteContentEditorProviderProps) {
  const editor = useEditor({
    extensions,
    content: note?.content ?? '',
  });

  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <EditorContext.Provider value={providerValue}>
      {children}
    </EditorContext.Provider>
  );
}

export default NoteContentEditorProvider;
