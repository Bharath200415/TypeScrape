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
      {isAsset && (
        <div className="mt-3">
          <button
            onClick={async () => {
              try {
                const res = await fetch(proxiedUrl)
                if (!res.ok) throw new Error(`Download failed: ${res.status}`)
                const blob = await res.blob()
                const urlObj = URL.createObjectURL(blob)
                let filename = font.name || "font"
                try {
                  const parsed = new URL(font.url)
                  const parts = parsed.pathname.split("/")
                  const last = parts[parts.length - 1]
                  if (last) filename = last.split("?")[0]
                } catch {
                  // ignore
                }

                const a = document.createElement("a")
                a.href = urlObj
                a.download = filename
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(urlObj)
              } catch (err) {
                console.error("Font download error:", err)
                alert("Failed to download font")
              }
            }}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l4-4m-4 4l-4-4M21 21H3" />
            </svg>
            Download
          </button>
        </div>
      )}
    </div>
  )
}
