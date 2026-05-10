import { FontToken } from "@/types"

interface FontPreviewProps {
  font: FontToken
}

export default function FontPreview({ font }: FontPreviewProps) {
  const isAsset = typeof font !== "string"
  const label = isAsset ? font.name || font.family : font
  const family = isAsset ? `scraped-font-${btoa(font.url).replace(/[^a-zA-Z0-9]/g, "")}` : font
  const details = isAsset
    ? [font.family, font.weight, font.style]
      .filter(Boolean)
      .filter((value, index, arr) => arr.indexOf(value) === index)
      .join(", ")
    : ""
  const proxiedUrl = isAsset
    ? `/api/fonts?url=${encodeURIComponent(font.url)}${font.referer ? `&referer=${encodeURIComponent(font.referer)}` : ""}`
    : ""

  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-white border border-zinc-200 shadow-sm">
      {isAsset && (
        <style>
          {`
            @font-face {
              font-family: "${family}";
              src: url("${proxiedUrl}") format("${font.format.toLowerCase()}");
              font-weight: ${font.weight || "400"};
              font-style: ${font.style || "normal"};
              font-display: swap;
            }
          `}
        </style>
      )}
      <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
        {details ? `${label} (${details})` : label}
      </span>
      <span
        className="text-2xl text-zinc-950"
        style={{ fontFamily: `"${family}"` }}
      >
        Aa Bb Cc
      </span>
      <span
        className="text-sm text-zinc-700"
        style={{ fontFamily: `"${family}"` }}
      >
        The quick brown fox jumps over the lazy dog
      </span>
    </div>
  )
}
