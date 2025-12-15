"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Github } from "lucide-react"

export default function HomePage() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setIsLoading(true)
    router.push(`/wrapped?username=${encodeURIComponent(username.trim())}`)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Github className="w-12 h-12 text-white" />
            <h1 className="text-6xl font-black text-white tracking-tighter">
              <span className="border-b-4 border-white pb-2">Git Wrapped</span>
            </h1>
          </div>
          <p className="text-xl text-white/40 font-light">Your year in code, visualized.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="github username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-14 px-0 text-xl bg-transparent border-0 border-b border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-colors"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={!username.trim() || isLoading}
            className="w-full h-14 text-lg font-medium bg-white text-black hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLoading ? "Loading..." : "See Your Wrapped →"}
          </button>
        </form>

        {/* Examples */}
        <div className="space-y-3">
          <p className="text-xs text-white/30 uppercase tracking-wider">Try an example</p>
          <div className="flex flex-wrap gap-3">
            {["torvalds", "gaearon", "sindresorhus"].map((example) => (
              <button
                key={example}
                onClick={() => setUsername(example)}
                className="px-4 py-2 text-sm text-white/40 hover:text-white border border-white/10 hover:border-white/30 transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-8 border-t border-white/10">
          <p className="text-xs text-white/30 uppercase tracking-wider">Features</p>
          <ul className="text-sm text-white/40 space-y-2">
            <li>✓ Interactive animated video experience</li>
            <li>✓ Download as shareable image card</li>
            <li>✓ Multiple themes and layouts</li>
            <li>✓ Real-time GitHub stats</li>
          </ul>
        </div>

        {/* Footer */}
        <p className="text-xs text-white/20">Powered by GitHub API</p>
      </div>
    </div>
  )
}
