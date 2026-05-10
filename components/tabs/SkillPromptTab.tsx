import { AnalysisResult, DesignTokens, FontToken } from "@/types"
import CodeBlock from "@/components/ui/CodeBlock"

interface SkillPromptTabProps {
  analysis: AnalysisResult
  tokens: DesignTokens
  url: string
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return "scraped-site"
  }
}

function skillNameFromDomain(domain: string): string {
  return `${domain.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase()}-style`
}

function formatFont(font: FontToken): string {
  if (typeof font === "string") return font

  const label = font.name || font.family
  const details = [font.family, font.weight, font.style, font.format]
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index)

  return details.length > 0 ? `${label} (${details.join(", ")})` : label
}

function formatRecord(record: Record<string, string>): string {
  return Object.entries(record)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n")
}

function buildSkillPrompt(analysis: AnalysisResult, tokens: DesignTokens, url: string): string {
  const domain = domainFromUrl(url)
  const skillName = skillNameFromDomain(domain)
  const fonts = tokens.fonts.map(formatFont).join("\n")

  return `---
name: ${skillName}
description: Apply the ${domain} visual design system to product UI, landing pages, dashboards, and frontend components. Use when the user asks to mimic, clone, adapt, or build in the ${domain} style, including its typography, color strategy, spacing, component density, interaction tone, and overall design principles.
---

# ${domain} Style System

## Design Intent

Create interfaces with this personality:
${analysis.brandPersonality}

Use this UX strategy:
${analysis.uxStrategy}

Overall style label: ${analysis.uiStyle}

## Typography

Use these extracted font assets and families as the source of truth:
${fonts || "- No specific fonts detected"}

Recommended Tailwind families:
${Object.entries(analysis.tailwindTheme.fontFamily)
  .map(([key, value]) => `- ${key}: ${value.join(", ")}`)
  .join("\n")}

Type scale:
${formatRecord(analysis.tailwindTheme.fontSize)}

## Color System

Prefer this color palette:
${formatRecord(analysis.tailwindTheme.colors)}

Use colors with restraint. Preserve the original contrast pattern and avoid introducing unrelated accent colors unless the user explicitly requests a departure.

## Layout And Spacing

Spacing scale:
${formatRecord(analysis.tailwindTheme.spacing)}

Radii:
${formatRecord(analysis.tailwindTheme.borderRadius)}

Shadows:
${formatRecord(analysis.tailwindTheme.boxShadow)}

Build with the same density and hierarchy implied by the source site. Favor predictable layout, crisp alignment, and compact content groupings over decorative marketing composition.

## Component Guidance

- Match the source site's interaction tone before adding new flourishes.
- Use extracted radii, shadows, spacing, and type sizes for buttons, cards, tabs, forms, and navigation.
- Keep copy and labels concise, with hierarchy coming from weight, spacing, and contrast rather than oversized type.
- Preserve the source site's balance between brand expression and usability.
- When creating new components, infer from the design tokens instead of inventing a separate visual language.

## Avoid

- Do not add unrelated gradients, decorative blobs, or stock-like imagery unless the source style clearly uses them.
- Do not replace the extracted font system with generic browser defaults.
- Do not over-round components beyond the extracted radius scale.
- Do not make the UI more spacious, playful, or colorful than the source design unless asked.

## Implementation Notes

Use this summary as the primary style directive:
${analysis.starterPack}
`
}

export default function SkillPromptTab({ analysis, tokens, url }: SkillPromptTabProps) {
  const skillPrompt = buildSkillPrompt(analysis, tokens, url)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
          Copyable AI Skill
        </h3>
        <p className="text-sm text-zinc-600 leading-relaxed max-w-3xl">
          Paste this into a <code className="text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">SKILL.md</code> file or use it as a system prompt when asking an AI agent to build in this design language.
        </p>
      </div>
      <CodeBlock code={skillPrompt} language="markdown" />
    </div>
  )
}
