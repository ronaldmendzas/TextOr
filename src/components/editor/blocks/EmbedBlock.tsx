"use client";

import { useState, useCallback, useEffect } from "react";
import { useEditorStore } from "@/stores";
import { useI18n } from "@/hooks";
import type { Block } from "@/types";
import {
  extractYouTubeId,
  extractSpotifyId,
  extractTwitterId,
  detectEmbedType,
} from "@/lib";
import { Link2, ExternalLink, ChevronUp } from "lucide-react";

interface EmbedBlockProps {
  block: Block<"embed">;
}

export function EmbedBlock({ block }: EmbedBlockProps) {
  const { t } = useI18n();
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const pushToHistory = useEditorStore((state) => state.pushToHistory);
  const [showPrompt, setShowPrompt] = useState(!block.data.isExpanded);
  const [inputUrl, setInputUrl] = useState(block.data.url);

  useEffect(() => {
    if (block.data.url && !block.data.isExpanded) {
      setShowPrompt(true);
    }
  }, [block.data.url, block.data.isExpanded]);

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      setInputUrl(url);
    },
    []
  );

  const handleUrlBlur = useCallback(() => {
    if (inputUrl !== block.data.url) {
      const embedType = detectEmbedType(inputUrl);
      updateBlock<"embed">(block.id, {
        url: inputUrl,
        type: embedType,
      });
      setShowPrompt(true);
    }
  }, [block.id, block.data.url, inputUrl, updateBlock]);

  const handleEmbed = useCallback(() => {
    pushToHistory("Embed content");
    updateBlock<"embed">(block.id, {
      isExpanded: true,
    });
    setShowPrompt(false);
  }, [block.id, updateBlock, pushToHistory]);

  const handleKeepLink = useCallback(() => {
    setShowPrompt(false);
  }, []);

  const toggleExpand = useCallback(() => {
    updateBlock<"embed">(block.id, {
      isExpanded: !block.data.isExpanded,
    });
  }, [block.id, block.data.isExpanded, updateBlock]);

  const renderEmbed = () => {
    if (!block.data.isExpanded) {
      return (
        <a
          href={block.data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-editor-accent hover:underline"
        >
          <Link2 className="h-4 w-4" />
          <span className="truncate">{block.data.url}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }

    switch (block.data.type) {
      case "youtube": {
        const videoId = extractYouTubeId(block.data.url);
        if (!videoId) return <div>Invalid YouTube URL</div>;
        return (
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="h-full w-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video"
            />
          </div>
        );
      }

      case "spotify": {
        const spotifyData = extractSpotifyId(block.data.url);
        if (!spotifyData) return <div>Invalid Spotify URL</div>;
        return (
          <iframe
            src={`https://open.spotify.com/embed/${spotifyData.type}/${spotifyData.id}`}
            className="h-20 w-full rounded-lg"
            allow="encrypted-media"
            title="Spotify embed"
          />
        );
      }

      case "twitter": {
        const tweetId = extractTwitterId(block.data.url);
        if (!tweetId) return <div>Invalid Twitter/X URL</div>;
        return (
          <div className="rounded-lg border border-editor-border bg-editor-hover p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-editor-muted" />
              <div>
                <div className="font-semibold">Tweet</div>
                <div className="text-sm text-editor-muted">@user</div>
              </div>
            </div>
            <p className="text-sm">
              Loading tweet... 
              <a 
                href={block.data.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-editor-accent hover:underline"
              >
                View on X
              </a>
            </p>
          </div>
        );
      }

      case "figma": {
        return (
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.figma.com/embed?embed_host=textor&url=${encodeURIComponent(block.data.url)}`}
              className="h-full w-full rounded-lg"
              allowFullScreen
              title="Figma embed"
            />
          </div>
        );
      }

      default:
        return (
          <div className="rounded-lg border border-editor-border bg-editor-hover p-4">
            <a
              href={block.data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-editor-accent hover:underline"
            >
              <Link2 className="h-4 w-4" />
              <span className="truncate">{block.data.url}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        );
    }
  };

  return (
    <div className="embed-container">
      {!block.data.url ? (
        <div className="p-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-editor-muted" />
            <input
              type="url"
              value={inputUrl}
              onChange={handleUrlChange}
              onBlur={handleUrlBlur}
              placeholder="Paste a URL (YouTube, Spotify, Twitter, Figma...)"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-editor-muted"
              aria-label="Embed URL"
            />
          </div>
        </div>
      ) : (
        <>
          {showPrompt && !block.data.isExpanded && (
            <div className="embed-placeholder">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-editor-muted" />
                <span className="text-sm">{t.blocks.embed.embedPrompt}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEmbed}
                  className="rounded-md bg-editor-accent px-3 py-1 text-sm text-white hover:bg-editor-accent/90"
                >
                  {t.blocks.embed.yes}
                </button>
                <button
                  onClick={handleKeepLink}
                  className="rounded-md bg-editor-hover px-3 py-1 text-sm hover:bg-editor-border"
                >
                  {t.blocks.embed.no}
                </button>
              </div>
            </div>
          )}

          {!showPrompt && (
            <>
              <div className="p-4">{renderEmbed()}</div>
              {block.data.isExpanded && (
                <button
                  onClick={toggleExpand}
                  className="flex w-full items-center justify-center gap-1 border-t border-editor-border py-2 text-sm text-editor-muted hover:bg-editor-hover"
                >
                  <ChevronUp className="h-4 w-4" />
                  <span>Collapse</span>
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
