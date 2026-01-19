import { z } from "zod";

export const BlockType = {
  PARAGRAPH: "paragraph",
  HEADING: "heading",
  CODE: "code",
  TABLE: "table",
  CALLOUT: "callout",
  EMBED: "embed",
  IMAGE: "image",
  DIVIDER: "divider",
  QUOTE: "quote",
  LIST: "list",
} as const;

export type BlockType = (typeof BlockType)[keyof typeof BlockType];

export const CalloutType = {
  INFO: "info",
  WARNING: "warning",
  TIP: "tip",
  DANGER: "danger",
} as const;

export type CalloutType = (typeof CalloutType)[keyof typeof CalloutType];

export const EmbedType = {
  YOUTUBE: "youtube",
  SPOTIFY: "spotify",
  FIGMA: "figma",
  TWITTER: "twitter",
  GENERIC: "generic",
} as const;

export type EmbedType = (typeof EmbedType)[keyof typeof EmbedType];

export const HeadingLevel = {
  H1: 1,
  H2: 2,
  H3: 3,
  H4: 4,
  H5: 5,
  H6: 6,
} as const;

export type HeadingLevel = (typeof HeadingLevel)[keyof typeof HeadingLevel];

export const ListStyle = {
  BULLET: "bullet",
  NUMBERED: "numbered",
  CHECKBOX: "checkbox",
} as const;

export type ListStyle = (typeof ListStyle)[keyof typeof ListStyle];

export const SortDirection = {
  ASC: "asc",
  DESC: "desc",
  NONE: "none",
} as const;

export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];

export interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  link?: string;
}

export interface TextSegment {
  text: string;
  format?: TextFormat;
}

export interface TableCell {
  id: string;
  content: TextSegment[];
}

export interface TableRow {
  id: string;
  cells: TableCell[];
}

export interface TableColumn {
  id: string;
  header: string;
  width?: number;
}

export interface ListItem {
  id: string;
  content: TextSegment[];
  checked?: boolean;
  children?: ListItem[];
}

export interface BlockDataMap {
  paragraph: {
    content: TextSegment[];
  };
  heading: {
    level: HeadingLevel;
    content: TextSegment[];
  };
  code: {
    language: string;
    code: string;
    output?: string;
    isRunning?: boolean;
  };
  table: {
    columns: TableColumn[];
    rows: TableRow[];
    sortColumn?: string;
    sortDirection?: SortDirection;
  };
  callout: {
    type: CalloutType;
    title?: string;
    content: TextSegment[];
  };
  embed: {
    type: EmbedType;
    url: string;
    title?: string;
    thumbnailUrl?: string;
    isExpanded?: boolean;
  };
  image: {
    url: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
  };
  divider: Record<string, never>;
  quote: {
    content: TextSegment[];
    author?: string;
  };
  list: {
    style: ListStyle;
    items: ListItem[];
  };
}

export interface Block<T extends BlockType = BlockType> {
  id: string;
  type: T;
  data: BlockDataMap[T];
  createdAt: number;
  updatedAt: number;
}

export interface Document {
  id: string;
  title: string;
  blocks: Block[];
  version: number;
  createdAt: number;
  updatedAt: number;
  metadata?: DocumentMetadata;
}

export interface DocumentMetadata {
  author?: string;
  tags?: string[];
  description?: string;
  language?: string;
}

export const TextSegmentSchema = z.object({
  text: z.string(),
  format: z
    .object({
      bold: z.boolean().optional(),
      italic: z.boolean().optional(),
      underline: z.boolean().optional(),
      strikethrough: z.boolean().optional(),
      code: z.boolean().optional(),
      link: z.string().optional(),
    })
    .optional(),
});

export const TableCellSchema = z.object({
  id: z.string(),
  content: z.array(TextSegmentSchema),
});

export const TableRowSchema = z.object({
  id: z.string(),
  cells: z.array(TableCellSchema),
});

export const TableColumnSchema = z.object({
  id: z.string(),
  header: z.string(),
  width: z.number().optional(),
});

export const ListItemSchema: z.ZodType<ListItem> = z.lazy(() =>
  z.object({
    id: z.string(),
    content: z.array(TextSegmentSchema),
    checked: z.boolean().optional(),
    children: z.array(ListItemSchema).optional(),
  })
);

export const BlockDataSchemas = {
  paragraph: z.object({
    content: z.array(TextSegmentSchema),
  }),
  heading: z.object({
    level: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
    ]),
    content: z.array(TextSegmentSchema),
  }),
  code: z.object({
    language: z.string(),
    code: z.string(),
    output: z.string().optional(),
    isRunning: z.boolean().optional(),
  }),
  table: z.object({
    columns: z.array(TableColumnSchema),
    rows: z.array(TableRowSchema),
    sortColumn: z.string().optional(),
    sortDirection: z.enum(["asc", "desc", "none"]).optional(),
  }),
  callout: z.object({
    type: z.enum(["info", "warning", "tip", "danger"]),
    title: z.string().optional(),
    content: z.array(TextSegmentSchema),
  }),
  embed: z.object({
    type: z.enum(["youtube", "spotify", "figma", "twitter", "generic"]),
    url: z.string().url(),
    title: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    isExpanded: z.boolean().optional(),
  }),
  image: z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
  divider: z.object({}),
  quote: z.object({
    content: z.array(TextSegmentSchema),
    author: z.string().optional(),
  }),
  list: z.object({
    style: z.enum(["bullet", "numbered", "checkbox"]),
    items: z.array(ListItemSchema),
  }),
};

export const BlockSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    "paragraph",
    "heading",
    "code",
    "table",
    "callout",
    "embed",
    "image",
    "divider",
    "quote",
    "list",
  ]),
  data: z.union([
    BlockDataSchemas.paragraph,
    BlockDataSchemas.heading,
    BlockDataSchemas.code,
    BlockDataSchemas.table,
    BlockDataSchemas.callout,
    BlockDataSchemas.embed,
    BlockDataSchemas.image,
    BlockDataSchemas.divider,
    BlockDataSchemas.quote,
    BlockDataSchemas.list,
  ]),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const DocumentMetadataSchema = z.object({
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  language: z.string().optional(),
});

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  blocks: z.array(BlockSchema),
  version: z.number().int().min(1),
  createdAt: z.number(),
  updatedAt: z.number(),
  metadata: DocumentMetadataSchema.optional(),
});

export type ValidatedDocument = z.infer<typeof DocumentSchema>;
export type ValidatedBlock = z.infer<typeof BlockSchema>;
