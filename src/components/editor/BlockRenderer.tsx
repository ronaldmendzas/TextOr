"use client";

import type { Block } from "@/types";
import { ParagraphBlock } from "./blocks/ParagraphBlock";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { CodeBlock } from "./blocks/CodeBlock";
import { TableBlock } from "./blocks/TableBlock";
import { CalloutBlock } from "./blocks/CalloutBlock";
import { EmbedBlock } from "./blocks/EmbedBlock";
import { DividerBlock } from "./blocks/DividerBlock";
import { QuoteBlock } from "./blocks/QuoteBlock";
import { ListBlock } from "./blocks/ListBlock";
import { BlockWrapper } from "./blocks/BlockWrapper";

interface BlockRendererProps {
  block: Block;
  index: number;
  isFocused: boolean;
}

export function BlockRenderer({ block, index, isFocused }: BlockRendererProps) {
  const renderBlock = () => {
    switch (block.type) {
      case "paragraph":
        return <ParagraphBlock block={block as Block<"paragraph">} />;
      case "heading":
        return <HeadingBlock block={block as Block<"heading">} />;
      case "code":
        return <CodeBlock block={block as Block<"code">} />;
      case "table":
        return <TableBlock block={block as Block<"table">} />;
      case "callout":
        return <CalloutBlock block={block as Block<"callout">} />;
      case "embed":
        return <EmbedBlock block={block as Block<"embed">} />;
      case "divider":
        return <DividerBlock block={block as Block<"divider">} />;
      case "quote":
        return <QuoteBlock block={block as Block<"quote">} />;
      case "list":
        return <ListBlock block={block as Block<"list">} />;
      default:
        return null;
    }
  };

  return (
    <BlockWrapper block={block} index={index} isFocused={isFocused}>
      {renderBlock()}
    </BlockWrapper>
  );
}
