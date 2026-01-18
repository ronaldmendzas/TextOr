'use client';

import { useEditor, EditorContent, type Editor as TiptapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/editor.store';
import { debounce } from '@/lib/utils';
import { EditorToolbar } from './EditorToolbar';
import { EditorFooter } from './EditorFooter';

interface EditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  placeholder?: string;
}

export function Editor({
  initialContent = '',
  onContentChange,
  placeholder = 'Start typing or press / for commands...',
}: EditorProps) {
  const { updateContent, focusMode } = useEditorStore();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        code: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none ${
          focusMode ? 'opacity-100' : ''
        }`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedContentChange(html);
    },
  });

  const debouncedContentChange = useCallback(
    debounce((content: string) => {
      onContentChange?.(content);
    }, 500),
    [onContentChange]
  );

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <EditorToolbar editor={editor} />
      
      <div
        className={`flex-1 overflow-y-auto transition-all ${
          focusMode ? 'px-32' : 'px-8'
        }`}
      >
        <EditorContent editor={editor} className="h-full" />
      </div>

      <EditorFooter editor={editor} />
    </div>
  );
}
