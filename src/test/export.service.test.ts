import { describe, it, expect } from 'vitest';
import { ExportService } from '@/services/export.service';
import type { Document } from '@/types/editor';

describe('Export Service', () => {
  const mockDocument: Document = {
    id: 'test-doc',
    title: 'Test Document',
    content: [
      {
        id: '1',
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello World' }],
      },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    version: 1,
  };

  describe('exportDocument', () => {
    it('should export to JSON format', async () => {
      const result = await ExportService.exportDocument(mockDocument, {
        format: 'json',
        includeMetadata: true,
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        const parsed = JSON.parse(result.data);
        expect(parsed.id).toBe('test-doc');
      }
    });

    it('should handle unsupported format', async () => {
      const result = await ExportService.exportDocument(mockDocument, {
        format: 'invalid' as any,
        includeMetadata: false,
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported export format');
    });

    it('should have export methods', () => {
      expect(ExportService.exportDocument).toBeDefined();
    });
  });
});
