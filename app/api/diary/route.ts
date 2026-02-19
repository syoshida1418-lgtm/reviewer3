import { NextRequest, NextResponse } from "next/server"
import { readDiaryEntries, upsertDiaryEntry, deleteDiaryEntryById } from "@/lib/server-storage"
import { supabase } from "@/lib/supabase-client"

// If SUPABASE_URL and SUPABASE_SERVICE_KEY are configured, use Supabase table `diary`.
// Otherwise fallback to file-based server storage.

export async function GET() {
  if (supabase) {
    const { data, error } = await supabase.from("diary").select("*")
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  }

  const entries = await readDiaryEntries()
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  try {
    const entry = await req.json()
    if (supabase) {
      const { error } = await supabase.from("diary").upsert(entry)
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    await upsertDiaryEntry(entry)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 })

    if (supabase) {
      const { error } = await supabase.from("diary").delete().eq("id", id)
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    await deleteDiaryEntryById(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
