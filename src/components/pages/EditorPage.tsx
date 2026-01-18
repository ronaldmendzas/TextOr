'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Callout } from '@/components/editor/extensions/Callout';
import { ExecutableCodeBlock } from '@/components/editor/extensions/ExecutableCodeBlock';
import { DynamicTable } from '@/components/editor/extensions/DynamicTable';
import { Variables } from '@/components/editor/extensions/Variables';
import { InlineCalculator } from '@/components/editor/extensions/InlineCalculator';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorFooter } from '@/components/editor/EditorFooter';
import { SlashCommandMenu } from '@/components/editor/SlashCommandMenu';
import { EmojiPicker } from '@/components/editor/EmojiPicker';
import { AnalysisPanel } from '@/components/editor/AnalysisPanel';
import { ExportMenu } from '@/components/editor/ExportMenu';
import { useEditorStore } from '@/store/editor.store';
import { BarChart3, Download } from 'lucide-react';
import type { Document } from '@/types/editor';

export function EditorPage() {
  const { focusMode, setDocument } = useEditorStore();
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuRange, setSlashMenuRange] = useState({ from: 0, to: 0 });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiQuery, setEmojiQuery] = useState('');
  const [emojiRange, setEmojiRange] = useState({ from: 0, to: 0 });
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: 'Start typing or press / for commands...',
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
      Callout,
      ExecutableCodeBlock,
      DynamicTable,
      Variables,
      InlineCalculator,
    ],
    content: '<p>Welcome to TextOr! Start typing or press <strong>/</strong> for commands.</p>',
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none min-h-[calc(100vh-200px)] ${
          focusMode ? 'opacity-100' : ''
        }`,
      },
      handleKeyDown: (view, event) => {
        const { state } = view;
        const { selection } = state;
        const { $from } = selection;
        
        const textBefore = state.doc.textBetween(
          Math.max(0, $from.pos - 50),
          $from.pos,
          '\n'
        );

        if (event.key === '/') {
          const isAtStart = $from.nodeBefore === null || 
                           $from.nodeBefore.type.name === 'hardBreak';
          
          if (isAtStart || textBefore.endsWith(' ')) {
            setSlashMenuRange({ from: $from.pos, to: $from.pos + 1 });
            setShowSlashMenu(true);
          }
        }

        if (event.key === ':') {
          setEmojiQuery(':');
          setEmojiRange({ from: $from.pos, to: $from.pos + 1 });
          setShowEmojiPicker(true);
        }

        if (showSlashMenu && event.key === 'Escape') {
          setShowSlashMenu(false);
        }

        if (showEmojiPicker && event.key === 'Escape') {
          setShowEmojiPicker(false);
        }

        return false;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const mockDocument: Document = {
      id: 'doc-1',
      title: 'Untitled Document',
      content: [],
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-1',
    };

    setDocument(mockDocument);
  }, [editor, setDocument]);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      if (showEmojiPicker) {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;
        
        const textBefore = state.doc.textBetween(
          Math.max(0, $from.pos - 20),
          $from.pos,
          '\n'
        );

        const match = textBefore.match(/:(\w*)$/);
        if (match) {
          setEmojiQuery(match[0]);
          setEmojiRange({ from: $from.pos - match[0].length, to: $from.pos });
        } else {
          setShowEmojiPicker(false);
        }
      }
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, showEmojiPicker]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  const currentDocument: Document = {
    id: 'doc-1',
    title: 'Untitled Document',
    content: [],
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user-1',
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">TextOr</h1>
            <p className="text-xs text-muted-foreground">Professional Rich Text Editor</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Analysis</span>
            </button>
            <button
              onClick={() => setShowExportMenu(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col relative">
        <EditorToolbar editor={editor} />
        
        <div
          className={`flex-1 overflow-y-auto transition-all ${
            focusMode ? 'px-32' : 'container mx-auto px-4'
          } py-8 relative`}
        >
          <EditorContent editor={editor} className="h-full" />

          {showSlashMenu && (
            <div className="absolute z-50" style={{ top: '100px', left: '50%', transform: 'translateX(-50%)' }}>
              <SlashCommandMenu
                editor={editor}
                range={slashMenuRange}
                onClose={() => setShowSlashMenu(false)}
              />
            </div>
          )}

          {showEmojiPicker && (
            <div className="absolute z-50" style={{ top: '100px', left: '50%', transform: 'translateX(-50%)' }}>
              <EmojiPicker
                editor={editor}
                range={emojiRange}
                query={emojiQuery}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
        </div>

        <EditorFooter editor={editor} />

        <AnalysisPanel
          editor={editor}
          isOpen={showAnalysisPanel}
          onClose={() => setShowAnalysisPanel(false)}
        />
      </div>

      <ExportMenu
        document={currentDocument}
        isOpen={showExportMenu}
        onClose={() => setShowExportMenu(false)}
      />
    </div>
  );
}
