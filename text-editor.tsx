"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  title?: string
}

export function TextEditor({ value, onChange, placeholder, title }: TextEditorProps) {
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      onChange(newValue)

      // Update counts
      const words = newValue.trim() ? newValue.trim().split(/\s+/).length : 0
      setWordCount(words)
      setCharCount(newValue.length)
    },
    [onChange],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title || "Write Your English Text"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text-input">Your Text</Label>
          <Textarea
            id="text-input"
            value={value}
            onChange={handleTextChange}
            placeholder={placeholder || "Start writing your English text here..."}
            className="min-h-[200px] resize-none"
          />
        </div>

        {/* Word and character count */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
      </CardContent>
    </Card>
  )
}
