import type React from "react"
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion"

interface ContributionsProps {
  totalCommits: number
  totalPRs: number
  totalIssues: number
  longestStreak?: number
  currentStreak?: number
}

export const Contributions: React.FC<ContributionsProps> = ({
  totalCommits,
  totalPRs,
  totalIssues,
  longestStreak = 0,
  currentStreak = 0,
}) => {
  const frame = useCurrentFrame()

  const colors = {
    primary: "#22c55e",
    secondary: "#84cc16",
    accent: "#10b981",
    glow: "#4ade80",
  }

  const labelOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  })

  const numberOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  })

  const animatedCommits = Math.max(
    0,
    Math.floor(
      interpolate(frame, [25, 80], [0, totalCommits], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.quad),
      }),
    ),
  )

  const secondaryOpacity = interpolate(frame, [90, 120], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  })

  return (
    <AbsoluteFill className="bg-gradient-to-br from-slate-950 via-emerald-950/40 to-green-950/40 flex flex-col items-center justify-center p-10 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[110px] opacity-35"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            top: "25%",
            right: "25%",
            transform: `translate(${Math.sin(frame * 0.02) * 40}px, ${Math.cos(frame * 0.02) * 40}px)`,
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[90px] opacity-25"
          style={{
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.glow})`,
            bottom: "25%",
            left: "20%",
            transform: `translate(${Math.cos(frame * 0.025) * 35}px, ${Math.sin(frame * 0.025) * 35}px)`,
          }}
        />
      </div>

      {/* Main stats */}
      <div className="text-center z-10">
        {/* Label */}
        <p style={{ opacity: labelOpacity }} className="text-4xl text-white/40 font-light tracking-wide mb-4">
          You pushed
        </p>

        {/* Main number */}
        <div style={{ opacity: numberOpacity }} className="mb-4">
          <span className="text-[240px] font-black text-white leading-none tracking-tighter tabular-nums">
            {animatedCommits}
          </span>
        </div>

        <p style={{ opacity: numberOpacity }} className="text-6xl text-white font-light tracking-wide mb-16">
          commits
        </p>

        {/* Secondary stats */}
        <div style={{ opacity: secondaryOpacity }} className="flex gap-32 justify-center">
          <div className="text-center">
            <p className="text-8xl font-black text-white tabular-nums mb-2">{totalPRs}</p>
            <p className="text-2xl text-white/40 font-light">pull requests</p>
          </div>
          <div className="text-center">
            <p className="text-8xl font-black text-white tabular-nums mb-2">{totalIssues}</p>
            <p className="text-2xl text-white/40 font-light">issues</p>
          </div>
        </div>

        {/* Streak section */}
        {(longestStreak > 0 || currentStreak > 0) && (
          <div className="mt-10">
            <div className="flex gap-10 justify-center">
              {longestStreak > 0 && (
                <div className="text-center">
                  <div className="text-6xl mb-2">🔥</div>
                  <div className="text-5xl font-black" style={{ color: colors.secondary }}>
                    {longestStreak} days
                  </div>
                  <div className="text-xl text-slate-400">longest streak</div>
                </div>
              )}
              {currentStreak > 0 && (
                <div className="text-center">
                  <div className="text-6xl mb-2">⚡</div>
                  <div className="text-5xl font-black" style={{ color: colors.glow }}>
                    {currentStreak} days
                  </div>
                  <div className="text-xl text-slate-400">current streak</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  )
}
