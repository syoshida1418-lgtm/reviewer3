import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "xiaomi/mimo-v2-flash",
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that corrects English diary entries. Rewrite the entry naturally with grammar corrected.",
          },
          { role: "user", content: text },
        ],
      }),
    }
  );

  const data = await response.json();

  return NextResponse.json({
    result:
      data.choices?.[0]?.message?.content ?? "No result – try again.",
  });
}
