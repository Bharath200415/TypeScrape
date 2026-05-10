interface ColorswatchProps {
  color: string
}

export default function Colorswatch({ color }: ColorswatchProps) {
  const handleCopy = () => navigator.clipboard.writeText(color)

  return (
    <div
      onClick={handleCopy}
      className="group flex flex-col items-center gap-2 cursor-pointer"
      title="Click to copy"
    >
      <div
        className="w-12 h-12 rounded-lg border border-zinc-200 shadow-sm transition-transform group-hover:scale-110"
        style={{ backgroundColor: color }}
      />
      <span className="text-[11px] font-mono text-zinc-500 group-hover:text-zinc-950 transition-colors">
        {color}
      </span>
    </div>
  )
}
