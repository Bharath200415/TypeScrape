import { NextRequest, NextResponse } from "next/server"
import { AnakinApiError, scrapeURL } from "@/lib/anakin"
import { extractDesignTokens } from "@/lib/extractCSS"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url } = body

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "url is required" },
        { status: 400 }
      )
    }

    // basic url validation
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    const { html, markdown } = await scrapeURL(url)
    const tokens = extractDesignTokens(html)

    return NextResponse.json({
      tokens,
      markdown,
      success: true,
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed"
    const status = err instanceof AnakinApiError ? err.status : 500
    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}