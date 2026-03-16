"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Hash, Search, Filter, X } from "lucide-react"
import type { DiaryEntry } from "@/lib/types"

interface TagManagerProps {
  entries: DiaryEntry[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  onFilterByTag: (tag: string) => void
}

export function TagManager({ entries, selectedTags, onTagsChange, onFilterByTag }: TagManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Get all unique tags from entries with usage count
  const tagStats = useMemo(() => {
    const tagCounts: { [key: string]: number } = {}

    entries.forEach((entry) => {
      entry.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  }, [entries])

  // Filter tags based on search term
  const filteredTags = useMemo(() => {
    if (!searchTerm) return tagStats
    return tagStats.filter((item) => item.tag.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [tagStats, searchTerm])

  const handleTagToggle = (tag: string) => {
    // If a single-tag filter callback is provided, treat clicks as "select this tag"
    if (typeof onFilterByTag === "function") {
      onFilterByTag(tag)
      return
    }

    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const clearAllTags = () => {
    onTagsChange([])
  }

  const getTagColor = (count: number) => {
    if (count >= 5) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    if (count >= 3) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Tag Manager
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="tag-search">Search Tags</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="tag-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tags..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Active Filters ({selectedTags.length})</Label>
              <Button variant="ghost" size="sm" onClick={clearAllTags}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="default"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
            <Separator />
          </div>
        )}

        {/* All Tags */}
        <div className="space-y-2">
          <Label>All Tags ({filteredTags.length})</Label>
          {filteredTags.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {filteredTags.map(({ tag, count }) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "secondary"}
                  className={`cursor-pointer hover:opacity-80 ${!selectedTags.includes(tag) ? getTagColor(count) : ""}`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                  <span className="ml-1 text-xs opacity-70">({count})</span>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "No tags found matching your search." : "No tags available yet."}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        {tagStats.length > 0 && (
          <div className="space-y-2">
            <Label>Quick Filters</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const popularTags = tagStats.slice(0, 3).map((item) => item.tag)
                  onTagsChange(popularTags)
                }}
              >
                <Filter className="h-4 w-4 mr-1" />
                Most Popular
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const recentTags = entries
                    .slice(-5)
                    .flatMap((entry) => entry.tags)
                    .filter((tag, index, arr) => arr.indexOf(tag) === index)
                  onTagsChange(recentTags)
                }}
              >
                <Filter className="h-4 w-4 mr-1" />
                Recent
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
