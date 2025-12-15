"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Player, type PlayerRef } from "@remotion/player";
import { GitWrappedComposition } from "@/components/github-wrapped/root";
import type { GitHubData } from "@/lib/github";
import {
  Loader2,
  Download,
  Share2,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";

type Theme = "dark" | "light" | "midnight" | "forest" | "sunset" | "ocean";
type Layout = "linear" | "bento";

const themes: Record<
  Theme,
  {
    bg: string;
    text: string;
    muted: string;
    accent: string;
    subtle: string;
    card: string;
  }
> = {
  dark: {
    bg: "#000000",
    text: "#ffffff",
    muted: "#888888",
    accent: "#ffffff",
    subtle: "#333333",
    card: "#111111",
  },
  light: {
    bg: "#fafafa",
    text: "#0a0a0a",
    muted: "#666666",
    accent: "#0a0a0a",
    subtle: "#e5e5e5",
    card: "#ffffff",
  },
  midnight: {
    bg: "#0f172a",
    text: "#e2e8f0",
    muted: "#64748b",
    accent: "#38bdf8",
    subtle: "#1e293b",
    card: "#111111",
  },
  forest: {
    bg: "#052e16",
    text: "#dcfce7",
    muted: "#86efac",
    accent: "#4ade80",
    subtle: "#14532d",
    card: "#111111",
  },
  sunset: {
    bg: "#1c1917",
    text: "#fef3c7",
    muted: "#fcd34d",
    accent: "#f59e0b",
    subtle: "#292524",
    card: "#111111",
  },
  ocean: {
    bg: "#0c4a6e",
    text: "#e0f2fe",
    muted: "#7dd3fc",
    accent: "#0ea5e9",
    subtle: "#075985",
    card: "#111111",
  },
};

async function drawCardToCanvas(
  githubData: GitHubData,
  theme: Theme,
): Promise<HTMLCanvasElement> {
  const t = themes[theme];
  const scale = 4;
  const width = 600 * scale;
  const height = 1500 * scale;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const s = (v: number) => v * scale;

  // Background
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, width, height);

  let avatarLoaded = false;
  const avatar = new Image();
  avatar.crossOrigin = "anonymous";
  const directAvatarUrl = `https://avatars.githubusercontent.com/${githubData.username}`;

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("timeout"));
      }, 8000);

      avatar.onload = async () => {
        try {
          await avatar.decode();
          clearTimeout(timeout);
          avatarLoaded = true;
          resolve();
        } catch (e) {
          clearTimeout(timeout);
          reject(e);
        }
      };
      avatar.onerror = (e) => {
        clearTimeout(timeout);
        reject(e);
      };
      avatar.src = directAvatarUrl;
    });
  } catch (e) {
    avatarLoaded = false;
  }

  let y = s(60);

  // Avatar and username row
  if (avatarLoaded && avatar.complete && avatar.naturalWidth > 0) {
    const avatarSize = s(70);
    const avatarX = s(50);
    const avatarY = y - s(10);

    // Draw circular avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      avatarX + avatarSize / 2,
      avatarY + avatarSize / 2,
      avatarSize / 2,
      0,
      Math.PI * 2,
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Draw border ring
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = s(3);
    ctx.beginPath();
    ctx.arc(
      avatarX + avatarSize / 2,
      avatarY + avatarSize / 2,
      avatarSize / 2 + s(2),
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Username next to avatar
    ctx.fillStyle = t.text;
    ctx.font = `italic 300 ${s(36)}px Georgia, "Times New Roman", serif`;
    ctx.textAlign = "left";
    ctx.fillText(
      githubData.username,
      avatarX + avatarSize + s(20),
      avatarY + avatarSize / 2 + s(12),
    );

    y = avatarY + avatarSize + s(40);
  } else {
    // Fallback: just username without avatar
    ctx.fillStyle = t.text;
    ctx.font = `italic 300 ${s(40)}px Georgia, "Times New Roman", serif`;
    ctx.textAlign = "left";
    ctx.fillText(githubData.username, s(50), y);
    y += s(20);
  }

  // Year on the right
  ctx.fillStyle = t.muted;
  ctx.font = `400 ${s(22)}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText("2025", width - s(50), s(60));

  y += s(20);

  // Decorative line
  ctx.strokeStyle = t.subtle;
  ctx.lineWidth = s(1);
  ctx.beginPath();
  ctx.moveTo(s(50), y);
  ctx.lineTo(width - s(50), y);
  ctx.stroke();

  y += s(40);

  ctx.fillStyle = t.muted;
  ctx.font = `400 ${s(14)}px "SF Mono", Monaco, "Cascadia Code", monospace`;
  ctx.textAlign = "left";
  ctx.fillText("your year in code", s(50), y);

  y += s(60);

  // Stats header
  ctx.fillStyle = t.text;
  ctx.font = `400 ${s(16)}px "SF Mono", Monaco, monospace`;
  const statsText = "stats";
  ctx.fillText(statsText, s(50), y);

  const statsWidth = ctx.measureText(statsText).width;
  ctx.strokeStyle = t.accent;
  ctx.lineWidth = s(2);
  ctx.beginPath();
  ctx.moveTo(s(50), y + s(6));
  ctx.lineTo(s(50) + statsWidth, y + s(6));
  ctx.stroke();

  y += s(50);

  // Stats
  const stats = [
    { value: githubData.totalRepos, label: "repositories" },
    { value: githubData.totalStars, label: "stars" },
    { value: githubData.totalCommits, label: "commits" },
    { value: githubData.totalPRs, label: "pull requests" },
  ];

  stats.forEach((stat) => {
    ctx.fillStyle = t.text;
    ctx.font = `700 ${s(54)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText(stat.value.toLocaleString(), s(50), y);

    ctx.fillStyle = t.muted;
    ctx.font = `300 ${s(16)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText(stat.label, s(50), y + s(24));

    y += s(100);
  });

  // Decorative line before languages
  y += s(10);
  ctx.strokeStyle = t.subtle;
  ctx.lineWidth = s(1);
  ctx.beginPath();
  ctx.moveTo(s(50), y);
  ctx.lineTo(width - s(50), y);
  ctx.stroke();

  y += s(40);

  // Languages header
  ctx.fillStyle = t.text;
  ctx.font = `400 ${s(16)}px "SF Mono", Monaco, monospace`;
  const langText = "languages";
  ctx.fillText(langText, s(50), y);

  const langWidth = ctx.measureText(langText).width;
  ctx.strokeStyle = t.accent;
  ctx.lineWidth = s(2);
  ctx.beginPath();
  ctx.moveTo(s(50), y + s(6));
  ctx.lineTo(s(50) + langWidth, y + s(6));
  ctx.stroke();

  y += s(40);

  githubData.topLanguages.slice(0, 5).forEach((lang) => {
    ctx.fillStyle = t.text;
    ctx.font = `400 ${s(16)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText(lang.name, s(50), y);

    ctx.fillStyle = t.muted;
    ctx.textAlign = "right";
    ctx.fillText(`${Math.round(lang.percentage)}%`, width - s(50), y);
    y += s(32);
  });

  y += s(20);

  // Decorative line before top repositories
  ctx.strokeStyle = t.subtle;
  ctx.lineWidth = s(1);
  ctx.beginPath();
  ctx.moveTo(s(50), y);
  ctx.lineTo(width - s(50), y);
  ctx.stroke();

  y += s(40);

  // Top repos header
  ctx.textAlign = "left"; // Explicitly reset text alignment
  ctx.fillStyle = t.text;
  ctx.font = `400 ${s(16)}px "SF Mono", Monaco, monospace`;
  const repoText = "top repositories";
  ctx.fillText(repoText, s(50), y);

  const repoWidth = ctx.measureText(repoText).width;
  ctx.strokeStyle = t.accent;
  ctx.lineWidth = s(2);
  ctx.beginPath();
  ctx.moveTo(s(50), y + s(6));
  ctx.lineTo(s(50) + repoWidth, y + s(6));
  ctx.stroke();

  y += s(40);

  // Top repos list
  githubData.topRepos.slice(0, 3).forEach((repo, i) => {
    ctx.textAlign = "left"; // Explicitly reset text alignment for each repo
    ctx.fillStyle = t.text;
    ctx.font = `400 ${s(16)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    const repoName =
      repo.name.length > 20 ? repo.name.substring(0, 17) + "..." : repo.name;
    ctx.fillText(`${i + 1}. ${repoName}`, s(50), y);

    ctx.fillStyle = t.muted;
    ctx.font = `400 ${s(14)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = "right";
    ctx.fillText(`★ ${repo.stars}`, width - s(50), y);
    y += s(28);

    if (repo.language) {
      ctx.textAlign = "left"; // Reset alignment for language text
      ctx.fillStyle = t.muted;
      ctx.font = `400 ${s(12)}px "SF Mono", Monaco, monospace`;
      ctx.fillText(repo.language, s(50), y);
      y += s(24);
    }

    y += s(16);
  });

  // Footer decorative line
  ctx.strokeStyle = t.subtle;
  ctx.lineWidth = s(1);
  ctx.beginPath();
  ctx.moveTo(s(50), height - s(70));
  ctx.lineTo(width - s(50), height - s(70));
  ctx.stroke();

  // Footer text
  ctx.fillStyle = t.muted;
  ctx.font = `400 ${s(12)}px "SF Mono", Monaco, monospace`;
  ctx.textAlign = "left";
  ctx.fillText("github-summary.vercel.app", s(50), height - s(40));

  return canvas;
}

async function drawBentoCardToCanvas(
  githubData: GitHubData,
  theme: Theme,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  const scale = 4;
  const width = 800;
  const height = 1300;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d")!;

  const s = (n: number) => n * scale;
  const t = themes[theme];

  // Background
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const avatar = new Image();
  avatar.crossOrigin = "anonymous";
  const directAvatarUrl = `https://avatars.githubusercontent.com/${githubData.username}`;
  const avatarLoaded = new Promise<boolean>((resolve) => {
    avatar.onload = async () => {
      try {
        await avatar.decode();
        resolve(true);
      } catch {
        resolve(false);
      }
    };
    avatar.onerror = () => resolve(false);
    setTimeout(() => resolve(false), 8000);
  });
  avatar.src = directAvatarUrl;
  const loaded = await avatarLoaded;

  // Header with avatar
  if (loaded && avatar.complete && avatar.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(s(90), s(90), s(40), 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, s(50), s(50), s(80), s(80));
    ctx.restore();

    ctx.strokeStyle = t.accent;
    ctx.lineWidth = s(2);
    ctx.beginPath();
    ctx.arc(s(90), s(90), s(40), 0, Math.PI * 2);
    ctx.stroke();
  }

  // Username
  ctx.fillStyle = t.text;
  ctx.font = `italic 300 ${s(36)}px Georgia, serif`;
  ctx.textAlign = "left";
  ctx.fillText(githubData.username, s(160), s(85));

  // Subtitle
  ctx.fillStyle = t.muted;
  ctx.font = `400 ${s(14)}px "SF Mono", Monaco, monospace`;
  ctx.fillText("your year in code", s(160), s(110));

  // Year
  ctx.fillStyle = t.muted;
  ctx.font = `400 ${s(22)}px "SF Mono", Monaco, monospace`;
  ctx.textAlign = "right";
  ctx.fillText("2025", width * scale - s(50), s(85));

  // Bento grid cards
  let y = s(180);

  // Helper function to draw card
  const drawCard = (
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    value: string,
    subtitle?: string,
  ) => {
    // Card background
    ctx.fillStyle = t.card;
    ctx.fillRect(x, y, w, h);

    // Card border
    ctx.strokeStyle = t.subtle;
    ctx.lineWidth = s(1);
    ctx.strokeRect(x, y, w, h);

    // Label
    ctx.fillStyle = t.muted;
    ctx.font = `400 ${s(14)}px "SF Mono", Monaco, monospace`;
    ctx.textAlign = "left";
    ctx.fillText(label, x + s(20), y + s(35));

    // Value
    ctx.fillStyle = t.text;
    const fontSize = w > s(350) ? s(72) : s(42);
    ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(value, x + s(20), y + (w > s(350) ? s(120) : s(85)));

    // Subtitle if provided
    if (subtitle) {
      ctx.fillStyle = t.muted;
      ctx.font = `400 ${s(13)}px "SF Mono", Monaco, monospace`;
      ctx.fillText(subtitle, x + s(20), y + h - s(25));
    }
  };

  // Large commit card
  drawCard(
    s(50),
    y,
    s(380),
    s(280),
    "commits",
    githubData.totalCommits.toLocaleString(),
    "you shipped code consistently",
  );

  // Repositories card
  drawCard(
    s(450),
    y,
    s(300),
    s(130),
    "repositories",
    githubData.totalRepos.toString(),
  );

  // Stars card
  drawCard(
    s(450),
    y + s(150),
    s(145),
    s(130),
    "stars",
    githubData.totalStars.toString(),
  );

  // PRs card
  drawCard(
    s(605),
    y + s(150),
    s(145),
    s(130),
    "PRs",
    githubData.totalPRs.toString(),
  );

  // Languages grid
  y += s(310);
  ctx.fillStyle = t.muted;
  ctx.font = `400 ${s(14)}px "SF Mono", Monaco, monospace`;
  ctx.textAlign = "left";
  ctx.fillText("TOP LANGUAGES", s(50), y);
  y += s(30);

  const languages = githubData.topLanguages.slice(0, 4);
  languages.forEach((lang, i) => {
    const x = s(50) + (i % 2) * s(360);
    const cardY = y + Math.floor(i / 2) * s(130);

    // Card background
    ctx.fillStyle = t.card;
    ctx.fillRect(x, cardY, s(340), s(110));

    // Card border
    ctx.strokeStyle = t.subtle;
    ctx.lineWidth = s(1);
    ctx.strokeRect(x, cardY, s(340), s(110));

    // Language name
    ctx.fillStyle = t.text;
    ctx.font = `400 ${s(16)}px "SF Mono", Monaco, monospace`;
    ctx.textAlign = "left";
    ctx.fillText(lang.name, x + s(20), cardY + s(35));

    // Rank
    ctx.fillStyle = t.muted;
    ctx.font = `400 ${s(14)}px "SF Mono", Monaco, monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`#${i + 1}`, x + s(320), cardY + s(35));

    // Percentage
    ctx.fillStyle = t.text;
    ctx.font = `700 ${s(32)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText(`${Math.round(lang.percentage)}%`, x + s(20), cardY + s(75));
  });

  // Top repositories grid
  y += s(290);
  ctx.fillStyle = t.muted;
  ctx.font = `400 ${s(14)}px "SF Mono", Monaco, monospace`;
  ctx.textAlign = "left";
  ctx.fillText("TOP REPOSITORIES", s(50), y);
  y += s(30);

  const topRepos = githubData.topRepos.slice(0, 3);
  topRepos.forEach((repo, i) => {
    const x = s(50) + (i % 2) * s(360);
    const cardY = y + Math.floor(i / 2) * s(130);

    // Card background
    ctx.fillStyle = t.card;
    ctx.fillRect(x, cardY, s(340), s(110));

    // Card border
    ctx.strokeStyle = t.subtle;
    ctx.lineWidth = s(1);
    ctx.strokeRect(x, cardY, s(340), s(110));

    // Repo name
    ctx.fillStyle = t.text;
    ctx.font = `400 ${s(16)}px "SF Mono", Monaco, monospace`;
    ctx.textAlign = "left";
    const repoName =
      repo.name.length > 20 ? repo.name.substring(0, 17) + "..." : repo.name;
    ctx.fillText(`${i + 1}. ${repoName}`, x + s(20), cardY + s(35));

    // Stars
    ctx.fillStyle = t.muted;
    ctx.font = `400 ${s(14)}px "SF Mono", Monaco, monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`★ ${repo.stars}`, x + s(320), cardY + s(35));

    // Language
    if (repo.language) {
      ctx.fillStyle = t.muted;
      ctx.font = `400 ${s(12)}px "SF Mono", Monaco, monospace`;
      ctx.textAlign = "left";
      ctx.fillText(repo.language, x + s(20), cardY + s(75));
    }
  });

  // Footer line
  y += s(310);
  ctx.strokeStyle = t.subtle;
  ctx.lineWidth = s(1);
  ctx.beginPath();
  ctx.moveTo(s(50), y);
  ctx.lineTo(width * scale - s(50), y);
  ctx.stroke();

  // Footer text
  ctx.fillStyle = t.muted;
  ctx.font = `400 ${s(14)}px "SF Mono", Monaco, monospace`;
  ctx.textAlign = "center";
  ctx.fillText("github-summary.vercel.app", (width * scale) / 2, y + s(40));

  return canvas;
}

function BentoCard({
  githubData,
  theme,
}: {
  githubData: GitHubData;
  theme: Theme;
}) {
  const t = themes[theme];

  return (
    <div
      className="p-8 w-full max-w-2xl rounded-lg"
      style={{ backgroundColor: t.bg }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img
            src={githubData.avatar || "/placeholder.svg"}
            alt={githubData.username}
            className="w-20 h-20 rounded-full ring-2"
            style={{ borderColor: t.accent }}
            crossOrigin="anonymous"
          />
          <div>
            <h2
              className="text-3xl font-light italic font-serif"
              style={{ color: t.text }}
            >
              {githubData.username}
            </h2>
            <p className="text-xs font-mono mt-1" style={{ color: t.muted }}>
              your year in code
            </p>
          </div>
        </div>
        <span className="text-lg font-mono" style={{ color: t.muted }}>
          2025
        </span>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {/* Large stat - commits */}
        <div
          className="col-span-2 row-span-2 p-6 rounded-lg border"
          style={{ backgroundColor: t.card, borderColor: t.subtle }}
        >
          <p className="text-xs font-mono mb-2" style={{ color: t.muted }}>
            commits
          </p>
          <p
            className="text-6xl font-bold tabular-nums"
            style={{ color: t.text }}
          >
            {githubData.totalCommits.toLocaleString()}
          </p>
          <div className="h-px my-3" style={{ backgroundColor: t.subtle }} />
          <p className="text-xs font-mono" style={{ color: t.muted }}>
            you shipped code consistently
          </p>
        </div>

        {/* Repositories */}
        <div
          className="col-span-2 p-4 rounded-lg border"
          style={{ backgroundColor: t.card, borderColor: t.subtle }}
        >
          <p className="text-xs font-mono mb-1" style={{ color: t.muted }}>
            repositories
          </p>
          <p
            className="text-4xl font-bold tabular-nums"
            style={{ color: t.text }}
          >
            {githubData.totalRepos}
          </p>
        </div>

        {/* Stars */}
        <div
          className="p-4 rounded-lg border"
          style={{ backgroundColor: t.card, borderColor: t.subtle }}
        >
          <p className="text-xs font-mono mb-1" style={{ color: t.muted }}>
            stars
          </p>
          <p
            className="text-3xl font-bold tabular-nums"
            style={{ color: t.text }}
          >
            {githubData.totalStars}
          </p>
        </div>

        {/* PRs */}
        <div
          className="p-4 rounded-lg border"
          style={{ backgroundColor: t.card, borderColor: t.subtle }}
        >
          <p className="text-xs font-mono mb-1" style={{ color: t.muted }}>
            PRs
          </p>
          <p
            className="text-3xl font-bold tabular-nums"
            style={{ color: t.text }}
          >
            {githubData.totalPRs}
          </p>
        </div>
      </div>

      {/* Languages Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <p className="text-sm font-mono mb-2" style={{ color: t.muted }}>
          TOP LANGUAGES
        </p>
        {githubData.topLanguages.slice(0, 4).map((lang, i) => (
          <div
            key={lang.name}
            className="p-4 rounded-lg border"
            style={{ backgroundColor: t.card, borderColor: t.subtle }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-mono" style={{ color: t.text }}>
                {lang.name}
              </span>
              <span className="text-xs" style={{ color: t.muted }}>
                #{i + 1}
              </span>
            </div>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: t.text }}
            >
              {Math.round(lang.percentage)}%
            </p>
          </div>
        ))}
      </div>

      {/* Top Repositories Grid */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <p className="text-sm font-mono mb-2" style={{ color: t.muted }}>
          TOP REPOSITORIES
        </p>
        {githubData.topRepos.slice(0, 3).map((repo, i) => (
          <div
            key={repo.name}
            className="p-4 rounded-lg border"
            style={{ backgroundColor: t.card, borderColor: t.subtle }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: t.text }}>
                {i + 1}.{" "}
                {repo.name.length > 20
                  ? repo.name.substring(0, 17) + "..."
                  : repo.name}
              </span>
              <span className="text-xs" style={{ color: t.muted }}>
                ★ {repo.stars}
              </span>
            </div>
            {repo.language && (
              <span className="text-xs font-mono" style={{ color: t.muted }}>
                {repo.language}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="h-px my-6" style={{ backgroundColor: t.subtle }} />
      <p className="text-xs font-mono text-center" style={{ color: t.muted }}>
        github-summary.vercel.app
      </p>
    </div>
  );
}

function BentoDisplayCard({
  githubData,
  theme,
}: {
  githubData: GitHubData;
  theme: Theme;
}) {
  const t = themes[theme];

  return (
    <div
      className="p-8 w-full max-w-2xl rounded-lg"
      style={{ backgroundColor: t.bg }}
    >
      {/* Header with avatar */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={githubData.avatar || "/placeholder.svg"}
          alt={githubData.username}
          className="w-16 h-16 rounded-full ring-2"
          style={{ borderColor: t.accent }}
          crossOrigin="anonymous"
        />
        <div className="flex-1">
          <h2
            className="text-3xl font-light italic font-serif"
            style={{ color: t.text }}
          >
            {githubData.username}
          </h2>
          <p className="text-xs font-mono" style={{ color: t.muted }}>
            your year in code
          </p>
        </div>
        <span className="text-xl" style={{ color: t.muted }}>
          2025
        </span>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {/* Commits - large card */}
        <div
          className="col-span-2 row-span-2 p-4 rounded-lg border flex flex-col justify-between"
          style={{ backgroundColor: t.card, borderColor: t.subtle }}
        >
          <p className="text-xs font-mono mb-2" style={{ color: t.muted }}>
            commits
          </p>
          <p
            className="text-6xl font-bold tabular-nums"
            style={{ color: t.text }}
          >
            {githubData.totalCommits.toLocaleString()}
          </p>
          <div className="h-px my-3" style={{ backgroundColor: t.subtle }} />
          <p className="text-xs font-mono" style={{ color: t.muted }}>
            you shipped code consistently
          </p>
        </div>

        {/* Repositories */}
        <div
          className="col-span-2 p-4 rounded-lg border"
          style={{ backgroundColor: t.card, borderColor: t.subtle }}
        >
          <p className="text-xs font-mono mb-1" style={{ color: t.muted }}>
            repositories
          </p>
          <p
            className="text-4xl font-bold tabular-nums"
            style={{ color: t.text }}
          >
            {githubData.totalRepos}
          </p>
        </div>

        {/* Stars */}
        <div
          className="p-4 rounded-lg border"
          style={{ backgroundColor: t.card, borderColor: t.subtle }}
        >
          <p className="text-xs font-mono mb-1" style={{ color: t.muted }}>
            stars
          </p>
          <p
            className="text-3xl font-bold tabular-nums"
            style={{ color: t.text }}
          >
            {githubData.totalStars}
          </p>
        </div>

        {/* PRs */}
        <div
          className="p-4 rounded-lg border"
          style={{ backgroundColor: t.card, borderColor: t.subtle }}
        >
          <p className="text-xs font-mono mb-1" style={{ color: t.muted }}>
            PRs
          </p>
          <p
            className="text-3xl font-bold tabular-nums"
            style={{ color: t.text }}
          >
            {githubData.totalPRs}
          </p>
        </div>
      </div>

      {/* Languages Section - label separate from grid */}
      <p className="text-xs font-mono mb-3" style={{ color: t.muted }}>
        TOP LANGUAGES
      </p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {githubData.topLanguages.slice(0, 4).map((lang, i) => (
          <div
            key={lang.name}
            className="p-4 rounded-lg border"
            style={{ backgroundColor: t.card, borderColor: t.subtle }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-mono" style={{ color: t.text }}>
                {lang.name}
              </span>
              <span className="text-xs" style={{ color: t.muted }}>
                #{i + 1}
              </span>
            </div>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: t.text }}
            >
              {Math.round(lang.percentage)}%
            </p>
          </div>
        ))}
      </div>

      {/* Top Repositories Section - label separate from grid */}
      <p className="text-xs font-mono mb-3" style={{ color: t.muted }}>
        TOP REPOSITORIES
      </p>
      <div className="grid grid-cols-2 gap-3">
        {githubData.topRepos.slice(0, 3).map((repo, i) => (
          <div
            key={repo.name}
            className="p-4 rounded-lg border"
            style={{ backgroundColor: t.card, borderColor: t.subtle }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: t.text }}>
                {i + 1}.{" "}
                {repo.name.length > 20
                  ? repo.name.substring(0, 17) + "..."
                  : repo.name}
              </span>
              <span className="text-xs" style={{ color: t.muted }}>
                ★ {repo.stars}
              </span>
            </div>
            {repo.language && (
              <span className="text-xs font-mono" style={{ color: t.muted }}>
                {repo.language}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="h-px my-6" style={{ backgroundColor: t.subtle }} />
      <p className="text-xs font-mono text-center" style={{ color: t.muted }}>
        github-summary.vercel.app
      </p>
    </div>
  );
}

function DisplayCard({
  githubData,
  theme,
}: {
  githubData: GitHubData;
  theme: Theme;
}) {
  const t = themes[theme];

  return (
    <div
      className="p-10 w-full max-w-md rounded-lg"
      style={{ backgroundColor: t.bg }}
    >
      {/* Header with avatar */}
      <div className="flex items-center gap-4 mb-2">
        <img
          src={githubData.avatar || "/placeholder.svg"}
          alt={githubData.username}
          className="w-16 h-16 rounded-full ring-2"
          style={{ borderColor: t.accent }}
          crossOrigin="anonymous"
        />
        <div className="flex-1">
          <h2
            className="text-2xl font-light italic font-serif"
            style={{ color: t.text }}
          >
            {githubData.username}
          </h2>
        </div>
        <span className="text-xl" style={{ color: t.muted }}>
          2025
        </span>
      </div>

      {/* Decorative line */}
      <div className="h-px my-4" style={{ backgroundColor: t.subtle }} />

      <p className="text-xs font-mono mb-10" style={{ color: t.muted }}>
        your year in code
      </p>

      {/* Stats section */}
      <div className="mb-8">
        <p
          className="text-xs font-mono underline underline-offset-4 mb-6"
          style={{ color: t.text, textDecorationColor: t.accent }}
        >
          stats
        </p>
        <div className="space-y-5">
          {[
            { value: githubData.totalRepos, label: "repositories" },
            { value: githubData.totalStars, label: "stars" },
            { value: githubData.totalCommits, label: "commits" },
            { value: githubData.totalPRs, label: "pull requests" },
          ].map((stat) => (
            <div key={stat.label}>
              <p
                className="text-4xl font-bold tabular-nums"
                style={{ color: t.text }}
              >
                {stat.value.toLocaleString()}
              </p>
              <p className="text-sm font-light" style={{ color: t.muted }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative line */}
      <div className="h-px my-6" style={{ backgroundColor: t.subtle }} />

      {/* Languages section */}
      <div className="mb-8">
        <p
          className="text-xs font-mono underline underline-offset-4 mb-4"
          style={{ color: t.text, textDecorationColor: t.accent }}
        >
          languages
        </p>
        <div className="space-y-2">
          {githubData.topLanguages.slice(0, 5).map((lang) => (
            <div key={lang.name} className="flex justify-between items-center">
              <span className="text-sm" style={{ color: t.text }}>
                {lang.name}
              </span>
              <span className="text-sm" style={{ color: t.muted }}>
                {Math.round(lang.percentage)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative line */}
      <div className="h-px my-6" style={{ backgroundColor: t.subtle }} />

      {/* Top Repositories section */}
      <div>
        <p
          className="text-xs font-mono underline underline-offset-4 mb-4"
          style={{ color: t.text, textDecorationColor: t.accent }}
        >
          top repositories
        </p>
        <div className="space-y-3">
          {githubData.topRepos.slice(0, 3).map((repo, i) => (
            <div key={repo.name}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium" style={{ color: t.text }}>
                  {i + 1}.{" "}
                  {repo.name.length > 20
                    ? repo.name.substring(0, 17) + "..."
                    : repo.name}
                </span>
                <span className="text-xs" style={{ color: t.muted }}>
                  ★ {repo.stars}
                </span>
              </div>
              {repo.language && (
                <span className="text-xs font-mono" style={{ color: t.muted }}>
                  {repo.language}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Decorative line */}
      <div className="h-px mt-8 mb-4" style={{ backgroundColor: t.subtle }} />

      {/* Footer */}
      <p className="text-xs font-mono text-center" style={{ color: t.muted }}>
        github-summary.vercel.app
      </p>
    </div>
  );
}

function WrappedContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [layout, setLayout] = useState<Layout>("linear");
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    if (!username) {
      setError("No username provided");
      setIsLoading(false);
      return;
    }

    fetch(`/api/github/${username}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch data");
        }
        return res.json();
      })
      .then(setGithubData)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [username]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handleEnded = () => {
      setVideoEnded(true);
      setIsPlaying(false);
      setShowSummary(true);
    };
    const handlePlay = () => {
      setIsPlaying(true);
      setVideoEnded(false);
    };
    const handlePause = () => setIsPlaying(false);

    player.addEventListener("ended", handleEnded);
    player.addEventListener("play", handlePlay);
    player.addEventListener("pause", handlePause);

    return () => {
      player.removeEventListener("ended", handleEnded);
      player.removeEventListener("play", handlePlay);
      player.removeEventListener("pause", handlePause);
    };
  }, [githubData]);

  const handleDownload = async () => {
    if (!githubData) return;
    setIsDownloading(true);
    try {
      const canvas =
        layout === "bento"
          ? await drawBentoCardToCanvas(githubData, theme)
          : await drawCardToCanvas(githubData, theme);
      const link = document.createElement("a");
      link.download = `${githubData.username}-github-wrapped-2025.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to download:", err);
      alert("Failed to download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    if (!githubData) return;
    try {
      const canvas =
        layout === "bento"
          ? await drawBentoCardToCanvas(githubData, theme)
          : await drawCardToCanvas(githubData, theme);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }, "image/png");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy image. Please try downloading instead.");
    }
  };

  const handleShare = async () => {
    if (!githubData) return;
    const url = `${window.location.origin}/wrapped?username=${githubData.username}`;
    if (navigator.share) {
      await navigator.share({
        title: `${githubData.username}'s GitHub Wrapped 2025`,
        text: `Check out my GitHub year in review!`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  const replay = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0);
    playerRef.current.play();
    setShowSummary(false);
    setVideoEnded(false);
  };

  const themeLabels: Record<Theme, string> = {
    dark: "dark",
    light: "light",
    midnight: "midnight",
    forest: "forest",
    sunset: "sunset",
    ocean: "ocean",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/40 text-xs font-mono">loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-white text-lg font-light italic font-serif mb-2">
            error
          </p>
          <p className="text-white/40 text-sm mb-8">{error}</p>
          <a
            href="/"
            className="text-white/40 hover:text-white transition-colors text-xs font-mono underline"
          >
            back home
          </a>
        </div>
      </div>
    );
  }

  if (!githubData) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Controls - minimal */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <a
          href="/"
          className="text-white/30 hover:text-white transition-colors text-xs font-mono"
        >
          ← back
        </a>
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="text-white/30 hover:text-white transition-colors text-xs font-mono"
        >
          {showSummary ? "video" : "summary"}
        </button>
      </div>

      {/* Main content */}
      <div className="w-full max-w-2xl">
        {showSummary ? (
          <div className="flex flex-col items-center">
            {/* Layout selector alongside theme selector */}
            <div className="flex gap-4 mb-4 items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setLayout("linear")}
                  className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                    layout === "linear"
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  linear
                </button>
                <button
                  onClick={() => setLayout("bento")}
                  className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                    layout === "bento"
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  bento
                </button>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex gap-2 flex-wrap">
                {Object.keys(themes).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t as Theme)}
                    className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                      theme === t
                        ? "bg-white text-black"
                        : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {themeLabels[t as Theme]}
                  </button>
                ))}
              </div>
            </div>

            {layout === "bento" ? (
              <BentoDisplayCard githubData={githubData} theme={theme} />
            ) : (
              <DisplayCard githubData={githubData} theme={theme} />
            )}

            <div className="flex gap-6 mt-8">
              <button
                onClick={handleCopyImage}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-mono"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "copied" : "copy"}
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-mono disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                download
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-mono"
              >
                <Share2 className="w-4 h-4" />
                share
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Player */}
            <div
              data-player-container
              className="aspect-[9/16] w-full max-w-md mx-auto overflow-hidden bg-black"
            >
              <Player
                ref={playerRef}
                component={GitWrappedComposition}
                inputProps={{ githubData }}
                durationInFrames={1080}
                fps={30}
                compositionWidth={1080}
                compositionHeight={1920}
                style={{ width: "100%", height: "100%" }}
                autoPlay
              />
            </div>

            {/* Player controls - minimal */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={togglePlayPause}
                className="p-2 text-white/40 hover:text-white transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
              {videoEnded && (
                <button
                  onClick={replay}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WrappedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
      }
    >
      <WrappedContent />
    </Suspense>
  );
}
