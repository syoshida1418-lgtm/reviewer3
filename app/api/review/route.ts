import { NextRequest, NextResponse } from "next/server"
import { reviewText } from "@/lib/ai-review"

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "textが必要です" }, { status: 400 })
    }
    try {
      const result = await reviewText(text)
      return NextResponse.json({ result })
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "AIレビューエラー" }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: "APIルートで予期せぬエラー: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
