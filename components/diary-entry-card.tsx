"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Calendar, Edit, Trash2 } from "lucide-react"
import type { DiaryEntry } from "@/lib/types"

interface DiaryEntryCardProps {
  entry: DiaryEntry
  onEdit: (entry: DiaryEntry) => void
  onDelete: (id: string) => void
  onView: (entry: DiaryEntry) => void
}

export function DiaryEntryCard({ entry, onEdit, onDelete, onView }: DiaryEntryCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onView(entry)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-1">{entry.title}</CardTitle>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(entry)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(entry.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formatDate(entry.createdAt)}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Preview Text */}
        <p className="text-sm text-muted-foreground line-clamp-3">{entry.originalText}</p>

        {/* Scores */}
        {entry.grammarScore !== undefined && entry.naturalnessScore !== undefined && (
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span>Grammar:</span>
              <span className={getScoreColor(entry.grammarScore)}>{entry.grammarScore}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Natural:</span>
              <span className={getScoreColor(entry.naturalnessScore)}>{entry.naturalnessScore}</span>
            </div>
            {entry.overallRating && <div className="flex items-center gap-1">{renderStars(entry.overallRating)}</div>}
          </div>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {entry.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{entry.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
