import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export interface VariablesOptions {
  variables: Record<string, () => string>;
}

export const Variables = Extension.create<VariablesOptions>({
  name: 'variables',

  addOptions() {
    return {
      variables: {
        date: () => new Date().toLocaleDateString(),
        time: () => new Date().toLocaleTimeString(),
        datetime: () => new Date().toLocaleString(),
        year: () => new Date().getFullYear().toString(),
        month: () => new Date().toLocaleDateString('en-US', { month: 'long' }),
        day: () => new Date().getDate().toString(),
        weekday: () => new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      },
    };
  },

  addProseMirrorPlugins() {
    const { variables } = this.options;

    return [
      new Plugin({
        key: new PluginKey('variables'),
        
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            const doc = state.doc;

            doc.descendants((node, pos) => {
              if (!node.isText) return;

              const text = node.text || '';
              const regex = /\{\{(\w+)\}\}/g;
              let match;

              while ((match = regex.exec(text)) !== null) {
                const from = pos + match.index;
                const to = from + match[0].length;
                const variable = match[1];

                if (variables[variable]) {
                  decorations.push(
                    Decoration.inline(from, to, {
                      class: 'variable-placeholder',
                      'data-variable': variable,
                    })
                  );
                }
              }
            });

            return DecorationSet.create(doc, decorations);
          },
          
          handleTextInput(view, from, to, text) {
            if (text !== ' ') return false;

            const { state, dispatch } = view;
            const { tr } = state;
            const textBefore = state.doc.textBetween(
              Math.max(0, from - 20),
              from,
              '\n'
            );

            const match = textBefore.match(/\{\{(\w+)\}\}$/);

            if (match) {
              const variable = match[1];
              const value = variables[variable];

              if (value) {
                const matchStart = from - match[0].length;
                tr.delete(matchStart, from);
                tr.insertText(value() + ' ', matchStart);
                dispatch(tr);
                return true;
              }
            }

            return false;
          },
        },
      }),
    ];
  },

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          variable: {
            default: null,
            parseHTML: element => element.getAttribute('data-variable'),
            renderHTML: attributes => {
              if (!attributes.variable) {
                return {};
              }

              return {
                'data-variable': attributes.variable,
                class: 'variable-placeholder',
              };
            },
          },
        },
      },
    ];
  },
});
