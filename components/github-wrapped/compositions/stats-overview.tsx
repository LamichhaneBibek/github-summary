import type React from "react"
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion"

interface StatsOverviewProps {
  totalRepos: number
  totalStars: number
  followers: number
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ totalRepos, totalStars, followers }) => {
  const frame = useCurrentFrame()

  const colors = {
    primary: "#f97316",
    secondary: "#fbbf24",
    accent: "#fb7185",
    glow: "#fdba74",
  }

  const labelOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  })

  const numberOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  })

  const animatedRepos = Math.max(
    0,
    Math.floor(
      interpolate(frame, [25, 70], [0, totalRepos], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.quad),
      }),
    ),
  )

  const secondaryOpacity = interpolate(frame, [80, 110], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  })

  const animatedStars = Math.max(
    0,
    Math.floor(
      interpolate(frame, [85, 120], [0, totalStars], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.quad),
      }),
    ),
  )

  const animatedFollowers = Math.max(
    0,
    Math.floor(
      interpolate(frame, [100, 135], [0, followers], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.quad),
      }),
    ),
  )

  return (
    <AbsoluteFill className="bg-black flex flex-col items-center justify-center p-12">
      <div className="text-center">
        {/* Label */}
        <p style={{ opacity: labelOpacity }} className="text-4xl text-white/40 font-light tracking-wide mb-4">
          You created
        </p>

        {/* Main number */}
        <div style={{ opacity: numberOpacity }} className="mb-4">
          <span className="text-[240px] font-black text-white leading-none tracking-tighter tabular-nums">
            {animatedRepos}
          </span>
        </div>

        <p style={{ opacity: numberOpacity }} className="text-6xl text-white font-light tracking-wide mb-16">
          repositories
        </p>

        {/* Secondary stats */}
        <div style={{ opacity: secondaryOpacity }} className="flex gap-32 justify-center">
          <div className="text-center">
            <p className="text-8xl font-black text-white tabular-nums mb-2">{animatedStars}</p>
            <p className="text-2xl text-white/40 font-light">stars earned</p>
          </div>
          <div className="text-center">
            <p className="text-8xl font-black text-white tabular-nums mb-2">{animatedFollowers}</p>
            <p className="text-2xl text-white/40 font-light">followers</p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
