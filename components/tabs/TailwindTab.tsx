import { AnalysisResult } from "@/types"
import CodeBlock from "@/components/ui/CodeBlock"

interface TailwindTabProps {
  analysis: AnalysisResult
}

export default function TailwindTab({ analysis }: TailwindTabProps) {
  const config = `import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: ${JSON.stringify(analysis.tailwindTheme.colors, null, 8)},
      fontFamily: ${JSON.stringify(analysis.tailwindTheme.fontFamily, null, 8)},
      borderRadius: ${JSON.stringify(analysis.tailwindTheme.borderRadius, null, 8)},
      boxShadow: ${JSON.stringify(analysis.tailwindTheme.boxShadow, null, 8)},
      fontSize: ${JSON.stringify(analysis.tailwindTheme.fontSize, null, 8)},
      spacing: ${JSON.stringify(analysis.tailwindTheme.spacing, null, 8)},
    },
  },
  plugins: [],
}

export default config`

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-zinc-600">
        Drop this into your project&apos;s{" "}
        <code className="text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded text-xs">
          tailwind.config.ts
        </code>{" "}
        to instantly replicate this site&apos;s design system.
      </p>
      <CodeBlock code={config} language="typescript" />
    </div>
  )
}
