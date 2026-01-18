import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { DynamicTableComponent } from '../components/DynamicTableComponent';

export interface DynamicTableOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dynamicTable: {
      insertDynamicTable: (rows?: number, cols?: number) => ReturnType;
    };
  }
}

export const DynamicTable = Node.create<DynamicTableOptions>({
  name: 'dynamicTable',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      headers: {
        default: ['Column 1', 'Column 2'],
        parseHTML: element => JSON.parse(element.getAttribute('data-headers') || '[]'),
        renderHTML: attributes => ({
          'data-headers': JSON.stringify(attributes.headers),
        }),
      },
      rows: {
        default: [['', '']],
        parseHTML: element => JSON.parse(element.getAttribute('data-rows') || '[]'),
        renderHTML: attributes => ({
          'data-rows': JSON.stringify(attributes.rows),
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-dynamic-table]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-dynamic-table': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DynamicTableComponent);
  },

  addCommands() {
    return {
      insertDynamicTable:
        (rows = 3, cols = 2) =>
        ({ commands }) => {
          const headers = Array.from({ length: cols }, (_, i) => `Column ${i + 1}`);
          const rowsData = Array.from({ length: rows }, () => Array(cols).fill(''));

          return commands.insertContent({
            type: this.name,
            attrs: {
              headers,
              rows: rowsData,
            },
          });
        },
    };
  },
});
