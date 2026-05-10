"use client"

import { useState } from "react"
import { DesignTokens, AnalysisResult } from "@/types"
import ScrapedTab from "@/components/tabs/ScrapedTab"
import AnalysisTab from "@/components/tabs/AnalysisTab"
import TailwindTab from "@/components/tabs/TailwindTab"
import StarterTab from "@/components/tabs/StarterTab"
import SkillPromptTab from "@/components/tabs/SkillPromptTab"

interface ResultsPanelProps {
  tokens: DesignTokens
  analysis: AnalysisResult
  url: string
}

const TABS = [
  { id: "scraped", label: "Scraped Tokens" },
  { id: "analysis", label: "AI Analysis" },
  { id: "tailwind", label: "Tailwind Theme" },
  { id: "starter", label: "Starter Pack" },
  { id: "skill", label: "AI Skill" },
] as const

type TabId = (typeof TABS)[number]["id"]

export default function ResultsPanel({ tokens, analysis, url }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("scraped")

  const domain = (() => {
    try { return new URL(url).hostname }
    catch { return url }
  })()

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold text-zinc-950"
          style={{ fontFamily: "var(--font-custom-heading)"}}>
            Design system extracted
          </h2>
          <span className="text-xs font-mono text-zinc-500">{domain}</span>
        </div>
      </div>

      {/* tab bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-white border border-zinc-200 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* tab content */}
      <div className="min-h-[400px]">
        {activeTab === "scraped" && <ScrapedTab tokens={tokens} />}
        {activeTab === "analysis" && <AnalysisTab analysis={analysis} />}
        {activeTab === "tailwind" && <TailwindTab analysis={analysis} />}
        {activeTab === "starter" && <StarterTab analysis={analysis} />}
        {activeTab === "skill" && (
          <SkillPromptTab analysis={analysis} tokens={tokens} url={url} />
        )}
      </div>

    </div>
  )
}
