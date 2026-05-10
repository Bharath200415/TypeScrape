"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { AppState, DesignTokens, AnalysisResult, FontAsset } from "@/types"
import URLInput from "@/components/URLInput"
import ResultsPanel from "@/components/ResultsPanel"
import LoadingSteps from "@/components/ui/LoadingSteps"

const heroFonts = [
  { name: "Syne", family: "var(--font-syne), sans-serif" },
  { name: "DM Sans", family: "var(--font-dm-sans), sans-serif" },
  { name: "DM Mono", family: "var(--font-dm-mono), monospace" },
  { name: "System", family: "Inter, ui-sans-serif, system-ui, sans-serif" },
]

export default function Home() {
  const [state, setState] = useState<AppState>({
    status: "idle",
    url: "",
    tokens: null,
    analysis: null,
    error: null,
  })
  const [currentFontIndex, setCurrentFontIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const currentFont = heroFonts[currentFontIndex]

  const handleFontSwitch = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentFontIndex((prev) => (prev + 1) % heroFonts.length)
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 400)
    return () => clearTimeout(timer)
  }, [currentFontIndex])

  const handleAnalyze = async (url: string) => {
    setState({ status: "scraping", url, tokens: null, analysis: null, error: null })

    try {
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const scrapeData = await scrapeRes.json()

      if (!scrapeRes.ok) {
        throw new Error(scrapeData.error ?? "Scrape failed")
      }

      const tokens: DesignTokens = scrapeData.tokens
      const markdown: string = scrapeData.markdown

      const fontsRes = await fetch("/api/fonts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (fontsRes.ok) {
        const fontsData: { fonts?: FontAsset[] } = await fontsRes.json()
        const fontTokens = (fontsData.fonts ?? [])
          .filter((font) => font.name || font.family)

        if (fontTokens.length > 0) {
          tokens.fonts = Array.from(
            new Map(fontTokens.map((font) => [font.url || font.name || font.family, font])).values()
          ).slice(0, 6)
        }
      }

      setState((prev) => ({ ...prev, status: "extracting", tokens }))

      await new Promise((res) => setTimeout(res, 800))

      setState((prev) => ({ ...prev, status: "analyzing" }))

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens, markdown }),
      })

      const analyzeData = await analyzeRes.json()

      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error ?? "Analysis failed")
      }

      const analysis: AnalysisResult = analyzeData.analysis

      setState((prev) => ({ ...prev, status: "done", analysis }))

    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setState((prev) => ({ ...prev, status: "error", error: message }))
    }
  }

  const handleReset = () => {
    setState({ status: "idle", url: "", tokens: null, analysis: null, error: null })
  }

  const isLoading = ["scraping", "extracting", "analyzing"].includes(state.status)
  const isDone = state.status === "done"
  const isError = state.status === "error"

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-950 relative">
      <div className="fixed inset-0 h-full w-full bg-neutral-50 pointer-events-none">
        <div
          className="absolute h-full w-full"
          style={{
            background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #6366f1 100%)",
          }}
        />
        <svg
          className="absolute inset-0 z-20 h-full w-full stroke-black/7 mask-[radial-gradient(75%_50%_at_top_center,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="hero"
              width="80"
              height="80"
              x="50%"
              y="-1"
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 200V.5H200" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth="0" fill="url(#hero)" />
        </svg>
      </div>

      {isDone && (
        <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <span
              className="font-mono text-lg  font-extrabold tracking-tight cursor-pointer"
              onClick={handleReset}
            >
              TypeScrape
            </span>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700">
              Powered by Anakin AI
            </span>
          </div>
        </header>
      )}

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col gap-16">
        {!isDone && (
          <section className="relative pt-24 pb-16 px-6">
            <div className="relative max-w-4xl mx-auto text-center">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="text-sm font-medium text-gray-500 tracking-wide mb-6"
              >
                Design Intelligence Tool
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
                className="relative"
              >
                <button
                  onClick={handleFontSwitch}
                  className="group relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-4 rounded-lg"
                  aria-label={`Currently using ${currentFont.name} font. Click to switch fonts.`}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentFontIndex}
                      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                      className="block text-6xl md:text-8xl bg-clip-text font-semibold text-neutral-800 tracking-tight leading-none"
                      style={{
                        fontFamily: currentFont.family,
                        maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
                        WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
                      }}
                    >
                      TypeScrape
                    </motion.span>
                  </AnimatePresence>

                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors duration-150"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-sm group-hover:bg-green-400 transition-colors animate-pulse duration-150" />
                    {currentFont.name}
                    <span className="text-gray-400">&middot;</span>
                    <span className="text-gray-400 group-hover:text-gray-500">Click to switch</span>
                  </motion.span>
                </button>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
                className="mt-16 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
              >
                Enter any website URL and instantly extract its fonts, colors, spacing,
                Tailwind theme, and an AI-ready design skill for recreating the visual system.
              </motion.p>
            </div>
          </section>
        )}

        {!isDone && (
          <URLInput onSearch={handleAnalyze} loading={isLoading} />
        )}

        {isLoading && (
          <div className="flex flex-col items-center gap-8">
            <LoadingSteps currentStatus={state.status} />
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-red-50 border border-red-200 shadow-sm">
            <p className="text-sm text-red-700 text-center">{state.error}</p>
            <button
              onClick={handleReset}
              className="text-xs font-mono px-4 py-2 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 transition-all"
            >
              Try again
            </button>
          </div>
        )}

        {isDone && state.tokens && state.analysis && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-end">
              <button
                onClick={handleReset}
                className="text-xs font-mono px-4 py-2 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-950 transition-all"
              >
                Analyze another
              </button>
            </div>
            <ResultsPanel
              tokens={state.tokens}
              analysis={state.analysis}
              url={state.url}
            />
          </div>
        )}
      </main>
    </div>
  )
}
