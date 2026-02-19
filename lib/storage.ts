// Local storage utilities for persisting data
import type { DiaryEntry, BookmarkedSentence } from "./types"

const DIARY_ENTRIES_KEY = "english-reviewer-diary-entries"
const BOOKMARKED_SENTENCES_KEY = "english-reviewer-bookmarked-sentences"

export const storageUtils = {
  // Diary entries
  getDiaryEntries: (): DiaryEntry[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(DIARY_ENTRIES_KEY)
    if (!stored) return []
    return JSON.parse(stored).map((entry: any) => ({
      ...entry,
      createdAt: new Date(entry.createdAt),
      updatedAt: new Date(entry.updatedAt),
    }))
  },

  saveDiaryEntry: (entry: DiaryEntry): void => {
    if (typeof window === "undefined") return
    const entries = storageUtils.getDiaryEntries()
    const existingIndex = entries.findIndex((e) => e.id === entry.id)

    if (existingIndex >= 0) {
      entries[existingIndex] = entry
    } else {
      entries.push(entry)
    }

    localStorage.setItem(DIARY_ENTRIES_KEY, JSON.stringify(entries))
    // Fire-and-forget: try to save to server-side cloud API as well
    ;(async () => {
      try {
        await fetch("/api/diary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        })
      } catch (err) {
        // ignore cloud errors in client
        console.warn("Cloud save failed:", err)
      }
    })()
  },

  deleteDiaryEntry: (id: string): void => {
    if (typeof window === "undefined") return
    const entries = storageUtils.getDiaryEntries()
    const filtered = entries.filter((e) => e.id !== id)
    localStorage.setItem(DIARY_ENTRIES_KEY, JSON.stringify(filtered))
    ;(async () => {
      try {
        await fetch("/api/diary", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        })
      } catch (err) {
        console.warn("Cloud delete failed:", err)
      }
    })()
  },

  // Optional explicit cloud helpers
  cloudGetDiaryEntries: async (): Promise<DiaryEntry[]> => {
    if (typeof window === "undefined") return []
    try {
      const res = await fetch("/api/diary")
      if (!res.ok) return []
      const data = (await res.json()) as DiaryEntry[]
      return data.map((e) => ({ ...e, createdAt: new Date(e.createdAt), updatedAt: new Date(e.updatedAt) }))
    } catch (err) {
      console.warn("cloudGetDiaryEntries failed:", err)
      return []
    }
  },

  cloudSaveDiaryEntry: async (entry: DiaryEntry): Promise<boolean> => {
    if (typeof window === "undefined") return false
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      })
      return res.ok
    } catch (err) {
      console.warn("cloudSaveDiaryEntry failed:", err)
      return false
    }
  },

  cloudDeleteDiaryEntry: async (id: string): Promise<boolean> => {
    if (typeof window === "undefined") return false
    try {
      const res = await fetch("/api/diary", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      return res.ok
    } catch (err) {
      console.warn("cloudDeleteDiaryEntry failed:", err)
      return false
    }
  },

  getBookmarkedSentences: (): BookmarkedSentence[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(BOOKMARKED_SENTENCES_KEY)
    if (!stored) return []
    return JSON.parse(stored).map((sentence: any) => ({
      ...sentence,
      createdAt: new Date(sentence.createdAt),
    }))
  },

  saveBookmarkedSentence: (sentence: BookmarkedSentence): void => {
    if (typeof window === "undefined") return
    const sentences = storageUtils.getBookmarkedSentences()
    const existingIndex = sentences.findIndex((s) => s.id === sentence.id)

    if (existingIndex >= 0) {
      sentences[existingIndex] = sentence
    } else {
      sentences.push(sentence)
    }

    localStorage.setItem(BOOKMARKED_SENTENCES_KEY, JSON.stringify(sentences))
  },

  deleteBookmarkedSentence: (id: string): void => {
    if (typeof window === "undefined") return
    const sentences = storageUtils.getBookmarkedSentences()
    const filtered = sentences.filter((s) => s.id !== id)
    localStorage.setItem(BOOKMARKED_SENTENCES_KEY, JSON.stringify(filtered))
  },
}
