'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Editor } from '@tiptap/react';
import { Search } from 'lucide-react';
import { emojiMap, emojiCategories } from '@/lib/emoji-data';
import { cn } from '@/lib/utils';

interface EmojiPickerProps {
  editor: Editor;
  range: { from: number; to: number };
  query: string;
  onClose: () => void;
}

export function EmojiPicker({ editor, range, query, onClose }: EmojiPickerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredEmojis, setFilteredEmojis] = useState<Array<{ emoji: string; name: string }>>([]);

  useEffect(() => {
    const searchQuery = query.slice(1).toLowerCase();

    if (searchQuery.length === 0) {
      const allEmojis = Object.entries(emojiMap).map(([name, emoji]) => ({ emoji, name }));
      setFilteredEmojis(allEmojis.slice(0, 50));
      return;
    }

    const matches = Object.entries(emojiMap)
      .filter(([name]) => name.includes(searchQuery))
      .map(([name, emoji]) => ({ emoji, name }))
      .slice(0, 50);

    setFilteredEmojis(matches);
    setSelectedIndex(0);
  }, [query]);

  const insertEmoji = useCallback(
    (index: number) => {
      const emoji = filteredEmojis[index];
      if (emoji) {
        editor.chain().focus().deleteRange(range).insertContent(emoji.emoji + ' ').run();
        onClose();
      }
    },
    [editor, filteredEmojis, range, onClose]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredEmojis.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertEmoji(selectedIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredEmojis.length, insertEmoji, onClose]);

  if (filteredEmojis.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-72">
        <div className="text-center text-gray-500 text-sm">No emojis found</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-80">
      <div className="p-2 border-b border-gray-200 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">
          Type to search: <span className="font-mono">:{query.slice(1)}</span>
        </span>
      </div>
      <div className="max-h-64 overflow-y-auto p-2">
        <div className="grid grid-cols-8 gap-1">
          {filteredEmojis.map((item, index) => (
            <button
              key={`${item.emoji}-${index}`}
              onClick={() => insertEmoji(index)}
              className={cn(
                'p-2 text-2xl hover:bg-gray-100 rounded transition-colors',
                index === selectedIndex && 'bg-blue-100'
              )}
              title={item.name}
            >
              {item.emoji}
            </button>
          ))}
        </div>
      </div>
      <div className="p-2 border-t border-gray-200 text-xs text-gray-500 text-center">
        Use ↑↓ to navigate, Enter to select
      </div>
    </div>
  );
}
