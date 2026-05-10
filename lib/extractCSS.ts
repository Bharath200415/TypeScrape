import { DesignTokens, ButtonStyle } from "@/types"

function extractFromStyleSheets(html: string): string {
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
  const matches: string[] = []
  let match

  while ((match = styleRegex.exec(html)) !== null) {
    matches.push(match[1])
  }

  return matches.join("\n")
}

function extractInlineStyles(html: string): string {
  const inlineRegex = /style="([^"]*)"/gi
  const matches: string[] = []
  let match

  while ((match = inlineRegex.exec(html)) !== null) {
    matches.push(match[1])
  }

  return matches.join("\n")
}

function extractColors(css: string): string[] {
  const colorRegex =
    /#([0-9a-fA-F]{3,8})\b|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/g

  const raw = [...new Set(css.match(colorRegex) ?? [])]

  // filter out pure black/white noise and very short values
  return raw
    .filter((c) => c !== "#000" && c !== "#fff" && c !== "#ffffff" && c !== "#000000")
    .slice(0, 20)
}

function extractFonts(css: string): string[] {
  const fontRegex = /font-family\s*:\s*([^;}\n]+)/gi
  const fonts: string[] = []
  let match

  while ((match = fontRegex.exec(css)) !== null) {
    const cleaned = match[1]
      .replace(/["']/g, "")
      .split(",")[0]
      .trim()

    if (cleaned && !fonts.includes(cleaned)) {
      fonts.push(cleaned)
    }
  }

  return [...new Set(fonts)].slice(0, 6)
}

function extractFontSizes(css: string): string[] {
  const sizeRegex = /font-size\s*:\s*([^;}\n]+)/gi
  const sizes: string[] = []
  let match

  while ((match = sizeRegex.exec(css)) !== null) {
    sizes.push(match[1].trim())
  }

  return [...new Set(sizes)].slice(0, 10)
}

function extractSpacing(css: string): string[] {
  const spacingRegex = /(?:padding|margin)\s*:\s*([^;}\n]+)/gi
  const values: string[] = []
  let match

  while ((match = spacingRegex.exec(css)) !== null) {
    values.push(match[1].trim())
  }

  return [...new Set(values)].slice(0, 10)
}

function extractBorderRadius(css: string): string[] {
  const radiusRegex = /border-radius\s*:\s*([^;}\n]+)/gi
  const values: string[] = []
  let match

  while ((match = radiusRegex.exec(css)) !== null) {
    values.push(match[1].trim())
  }

  return [...new Set(values)].slice(0, 8)
}

function extractShadows(css: string): string[] {
  const shadowRegex = /box-shadow\s*:\s*([^;}\n]+)/gi
  const values: string[] = []
  let match

  while ((match = shadowRegex.exec(css)) !== null) {
    values.push(match[1].trim())
  }

  return [...new Set(values)].slice(0, 6)
}

function extractButtons(html: string): ButtonStyle[] {
  const buttonRegex = /<button[^>]*style="([^"]*)"[^>]*>/gi
  const buttons: ButtonStyle[] = []
  let match

  while ((match = buttonRegex.exec(html)) !== null) {
    const styleStr = match[1]

    const get = (prop: string) => {
      const r = new RegExp(`${prop}\\s*:\\s*([^;]+)`, "i")
      return styleStr.match(r)?.[1].trim() ?? ""
    }

    buttons.push({
      backgroundColor: get("background-color") || get("background"),
      textColor: get("color"),
      borderRadius: get("border-radius"),
      padding: get("padding"),
      fontSize: get("font-size"),
      border: get("border"),
    })
  }

  return buttons.slice(0, 5)
}

export function extractDesignTokens(html: string): DesignTokens {
  const sheetCSS = extractFromStyleSheets(html)
  const inlineCSS = extractInlineStyles(html)
  const allCSS = sheetCSS + "\n" + inlineCSS

  return {
    colors: extractColors(allCSS),
    fonts: extractFonts(allCSS),
    fontSizes: extractFontSizes(allCSS),
    spacing: extractSpacing(allCSS),
    borderRadius: extractBorderRadius(allCSS),
    shadows: extractShadows(allCSS),
    buttons: extractButtons(html),
  }
}