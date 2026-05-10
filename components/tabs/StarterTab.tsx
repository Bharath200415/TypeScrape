import { AnalysisResult } from "@/types"
import CodeBlock from "@/components/ui/CodeBlock"

interface StarterTabProps {
  analysis: AnalysisResult
}

export default function StarterTab({ analysis }: StarterTabProps) {
  const tokens = JSON.stringify(analysis.designTokensJSON, null, 2)

  const cssVariables = `/* design-tokens.css */
:root {
${Object.entries(analysis.designTokensJSON.colors)
  .map(([k, v]) => `  --color-${k}: ${v};`)
  .join("\n")}

${Object.entries(analysis.designTokensJSON.typography)
  .map(([k, v]) => `  --${k}: ${v};`)
  .join("\n")}

${Object.entries(analysis.designTokensJSON.spacing)
  .map(([k, v]) => `  --${k}: ${v};`)
  .join("\n")}

${Object.entries(analysis.designTokensJSON.radii)
  .map(([k, v]) => `  --${k}: ${v};`)
  .join("\n")}

${Object.entries(analysis.designTokensJSON.shadows)
  .map(([k, v]) => `  --${k}: ${v};`)
  .join("\n")}
}`

  return (
    <div className="flex flex-col gap-8">

      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
          Design Tokens — JSON
        </h3>
        <CodeBlock code={tokens} language="json" />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
          CSS Variables
        </h3>
        <CodeBlock code={cssVariables} language="css" />
      </div>

    </div>
  )
}