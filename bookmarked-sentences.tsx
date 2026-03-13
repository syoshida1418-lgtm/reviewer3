"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bookmark, Trash2, Search, Plus, X } from "lucide-react"
import type { BookmarkedSentence } from "@/lib/types"
import { storageUtils } from "@/lib/storage"

interface BookmarkedSentencesProps {
  onRefresh?: () => void
}

export function BookmarkedSentences({ onRefresh }: BookmarkedSentencesProps) {
  const [bookmarkedSentences, setBookmarkedSentences] = useState<BookmarkedSentence[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    loadBookmarkedSentences()
  }, [])

  const loadBookmarkedSentences = () => {
    setBookmarkedSentences(storageUtils.getBookmarkedSentences())
  }

  const handleDelete = (id: string) => {
    storageUtils.deleteBookmarkedSentence(id)
    loadBookmarkedSentences()
    onRefresh?.()
  }

  const handleAddTag = (sentenceId: string) => {
    if (!newTag.trim()) return

    const sentences = storageUtils.getBookmarkedSentences()
    const sentence = sentences.find((s) => s.id === sentenceId)
    if (sentence && !sentence.tags.includes(newTag.trim())) {
      sentence.tags.push(newTag.trim())
      storageUtils.saveBookmarkedSentence(sentence)
      loadBookmarkedSentences()
    }
    setNewTag("")
    setEditingId(null)
  }

  const handleRemoveTag = (sentenceId: string, tagToRemove: string) => {
    const sentences = storageUtils.getBookmarkedSentences()
    const sentence = sentences.find((s) => s.id === sentenceId)
    if (sentence) {
      sentence.tags = sentence.tags.filter((tag) => tag !== tagToRemove)
      storageUtils.saveBookmarkedSentence(sentence)
      loadBookmarkedSentences()
    }
  }

  // Get all unique tags
  const allTags = Array.from(new Set(bookmarkedSentences.flatMap((s) => s.tags))).sort()

  // Filter sentences
  const filteredSentences = bookmarkedSentences.filter((sentence) => {
    const matchesSearch =
      !searchTerm ||
      sentence.originalSentence.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sentence.correctedSentence.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => sentence.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  const getCorrectionTypeColor = (type: string) => {
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bookmark className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Bookmarked Corrections</h2>
        <Badge variant="secondary">{bookmarkedSentences.length}</Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bookmarked sentences..."
                className="pl-10"
              />
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="space-y-2">
              <Label>Filter by Tags</Label>
              <div className="flex flex-wrap gap-1">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "secondary"}
                    className="cursor-pointer hover:opacity-80"
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter((t) => t !== tag))
                      } else {
                        setSelectedTags([...selectedTags, tag])
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookmarked Sentences */}
      <div className="space-y-3">
        {filteredSentences.map((sentence) => (
          <Card key={sentence.id}>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Original:</span>
                  <p className="text-red-600 dark:text-red-400">{sentence.originalSentence}</p>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Corrected:</span>
                  <p className="text-green-600 dark:text-green-400 font-medium">{sentence.correctedSentence}</p>
                </div>
              </div>

              {sentence.corrections.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">Corrections:</span>
                  <div className="flex flex-wrap gap-1">
                    {sentence.corrections.map((correction) => (
                      <Badge key={correction.id} className={getCorrectionTypeColor(correction.type)}>
                        {correction.type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex flex-wrap gap-1">
                    {sentence.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                          onClick={() => handleRemoveTag(sentence.id, tag)}
                        />
                      </Badge>
                    ))}
                  </div>

                  {editingId === sentence.id ? (
                    <div className="flex gap-1">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag..."
                        className="h-6 text-xs w-20"
                        onKeyPress={(e) => e.key === "Enter" && handleAddTag(sentence.id)}
                      />
                      <Button size="sm" variant="ghost" onClick={() => handleAddTag(sentence.id)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(sentence.id)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("en-US").format(sentence.createdAt)}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(sentence.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSentences.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {bookmarkedSentences.length === 0
                ? "No bookmarked sentences yet. Review some text to start bookmarking corrections!"
                : "No sentences match your search criteria."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
