// Data types for the English review application
export interface DiaryEntry {
  id: string
  title: string
  originalText: string
  memo?: string
  correctedText?: string
  corrections?: Correction[]
  // Keep a history of all AI reviews performed for this entry
  reviewHistory?: ReviewResult[]
  grammarScore?: number
  naturalnessScore?: number
  overallRating?: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Correction {
  id: string
  originalText: string
  correctedText: string
  reason: string
  type: "grammar" | "spelling" | "naturalness" | "style"
  startIndex: number
  endIndex: number
}

export interface VocabularyItem {
  id: string
  word: string
  meaning: string
  example: string
  tags: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  createdAt: Date
  lastReviewed?: Date
}

export interface ReviewResult {
  correctedText: string
  corrections: Correction[]
  grammarScore: number
  naturalnessScore: number
  overallRating: number
}

export interface BookmarkedSentence {
  id: string
  originalSentence: string
  correctedSentence: string
  corrections: Correction[]
  tags: string[]
  createdAt: Date
}
