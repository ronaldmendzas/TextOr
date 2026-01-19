import type {
  Block,
  TextSegment,
  TableColumn,
  TableRow,
  ListItem,
} from "@/types";

type ParagraphBlock = Block<"paragraph">;
type HeadingBlock = Block<"heading">;
type CodeBlock = Block<"code">;
type TableBlock = Block<"table">;
type CalloutBlock = Block<"callout">;
type EmbedBlock = Block<"embed">;
type ImageBlock = Block<"image">;
type QuoteBlock = Block<"quote">;
type ListBlock = Block<"list">;

function getTextFromSegments(segments: TextSegment[]): string {
  return segments.map((s) => s.text).join("");
}

function applyStyles(
  text: string,
  format?: { bold?: boolean; italic?: boolean; strikethrough?: boolean }
): string {
  let result = text;
  if (format?.bold) result = `**${result}**`;
  if (format?.italic) result = `*${result}*`;
  if (format?.strikethrough) result = `~~${result}~~`;
  return result;
}

function getCalloutIcon(type: string): string {
  switch (type) {
    case "info":
      return "ℹ️";
    case "warning":
      return "⚠️";
    case "tip":
      return "💡";
    case "danger":
      return "🚨";
    default:
      return "📝";
  }
}

function getListPrefix(style: string, index: number, checked?: boolean): string {
  switch (style) {
    case "bullet":
      return "- ";
    case "numbered":
      return `${index + 1}. `;
    case "checkbox":
      return checked ? "- [x] " : "- [ ] ";
    default:
      return "- ";
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function spanToHTML(span: TextSegment): string {
  let result = escapeHtml(span.text);
  if (span.format?.bold) result = `<strong>${result}</strong>`;
  if (span.format?.italic) result = `<em>${result}</em>`;
  if (span.format?.underline) result = `<u>${result}</u>`;
  if (span.format?.strikethrough) result = `<s>${result}</s>`;
  if (span.format?.link) result = `<a href="${escapeHtml(span.format.link)}">${result}</a>`;
  return result;
}

function paragraphToMarkdown(block: ParagraphBlock): string {
  return block.data.content.map((s) => applyStyles(s.text, s.format)).join("");
}

function headingToMarkdown(block: HeadingBlock): string {
  const text = getTextFromSegments(block.data.content);
  const hashes = "#".repeat(block.data.level);
  return `${hashes} ${text}`;
}

function codeToMarkdown(block: CodeBlock): string {
  return `\`\`\`${block.data.language}\n${block.data.code}\n\`\`\``;
}

function tableToMarkdown(block: TableBlock): string {
  const { columns, rows } = block.data;
  const headerRow = `| ${columns.map((c: TableColumn) => c.header).join(" | ")} |`;
  const separator = `| ${columns.map(() => "---").join(" | ")} |`;
  const dataRows = rows.map(
    (row: TableRow) =>
      `| ${row.cells.map((cell) => getTextFromSegments(cell.content)).join(" | ")} |`
  );
  return [headerRow, separator, ...dataRows].join("\n");
}

function calloutToMarkdown(block: CalloutBlock): string {
  const icon = getCalloutIcon(block.data.type);
  const title = block.data.title ? `**${block.data.title}**\n` : "";
  const text = getTextFromSegments(block.data.content);
  return `> ${icon} ${title}${text}`;
}

function embedToMarkdown(block: EmbedBlock): string {
  return `[${block.data.url}](${block.data.url})`;
}

function imageToMarkdown(block: ImageBlock): string {
  return `![${block.data.alt ?? "Image"}](${block.data.url})`;
}

function quoteToMarkdown(block: QuoteBlock): string {
  const text = getTextFromSegments(block.data.content);
  const author = block.data.author ? `\n> — *${block.data.author}*` : "";
  return `> ${text}${author}`;
}

function listToMarkdown(block: ListBlock): string {
  return block.data.items
    .map((item: ListItem, index: number) => {
      const prefix = getListPrefix(block.data.style, index, item.checked);
      const text = getTextFromSegments(item.content);
      return `${prefix}${text}`;
    })
    .join("\n");
}

function blockToMarkdown(block: Block): string {
  switch (block.type) {
    case "paragraph":
      return paragraphToMarkdown(block as ParagraphBlock);
    case "heading":
      return headingToMarkdown(block as HeadingBlock);
    case "code":
      return codeToMarkdown(block as CodeBlock);
    case "table":
      return tableToMarkdown(block as TableBlock);
    case "callout":
      return calloutToMarkdown(block as CalloutBlock);
    case "embed":
      return embedToMarkdown(block as EmbedBlock);
    case "image":
      return imageToMarkdown(block as ImageBlock);
    case "divider":
      return "---";
    case "quote":
      return quoteToMarkdown(block as QuoteBlock);
    case "list":
      return listToMarkdown(block as ListBlock);
    default:
      return "";
  }
}

export function exportToMarkdown(blocks: Block[]): string {
  return blocks.map(blockToMarkdown).join("\n\n");
}

export function exportToJSON(blocks: Block[], title: string): string {
  const document = {
    title,
    version: "1.0",
    createdAt: new Date().toISOString(),
    blocks,
  };
  return JSON.stringify(document, null, 2);
}

function paragraphToHTML(block: ParagraphBlock): string {
  const text = block.data.content.map((s) => spanToHTML(s)).join("");
  return `<p>${text}</p>`;
}

function headingToHTML(block: HeadingBlock): string {
  const text = getTextFromSegments(block.data.content);
  return `<h${block.data.level}>${escapeHtml(text)}</h${block.data.level}>`;
}

function codeToHTML(block: CodeBlock): string {
  return `<pre><code class="language-${block.data.language}">${escapeHtml(block.data.code)}</code></pre>`;
}

function tableToHTML(block: TableBlock): string {
  const headerCells = block.data.columns
    .map((c: TableColumn) => `<th>${escapeHtml(c.header)}</th>`)
    .join("");
  const rows = block.data.rows
    .map(
      (row: TableRow) =>
        `<tr>${row.cells.map((cell) => `<td>${escapeHtml(getTextFromSegments(cell.content))}</td>`).join("")}</tr>`
    )
    .join("\n");
  return `<table><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table>`;
}

function calloutToHTML(block: CalloutBlock): string {
  const title = block.data.title
    ? `<strong>${escapeHtml(block.data.title)}</strong><br>`
    : "";
  const text = getTextFromSegments(block.data.content);
  return `<div class="callout callout-${block.data.type}">${title}${escapeHtml(text)}</div>`;
}

function embedToHTML(block: EmbedBlock): string {
  return `<a href="${escapeHtml(block.data.url)}" target="_blank" rel="noopener">${escapeHtml(block.data.url)}</a>`;
}

function imageToHTML(block: ImageBlock): string {
  return `<img src="${escapeHtml(block.data.url)}" alt="${escapeHtml(block.data.alt ?? "")}" style="max-width: 100%;">`;
}

function quoteToHTML(block: QuoteBlock): string {
  const text = getTextFromSegments(block.data.content);
  const author = block.data.author
    ? `<footer>— ${escapeHtml(block.data.author)}</footer>`
    : "";
  return `<blockquote>${escapeHtml(text)}${author}</blockquote>`;
}

function listToHTML(block: ListBlock): string {
  const tag = block.data.style === "numbered" ? "ol" : "ul";
  const className = block.data.style === "checkbox" ? ' class="checkbox"' : "";
  const items = block.data.items
    .map((item: ListItem) => {
      const checkedClass = item.checked ? ' class="checked"' : "";
      const text = getTextFromSegments(item.content);
      return `<li${checkedClass}>${escapeHtml(text)}</li>`;
    })
    .join("\n");
  return `<${tag}${className}>${items}</${tag}>`;
}

function blockToHTML(block: Block): string {
  switch (block.type) {
    case "paragraph":
      return paragraphToHTML(block as ParagraphBlock);
    case "heading":
      return headingToHTML(block as HeadingBlock);
    case "code":
      return codeToHTML(block as CodeBlock);
    case "table":
      return tableToHTML(block as TableBlock);
    case "callout":
      return calloutToHTML(block as CalloutBlock);
    case "embed":
      return embedToHTML(block as EmbedBlock);
    case "image":
      return imageToHTML(block as ImageBlock);
    case "divider":
      return "<hr>";
    case "quote":
      return quoteToHTML(block as QuoteBlock);
    case "list":
      return listToHTML(block as ListBlock);
    default:
      return "";
  }
}

export function exportToHTML(blocks: Block[], title: string): string {
  const content = blocks.map(blockToHTML).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #1a1a1a;
    }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    code { font-family: 'Fira Code', Consolas, monospace; }
    blockquote { border-left: 4px solid #6366f1; padding-left: 1rem; margin: 1rem 0; font-style: italic; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 0.5rem 1rem; text-align: left; }
    th { background: #f4f4f4; }
    .callout { padding: 1rem; border-radius: 8px; margin: 1rem 0; }
    .callout-info { background: #dbeafe; border-left: 4px solid #3b82f6; }
    .callout-warning { background: #fef3c7; border-left: 4px solid #f59e0b; }
    .callout-tip { background: #d1fae5; border-left: 4px solid #10b981; }
    .callout-danger { background: #fee2e2; border-left: 4px solid #ef4444; }
    hr { border: none; border-top: 1px solid #ddd; margin: 2rem 0; }
    ul, ol { padding-left: 1.5rem; }
    .checkbox { list-style: none; padding-left: 0; }
    .checkbox li::before { content: '☐ '; }
    .checkbox li.checked::before { content: '☑ '; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${content}
</body>
</html>`;
}

export async function exportToPDF(blocks: Block[], title: string): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;
  const lineHeight = 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(title, margin, y);
  y += 15;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  for (const block of blocks) {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    switch (block.type) {
      case "paragraph": {
        const paragraphBlock = block as ParagraphBlock;
        const text = getTextFromSegments(paragraphBlock.data.content);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines as string[], margin, y);
        y += (lines as string[]).length * lineHeight + 5;
        break;
      }

      case "heading": {
        const headingBlock = block as HeadingBlock;
        const text = getTextFromSegments(headingBlock.data.content);
        const fontSize = 24 - (headingBlock.data.level - 1) * 2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines as string[], margin, y);
        y += (lines as string[]).length * (lineHeight + 2) + 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        break;
      }

      case "code": {
        const codeBlock = block as CodeBlock;
        doc.setFont("courier", "normal");
        doc.setFontSize(10);
        const lines = codeBlock.data.code.split("\n");
        for (const line of lines) {
          if (y > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += lineHeight;
        }
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        break;
      }

      case "quote": {
        const quoteBlock = block as QuoteBlock;
        doc.setFont("helvetica", "italic");
        const text = getTextFromSegments(quoteBlock.data.content);
        const lines = doc.splitTextToSize(`"${text}"`, maxWidth - 10);
        doc.text(lines as string[], margin + 10, y);
        y += (lines as string[]).length * lineHeight;
        if (quoteBlock.data.author) {
          doc.text(`— ${quoteBlock.data.author}`, margin + 10, y);
          y += lineHeight;
        }
        y += 5;
        doc.setFont("helvetica", "normal");
        break;
      }

      case "divider": {
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
        break;
      }

      case "list": {
        const listBlock = block as ListBlock;
        for (let i = 0; i < listBlock.data.items.length; i++) {
          if (y > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
          }
          const item = listBlock.data.items[i];
          if (!item) continue;
          const text = getTextFromSegments(item.content);
          let prefix = "• ";
          if (listBlock.data.style === "numbered") prefix = `${i + 1}. `;
          if (listBlock.data.style === "checkbox")
            prefix = item.checked ? "☑ " : "☐ ";
          doc.text(`${prefix}${text}`, margin, y);
          y += lineHeight;
        }
        y += 5;
        break;
      }

      default:
        break;
    }
  }

  doc.save(
    `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "document"}.pdf`
  );
}
