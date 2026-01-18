import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';

export interface InlineCalculatorOptions {
  enabled: boolean;
}

export const InlineCalculator = Extension.create<InlineCalculatorOptions>({
  name: 'inlineCalculator',

  addOptions() {
    return {
      enabled: true,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('inlineCalculator'),
        
        props: {
          handleTextInput(view, from, _to, text) {
            if (text !== ' ') return false;

            const { state, dispatch } = view;
            const textBefore = state.doc.textBetween(
              Math.max(0, from - 50),
              from,
              '\n'
            );

            const match = textBefore.match(/=([0-9+\-*/().\s]+)$/);

            if (match) {
              try {
                const expression = match[1].trim();
                const result = Function(`"use strict"; return (${expression})`)();

                if (typeof result === 'number' && !isNaN(result)) {
                  const matchStart = from - match[0].length;
                  const { tr } = state;
                  
                  tr.delete(matchStart, from);
                  tr.insertText(`${match[0]} = ${result} `, matchStart);
                  
                  dispatch(tr);
                  return true;
                }
              } catch (error) {
                return false;
              }
            }

            return false;
          },
        },
      }),
    ];
  },
});
