'use client';

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { useState } from 'react';
import { Play, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CodeBlockComponent({
  node,
  updateAttributes,
}: {
  node: { attrs: { language: string; output: string } };
  updateAttributes: (attrs: { output?: string }) => void;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const executeCode = async () => {
    setIsRunning(true);
    try {
      const code = (document.querySelector('.code-content') as HTMLElement)?.textContent || '';
      
      if (node.attrs.language === 'javascript') {
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(arg => String(arg)).join(' '));
        };

        try {
          eval(code);
          updateAttributes({ output: logs.join('\n') || 'Code executed successfully' });
        } catch (error) {
          updateAttributes({
            output: `Error: ${error instanceof Error ? error.message : String(error)}`,
          });
        } finally {
          console.log = originalLog;
        }
      } else {
        updateAttributes({ output: 'Language not supported for execution yet' });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = async () => {
    const code = (document.querySelector('.code-content') as HTMLElement)?.textContent || '';
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <div className="bg-gray-900 rounded-lg overflow-hidden my-4">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-sm text-gray-400">{node.attrs.language}</span>
          <div className="flex gap-2">
            <button
              onClick={copyCode}
              className="p-1.5 rounded hover:bg-gray-700 transition-colors"
              title="Copy code"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {node.attrs.language === 'javascript' && (
              <button
                onClick={executeCode}
                disabled={isRunning}
                className={cn(
                  'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                  'bg-green-600 hover:bg-green-700 text-white',
                  isRunning && 'opacity-50 cursor-not-allowed'
                )}
                title="Run code"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="p-4">
          <pre className="text-gray-100 font-mono text-sm">
            <NodeViewContent className="code-content" />
          </pre>
        </div>
        {node.attrs.output && (
          <div className="px-4 py-3 bg-gray-800 border-t border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Output:</div>
            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
              {node.attrs.output}
            </pre>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
