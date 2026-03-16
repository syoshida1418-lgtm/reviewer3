"use client"

import React, { useState, useEffect } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface DiaryEntryFormProps {
  entry?: DiaryEntry
  onSave: (entry: DiaryEntry) => void
  onCancel: () => void
}
export default DiaryEntryForm;

function DiaryEntryForm({ entry, onSave, onCancel }: DiaryEntryFormProps) {
  const [title, setTitle] = useState(entry?.title || "")
  const [text, setText] = useState(entry?.originalText || "")
  const [memo, setMemo] = useState(entry?.memo || "")
  const [tags, setTags] = useState<string[]>(entry?.tags || [])
  const [newTag, setNewTag] = useState("")
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(entry?.corrections ? {
    correctedText: entry.correctedText || "",
    corrections: entry.corrections || [],
    grammarScore: entry.grammarScore ?? 0,
    naturalnessScore: entry.naturalnessScore ?? 0,
    overallRating: entry.overallRating || 0
  } : null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleReviewComplete = async (result: ReviewResult) => {
    setReviewResult(result)
    try {
      if (entry?.id) {
        const stored = await storageUtils.getDiaryEntries()
        const idx = stored.findIndex((e: DiaryEntry) => e.id === entry.id)
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
          };
          await storageUtils.saveDiaryEntry(updated);
        }
      }
    } catch (err) {
      console.warn("auto-save review failed:", err)
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !text.trim() || !isOnline) return
    setIsSaving(true)
    setError(null)
    try {
      const diaryEntry: DiaryEntry = {
        id: entry?.id || crypto.randomUUID(),
        title: title.trim(),
        originalText: text,
        memo: memo || undefined,
        correctedText: reviewResult?.correctedText,
        corrections: reviewResult?.corrections,
        reviewHistory: entry?.reviewHistory ? [...entry.reviewHistory, ...(reviewResult ? [reviewResult] : [])] : reviewResult ? [reviewResult] : undefined,
        grammarScore: reviewResult?.grammarScore,
        naturalnessScore: reviewResult?.naturalnessScore,
        overallRating: reviewResult?.overallRating,
        tags,
        createdAt: entry?.createdAt || new Date(),
        updatedAt: new Date(),
      }
      await storageUtils.saveDiaryEntry(diaryEntry)
      onSave(diaryEntry)
    } catch (error) {
      setError(error instanceof Error ? error.message : "保存中にエラーが発生しました。ネットワーク接続を確認してください。")
      console.error("Failed to save diary entry:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto space-y-6 px-2 sm:px-4 pb-24">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!isOnline && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>ネットワーク接続がありません。保存にはインターネット接続が必要です。</AlertDescription>
          </Alert>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{entry ? "Edit Diary Entry" : "New Diary Entry"}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} size="sm" className="sm:size-md">
              Cancel
            </Button>
            <Button type="button" variant="default" onClick={handleSave} disabled={!title.trim() || !text.trim() || isSaving || !isOnline} size="sm" className="sm:size-md">
              <Save className="mr-2 h-4 w-4" />保存
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
                    className="text-base py-3 px-3"
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
                    className="w-full p-2 border rounded-md bg-transparent text-base"
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
                      className="flex-1 text-base py-3 px-3"
                    />
                    <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
                      <Plus className="h-5 w-5" />
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
      {/* 画面下部に保存ボタンを固定表示（スマホ用） */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t z-50 p-3 flex justify-center sm:hidden">
        <Button onClick={handleSave} disabled={!title.trim() || !text.trim() || isSaving} size="lg" className="w-full max-w-xs">
          <Save className="mr-2 h-5 w-5" />
          {isSaving ? "Saving..." : "Save Entry"}
        </Button>
      </div>
    </div>
  )
}

