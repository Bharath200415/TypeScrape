import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { buildAnalysisPrompt } from "@/lib/prompts"
import { DesignTokens, AnalysisResult } from "@/types"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tokens, markdown }: { tokens: DesignTokens; markdown: string } = body

    if (!tokens || !markdown) {
      return NextResponse.json(
        { error: "tokens and markdown are required" },
        { status: 400 }
      )
    }

    const prompt = buildAnalysisPrompt(tokens, markdown)

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        responseMimeType: "application/json",  // forces valid JSON output, no fences
        temperature: 0.3,                      // lower = more consistent structured output
        maxOutputTokens: 8192,
      },
    })

    const result = await model.generateContent(prompt)
    const raw = result.response.text()

    let analysis: AnalysisResult

    try {
      analysis = JSON.parse(raw)
    } catch {
      return NextResponse.json(
        { error: "Gemini returned malformed JSON", raw },
        { status: 500 }
      )
    }

    return NextResponse.json({
      analysis,
      success: true,
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}