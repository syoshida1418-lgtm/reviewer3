"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, Star } from "lucide-react"
import type { DiaryEntry } from "@/lib/types"

interface CalendarViewProps {
  entries: DiaryEntry[]
  onDateSelect: (date: Date) => void
  onEntrySelect: (entry: DiaryEntry) => void
  onNewEntry: (date: Date) => void
}

function CalendarView({ entries, onDateSelect, onEntrySelect, onNewEntry }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const { calendarDays, monthYear } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Get first day of month and how many days in month
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    // Create array of all days to display (including previous/next month)
    const days: (Date | null)[] = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    const monthYear = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(firstDay)

    return { calendarDays: days, monthYear }
  }, [currentDate])

  const getEntriesForDate = (date: Date) => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt)
      return (
        entryDate.getDate() === date.getDate() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const getAverageRating = (dayEntries: DiaryEntry[]) => {
    const ratingsEntries = dayEntries.filter((entry) => entry.overallRating)
    if (ratingsEntries.length === 0) return null

    const sum = ratingsEntries.reduce((acc, entry) => acc + (entry.overallRating || 0), 0)
    return Math.round(sum / ratingsEntries.length)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: rating }, (_, i) => (
      <Star key={i} className="h-2 w-2 fill-yellow-400 text-yellow-400" />
    ))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{monthYear}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={index} className="p-2 h-24" />
            }

            const dayEntries = getEntriesForDate(date)
            const averageRating = getAverageRating(dayEntries)
            const today = isToday(date)

            return (
              <div
                key={date.toISOString()}
                className={`p-2 h-24 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                  today ? "bg-primary/10 border-primary" : "border-border"
                }`}
                onClick={() => onDateSelect(date)}
              >
                <div className="flex flex-col h-full">
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm ${today ? "font-bold text-primary" : ""}`}>{date.getDate()}</span>
                    {dayEntries.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          onNewEntry(date)
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Entries */}
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {dayEntries.slice(0, 2).map((entry) => (
                      <div
                        key={entry.id}
                        className="text-xs p-1 bg-blue-100 dark:bg-blue-900 rounded truncate cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEntrySelect(entry)
                        }}
                      >
                        {entry.title}
                      </div>
                    ))}

                    {dayEntries.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{dayEntries.length - 2} more</div>
                    )}
                  </div>

                  {/* Average rating */}
                  {averageRating && (
                    <div className="flex items-center justify-center mt-1">
                      <div className="flex gap-0.5">{renderStars(averageRating)}</div>
                    </div>
                  )}

                  {/* Add entry button for empty days */}
                  {dayEntries.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          onNewEntry(date)
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
export default CalendarView;
