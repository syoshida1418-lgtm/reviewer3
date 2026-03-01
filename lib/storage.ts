// Local storage utilities for persisting data
import type { DiaryEntry, BookmarkedSentence } from "./types"

const DIARY_ENTRIES_KEY = "english-reviewer-diary-entries"
const BOOKMARKED_SENTENCES_KEY = "english-reviewer-bookmarked-sentences"

export const storageUtils = {
  // Diary entries
  getDiaryEntries: async (): Promise<DiaryEntry[]> => {
    if (typeof window === "undefined") return []

    // First try to get from localStorage
    const stored = localStorage.getItem(DIARY_ENTRIES_KEY)
    let localEntries: DiaryEntry[] = []
    if (stored) {
      try {
        localEntries = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
        }))
      } catch (err) {
        console.warn("Failed to parse local diary entries:", err)
      }
    }

    // Then try to sync with server
    try {
      const response = await fetch("/api/diary")
      if (response.ok) {
        const serverEntries: DiaryEntry[] = await response.json()
        const serverEntriesParsed = serverEntries.map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
        }))

        // Merge server and local entries, preferring newer ones
        const merged = new Map<string, DiaryEntry>()

        // Add local entries
        localEntries.forEach(entry => merged.set(entry.id, entry))

        // Add/update with server entries
        serverEntriesParsed.forEach(entry => {
          const existing = merged.get(entry.id)
          if (!existing || new Date(entry.updatedAt) > new Date(existing.updatedAt)) {
            merged.set(entry.id, entry)
          }
        })

        const mergedEntries = Array.from(merged.values())

        // Save merged data to localStorage
        localStorage.setItem(DIARY_ENTRIES_KEY, JSON.stringify(mergedEntries))

        return mergedEntries
      }
    } catch (err) {
      console.warn("Failed to sync with server:", err)
    }

    return localEntries
  },

  saveDiaryEntry: async (entry: DiaryEntry): Promise<void> => {
    if (typeof window === "undefined") return
    const entries = await storageUtils.getDiaryEntries()
    const existingIndex = entries.findIndex((e) => e.id === entry.id)

    if (existingIndex >= 0) {
      entries[existingIndex] = entry
    } else {
      entries.push(entry)
    }

    localStorage.setItem(DIARY_ENTRIES_KEY, JSON.stringify(entries))

    // オフライン時は未同期リストに追加
    if (!navigator.onLine) {
      const unsynced = JSON.parse(localStorage.getItem("unsynced-diary-entries") || "[]")
      unsynced.push(entry)
      localStorage.setItem("unsynced-diary-entries", JSON.stringify(unsynced))
      return
    }

    // オンライン時はサーバーへ送信
    try {
      await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      })
    } catch (err) {
      // サーバー送信失敗時は未同期リストに追加
      const unsynced = JSON.parse(localStorage.getItem("unsynced-diary-entries") || "[]")
      unsynced.push(entry)
      localStorage.setItem("unsynced-diary-entries", JSON.stringify(unsynced))
      console.warn("Cloud save failed:", err)
    }
  },

  deleteDiaryEntry: async (id: string): Promise<void> => {
    if (typeof window === "undefined") return
    const entries = await storageUtils.getDiaryEntries()
    const filtered = entries.filter((e) => e.id !== id)
    localStorage.setItem(DIARY_ENTRIES_KEY, JSON.stringify(filtered))

    // オフライン時は未同期削除リストに追加
    if (!navigator.onLine) {
      const unsyncedDeletes = JSON.parse(localStorage.getItem("unsynced-diary-deletes") || "[]")
      unsyncedDeletes.push(id)
      localStorage.setItem("unsynced-diary-deletes", JSON.stringify(unsyncedDeletes))
      return
    }

    // オンライン時はサーバーへ送信
    try {
      await fetch("/api/diary", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
    } catch (err) {
      // サーバー送信失敗時は未同期削除リストに追加
      const unsyncedDeletes = JSON.parse(localStorage.getItem("unsynced-diary-deletes") || "[]")
      unsyncedDeletes.push(id)
      localStorage.setItem("unsynced-diary-deletes", JSON.stringify(unsyncedDeletes))
      console.warn("Cloud delete failed:", err)
    }
  },
  // オンライン復帰時に未同期データをサーバーへ送信
  syncUnsyncedDiaryEntries: async (): Promise<void> => {
    if (typeof window === "undefined" || !navigator.onLine) return
    // 保存
    const unsynced = JSON.parse(localStorage.getItem("unsynced-diary-entries") || "[]")
    for (const entry of unsynced) {
      try {
        await fetch("/api/diary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        })
      } catch (err) {
        console.warn("syncUnsyncedDiaryEntries save failed:", err)
      }
    }
    localStorage.removeItem("unsynced-diary-entries")
    // 削除
    const unsyncedDeletes = JSON.parse(localStorage.getItem("unsynced-diary-deletes") || "[]")
    for (const id of unsyncedDeletes) {
      try {
        await fetch("/api/diary", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        })
      } catch (err) {
        console.warn("syncUnsyncedDiaryEntries delete failed:", err)
      }
    }
    localStorage.removeItem("unsynced-diary-deletes")
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
