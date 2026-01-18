'use client';

import { useState } from 'react';
import { Download, FileText, FileJson, FileCode, X } from 'lucide-react';
import { ExportService } from '@/services/export.service';
import type { Document } from '@/types/editor';
import { cn } from '@/lib/utils';

interface ExportMenuProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportMenu({ document, isOpen, onClose }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleExport = async (format: 'pdf' | 'markdown' | 'json' | 'html') => {
    setIsExporting(true);
    setExportStatus(null);

    const result = await ExportService.exportDocument(document, {
      format,
      includeMetadata: true,
      fileName: `${document.title.replace(/\s+/g, '-')}.${format === 'markdown' ? 'md' : format}`,
    });

    setIsExporting(false);

    if (result.success && result.data) {
      const mimeTypes = {
        pdf: 'application/pdf',
        markdown: 'text/markdown',
        json: 'application/json',
        html: 'text/html',
      };

      const fileName = `${document.title.replace(/\s+/g, '-')}.${
        format === 'markdown' ? 'md' : format
      }`;

      ExportService.downloadFile(result.data, fileName, mimeTypes[format]);
      
      setExportStatus({
        success: true,
        message: `Successfully exported as ${format.toUpperCase()}`,
      });

      setTimeout(() => {
        setExportStatus(null);
        onClose();
      }, 2000);
    } else {
      setExportStatus({
        success: false,
        message: result.error || 'Export failed',
      });
    }
  };

  if (!isOpen) return null;

  const exportOptions = [
    {
      format: 'pdf' as const,
      icon: FileText,
      title: 'Export as PDF',
      description: 'Download as PDF document',
      color: 'text-red-600',
    },
    {
      format: 'markdown' as const,
      icon: FileCode,
      title: 'Export as Markdown',
      description: 'Download as .md file',
      color: 'text-blue-600',
    },
    {
      format: 'json' as const,
      icon: FileJson,
      title: 'Export as JSON',
      description: 'Download as structured data',
      color: 'text-yellow-600',
    },
    {
      format: 'html' as const,
      icon: FileCode,
      title: 'Export as HTML',
      description: 'Download as clean HTML',
      color: 'text-green-600',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg">Export Document</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close export menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {exportOptions.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.format}
                onClick={() => handleExport(option.format)}
                disabled={isExporting}
                className={cn(
                  'w-full flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200',
                  'hover:border-blue-500 hover:bg-blue-50 transition-all',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <Icon className={cn('w-6 h-6 flex-shrink-0', option.color)} />
                <div className="text-left flex-1">
                  <div className="font-medium text-gray-900">{option.title}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
                <Download className="w-5 h-5 text-gray-400" />
              </button>
            );
          })}
        </div>

        {exportStatus && (
          <div
            className={cn(
              'p-4 border-t',
              exportStatus.success
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            )}
          >
            <div className="text-sm font-medium text-center">{exportStatus.message}</div>
          </div>
        )}

        {isExporting && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Exporting...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
