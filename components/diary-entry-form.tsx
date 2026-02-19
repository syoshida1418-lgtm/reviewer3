"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Save } from "lucide-react"
import { TextEditor } from "./text-editor"
import { AIReviewPanel } from "./ai-review-panel"
import type { DiaryEntry, ReviewResult } from "@/lib/types"
import { storageUtils } from "@/lib/storage"

interface DiaryEntryFormProps {
  entry?: DiaryEntry
  onSave: (entry: DiaryEntry) => void
  onCancel: () => void
}

export function DiaryEntryForm({ entry, onSave, onCancel }: DiaryEntryFormProps) {
  const [title, setTitle] = useState(entry?.title || "")
  const [text, setText] = useState(entry?.originalText || "")
  const [memo, setMemo] = useState(entry?.memo || "")
  const [tags, setTags] = useState<string[]>(entry?.tags || [])
  const [newTag, setNewTag] = useState("")
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(
    entry?.corrections
      ? {
          correctedText: entry.correctedText || "",
          corrections: entry.corrections,
          grammarScore: entry.grammarScore || 0,
          naturalnessScore: entry.naturalnessScore || 0,
          overallRating: entry.overallRating || 0,
        }
      : null,
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleReviewComplete = (result: ReviewResult) => {
    setReviewResult(result)

    // If editing an existing saved entry, immediately append this review to its history
    try {
      if (entry?.id) {
        const stored = storageUtils.getDiaryEntries()
        const idx = stored.findIndex((e) => e.id === entry.id)
        if (idx >= 0) {
          const existing = stored[idx]
          const updated = {
            ...existing,
            reviewHistory: existing.reviewHistory ? [...existing.reviewHistory, result] : [result],
            correctedText: result.correctedText || existing.correctedText,
            corrections: result.corrections || existing.corrections,
            grammarScore: result.grammarScore ?? existing.grammarScore,
            naturalnessScore: result.naturalnessScore ?? existing.naturalnessScore,
            overallRating: result.overallRating ?? existing.overallRating,
            updatedAt: new Date(),
          }

          storageUtils.saveDiaryEntry(updated)
        }
      }
    } catch (err) {
      console.warn("auto-save review failed:", err)
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !text.trim()) return

    setIsSaving(true)
    try {
      const diaryEntry: DiaryEntry = {
        id: entry?.id || crypto.randomUUID(),
        title: title.trim(),
        originalText: text,
        memo: memo || undefined,
        correctedText: reviewResult?.correctedText,
        corrections: reviewResult?.corrections,
        // append current reviewResult to reviewHistory
        reviewHistory: entry?.reviewHistory ? [...entry.reviewHistory, ...(reviewResult ? [reviewResult] : [])] : reviewResult ? [reviewResult] : undefined,
        grammarScore: reviewResult?.grammarScore,
        naturalnessScore: reviewResult?.naturalnessScore,
        overallRating: reviewResult?.overallRating,
        tags,
        createdAt: entry?.createdAt || new Date(),
        updatedAt: new Date(),
      }

      storageUtils.saveDiaryEntry(diaryEntry)
      onSave(diaryEntry)
    } catch (error) {
      console.error("Failed to save diary entry:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{entry ? "Edit Diary Entry" : "New Diary Entry"}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || !text.trim() || isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Entry Form */}
        <div className="space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Entry Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your diary entry..."
                />
              </div>

              {/* Memo */}
              <div className="space-y-2">
                <Label htmlFor="memo">Memo (personal notes)</Label>
                <textarea
                  id="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Optional: add short notes or context for this entry..."
                  className="w-full p-2 border rounded-md bg-transparent text-sm"
                  rows={3}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag..."
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Text Editor */}
          <TextEditor
            value={text}
            onChange={setText}
            title="Your English Text"
            placeholder="Write your diary entry in English here..."
          />
        </div>

        {/* Right Column - AI Review */}
        <div className="space-y-6">
          <AIReviewPanel text={text} onReviewComplete={handleReviewComplete} />
        </div>
      </div>
    </div>
  )
}
