'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Heading1,
  Heading2,
  Heading3,
  Code,
  Table,
  List,
  ListOrdered,
  Quote,
  Info,
  Divide,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItem {
  title: string;
  description: string;
  icon: LucideIcon;
  command: () => void;
  keywords?: string[];
}

interface SlashCommandMenuProps {
  editor: Editor;
  range: { from: number; to: number };
  onClose: () => void;
}

export function SlashCommandMenu({ editor, range, onClose }: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [query, _setQuery] = useState('');

  const commands: CommandItem[] = [
    {
      title: 'Heading 1',
      description: 'Large section heading',
      icon: Heading1,
      command: () => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
      },
      keywords: ['h1', 'heading', 'title'],
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: Heading2,
      command: () => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
      },
      keywords: ['h2', 'heading', 'subtitle'],
    },
    {
      title: 'Heading 3',
      description: 'Small section heading',
      icon: Heading3,
      command: () => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
      },
      keywords: ['h3', 'heading'],
    },
    {
      title: 'Code Block',
      description: 'Create executable code snippet',
      icon: Code,
      command: () => {
        editor.chain().focus().deleteRange(range).setCodeBlock().run();
      },
      keywords: ['code', 'programming', 'snippet'],
    },
    {
      title: 'Dynamic Table',
      description: 'Sortable table with rows and columns',
      icon: Table,
      command: () => {
        editor.chain().focus().deleteRange(range).run();
        editor.commands.insertDynamicTable?.(3, 3);
      },
      keywords: ['table', 'grid', 'data'],
    },
    {
      title: 'Callout - Info',
      description: 'Informational callout block',
      icon: Info,
      command: () => {
        editor.chain().focus().deleteRange(range).run();
        editor.commands.setCallout?.('info');
      },
      keywords: ['callout', 'info', 'note', 'information'],
    },
    {
      title: 'Bullet List',
      description: 'Unordered list',
      icon: List,
      command: () => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
      keywords: ['list', 'bullet', 'ul'],
    },
    {
      title: 'Numbered List',
      description: 'Ordered list',
      icon: ListOrdered,
      command: () => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
      keywords: ['list', 'numbered', 'ol'],
    },
    {
      title: 'Quote',
      description: 'Block quote',
      icon: Quote,
      command: () => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
      keywords: ['quote', 'blockquote', 'citation'],
    },
    {
      title: 'Divider',
      description: 'Horizontal rule',
      icon: Divide,
      command: () => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
      keywords: ['divider', 'separator', 'hr', 'line'],
    },
  ];

  const filteredCommands = commands.filter(cmd => {
    const searchText = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(searchText) ||
      cmd.description.toLowerCase().includes(searchText) ||
      cmd.keywords?.some(k => k.includes(searchText))
    );
  });

  const executeCommand = useCallback(
    (index: number) => {
      const command = filteredCommands[index];
      if (command) {
        command.command();
        onClose();
      }
    },
    [filteredCommands, onClose]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev =>
          prev === 0 ? filteredCommands.length - 1 : prev - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeCommand(selectedIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredCommands.length, executeCommand, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden w-80">
      <div className="max-h-96 overflow-y-auto">
        {filteredCommands.map((cmd, index) => {
          const Icon = cmd.icon;
          return (
            <button
              key={cmd.title}
              onClick={() => executeCommand(index)}
              className={cn(
                'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                index === selectedIndex && 'bg-blue-50'
              )}
            >
              <Icon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm text-gray-900">{cmd.title}</div>
                <div className="text-xs text-gray-500">{cmd.description}</div>
              </div>
            </button>
          );
        })}
        {filteredCommands.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No commands found
          </div>
        )}
      </div>
    </div>
  );
}
