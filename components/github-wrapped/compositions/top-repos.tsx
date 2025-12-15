import type React from "react"
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion"

interface TopReposProps {
  repos: Array<{ name: string; stars: number; description: string; language?: string }>
}

export const TopRepos: React.FC<TopReposProps> = ({ repos }) => {
  const frame = useCurrentFrame()

  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  })

  return (
    <AbsoluteFill className="bg-black flex flex-col items-center justify-center p-12">
      {/* Title */}
      <div style={{ opacity: titleOpacity }} className="text-center mb-14">
        <p className="text-4xl text-white/40 font-light tracking-wide mb-2">Your top</p>
        <p className="text-7xl font-black text-white tracking-tight">Repositories</p>
      </div>

      {/* Repo list */}
      <div className="w-full max-w-2xl space-y-6">
        {repos.slice(0, 3).map((repo, index) => {
          const delay = 40 + index * 35
          const itemOpacity = interpolate(frame, [delay, delay + 25], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.ease),
          })
          const slideY = interpolate(frame, [delay, delay + 25], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          })

          return (
            <div
              key={repo.name}
              style={{
                opacity: itemOpacity,
                transform: `translateY(${slideY}px)`,
              }}
              className="border-b border-white/10 pb-6"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-4xl font-bold text-white tracking-tight mb-1">
                    <span className="border-b-2 border-white/40">{repo.name}</span>
                  </h3>
                  {repo.language && <span className="text-lg text-white/40">{repo.language}</span>}
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black text-white tabular-nums">{repo.stars}</span>
                  <p className="text-lg text-white/40">stars</p>
                </div>
              </div>
              {repo.description && <p className="text-xl text-white/50 line-clamp-2">{repo.description}</p>}
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
