import { supabase } from "./supabase-client"
import type { ReviewResult } from "./types"

export async function saveReviewToSupabase(entry: {
  id: string,
  title: string,
  originalText: string,
  memo?: string,
  tags?: string[],
  reviewResult: ReviewResult
}) {
  if (!supabase) throw new Error("Supabaseクライアントが初期化されていません")

  const { correctedText, corrections, grammarScore, naturalnessScore, overallRating } = entry.reviewResult

  const { error } = await supabase.from("diary").upsert([
    {
      id: entry.id,
      title: entry.title,
      content: entry.originalText,
      memo: entry.memo || "",
      tags: entry.tags || [],
      corrected_text: correctedText,
      corrections: JSON.stringify(corrections),
      grammar_score: grammarScore,
      naturalness_score: naturalnessScore,
      overall_rating: overallRating,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ])

  if (error) throw new Error("Supabase保存エラー: " + error.message)
}
