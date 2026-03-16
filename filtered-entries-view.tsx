"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DiaryEntryCard } from "./diary-entry-card"
import type { DiaryEntry } from "@/lib/types"

interface FilteredEntriesViewProps {
  entries: DiaryEntry[]
  selectedTags: string[]
  onEditEntry: (entry: DiaryEntry) => void
  onDeleteEntry: (id: string) => void
  onViewEntry: (entry: DiaryEntry) => void
}

export function FilteredEntriesView({
  entries,
  selectedTags,
  onEditEntry,
  onDeleteEntry,
  onViewEntry,
}: FilteredEntriesViewProps) {
  const filteredEntries = useMemo(() => {
    if (selectedTags.length === 0) return entries

    return entries.filter((entry) => selectedTags.every((tag) => entry.tags.includes(tag)))
  }, [entries, selectedTags])

  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [filteredEntries])

  if (selectedTags.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Select tags to filter your diary entries.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filtered by:</span>
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="default" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredEntries.length} {filteredEntries.length === 1 ? "entry" : "entries"} found
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Filtered Entries */}
      {sortedEntries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedEntries.map((entry) => (
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
            <p className="text-muted-foreground">No entries found with the selected tags.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
