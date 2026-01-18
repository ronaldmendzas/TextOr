import jsPDF from 'jspdf';
import type { EditorBlock, Document } from '@/types/editor';
import type { ExportOptions, ExportResult } from '@/types/export';

export class ExportService {
  static async exportDocument(
    document: Document,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      switch (options.format) {
        case 'pdf':
          return await this.exportToPDF(document, options);
        case 'markdown':
          return this.exportToMarkdown(document, options);
        case 'json':
          return this.exportToJSON(document, options);
        case 'html':
          return this.exportToHTML(document, options);
        default:
          return {
            success: false,
            error: `Unsupported export format: ${options.format}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  private static async exportToPDF(
    document: Document,
    options: ExportOptions
  ): Promise<ExportResult> {
    const pdf = new jsPDF();
    let yPosition = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;

    pdf.setFontSize(24);
    pdf.text(document.title, margin, yPosition);
    yPosition += 15;

    if (options.includeMetadata) {
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Created: ${document.createdAt.toLocaleDateString()}`, margin, yPosition);
      yPosition += 10;
    }

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);

    for (const block of document.content) {
      const text = this.blockToText(block);
      const lines = pdf.splitTextToSize(text, pdf.internal.pageSize.width - margin * 2);
      
      for (const line of lines) {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 7;
      }
      yPosition += 5;
    }

    const blob = pdf.output('blob');
    return { success: true, data: blob };
  }

  private static exportToMarkdown(
    document: Document,
    options: ExportOptions
  ): ExportResult {
    let markdown = `# ${document.title}\n\n`;

    if (options.includeMetadata) {
      markdown += `_Created: ${document.createdAt.toLocaleDateString()}_\n\n`;
      markdown += `---\n\n`;
    }

    for (const block of document.content) {
      markdown += this.blockToMarkdown(block) + '\n\n';
    }

    return { success: true, data: markdown };
  }

  private static exportToJSON(
    document: Document,
    options: ExportOptions
  ): ExportResult {
    const data = options.includeMetadata
      ? document
      : { title: document.title, content: document.content };

    return { success: true, data: JSON.stringify(data, null, 2) };
  }

  private static exportToHTML(
    document: Document,
    options: ExportOptions
  ): ExportResult {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.title}</title>
  <style>
    body { 
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 { margin-bottom: 0.5rem; }
    .metadata { color: #666; font-size: 0.875rem; margin-bottom: 2rem; }
    code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 5px; overflow-x: auto; }
    .callout { padding: 1rem; border-radius: 5px; margin: 1rem 0; }
    .callout-info { background: #e3f2fd; border-left: 4px solid #2196f3; }
    .callout-warning { background: #fff3e0; border-left: 4px solid #ff9800; }
    .callout-error { background: #ffebee; border-left: 4px solid #f44336; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    th { background: #f4f4f4; }
  </style>
</head>
<body>
  <h1>${document.title}</h1>
`;

    if (options.includeMetadata) {
      html += `  <div class="metadata">Created: ${document.createdAt.toLocaleDateString()}</div>\n`;
    }

    for (const block of document.content) {
      html += `  ${this.blockToHTML(block)}\n`;
    }

    html += `</body>\n</html>`;

    return { success: true, data: html };
  }

  private static blockToText(block: EditorBlock): string {
    switch (block.type) {
      case 'heading':
        return (block.data as { text: string }).text;
      case 'paragraph':
        return (block.data as { text: string }).text;
      case 'code':
        return (block.data as { code: string }).code;
      default:
        return JSON.stringify(block.data);
    }
  }

  private static blockToMarkdown(block: EditorBlock): string {
    switch (block.type) {
      case 'heading': {
        const { level, text } = block.data as { level: number; text: string };
        return `${'#'.repeat(level)} ${text}`;
      }
      case 'paragraph':
        return (block.data as { text: string }).text;
      case 'code': {
        const { language, code } = block.data as { language: string; code: string };
        return `\`\`\`${language}\n${code}\n\`\`\``;
      }
      case 'callout': {
        const { type, title, content } = block.data as { type: string; title: string; content: string };
        return `> **${type.toUpperCase()}: ${title}**\n> ${content}`;
      }
      default:
        return '';
    }
  }

  private static blockToHTML(block: EditorBlock): string {
    switch (block.type) {
      case 'heading': {
        const { level, text } = block.data as { level: number; text: string };
        return `<h${level}>${text}</h${level}>`;
      }
      case 'paragraph':
        return `<p>${(block.data as { text: string }).text}</p>`;
      case 'code': {
        const { language, code } = block.data as { language: string; code: string };
        return `<pre><code class="language-${language}">${code}</code></pre>`;
      }
      case 'callout': {
        const { type, title, content } = block.data as { type: string; title: string; content: string };
        return `<div class="callout callout-${type}"><strong>${title}</strong><p>${content}</p></div>`;
      }
      default:
        return '';
    }
  }

  static downloadFile(data: Blob | string, fileName: string, mimeType: string): void {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
