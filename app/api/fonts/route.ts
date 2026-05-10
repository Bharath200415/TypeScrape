import { NextRequest, NextResponse } from "next/server"

interface FontInfo {
  name: string
  family: string
  format: string
  url: string
  weight?: string
  style?: string
  referer?: string
}

const fontFaceRegex = /@font-face\s*\{([\s\S]*?)\}/gi
const importRegex = /@import\s+(?:url\(['"]?|['"])([^'")]+\.css[^'")]*)(?:['"]?\)['"]?|['"])\s*[^;]*;/gi
const fontFamilyRegex = /font-family\s*:\s*['"]?([^'";]+)['"]?/i
const srcRegex = /src\s*:\s*([^;]+)/i
const weightRegex = /font-weight\s*:\s*([^;]+)/i
const styleRegexProp = /font-style\s*:\s*([^;]+)/i
const fontSourceRegex = /url\s*\(\s*['"]?([^'")]+)['"]?\s*\)\s*(?:format\s*\(\s*['"]?([^'")]+)['"]?\s*\))?/gi
const formatPreference = ["WOFF2", "WOFF", "OPENTYPE", "TRUETYPE", "OTF", "TTF", "EOT", "SVG"]

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  const referer = request.nextUrl.searchParams.get("referer")

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }

  try {
    const fontUrl = new URL(url)
    const origin = referer ? new URL(referer).origin : fontUrl.origin
    const response = await fetch(fontUrl.href, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Accept: "*/*",
        Referer: referer || fontUrl.origin,
        Origin: origin,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch font: ${response.status}` },
        { status: response.status }
      )
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "font/woff2"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Font proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch font" }, { status: 500 })
  }
}

function resolveUrl(base: string, relative: string): string {
  try {
    if (relative.startsWith("data:")) return relative
    return new URL(relative, base).href
  } catch {
    return relative
  }
}

function getFormatFromUrl(url: string): string {
  const cleanUrl = url.split("?")[0].split("#")[0]
  const ext = cleanUrl.split(".").pop()?.toLowerCase()
  const formatMap: Record<string, string> = {
    woff2: "WOFF2", woff: "WOFF", ttf: "TrueType",
    otf: "OpenType", eot: "EOT", svg: "SVG",
  }
  return formatMap[ext || ""] || "Unknown"
}

function normalizeFamilyName(family: string): string {
  return family.replace(/["']/g, "").trim()
}

function pickBestSource(src: string, baseUrl: string): { url: string; format: string } | null {
  const candidates: { url: string; format: string }[] = []
  let match
  const regexCopy = new RegExp(fontSourceRegex.source, "gi")

  while ((match = regexCopy.exec(src)) !== null) {
    const rawUrl = match[1]?.trim()
    if (!rawUrl || rawUrl.startsWith("local(")) continue
    const resolvedUrl = resolveUrl(baseUrl, rawUrl)
    const rawFormat =
      match[2]?.replace(/["']/g, "").trim().toUpperCase() ||
      getFormatFromUrl(rawUrl)
    candidates.push({ url: resolvedUrl, format: rawFormat })
  }

  if (candidates.length === 0) return null

  candidates.sort((a, b) => {
    const aIndex = formatPreference.indexOf(a.format.toUpperCase())
    const bIndex = formatPreference.indexOf(b.format.toUpperCase())
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
  })

  return candidates[0]
}

function extractFontsFromCSS(css: string, baseUrl: string): { fonts: FontInfo[]; imports: string[] } {
  const fonts: FontInfo[] = []
  const imports: string[] = []

  let importMatch
  const importRegexCopy = new RegExp(importRegex.source, "gi")
  while ((importMatch = importRegexCopy.exec(css)) !== null) {
    imports.push(resolveUrl(baseUrl, importMatch[1]))
  }

  let blockMatch
  const fontFaceRegexCopy = new RegExp(fontFaceRegex.source, "gi")
  while ((blockMatch = fontFaceRegexCopy.exec(css)) !== null) {
    const block = blockMatch[1]
    const familyMatch = block.match(fontFamilyRegex)
    const srcMatch = block.match(srcRegex)
    const weightMatch = block.match(weightRegex)
    const styleMatch = block.match(styleRegexProp)

    if (!familyMatch || !srcMatch) continue

    const family = normalizeFamilyName(familyMatch[1])
    const bestSource = pickBestSource(srcMatch[1], baseUrl)
    if (!bestSource) continue

    const fileName = bestSource.url.startsWith("data:")
      ? "embedded-font"
      : bestSource.url.split("/").pop()?.split("?")[0] || ""

    fonts.push({
      name: fileName || `${family}-${bestSource.format}`,
      family,
      format: bestSource.format,
      url: bestSource.url,
      weight: weightMatch ? weightMatch[1].trim() : "400",
      style: styleMatch ? styleMatch[1].trim() : "normal",
    })
  }

  return { fonts, imports }
}

const MAX_IMPORT_DEPTH = 3

async function fetchAndParseCSS(
  url: string,
  depth: number = 0,
  fetchedUrls: Set<string> = new Set()
): Promise<FontInfo[]> {
  if (depth > MAX_IMPORT_DEPTH || fetchedUrls.has(url)) return []
  fetchedUrls.add(url)

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
    })
    if (!response.ok) return []
    const css = await response.text()
    const { fonts, imports } = extractFontsFromCSS(css, url)
    const nestedFonts = await Promise.all(
      imports.map((i) => fetchAndParseCSS(i, depth + 1, fetchedUrls))
    )
    return [...fonts, ...nestedFonts.flat()]
  } catch {
    return []
  }
}

// ── NEW: connect to Anakin's cloud browser via CDP ──────────────────────────
async function extractFontsWithAnakinBrowser(targetUrl: string): Promise<FontInfo[]> {
  try {
    const { chromium } = await import("playwright")

    // get CDP websocket URL from Anakin
    const sessionRes = await fetch("https://api.anakin.io/v1/browser-connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.ANAKIN_API_KEY!,
      },
      body: JSON.stringify({
        headless: true,
        url: targetUrl,         // Anakin pre-navigates to this URL
      }),
    })

    if (!sessionRes.ok) {
      console.warn("Anakin browser-connect failed:", sessionRes.statusText)
      return []
    }

    const { wsEndpoint } = await sessionRes.json()

    // connect to the remote browser — no local binaries needed
    const browser = await chromium.connectOverCDP(wsEndpoint)

    try {
      const contexts = browser.contexts()
      const page = contexts[0]?.pages()[0] ?? await contexts[0]?.newPage()

      if (!page) return []

      // wait for fonts to fully load
      await page.waitForLoadState("networkidle")
      await page.evaluate(async () => {
        if (document.fonts) {
          await document.fonts.ready
        }
      })

      const fontFaces = await page.evaluate(() =>
        Array.from(document.fonts).map((f) => ({
          family: f.family,
          style: f.style,
          weight: f.weight,
          status: f.status,
          src: (f as unknown as { src?: string }).src || "",
        }))
      )

      const fonts: FontInfo[] = []
      for (const face of fontFaces) {
        if (face.status !== "loaded" && face.status !== "loading") continue
        if (!face.src) continue

        const bestSource = pickBestSource(face.src, targetUrl)
        if (!bestSource) continue

        const family = normalizeFamilyName(face.family || "Unknown Font")
        const fileName = bestSource.url.startsWith("data:")
          ? "embedded-font"
          : bestSource.url.split("/").pop()?.split("?")[0] || ""

        fonts.push({
          name: fileName || `${family}-${bestSource.format}`,
          family,
          format: bestSource.format,
          url: bestSource.url,
          weight: face.weight || "400",
          style: face.style || "normal",
          referer: targetUrl,
        })
      }

      return fonts
    } finally {
      await browser.close()
    }
  } catch (err) {
    console.warn("Anakin browser font extraction failed:", err)
    return []   // graceful fallback to CSS parsing below
  }
}
// ────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 })

    let targetUrl: URL
    try {
      targetUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    // run Anakin browser + static CSS parsing in parallel
    const [browserFonts, htmlResponse] = await Promise.all([
      extractFontsWithAnakinBrowser(targetUrl.href),
      fetch(targetUrl.href, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      }),
    ])

    const allFonts: FontInfo[] = [...browserFonts]
    const fetchedCssUrls = new Set<string>()

    if (htmlResponse.ok) {
      const html = await htmlResponse.text()

      // layer 1 — inline <style> blocks
      const inlineStyleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
      let styleMatch
      while ((styleMatch = inlineStyleRegex.exec(html)) !== null) {
        const { fonts, imports } = extractFontsFromCSS(styleMatch[1], targetUrl.href)
        allFonts.push(...fonts.map((f) => ({ ...f, referer: targetUrl.href })))
        const importFonts = await Promise.all(
          imports.map((i) => fetchAndParseCSS(i, 0, fetchedCssUrls))
        )
        allFonts.push(...importFonts.flat().map((f) => ({ ...f, referer: targetUrl.href })))
      }

      // layer 2 — linked stylesheets + preloaded fonts
      const linkTagRegex = /<link[^>]+>/gi
      const relRegex = /rel=["']?([^"'\s]+)["']?/i
      const hrefRegex = /href=["']?([^"'\s>]+)["']?/i
      const asRegex = /as=["']?([^"'\s]+)["']?/i
      const initialCssUrls: string[] = []
      let linkMatch

      while ((linkMatch = linkTagRegex.exec(html)) !== null) {
        const tag = linkMatch[0]
        const rel = tag.match(relRegex)?.[1].toLowerCase() || ""
        const href = tag.match(hrefRegex)?.[1] || ""
        const as = tag.match(asRegex)?.[1]?.toLowerCase() || ""
        if (!href) continue

        const resolvedUrl = resolveUrl(targetUrl.href, href)

        if (rel === "stylesheet" || (rel === "preload" && as === "style")) {
          initialCssUrls.push(resolvedUrl)
        } else if ((rel === "preload" || rel === "prefetch") && as === "font") {
          const format = getFormatFromUrl(resolvedUrl)
          const name = resolvedUrl.split("/").pop()?.split("?")[0] || "preloaded-font"
          allFonts.push({
            name,
            family: name.split(".")[0] || "Unknown Font",
            format,
            url: resolvedUrl,
            weight: "400",
            style: "normal",
            referer: targetUrl.href,
          })
        }
      }

      // layer 3 — fetch and parse all linked CSS
      const linkedFonts = await Promise.all(
        initialCssUrls.map((u) => fetchAndParseCSS(u, 0, fetchedCssUrls))
      )
      allFonts.push(...linkedFonts.flat().map((f) => ({ ...f, referer: targetUrl.href })))
    }

    // deduplicate by URL
    const uniqueMap = new Map<string, FontInfo>()
    for (const font of allFonts) {
      if (!uniqueMap.has(font.url)) uniqueMap.set(font.url, font)
    }
    const fonts = Array.from(uniqueMap.values())

    return NextResponse.json({ fonts, totalFound: fonts.length, sourceUrl: targetUrl.href })

  } catch (error) {
    console.error("Font extraction error:", error)
    return NextResponse.json({ error: "Failed to extract fonts" }, { status: 500 })
  }
}
