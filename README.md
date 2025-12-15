# Git Wrapped - Your Year in Code

A Spotify Wrapped-style experience for your GitHub statistics. Visualize your coding journey with beautiful animations and shareable cards.

## Features

- **Interactive Video Experience**: Animated presentation of your GitHub stats using Remotion
- **Multiple Themes**: Choose from Dark, Light, Midnight, Forest, Sunset, and Ocean themes
- **Two Layout Styles**: Linear storytelling or Bento grid layout
- **Shareable Cards**: Download your stats as beautiful image cards
- **Real-time Stats**: Fetches live data from GitHub API including:
  - Total commits, repositories, stars, and PRs
  - Top programming languages
  - Most starred repositories
  - Contribution streak
  - Account age
  - Lines of code estimate
  - Coding velocity

## Environment Variables

### GITHUB_TOKEN (Optional)

A GitHub Personal Access Token for enhanced features and higher rate limits.

**Why you need it:**
- **Higher Rate Limits**: 5,000 requests/hour (vs 60 without token)
- **Better Stats**: Access to private contribution data via GraphQL API
- **Accurate Counts**: Real commit, PR, and issue counts instead of estimates

**How to get it:**
1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Git Wrapped")
4. Select scopes:
   - `read:user` - Read user profile data
   - `repo` - Access repository data (only if you want private repo stats)
5. Click "Generate token"
6. Copy the token and add it to your Vercel project:
   - Go to your Vercel project settings
   - Navigate to Environment Variables
   - Add: `GITHUB_TOKEN` = your_token_here

**Without the token:**
- The app will still work!
- Stats are estimated from public events API
- Rate limited to 60 requests/hour per IP

## Tech Stack

- **Next.js 16** - React framework with App Router
- **Remotion 4** - Video generation and animations
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **GitHub API** - Data source

## Getting Started

### Installation

\`\`\`bash
# Clone the repository
git clone <your-repo-url>

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

### Usage

1. Enter any GitHub username on the home page
2. Choose your preferred theme and layout
3. Watch your animated stats presentation
4. Download as an image to share on social media

## API Routes

### GET /api/github/[username]

Fetches GitHub statistics for a given username.

**Response:**
\`\`\`json
{
  "username": "octocat",
  "avatar": "https://...",
  "totalRepos": 100,
  "totalStars": 5000,
  "totalCommits": 10000,
  "topLanguages": [...],
  "topRepos": [...],
  ...
}
\`\`\`

## Caching

- API responses are cached for 5 minutes
- Server-side caching with stale-while-revalidate
- Client-side caching for better performance

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Remember to add your `GITHUB_TOKEN` environment variable in Vercel project settings for best results.
