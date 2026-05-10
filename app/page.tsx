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
              className="text-2xl  font-bold  tracking-tight cursor-pointer"
              onClick={handleReset}
              style={{ fontFamily: "var(--font-custom-heading)"}}
            >
              TypeScrape
            </span>
            <span className="text-sm font-mono font-medium px-3 py-1 rounded-xl flex justify-center items-center bg-violet-50 border border-violet-200 text-neutral-700">
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25">
              <title>bolt</title>
              <g fill="none">
                <path d="M12 15V23.0359C12 24.0747 13.3876 24.4247 13.8803 23.5103L19.9902 12.1709C20.4887 11.1737 19.7633 10.0002 18.6484 10H12V6C9.5 8.5 7.87348 10.6369 7.5 15H12Z" fill="url(#1752500502767-4202697_bolt_existing_0_xj1v2qxex)" data-glass="origin" mask="url(#1752500502767-4202697_bolt_mask_yl22birbk)"></path>
                <path d="M12 15V23.0359C12 24.0747 13.3876 24.4247 13.8803 23.5103L19.9902 12.1709C20.4887 11.1737 19.7633 10.0002 18.6484 10H12V6C9.5 8.5 7.87348 10.6369 7.5 15H12Z" fill="url(#1752500502767-4202697_bolt_existing_0_xj1v2qxex)" data-glass="clone" filter="url(#1752500502767-4202697_bolt_filter_mvph9r03k)" clip-path="url(#1752500502767-4202697_bolt_clipPath_qizq5y859)"></path>
                <path d="M12 9V1.96408C12 0.925331 10.6124 0.575284 10.1197 1.48974L4.00979 12.8291C3.51129 13.8263 4.23674 14.9998 5.35158 15H12V9Z" fill="url(#1752500502767-4202697_bolt_existing_1_pr0095u8f)" data-glass="blur"></path>
                <path d="M10.1201 1.48889C10.6131 0.575627 11.9995 0.925489 12 1.9635V11.9996H11.25V1.9635C11.2499 1.87984 11.2247 1.83362 11.2002 1.80432C11.1708 1.76933 11.1232 1.73694 11.0615 1.72131C10.9997 1.70575 10.9419 1.71126 10.8994 1.72815C10.8639 1.74232 10.8201 1.77156 10.7803 1.84534L5.30762 11.9996H4.45605L10.1201 1.48889Z" fill="url(#1752500502767-4202697_bolt_existing_2_8ujc3fzwv)"></path>
                <defs>
                  <linearGradient id="1752500502767-4202697_bolt_existing_0_xj1v2qxex" x1="13.825" y1="6" x2="13.825" y2="27" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#575757"></stop>
                    <stop offset="1" stop-color="#151515"></stop>
                  </linearGradient>
                  <linearGradient id="1752500502767-4202697_bolt_existing_1_pr0095u8f" x1="7.925" y1="-2" x2="7.925" y2="15" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#E3E3E5" stop-opacity=".6"></stop>
                    <stop offset="1" stop-color="#BBBBC0" stop-opacity=".6"></stop>
                  </linearGradient>
                  <linearGradient id="1752500502767-4202697_bolt_existing_2_8ujc3fzwv" x1="8.228" y1=".963" x2="8.228" y2="11" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#fff" stop-opacity="1"></stop>
                    <stop offset="1" stop-color="#fff" stop-opacity="0"></stop>
                  </linearGradient>
                  <filter id="1752500502767-4202697_bolt_filter_mvph9r03k" x="-100%" y="-100%" width="400%" height="400%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse">
                    <feGaussianBlur stdDeviation="2" x="0%" y="0%" width="100%" height="100%" in="SourceGraphic" edgeMode="none" result="blur"></feGaussianBlur>
                  </filter>
                  <clipPath id="1752500502767-4202697_bolt_clipPath_qizq5y859">
                    <path d="M12 9V1.96408C12 0.925331 10.6124 0.575284 10.1197 1.48974L4.00979 12.8291C3.51129 13.8263 4.23674 14.9998 5.35158 15H12V9Z" fill="url(#1752500502767-4202697_bolt_existing_1_pr0095u8f)"></path>
                  </clipPath>
                  <mask id="1752500502767-4202697_bolt_mask_yl22birbk">
                    <rect width="100%" height="100%" fill="#FFF"></rect>
                    <path d="M12 9V1.96408C12 0.925331 10.6124 0.575284 10.1197 1.48974L4.00979 12.8291C3.51129 13.8263 4.23674 14.9998 5.35158 15H12V9Z" fill="#000"></path>
                  </mask>
                </defs>
              </g>
            </svg>
                </span>Powered by anakin.io
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
                className="text-xs cursor-pointer font-mono px-4 py-2 rounded-lg bg-neutral-100 shadow shadow-neutral-400  hover:bg-zinc-100 border border-zinc-200 text-zinc-600 font-semibold hover:text-zinc-950 transition-all"
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
