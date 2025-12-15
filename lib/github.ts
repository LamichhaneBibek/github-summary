export interface GitHubData {
  username: string
  avatar: string
  totalRepos: number
  totalStars: number
  followers: number
  following: number
  topLanguages: Array<{ name: string; percentage: number }>
  totalCommits: number
  totalPRs: number
  totalIssues: number
  topRepos: Array<{ name: string; stars: number; description: string; language?: string }>
  longestStreak?: number
  currentStreak?: number
  accountAge?: number
  bio?: string
  totalForks: number
  contributedTo: number
  mostActiveDay?: string
  linesOfCode?: number
  mostUsedLanguage?: string
  codingVelocity?: number
}

const cache = new Map<string, { data: GitHubData; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function fetchGitHubData(username: string): Promise<GitHubData> {
  const cached = cache.get(username)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("[v0] Returning cached data for", username)
    return cached.data
  }

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  }

  const token = process.env.GITHUB_TOKEN
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers })
    if (!userResponse.ok) {
      throw new Error("User not found")
    }
    const userData = await userResponse.json()

    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&type=all`,
      { headers },
    )
    if (!reposResponse.ok) {
      throw new Error("Failed to fetch repositories")
    }
    const repos = await reposResponse.json()

    const totalStars = repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0)
    const totalForks = repos.reduce((sum: number, repo: any) => sum + repo.forks_count, 0)

    // Calculate languages
    const languageCounts: Record<string, number> = {}
    repos.forEach((repo: any) => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
      }
    })

    const totalReposWithLang = Object.values(languageCounts).reduce((a: number, b: number) => a + b, 0)
    const topLanguages = Object.entries(languageCounts)
      .map(([name, count]) => ({
        name,
        percentage: totalReposWithLang > 0 ? (count / totalReposWithLang) * 100 : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5)

    const mostUsedLanguage = topLanguages[0]?.name || "Unknown"

    const topRepos = repos
      .sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
      .slice(0, 3)
      .map((repo: any) => ({
        name: repo.name,
        stars: repo.stargazers_count,
        description: repo.description || "",
        language: repo.language || "",
      }))

    let totalCommits = 0
    let totalPRs = 0
    let totalIssues = 0
    let contributedTo = 0
    let mostActiveDay = ""
    let linesOfCode = 0

    if (token) {
      try {
        const graphqlResponse = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query($username: String!) {
                user(login: $username) {
                  contributionsCollection {
                    totalCommitContributions
                    restrictedContributionsCount
                    totalPullRequestContributions
                    totalIssueContributions
                    totalRepositoriesWithContributedCommits
                    contributionCalendar {
                      totalContributions
                      weeks {
                        contributionDays {
                          contributionCount
                          date
                        }
                      }
                    }
                  }
                  repositoriesContributedTo(first: 100, contributionTypes: [COMMIT, PULL_REQUEST, ISSUE]) {
                    totalCount
                  }
                }
              }
            `,
            variables: { username },
          }),
        })

        if (graphqlResponse.ok) {
          const graphqlData = await graphqlResponse.json()
          const contributions = graphqlData?.data?.user?.contributionsCollection
          if (contributions) {
            totalCommits =
              (contributions.totalCommitContributions || 0) + (contributions.restrictedContributionsCount || 0)
            totalPRs = contributions.totalPullRequestContributions || 0
            totalIssues = contributions.totalIssueContributions || 0
            contributedTo = graphqlData?.data?.user?.repositoriesContributedTo?.totalCount || 0

            const calendar = contributions.contributionCalendar
            if (calendar?.weeks) {
              let maxCount = 0
              calendar.weeks.forEach((week: any) => {
                week.contributionDays.forEach((day: any) => {
                  if (day.contributionCount > maxCount) {
                    maxCount = day.contributionCount
                    mostActiveDay = new Date(day.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                })
              })
            }
          }
        }
      } catch (e) {
        console.error("[v0] GraphQL query failed, falling back to events API")
      }
    }

    // Fallback to events API
    if (totalCommits === 0) {
      const eventsResponse = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, {
        headers,
      })

      if (eventsResponse.ok) {
        const events = await eventsResponse.json()
        events.forEach((event: any) => {
          if (event.type === "PushEvent") {
            totalCommits += event.payload.commits?.length || 0
          } else if (event.type === "PullRequestEvent") {
            totalPRs++
          } else if (event.type === "IssuesEvent") {
            totalIssues++
          }
        })
      }

      // Estimate if still low
      totalCommits = Math.max(totalCommits, repos.length * 8)
    }

    const createdAt = new Date(userData.created_at)
    const now = new Date()
    const accountAge = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365))

    const codingVelocity = userData.public_repos > 0 ? Math.round(totalCommits / userData.public_repos) : 0

    linesOfCode = totalCommits * 50

    const result: GitHubData = {
      username: userData.login,
      avatar: userData.avatar_url,
      totalRepos: userData.public_repos + (userData.total_private_repos || 0),
      totalStars,
      followers: userData.followers,
      following: userData.following,
      topLanguages,
      totalCommits,
      totalPRs,
      totalIssues,
      topRepos,
      accountAge,
      bio: userData.bio || "",
      totalForks,
      contributedTo,
      mostActiveDay,
      linesOfCode,
      mostUsedLanguage,
      codingVelocity,
    }

    cache.set(username, { data: result, timestamp: Date.now() })

    return result
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch GitHub data")
  }
}
