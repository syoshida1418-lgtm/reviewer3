"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Hash, PenTool, Plus, Bookmark } from "lucide-react"
import { DiaryEntryForm } from "@/components/diary-entry-form"
import { CalendarView } from "@/components/calendar-view"
import { DayView } from "@/components/day-view"
import { TagManager } from "@/components/tag-manager"
import { FilteredEntriesView } from "@/components/filtered-entries-view"
import { BookmarkedSentences } from "@/components/bookmarked-sentences"
import type { DiaryEntry } from "@/lib/types"
import { storageUtils } from "@/lib/storage"

type ViewMode = "calendar" | "day" | "form" | "tags" | "bookmarks"

export default function HomePage() {
  const [currentView, setCurrentView] = useState<ViewMode>("calendar")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null)
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Load data on mount
  useEffect(() => {
    const loadEntries = async () => {
      const loadedEntries = await storageUtils.getDiaryEntries()
      setEntries(loadedEntries)
    }
    loadEntries()
  }, [])

  const refreshData = async () => {
    const loadedEntries = await storageUtils.getDiaryEntries()
    setEntries(loadedEntries)
  }

  const handleNewEntry = (date?: Date) => {
    setEditingEntry(null)
    setSelectedDate(date || new Date())
    setCurrentView("form")
  }

  const handleEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry)
    setCurrentView("form")
  }

  const handleDeleteEntry = (id: string) => {
    storageUtils.deleteDiaryEntry(id)
    refreshData()
  }

  const handleSaveEntry = (entry: DiaryEntry) => {
    refreshData()
    setCurrentView("calendar")
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setCurrentView("day")
  }

  const handleViewEntry = (entry: DiaryEntry) => {
    // For now, just edit the entry
    handleEditEntry(entry)
  }

  const renderContent = () => {
    switch (currentView) {
      case "form":
        return (
          <DiaryEntryForm
            entry={editingEntry || undefined}
            onSave={handleSaveEntry}
            onCancel={() => setCurrentView("calendar")}
          />
        )

      case "day":
        return selectedDate ? (
          <DayView
            date={selectedDate}
            entries={entries}
            onBack={() => setCurrentView("calendar")}
            onNewEntry={handleNewEntry}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            onViewEntry={handleViewEntry}
          />
        ) : null

      case "tags":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Tag Explorer</h1>
              <Button onClick={() => handleNewEntry()}>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Tag list only */}
              <div className="lg:col-span-1">
                <TagManager
                  entries={entries}
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  onFilterByTag={(tag) => setSelectedTags([tag])}
                />
              </div>

              {/* Right: show entries only when a tag is selected */}
              <div className="lg:col-span-2">
                {selectedTags.length === 0 ? (
                  <div className="p-6 border rounded text-sm text-muted-foreground">Select a tag to view related entries.</div>
                ) : (
                  <FilteredEntriesView
                    entries={entries}
                    selectedTags={selectedTags}
                    onEditEntry={handleEditEntry}
                    onDeleteEntry={handleDeleteEntry}
                    onViewEntry={handleViewEntry}
                  />
                )}
              </div>
            </div>
          </div>
        )

      case "bookmarks":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">ブックマーク一覧</h1>
              <Button onClick={() => handleNewEntry()}>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </div>
            <BookmarkedSentences onRefresh={refreshData} />
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">English Learning Diary</h1>
              <Button onClick={() => handleNewEntry()}>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </div>
            <CalendarView
              entries={entries}
              onDateSelect={handleDateSelect}
              onEntrySelect={handleViewEntry}
              onNewEntry={handleNewEntry}
            />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewMode)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Tags
            </TabsTrigger>
            <TabsTrigger value="form" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Write
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Bookmark
            </TabsTrigger>
          </TabsList>

          <TabsContent value={currentView} className="space-y-6">
            {renderContent()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
