"use client"

import { useState } from "react"

interface CodeBlockProps {
  code: string
  language?: string
}

export default function CodeBlock({ code, language = "json" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 bg-zinc-50">
        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="text-[11px] font-mono px-3 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 transition-all"
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      <pre className="p-4 text-sm text-zinc-700 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  )
}
