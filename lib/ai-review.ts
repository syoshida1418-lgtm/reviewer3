
import type { ReviewResult } from "./types"

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"
const MODEL = "xiaomi/mimo-v2-flash"

function buildPrompt(text: string) {
  return `You are an English writing tutor.\nCorrect the student's text and output only valid JSON in this format:\n\n{\n  "correctedText": "string",\n  "corrections": [\n    {\n      "id": "string",\n      "originalText": "string",\n      "correctedText": "string",\n      "reason": "string (in Japanese, briefly explain why the original is wrong and how to fix it)",\n      "type": "grammar | spelling | naturalness | style"\n    }\n  ],\n  "grammarScore": number (0-100),\n  "naturalnessScore": number (0-100),\n  "overallRating": number (1-5)\n}\n\nImportant:\n- Output ONLY valid JSON with the exact schema above.\n- For each correction's \"reason\" field, provide a short explanation IN JAPANESE (日本語) describing why the original is incorrect and how the corrected text fixes it.\n- Do not include any extra commentary outside the JSON.\n\nPlease review this English text:\n\n${text}`
}

export async function reviewText(text: string): Promise<ReviewResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error("OpenRouter APIキーが設定されていません。.env.localにOPENROUTER_API_KEYを追加してください。")
  }

  const prompt = buildPrompt(text)

  const res = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 2000
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => "")
    throw new Error(`OpenRouter APIエラー: ${res.status} ${res.statusText} ${errText}`)
  }

  const data = await res.json()
  const generated = data.choices?.[0]?.message?.content || ""

  const raw = generated.trim()

  // JSON部分のみ抽出
  let jsonStr = raw
  const jsonStart = raw.indexOf("{")
  const jsonEnd = raw.lastIndexOf("}")
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    jsonStr = raw.substring(jsonStart, jsonEnd + 1)
  }

  // reasonフィールドのダブルクォート抜けを補正
  jsonStr = jsonStr.replace(/("reason": )([^\"])([^,}]+)/g, (match, p1, p2, p3) => {
    // 既にダブルクォートで始まっていればそのまま
    if (p2 === '"') return match;
    // ダブルクォートで囲む
    return p1 + '"' + p2 + p3.replace(/"/g, '\"') + '"';
  });

  try {
    return JSON.parse(jsonStr) as ReviewResult
  } catch (err) {
    console.error("Failed to parse OpenRouter response as JSON:", jsonStr)
    throw new Error("AIからの応答が正しいJSON形式ではありませんでした。もう一度お試しください。\n\nAI応答:\n" + raw)
  }
}
