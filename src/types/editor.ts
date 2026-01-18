export type BlockType = 
  | 'paragraph'
  | 'heading'
  | 'code'
  | 'table'
  | 'callout'
  | 'image'
  | 'embed'
  | 'divider';

export type CalloutType = 'info' | 'warning' | 'error' | 'success' | 'tip';

export interface BlockData {
  [key: string]: unknown;
}

export interface HeadingData extends BlockData {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface ParagraphData extends BlockData {
  text: string;
}

export interface CodeBlockData extends BlockData {
  language: string;
  code: string;
  output?: string;
  executable?: boolean;
}

export interface TableData extends BlockData {
  headers: string[];
  rows: string[][];
  sortable?: boolean;
}

export interface CalloutData extends BlockData {
  type: CalloutType;
  title: string;
  content: string;
}

export interface ImageData extends BlockData {
  url: string;
  alt: string;
  caption?: string;
}

export interface EmbedData extends BlockData {
  url: string;
  provider: 'youtube' | 'spotify' | 'figma' | 'twitter' | 'generic';
  embedHtml?: string;
}

export interface EditorBlock {
  id: string;
  type: BlockType;
  data: BlockData;
  children?: EditorBlock[];
}

export interface Document {
  id: string;
  title: string;
  content: EditorBlock[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface DocumentMetadata {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  readingTime: number;
}
