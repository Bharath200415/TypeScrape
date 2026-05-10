import { DesignTokens } from "@/types"
import Colorswatch from "@/components/ui/Colorswatch"
import FontPreview from "@/components/ui/FontPreview"

interface ScrapedTabProps {
  tokens: DesignTokens
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-4">
    <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
      {title}
    </h3>
    {children}
  </div>
)

const PillList = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {items.length === 0 && (
      <span className="text-xs text-zinc-500">None detected</span>
    )}
    {items.map((item, i) => (
      <span
        key={i}
        className="text-xs font-mono px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-700 shadow-sm"
      >
        {item}
      </span>
    ))}
  </div>
)

export default function ScrapedTab({ tokens }: ScrapedTabProps) {
  return (
    <div className="flex flex-col gap-10">

      <Section title="Colors">
        <div className="flex flex-wrap gap-6">
          {tokens.colors.length === 0 && (
            <span className="text-xs text-zinc-500">No colors detected</span>
          )}
          {tokens.colors.map((color, i) => (
            <Colorswatch key={i} color={color} />
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tokens.fonts.length === 0 && (
            <span className="text-xs text-zinc-500">No fonts detected</span>
          )}
          {tokens.fonts.map((font, i) => (
            <FontPreview key={i} font={font} />
          ))}
        </div>
      </Section>

      <Section title="Font Sizes">
        <PillList items={tokens.fontSizes} />
      </Section>

      <Section title="Spacing">
        <PillList items={tokens.spacing} />
      </Section>

      <Section title="Border Radius">
        <div className="flex flex-wrap gap-4">
          {tokens.borderRadius.length === 0 && (
            <span className="text-xs text-zinc-500">None detected</span>
          )}
          {tokens.borderRadius.map((radius, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 bg-violet-100 border border-violet-300"
                style={{ borderRadius: radius }}
              />
              <span className="text-[11px] font-mono text-zinc-500">{radius}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Shadows">
        <div className="flex flex-wrap gap-4">
          {tokens.shadows.length === 0 && (
            <span className="text-xs text-zinc-500">None detected</span>
          )}
          {tokens.shadows.map((shadow, i) => (
            <div
              key={i}
              className="w-24 h-16 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shadow-sm"
              style={{ boxShadow: shadow }}
            >
              <span className="text-[10px] font-mono text-zinc-500">shadow</span>
            </div>
          ))}
        </div>
      </Section>

    </div>
  )
}
