import type React from "react"
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Easing } from "remotion"
import { Intro } from "./compositions/intro"
import { StatsOverview } from "./compositions/stats-overview"
import { Languages } from "./compositions/languages"
import { Contributions } from "./compositions/contributions"
import { TopRepos } from "./compositions/top-repos"
import { Outro } from "./compositions/outro"
import type { GitHubData } from "@/lib/github"

const SceneTransition: React.FC<{
  children: React.ReactNode
  durationInFrames: number
}> = ({ children, durationInFrames }) => {
  const frame = useCurrentFrame()

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  })

  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.ease),
  })

  const opacity = Math.min(fadeIn, fadeOut)

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
}

export const GitWrappedComposition: React.FC<{ githubData: GitHubData }> = ({ githubData }) => {
  const frame = useCurrentFrame()
  const sceneDuration = 180

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Progress Bar - minimal white segments */}
      <div className="absolute top-0 left-0 right-0 z-50 flex gap-1.5 p-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{
                width:
                  frame >= (i + 1) * sceneDuration
                    ? "100%"
                    : frame >= i * sceneDuration
                      ? `${((frame - i * sceneDuration) / sceneDuration) * 100}%`
                      : "0%",
              }}
            />
          </div>
        ))}
      </div>

      <Sequence from={0} durationInFrames={sceneDuration}>
        <SceneTransition durationInFrames={sceneDuration}>
          <Intro username={githubData.username} avatar={githubData.avatar} />
        </SceneTransition>
      </Sequence>

      <Sequence from={sceneDuration} durationInFrames={sceneDuration}>
        <SceneTransition durationInFrames={sceneDuration}>
          <StatsOverview
            totalRepos={githubData.totalRepos}
            totalStars={githubData.totalStars}
            followers={githubData.followers}
          />
        </SceneTransition>
      </Sequence>

      <Sequence from={sceneDuration * 2} durationInFrames={sceneDuration}>
        <SceneTransition durationInFrames={sceneDuration}>
          <Languages languages={githubData.topLanguages} />
        </SceneTransition>
      </Sequence>

      <Sequence from={sceneDuration * 3} durationInFrames={sceneDuration}>
        <SceneTransition durationInFrames={sceneDuration}>
          <Contributions
            totalCommits={githubData.totalCommits}
            totalPRs={githubData.totalPRs}
            totalIssues={githubData.totalIssues}
          />
        </SceneTransition>
      </Sequence>

      <Sequence from={sceneDuration * 4} durationInFrames={sceneDuration}>
        <SceneTransition durationInFrames={sceneDuration}>
          <TopRepos repos={githubData.topRepos} />
        </SceneTransition>
      </Sequence>

      <Sequence from={sceneDuration * 5} durationInFrames={sceneDuration}>
        <SceneTransition durationInFrames={sceneDuration}>
          <Outro githubData={githubData} />
        </SceneTransition>
      </Sequence>
    </AbsoluteFill>
  )
}
