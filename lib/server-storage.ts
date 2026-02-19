import fs from "fs/promises"
import path from "path"
import type { DiaryEntry } from "./types"

const DATA_DIR = path.join(process.cwd(), "data")
const DIARY_FILE = path.join(DATA_DIR, "diary.json")

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (err) {
    // ignore
  }
}

export async function readDiaryEntries(): Promise<DiaryEntry[]> {
  await ensureDataDir()
  try {
    const raw = await fs.readFile(DIARY_FILE, "utf8")
    const parsed = JSON.parse(raw) as DiaryEntry[]
    return parsed.map((e) => ({
      ...e,
      createdAt: new Date(e.createdAt),
      updatedAt: new Date(e.updatedAt),
    }))
  } catch (err) {
    return []
  }
}

export async function writeDiaryEntries(entries: DiaryEntry[]): Promise<void> {
  await ensureDataDir()
  const out = JSON.stringify(entries, null, 2)
  await fs.writeFile(DIARY_FILE, out, "utf8")
}

export async function upsertDiaryEntry(entry: DiaryEntry): Promise<DiaryEntry> {
  const entries = await readDiaryEntries()
  const idx = entries.findIndex((e) => e.id === entry.id)
  if (idx >= 0) {
    entries[idx] = entry
  } else {
    entries.push(entry)
  }
  await writeDiaryEntries(entries)
  return entry
}

export async function deleteDiaryEntryById(id: string): Promise<void> {
  const entries = await readDiaryEntries()
  const filtered = entries.filter((e) => e.id !== id)
  await writeDiaryEntries(filtered)
}
