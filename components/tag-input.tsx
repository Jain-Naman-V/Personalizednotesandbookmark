"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Plus, Tag, Search } from "lucide-react"

interface TagInputProps {
  tags: string[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  existingTags?: string[]
  placeholder?: string
}

export default function TagInput({
  tags,
  selectedTags,
  onTagsChange,
  existingTags = [],
  placeholder = "Add a tag...",
}: TagInputProps) {
  const [newTag, setNewTag] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (newTag.trim()) {
      const filtered = existingTags.filter(
        (tag) => tag.toLowerCase().includes(newTag.toLowerCase()) && !selectedTags.includes(tag),
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [newTag, existingTags, selectedTags])

  const getTagColor = (tag: string) => {
    const colors = [
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-yellow-100 text-yellow-800 border-yellow-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
      "bg-red-100 text-red-800 border-red-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-teal-100 text-teal-800 border-teal-200",
      "bg-cyan-100 text-cyan-800 border-cyan-200",
    ]
    // Use tag content to determine color consistently
    const index = tag.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  const addTag = (tagToAdd: string = newTag) => {
    const trimmedTag = tagToAdd.trim()
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      onTagsChange([...selectedTags, trimmedTag])
      setNewTag("")
      setShowSuggestions(false)
    }
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[0])
      } else {
        addTag()
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getTagColor(tag)} transition-all duration-200`}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-2 hover:scale-110 transition-transform duration-200"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Tag Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              ref={inputRef}
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => newTag.trim() && setShowSuggestions(filteredSuggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder={placeholder}
            />
          </div>
          <button
            type="button"
            onClick={() => addTag()}
            disabled={!newTag.trim()}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            <div className="p-2 text-xs text-gray-500 border-b border-gray-100 flex items-center">
              <Search className="w-3 h-3 mr-1" />
              Existing tags
            </div>
            {filteredSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onMouseDown={() => addTag(tag)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors duration-200 text-sm border-l-4 ${getTagColor(tag).split(" ")[2]} border-opacity-50`}
              >
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${getTagColor(tag)}`}>{tag}</span>
              </button>
            ))}
            {newTag.trim() && !existingTags.includes(newTag.trim()) && (
              <button
                type="button"
                onClick={() => addTag()}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors duration-200 text-sm border-l-4 border-green-200"
              >
                <span className="text-green-700">Create new: </span>
                <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                  {newTag.trim()}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
