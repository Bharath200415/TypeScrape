import { DesignTokens, FontToken } from "@/types"

function formatFontToken(font: FontToken): string {
  if (typeof font === "string") return font

  const label = font.name || font.family
  const details = [font.family, font.weight, font.style]
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index)

  return details.length > 0 ? `${label} (${details.join(", ")})` : label
}

export function buildAnalysisPrompt(tokens: DesignTokens, markdown: string): string {
  const fonts = tokens.fonts.map(formatFontToken)

  return `
You are a senior UI/UX designer and front-end architect analyzing a website's design system.

Below is extracted CSS data and page content from a website. Analyze it thoroughly and return a single valid JSON object — no markdown, no backticks, no explanation, just raw JSON.

## Extracted Design Tokens
- Colors: ${JSON.stringify(tokens.colors)}
- Fonts: ${JSON.stringify(fonts)}
- Font Sizes: ${JSON.stringify(tokens.fontSizes)}
- Spacing: ${JSON.stringify(tokens.spacing)}
- Border Radius: ${JSON.stringify(tokens.borderRadius)}
- Shadows: ${JSON.stringify(tokens.shadows)}

## Page Content (Markdown)
${markdown.slice(0, 1500)}

## Instructions
Return ONLY this JSON shape, populated with real values derived from the data above:

{
  "brandPersonality": "2-3 sentence description of the brand's personality, tone, and target audience based on visual choices",
  "uiStyle": "One label from: Minimal / Corporate / Playful / Bold / Luxury / Technical / Editorial / Brutalist / Soft / Dark",
  "uxStrategy": "2-3 sentence description of the UX strategy — information hierarchy, CTA placement, user journey intent",
  "tailwindTheme": {
    "colors": {
      "primary": "<most dominant color hex>",
      "secondary": "<second most used color hex>",
      "accent": "<standout accent color hex>",
      "background": "<main background color hex>",
      "text": "<primary text color hex>",
      "muted": "<muted/secondary text color hex>"
    },
    "fontFamily": {
      "sans": ["<primary font>", "sans-serif"],
      "display": ["<heading font if different>", "sans-serif"]
    },
    "borderRadius": {
      "sm": "<smallest radius value>",
      "md": "<medium radius value>",
      "lg": "<largest radius value>",
      "full": "9999px"
    },
    "boxShadow": {
      "sm": "<lightest shadow>",
      "md": "<medium shadow>",
      "lg": "<heaviest shadow>"
    },
    "fontSize": {
      "xs": "<smallest font size>",
      "sm": "<small font size>",
      "base": "<base font size>",
      "lg": "<large font size>",
      "xl": "<xl font size>",
      "2xl": "<2xl font size>"
    },
    "spacing": {
      "xs": "<smallest spacing>",
      "sm": "<small spacing>",
      "md": "<medium spacing>",
      "lg": "<large spacing>",
      "xl": "<xl spacing>"
    }
  },
  "designTokensJSON": {
    "colors": {
      "primary": "<hex>",
      "secondary": "<hex>",
      "accent": "<hex>",
      "background": "<hex>",
      "surface": "<hex>",
      "text-primary": "<hex>",
      "text-secondary": "<hex>",
      "border": "<hex>"
    },
    "typography": {
      "font-sans": "<primary font name>",
      "font-display": "<display font name>",
      "size-base": "<base size>",
      "size-lg": "<large size>",
      "size-xl": "<xl size>",
      "weight-normal": "400",
      "weight-bold": "700"
    },
    "spacing": {
      "space-1": "<value>",
      "space-2": "<value>",
      "space-4": "<value>",
      "space-8": "<value>",
      "space-16": "<value>"
    },
    "radii": {
      "radius-sm": "<value>",
      "radius-md": "<value>",
      "radius-lg": "<value>",
      "radius-full": "9999px"
    },
    "shadows": {
      "shadow-sm": "<value>",
      "shadow-md": "<value>",
      "shadow-lg": "<value>"
    }
  },
  "starterPack": "3-4 sentences describing how a developer would clone this site's visual style — mention specific font pairings, color strategy, component patterns, and overall approach"
}
`.trim()
}
