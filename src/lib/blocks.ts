import { v4 as uuidv4 } from "uuid";
import type {
  Block,
  BlockType,
  BlockDataMap,
  Document,
  TextSegment,
  TableColumn,
  TableRow,
  TableCell,
  ListItem,
  CalloutType,
  HeadingLevel,
  ListStyle,
} from "@/types";

export function createId(): string {
  return uuidv4();
}

export function createTimestamp(): number {
  return Date.now();
}

export function createTextSegment(
  text: string,
  format?: TextSegment["format"]
): TextSegment {
  return { text, format };
}

export function createBlock<T extends BlockType>(
  type: T,
  data: BlockDataMap[T]
): Block<T> {
  const now = createTimestamp();
  return {
    id: createId(),
    type,
    data,
    createdAt: now,
    updatedAt: now,
  };
}

export function createParagraphBlock(text: string = ""): Block<"paragraph"> {
  return createBlock("paragraph", {
    content: [createTextSegment(text)],
  });
}

export function createHeadingBlock(
  text: string,
  level: HeadingLevel = 1
): Block<"heading"> {
  return createBlock("heading", {
    level,
    content: [createTextSegment(text)],
  });
}

export function createCodeBlock(
  code: string = "",
  language: string = "javascript"
): Block<"code"> {
  return createBlock("code", {
    language,
    code,
    output: undefined,
    isRunning: false,
  });
}

export function createTableCell(text: string = ""): TableCell {
  return {
    id: createId(),
    content: [createTextSegment(text)],
  };
}

export function createTableRow(columnCount: number): TableRow {
  return {
    id: createId(),
    cells: Array.from({ length: columnCount }, () => createTableCell()),
  };
}

export function createTableColumn(header: string): TableColumn {
  return {
    id: createId(),
    header,
    width: 150,
  };
}

export function createTableBlock(
  columns: string[] = ["Column 1", "Column 2", "Column 3"],
  rowCount: number = 2
): Block<"table"> {
  const tableColumns = columns.map(createTableColumn);
  const rows = Array.from({ length: rowCount }, () =>
    createTableRow(columns.length)
  );

  return createBlock("table", {
    columns: tableColumns,
    rows,
    sortColumn: undefined,
    sortDirection: "none",
  });
}

export function createCalloutBlock(
  type: CalloutType = "info",
  text: string = "",
  title?: string
): Block<"callout"> {
  return createBlock("callout", {
    type,
    title,
    content: [createTextSegment(text)],
  });
}

export function createEmbedBlock(url: string): Block<"embed"> {
  const embedType = detectEmbedType(url);
  return createBlock("embed", {
    type: embedType,
    url,
    title: undefined,
    thumbnailUrl: undefined,
    isExpanded: false,
  });
}

export function createImageBlock(
  url: string,
  alt?: string,
  caption?: string
): Block<"image"> {
  return createBlock("image", {
    url,
    alt,
    caption,
    width: undefined,
    height: undefined,
  });
}

export function createDividerBlock(): Block<"divider"> {
  return createBlock("divider", {});
}

export function createQuoteBlock(text: string, author?: string): Block<"quote"> {
  return createBlock("quote", {
    content: [createTextSegment(text)],
    author,
  });
}

export function createListItem(text: string = "", checked?: boolean): ListItem {
  return {
    id: createId(),
    content: [createTextSegment(text)],
    checked,
    children: undefined,
  };
}

export function createListBlock(
  style: ListStyle = "bullet",
  items: string[] = [""]
): Block<"list"> {
  return createBlock("list", {
    style,
    items: items.map((text) =>
      createListItem(text, style === "checkbox" ? false : undefined)
    ),
  });
}

export function createDocument(
  title: string = "Untitled Document"
): Document {
  const now = createTimestamp();
  return {
    id: createId(),
    title,
    blocks: [createParagraphBlock()],
    version: 1,
    createdAt: now,
    updatedAt: now,
    metadata: {
      language: "en",
    },
  };
}

export function detectEmbedType(url: string): Block<"embed">["data"]["type"] {
  const lowerUrl = url.toLowerCase();

  if (
    lowerUrl.includes("youtube.com") ||
    lowerUrl.includes("youtu.be")
  ) {
    return "youtube";
  }

  if (lowerUrl.includes("spotify.com")) {
    return "spotify";
  }

  if (lowerUrl.includes("figma.com")) {
    return "figma";
  }

  if (
    lowerUrl.includes("twitter.com") ||
    lowerUrl.includes("x.com")
  ) {
    return "twitter";
  }

  return "generic";
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

export function extractSpotifyId(url: string): { type: string; id: string } | null {
  const match = url.match(/spotify\.com\/(track|album|playlist|episode)\/([^?]+)/);
  if (match?.[1] && match[2]) {
    return { type: match[1], id: match[2] };
  }
  return null;
}

export function extractTwitterId(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  return match?.[1] ?? null;
}

export function cloneBlock<T extends BlockType>(block: Block<T>): Block<T> {
  return {
    ...block,
    id: createId(),
    data: JSON.parse(JSON.stringify(block.data)) as BlockDataMap[T],
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
  };
}

export function updateBlockData<T extends BlockType>(
  block: Block<T>,
  data: Partial<BlockDataMap[T]>
): Block<T> {
  return {
    ...block,
    data: { ...block.data, ...data },
    updatedAt: createTimestamp(),
  };
}
