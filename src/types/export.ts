export type ExportFormat = 'pdf' | 'markdown' | 'json' | 'html';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  fileName?: string;
}

export interface ExportResult {
  success: boolean;
  data?: Blob | string;
  error?: string;
}
