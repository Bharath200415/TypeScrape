export interface ButtonStyle {
  backgroundColor: string
  textColor: string
  borderRadius: string
  padding: string
  fontSize: string
  border: string
}

export interface FontAsset {
  name: string
  family: string
  format: string
  url: string
  weight?: string
  style?: string
  referer?: string
}

export type FontToken = string | FontAsset

export interface DesignTokens {
  colors: string[]
  fonts: FontToken[]
  fontSizes: string[]
  spacing: string[]
  borderRadius: string[]
  shadows: string[]
  buttons: ButtonStyle[]
}

export interface ScrapeResult {
  html: string
  markdown: string
  url: string
}

export interface AnalysisResult {
  brandPersonality: string
  uiStyle: string
  uxStrategy: string
  tailwindTheme: {
    colors: Record<string, string>
    fontFamily: Record<string, string[]>
    borderRadius: Record<string, string>
    boxShadow: Record<string, string>
    fontSize: Record<string, string>
    spacing: Record<string, string>
  }
  designTokensJSON: {
    colors: Record<string, string>
    typography: Record<string, string>
    spacing: Record<string, string>
    radii: Record<string, string>
    shadows: Record<string, string>
  }
  starterPack: string
}

export interface AppState {
  status: "idle" | "scraping" | "extracting" | "analyzing" | "done" | "error"
  url: string
  tokens: DesignTokens | null
  analysis: AnalysisResult | null
  error: string | null
}
