"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, CheckCircle, AlertCircle, Loader2, Bookmark } from "lucide-react"
import type { ReviewResult, Correction, BookmarkedSentence } from "@/lib/types"
import { reviewText } from "@/lib/ai-review"
import { storageUtils } from "@/lib/storage"

interface AIReviewPanelProps {
  text: string
  onReviewComplete: (result: ReviewResult) => void
}

export function AIReviewPanel({ text, onReviewComplete }: AIReviewPanelProps) {
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true)

  // ネットワーク状態監視
  React.useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine)
    window.addEventListener("online", updateOnline)
    window.addEventListener("offline", updateOnline)
    return () => {
      window.removeEventListener("online", updateOnline)
      window.removeEventListener("offline", updateOnline)
    }
  }, [])

  const handleReview = async () => {
    if (!text.trim()) return

    setIsReviewing(true)
    setError(null)
    try {
      const result = await reviewText(text)
      setReviewResult(result)
      onReviewComplete(result)
    } catch (error) {
      console.error("Review failed:", error)
      setError(error instanceof Error ? error.message : "AIレビューの実行中にエラーが発生しました。")
    } finally {
      setIsReviewing(false)
    }
  }

  const handleBookmarkSentence = (sentence: string, originalSentence: string, corrections: Correction[]) => {
    const bookmarkedSentence: BookmarkedSentence = {
      id: crypto.randomUUID(),
      originalSentence: originalSentence.trim(),
      correctedSentence: sentence.trim(),
      corrections: corrections.filter(
        (c) => originalSentence.includes(c.originalText) || sentence.includes(c.correctedText),
      ),
      tags: [],
      createdAt: new Date(),
    }

    storageUtils.saveBookmarkedSentence(bookmarkedSentence)
  }

  const handleBookmarkCorrection = (correction: Correction, index: number) => {
    const bookmarkedSentence: BookmarkedSentence = {
      id: crypto.randomUUID(),
      originalSentence: correction.originalText,
      correctedSentence: correction.correctedText,
      corrections: [correction],
      tags: [`correction-${index + 1}`],
      createdAt: new Date(),
    }

    storageUtils.saveBookmarkedSentence(bookmarkedSentence)
  }

  const splitIntoSentences = (text: string): string[] => {
    return text
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0)
      .map((s) => s.trim() + ".")
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const getCorrectionTypeColor = (type: Correction["type"]) => {
    switch (type) {
      case "grammar":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "spelling":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "naturalness":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "style":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      {/* Review Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleReview}
          disabled={isReviewing || !text.trim() || !isOnline}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 w-full max-w-xs"
        >
          {isReviewing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              AI Reviewing...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Review with AI
            </>
          )}
        </Button>
      </div>
      {!isOnline && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>ネットワーク接続がありません。AI判定にはインターネット接続が必要です。</AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Review Results */}
      {reviewResult && (
        <div className="space-y-4">
          {/* Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Grammar Score */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Grammar</span>
                  <span className="text-sm text-muted-foreground">{reviewResult.grammarScore}/100</span>
                </div>
                <Progress value={reviewResult.grammarScore} className="h-2" />
              </div>

              {/* Naturalness Score */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Naturalness</span>
                  <span className="text-sm text-muted-foreground">{reviewResult.naturalnessScore}/100</span>
                </div>
                <Progress value={reviewResult.naturalnessScore} className="h-2" />
              </div>

              {/* Overall Rating */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium">Overall Rating</span>
                <div className="flex items-center gap-1">
                  {renderStars(reviewResult.overallRating)}
                  <span className="ml-2 text-sm text-muted-foreground">{reviewResult.overallRating}/5</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Correction Examples */}
          {reviewResult.corrections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Correction Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reviewResult.corrections.slice(0, 5).map((correction, index) => (
                  <div
                    key={correction.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-red-500 font-medium">×</span>
                      <span className="text-red-600 dark:text-red-400">{correction.originalText}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-500 font-medium">○</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">{correction.correctedText}</span>
                    </div>
                  </div>
                ))}
                {reviewResult.corrections.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{reviewResult.corrections.length - 5} more corrections below
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {reviewResult.corrections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  詳細な説明 ({reviewResult.corrections.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviewResult.corrections.map((correction, index) => (
                  <div key={correction.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getCorrectionTypeColor(correction.type)}>{correction.type}</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-red-500 font-medium">×</span>
                        <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-2 py-1 rounded">
                          {correction.originalText}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-500 font-medium">○</span>
                        <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-2 py-1 rounded font-medium">
                          {correction.correctedText}
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">なぜ違うのか：</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{correction.reason}</p>
                    </div>

                    {index < reviewResult.corrections.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Corrected Textカード削除済み */}
        </div>
      )}
    </div>
  )
}
