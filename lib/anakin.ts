const ANAKIN_BASE_URL = "https://api.anakin.io/v1"

export class AnakinApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "AnakinApiError"
    this.status = status
  }
}

function getAnakinApiKey(): string {
  const key = process.env.ANAKIN_API_KEY

  if (!key) {
    throw new AnakinApiError(
      "Missing ANAKIN_API_KEY. Add it to frontend/.env.local and restart the dev server.",
      500
    )
  }

  return key
}

interface AnakinJobResponse {
  jobId: string
  status: string
}

interface AnakinResultResponse {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  html?: string
  markdown?: string
  error?: string
}

async function submitScrapeJob(url: string): Promise<string> {
  const apiKey = getAnakinApiKey()

  const response = await fetch(`${ANAKIN_BASE_URL}/url-scraper`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      url,
      useBrowser: true,
      country: "us",
    }),
  })

  if (!response.ok) {
    let message = response.statusText

    try {
      const err = await response.json()
      message = err.error ?? message
    } catch {
      const text = await response.text()
      if (text) message = text
    }

    throw new AnakinApiError(`Anakin scrape failed: ${message}`, response.status)
  }

  const data: AnakinJobResponse = await response.json()
  return data.jobId
}

async function pollScrapeJob(jobId: string): Promise<AnakinResultResponse> {
  const apiKey = getAnakinApiKey()
  const maxAttempts = 24        // 24 × 5s = 2 min max
  const intervalMs = 5000

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((res) => setTimeout(res, intervalMs))

    const response = await fetch(`${ANAKIN_BASE_URL}/url-scraper/${jobId}`, {
      headers: {
        "X-API-Key": apiKey,
      },
    })

    if (!response.ok) {
      throw new AnakinApiError(`Anakin poll failed: ${response.statusText}`, response.status)
    }

    const data: AnakinResultResponse = await response.json()

    if (data.status === "completed") return data
    if (data.status === "failed") throw new Error(`Anakin job failed: ${data.error ?? "unknown error"}`)

    // still pending/processing — loop again
  }

  throw new Error("Anakin scrape timed out after 2 minutes")
}

export async function scrapeURL(url: string): Promise<{ html: string; markdown: string }> {
  const jobId = await submitScrapeJob(url)
  const result = await pollScrapeJob(jobId)

  if (!result.html || !result.markdown) {
    throw new Error("Anakin returned empty content")
  }

  return {
    html: result.html,
    markdown: result.markdown,
  }
}