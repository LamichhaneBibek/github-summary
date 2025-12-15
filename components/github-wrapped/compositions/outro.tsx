import type React from "react"
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion"
import type { GitHubData } from "@/lib/github"

interface OutroProps {
  githubData: GitHubData
}

export const Outro: React.FC<OutroProps> = ({ githubData }) => {
  const frame = useCurrentFrame()

  const colors = {
    cyan: "#22d3ee",
    lime: "#a3e635",
    orange: "#fb923c",
    rose: "#fb7185",
    amber: "#fbbf24",
  }

  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  })

  const cardOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  })

  const cardY = interpolate(frame, [30, 60], [20, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  })

  return (
    <AbsoluteFill className="bg-black flex flex-col items-center justify-center p-8">
      {/* Title */}
      <div style={{ opacity: titleOpacity }} className="text-center mb-10">
        <p className="text-7xl font-black text-white tracking-tight">That's a wrap.</p>
      </div>

      {/* Summary Card */}
      <div
        style={{
          opacity: cardOpacity,
          transform: `translateY(${cardY}px)`,
        }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
          <div className="w-20 h-20 rounded-full border border-white/20 overflow-hidden">
            <img
              src={githubData.avatar || "/placeholder.svg"}
              alt={githubData.username}
              className="w-full h-full object-cover grayscale"
              crossOrigin="anonymous"
            />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white border-b border-white/40 inline-block">
              {githubData.username}
            </h3>
            <p className="text-base text-white/40">2025</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <StatItem label="Repositories" value={githubData.totalRepos} frame={frame} delay={50} />
          <StatItem label="Stars" value={githubData.totalStars} frame={frame} delay={55} />
          <StatItem label="Commits" value={githubData.totalCommits} frame={frame} delay={60} />
          <StatItem label="PRs" value={githubData.totalPRs} frame={frame} delay={65} />
        </div>

        {/* Languages */}
        <div className="mb-6">
          <p className="text-sm text-white/30 uppercase tracking-wider mb-3">Top Languages</p>
          <div className="flex gap-2 flex-wrap">
            {githubData.topLanguages.slice(0, 4).map((lang, i) => {
              const langOpacity = interpolate(frame, [75 + i * 5, 85 + i * 5], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
              return (
                <span
                  key={lang.name}
                  style={{ opacity: langOpacity }}
                  className="px-3 py-1.5 text-sm font-medium text-white/70 bg-white/5 border border-white/10 rounded-full"
                >
                  {lang.name}
                </span>
              )
            })}
          </div>
        </div>

        {/* Top repo */}
        {githubData.topRepos[0] && (
          <div
            style={{
              opacity: interpolate(frame, [100, 120], [0, 1], { extrapolateRight: "clamp" }),
            }}
            className="pt-6 border-t border-white/10"
          >
            <p className="text-sm text-white/30 uppercase tracking-wider mb-2">Top Repository</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white">{githubData.topRepos[0].name}</span>
              <span className="text-2xl font-bold text-white/60">{githubData.topRepos[0].stars} stars</span>
            </div>
          </div>
        )}
      </div>

      <p
        style={{
          opacity: interpolate(frame, [130, 150], [0, 1], { extrapolateRight: "clamp" }),
        }}
        className="text-white/30 mt-8 text-base"
      >
        github-summary.vercel.app
      </p>
    </AbsoluteFill>
  )
}

const StatItem: React.FC<{
  label: string
  value: number
  frame: number
  delay: number
}> = ({ label, value, frame, delay }) => {
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  return (
    <div style={{ opacity }} className="text-center">
      <p className="text-4xl font-black text-white tabular-nums mb-1">{value.toLocaleString()}</p>
      <p className="text-sm text-white/40 font-medium uppercase tracking-wider">{label}</p>
    </div>
  )
}
