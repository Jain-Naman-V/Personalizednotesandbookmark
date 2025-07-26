"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Link, Globe, Loader2 } from "lucide-react"
import TagInput from "./tag-input"

interface Bookmark {
  id: string
  title: string
  url: string
  description: string
  tags: string[]
  isFavorite: boolean
  favicon?: string
  createdAt: string
  updatedAt: string
}

interface BookmarkModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (bookmark: Omit<Bookmark, "id" | "createdAt" | "updatedAt">) => void
  bookmark?: Bookmark | null
  existingTags?: string[]
}

export default function BookmarkModal({ isOpen, onClose, onSave, bookmark, existingTags = [] }: BookmarkModalProps) {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
  const [fetchTimeout, setFetchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [metadataBlocked, setMetadataBlocked] = useState(false)

  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title)
      setUrl(bookmark.url)
      setDescription(bookmark.description)
      setTags(bookmark.tags)
      setIsFavorite(bookmark.isFavorite)
    } else {
      setTitle("")
      setUrl("")
      setDescription("")
      setTags([])
      setIsFavorite(false)
    }
  }, [bookmark, isOpen])

  // Auto-fetch metadata when URL changes and user pauses for 2 seconds
  useEffect(() => {
    if (!url) {
      setTitle("")
      setDescription("")
      return
    }
    if (fetchTimeout) clearTimeout(fetchTimeout)
    if (url.trim()) {
      setFetchTimeout(
        setTimeout(() => {
          fetchMetadata()
        }, 2000)
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  const fetchMetadata = async () => {
    if (!url.trim()) return
    setIsLoadingMetadata(true)
    setMetadataBlocked(false)
    try {
      const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.title) setTitle(data.title)
        if (data.description) setDescription(data.description)
      } else {
        if (response.status === 403) {
          setMetadataBlocked(true)
          const domain = new URL(url).hostname.replace("www.", "")
          setTitle("Metadata fetching is blocked")
          setDescription("")
        } else {
          const domain = new URL(url).hostname.replace("www.", "")
          setTitle(domain.charAt(0).toUpperCase() + domain.slice(1))
        }
      }
    } catch (error) {
      try {
        const domain = new URL(url).hostname.replace("www.", "")
        setTitle(domain.charAt(0).toUpperCase() + domain.slice(1))
      } catch {
        setTitle("Website")
      }
    } finally {
      setIsLoadingMetadata(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    onSave({
      title: title.trim() || new URL(url).hostname,
      url: url.trim(),
      description: description.trim(),
      tags,
      isFavorite,
      favicon: `/placeholder.svg?height=16&width=16`,
    })
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{bookmark ? "Edit Bookmark" : "Add New Bookmark"}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* URL */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                URL *
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
                {isLoadingMetadata && <Loader2 className="ml-2 inline-block animate-spin text-purple-600 w-4 h-4 align-middle" />}
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Leave empty to auto-fetch title"
                />
              </div>
              {metadataBlocked && url && (
                <div className="text-xs text-yellow-600 mt-1">
                  <span>Metadata fetching is blocked for this site. Using domain as title: </span>
                  <span className="font-semibold">{new URL(url).hostname.replace("www.", "")}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Optional description..."
              />
            </div>

            {/* Tags */}
            <TagInput
              tags={tags}
              selectedTags={tags}
              onTagsChange={setTags}
              existingTags={existingTags}
              placeholder="Add a tag for your bookmark..."
            />

            {/* Favorite Toggle */}
            <div className="flex items-center">
              <input
                id="favorite"
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="favorite" className="ml-2 text-sm text-gray-700">
                Mark as favorite
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button type="submit" disabled={isLoadingMetadata} className="btn-primary disabled:opacity-50">
                {bookmark ? "Update Bookmark" : "Save Bookmark"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
