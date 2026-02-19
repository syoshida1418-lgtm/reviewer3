"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import { DiaryEntryCard } from "./diary-entry-card"
import type { DiaryEntry } from "@/lib/types"

interface DayViewProps {
  date: Date
  entries: DiaryEntry[]
  onBack: () => void
  onNewEntry: (date: Date) => void
  onEditEntry: (entry: DiaryEntry) => void
  onDeleteEntry: (id: string) => void
  onViewEntry: (entry: DiaryEntry) => void
}

export function DayView({ date, entries, onBack, onNewEntry, onEditEntry, onDeleteEntry, onViewEntry }: DayViewProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const dayEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.createdAt)
    return (
      entryDate.getDate() === date.getDate() &&
      entryDate.getMonth() === date.getMonth() &&
      entryDate.getFullYear() === date.getFullYear()
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calendar
          </Button>
          <h1 className="text-2xl font-bold">{formatDate(date)}</h1>
        </div>
        <Button onClick={() => onNewEntry(date)}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Entries */}
      {dayEntries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dayEntries.map((entry) => (
            <DiaryEntryCard
              key={entry.id}
              entry={entry}
              onEdit={onEditEntry}
              onDelete={onDeleteEntry}
              onView={onViewEntry}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No diary entries for this day yet.</p>
            <Button onClick={() => onNewEntry(date)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Entry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
