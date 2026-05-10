import { AnalysisResult } from "@/types"

interface AnalysisTabProps {
  analysis: AnalysisResult
}

const Card = ({ label, content }: { label: string; content: string }) => (
  <div className="flex flex-col gap-3 p-5 rounded-xl bg-white border border-zinc-200 shadow-sm">
    <span className="text-[11px] font-mono uppercase tracking-widest text-violet-700">
      {label}
    </span>
    <p className="text-sm text-zinc-700 leading-relaxed">{content}</p>
  </div>
)

const uiStyleColors: Record<string, string> = {
  Minimal: "bg-zinc-100 text-zinc-700 border-zinc-300",
  Corporate: "bg-blue-100 text-blue-700 border-blue-300",
  Playful: "bg-pink-100 text-pink-700 border-pink-300",
  Bold: "bg-orange-100 text-orange-700 border-orange-300",
  Luxury: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Technical: "bg-cyan-100 text-cyan-700 border-cyan-300",
  Editorial: "bg-purple-100 text-purple-700 border-purple-300",
  Brutalist: "bg-red-100 text-red-700 border-red-300",
  Soft: "bg-violet-100 text-violet-700 border-violet-300",
  Dark: "bg-gray-100 text-gray-700 border-gray-300",
}

export default function AnalysisTab({ analysis }: AnalysisTabProps) {
  const styleClass = uiStyleColors[analysis.uiStyle] ?? uiStyleColors["Minimal"]

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-600">Detected UI Style</span>
        <span className={`text-xs font-mono px-3 py-1 rounded-full border ${styleClass}`}>
          {analysis.uiStyle}
        </span>
      </div>

      <Card label="Brand Personality" content={analysis.brandPersonality} />
      <Card label="UX Strategy" content={analysis.uxStrategy} />
      <Card label="Clone This Style" content={analysis.starterPack} />

    </div>
  )
}
