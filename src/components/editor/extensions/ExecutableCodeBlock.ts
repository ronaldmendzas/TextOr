import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CodeBlockComponent } from '../components/CodeBlockComponent';

export interface CodeBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    executableCodeBlock: {
      setExecutableCodeBlock: (language?: string) => ReturnType;
    };
  }
}

export const ExecutableCodeBlock = Node.create<CodeBlockOptions>({
  name: 'executableCodeBlock',

  group: 'block',

  content: 'text*',

  marks: '',

  code: true,

  defining: true,

  addAttributes() {
    return {
      language: {
        default: 'javascript',
        parseHTML: element => element.getAttribute('data-language'),
        renderHTML: attributes => ({
          'data-language': attributes.language,
        }),
      },
      output: {
        default: '',
        parseHTML: element => element.getAttribute('data-output'),
        renderHTML: attributes => ({
          'data-output': attributes.output,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'pre[data-executable]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'pre',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-executable': '' }),
      ['code', 0],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },

  addCommands() {
    return {
      setExecutableCodeBlock:
        language =>
        ({ commands }) =>
          commands.setNode(this.name, { language }),
    };
  },
});
