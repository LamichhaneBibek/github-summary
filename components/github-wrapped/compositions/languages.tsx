import type React from "react"
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion"

interface LanguagesProps {
  languages: Array<{ name: string; percentage: number }>
}

export const Languages: React.FC<LanguagesProps> = ({ languages }) => {
  const frame = useCurrentFrame()

  const langColors = [
    { bg: "from-cyan-400 to-cyan-600", text: "#22d3ee", glow: "#06b6d4" },
    { bg: "from-lime-400 to-lime-600", text: "#a3e635", glow: "#84cc16" },
    { bg: "from-orange-400 to-orange-600", text: "#fb923c", glow: "#f97316" },
    { bg: "from-rose-400 to-rose-600", text: "#fb7185", glow: "#f43f5e" },
    { bg: "from-amber-400 to-amber-600", text: "#fbbf24", glow: "#f59e0b" },
  ]

  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  })

  const titleScale = interpolate(frame, [0, 25], [0.9, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.2)),
  })

  const getLanguageMessage = (lang: string) => {
    const messages: Record<string, { text: string; emoji: string }> = {
      TypeScript: { text: "Type safety enthusiast", emoji: "🛡️" },
      JavaScript: { text: "JS all the things", emoji: "⚡" },
      Python: { text: "Snek charmer", emoji: "🐍" },
      Rust: { text: "Memory safe warrior", emoji: "🦀" },
      Go: { text: "Gopher life", emoji: "🐹" },
      Java: { text: "Enterprise mode", emoji: "☕" },
      "C++": { text: "Performance junkie", emoji: "🚀" },
      Ruby: { text: "Developer happiness", emoji: "💎" },
      Swift: { text: "Apple ecosystem", emoji: "🍎" },
      Kotlin: { text: "Modern Android", emoji: "🤖" },
    }
    return messages[lang] || { text: "Code polyglot", emoji: "🌍" }
  }

  const topLangMessage = languages[0] ? getLanguageMessage(languages[0].name) : null

  const messageOpacity = interpolate(frame, [130, 150], [0, 1], {
    extrapolateRight: "clamp",
  })

  return (
    <AbsoluteFill className="bg-black flex flex-col items-center justify-center p-12">
      {/* Title */}
      <div style={{ opacity: titleOpacity }} className="text-center mb-16">
        <p className="text-4xl text-white/40 font-light tracking-wide mb-2">Your top</p>
        <p className="text-7xl font-black text-white tracking-tight">Languages</p>
      </div>

      {/* Language list */}
      <div className="w-full max-w-2xl space-y-8">
        {languages.slice(0, 5).map((lang, index) => {
          const delay = 40 + index * 25
          const itemOpacity = interpolate(frame, [delay, delay + 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.ease),
          })
          const barWidth = interpolate(frame, [delay + 10, delay + 50], [0, lang.percentage], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          })

          const color = langColors[index % langColors.length]

          return (
            <div key={lang.name} style={{ opacity: itemOpacity }}>
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-4xl font-bold text-white tracking-tight">
                  {index === 0 && "👑 "}
                  {lang.name}
                </span>
                <span className="text-3xl font-black text-white/60 tabular-nums">{Math.round(barWidth)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${color.bg} rounded-full`}
                  style={{ width: `${barWidth}%`, boxShadow: `0 0 20px ${color.glow}40` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {topLangMessage && (
        <div style={{ opacity: messageOpacity }} className="mt-12 flex items-center gap-4">
          <span className="text-6xl">{topLangMessage.emoji}</span>
          <p className="text-3xl font-medium text-white/40">{topLangMessage.text}</p>
        </div>
      )}
    </AbsoluteFill>
  )
}
