interface Step {
  id: string
  label: string
  description: string
}

interface LoadingStepsProps {
  currentStatus: "scraping" | "extracting" | "analyzing" | "done" | "idle" | "error"
}

const STEPS: Step[] = [
  {
    id: "scraping",
    label: "Scraping website",
    description: "Anakin AI fetching full rendered HTML",
  },
  {
    id: "extracting",
    label: "Extracting tokens",
    description: "Parsing fonts, colors, spacing, shadows",
  },
  {
    id: "analyzing",
    label: "AI analysis",
    description: "Gemini analyzing brand and generating theme",
  },
  {
    id: "done",
    label: "Done",
    description: "Your design system is ready",
  },
]

const ORDER = ["scraping", "extracting", "analyzing", "done"]

export default function LoadingSteps({ currentStatus }: LoadingStepsProps) {
  const currentIndex = ORDER.indexOf(currentStatus)

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex
        const isActive = ORDER[currentIndex] === step.id
        const isPending = index > currentIndex

        return (
          <div key={step.id} className="flex items-start gap-4">
            {/* indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-medium transition-all duration-300 
                  ${isCompleted ? "bg-violet-500 text-white" : ""}
                  ${isActive ? "bg-violet-100 border border-violet-500 text-violet-700 animate-pulse" : ""}
                  ${isPending ? "bg-white border border-zinc-200 text-zinc-400" : ""}
                `}
              >
                {isCompleted ? "✓" : index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-px h-6 mt-1 transition-all duration-500
                    ${isCompleted ? "bg-violet-500" : "bg-zinc-200"}
                  `}
                />
              )}
            </div>

            {/* text */}
            <div className="flex flex-col gap-0.5 pt-1">
              <span
                className={`text-sm font-medium transition-colors
                  ${isCompleted ? "text-violet-700" : ""}
                  ${isActive ? "text-zinc-950" : ""}
                  ${isPending ? "text-zinc-500" : ""}
                `}
              >
                {step.label}
              </span>
              <span className="text-xs text-zinc-500">{step.description}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
