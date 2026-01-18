'use client';

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react';
import { Info, AlertTriangle, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

const calloutConfig = {
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-900',
    iconClassName: 'text-blue-600',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    iconClassName: 'text-yellow-600',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-900',
    iconClassName: 'text-red-600',
  },
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-900',
    iconClassName: 'text-green-600',
  },
  tip: {
    icon: Lightbulb,
    className: 'bg-purple-50 border-purple-200 text-purple-900',
    iconClassName: 'text-purple-600',
  },
};

export function CalloutComponent({ node }: NodeViewProps) {
  const type = node.attrs.type as keyof typeof calloutConfig;
  const config = calloutConfig[type] || calloutConfig.info;
  const Icon = config.icon;

  return (
    <NodeViewWrapper className="callout-wrapper">
      <div className={cn('p-4 rounded-lg border-2 my-4', config.className)}>
        <div className="flex gap-3">
          <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconClassName)} />
          <div className="flex-1">
            <div className="font-semibold mb-1">{node.attrs.title}</div>
            <NodeViewContent className="content" />
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
