import type React from "react"
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion"

interface IntroProps {
  username: string
  avatar: string
}

export const Intro: React.FC<IntroProps> = ({ username, avatar }) => {
  const frame = useCurrentFrame()

  const colors = [
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
    "#fb7185", // rose
    "#22d3ee", // cyan light
    "#a3e635", // lime light
    "#fdba74", // orange light
  ]

  const yearOpacity = interpolate(frame, [0, 40], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  })

  const yearY = interpolate(frame, [0, 40], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  })

  const avatarOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  })

  const usernameOpacity = interpolate(frame, [50, 80], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  })

  const taglineOpacity = interpolate(frame, [70, 100], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  })

  const taglineY = interpolate(frame, [70, 100], [20, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  })

  return (
    <AbsoluteFill className="bg-black flex flex-col items-center justify-center p-12">
      {/* Year - large background text */}
      <div
        style={{
          opacity: yearOpacity * 0.08,
          transform: `translateY(${yearY}px)`,
        }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span className="text-[500px] font-black text-white tracking-tighter">2025</span>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Avatar */}
        <div style={{ opacity: avatarOpacity }} className="mb-8">
          <div className="w-48 h-48 rounded-full border-2 border-white/20 overflow-hidden">
            <img
              src={avatar || "/placeholder.svg?height=192&width=192"}
              alt={username}
              className="w-full h-full object-cover grayscale"
              crossOrigin="anonymous"
            />
          </div>
        </div>

        {/* Username */}
        <h1 style={{ opacity: usernameOpacity }} className="text-8xl font-black text-white tracking-tight mb-6">
          <span className="border-b-4 border-white pb-2">{username}</span>
        </h1>

        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
          }}
          className="text-center space-y-2"
        >
          <p className="text-5xl text-white/60 font-light">Your year in code.</p>
        </div>
      </div>
    </AbsoluteFill>
  )
}
