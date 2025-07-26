"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import ProtectedRoute from "@/components/protected-route"
import BookmarkCard from "@/components/bookmark-card"
import TagFilter from "@/components/tag-filter"
import BookmarkModal from "@/components/bookmark-modal"
import LoadingSkeleton from "@/components/loading-skeleton"
import { Plus, Search } from "lucide-react"

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

function mapFromApi(bookmark: any): Bookmark {
  return {
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description,
    tags: (bookmark.tags || []).map((t: any) => t.tag?.name || t.name || t),
    isFavorite: bookmark.favorite,
    favicon: bookmark.favicon,
    createdAt: bookmark.createdAt,
    updatedAt: bookmark.updatedAt,
  }
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null)

  // Fetch bookmarks from API with pagination
  useEffect(() => {
    const fetchBookmarks = async () => {
      setIsLoading(true)
      setError("")
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/bookmarks?page=${page}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to fetch bookmarks')
        const data = await res.json()
        setBookmarks(data.bookmarks.map(mapFromApi))
        setFilteredBookmarks(data.bookmarks.map(mapFromApi))
        setTotal(data.total)
      } catch (err: any) {
        setError(err.message || 'Error fetching bookmarks')
      } finally {
        setIsLoading(false)
      }
    }
    fetchBookmarks()
  }, [page, limit])

  // Filter bookmarks based on search and tags
  useEffect(() => {
    let filtered = bookmarks
    if (searchTerm) {
      filtered = filtered.filter(
        (bookmark) =>
          bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bookmark.url.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter((bookmark) => selectedTags.every((tag) => (bookmark.tags || []).includes(tag)))
    }
    setFilteredBookmarks(filtered)
  }, [bookmarks, searchTerm, selectedTags])

  // Debounced search
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    if (searchDebounce) clearTimeout(searchDebounce)
    setSearchDebounce(setTimeout(() => {
      setSearchTerm(value)
    }, 300))
  }, [searchDebounce])

  // Pagination controls
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])
  const canPrev = page > 1 && total > 0
  const canNext = page < totalPages && total > 0

  const allTags = Array.from(new Set(bookmarks.flatMap((bookmark) => bookmark.tags || [])))

  const handleSaveBookmark = async (bookmarkData: Omit<Bookmark, "id" | "createdAt" | "updatedAt">) => {
    setError("")
    try {
      const token = localStorage.getItem('token')
      let res, saved
      const payload = {
        ...bookmarkData,
        tagNames: bookmarkData.tags,
        favorite: bookmarkData.isFavorite,
      }
      if (editingBookmark) {
        // Update
        res = await fetch('/api/bookmarks', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...payload, id: editingBookmark.id })
        })
        if (!res.ok) throw new Error('Failed to update bookmark')
        saved = mapFromApi(await res.json())
        setBookmarks(bookmarks.map(b => b.id === saved.id ? saved : b))
      } else {
        // Create
        res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Failed to create bookmark')
        saved = mapFromApi(await res.json())
        setBookmarks([saved, ...bookmarks])
      }
      setIsModalOpen(false)
      setEditingBookmark(null)
    } catch (err: any) {
      setError(err.message || 'Error saving bookmark')
    }
  }

  const handleDeleteBookmark = async (id: string) => {
    setError("")
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/bookmarks', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error('Failed to delete bookmark')
      setBookmarks(bookmarks.filter(b => b.id !== id))
    } catch (err: any) {
      setError(err.message || 'Error deleting bookmark')
    }
  }

  const handleToggleFavorite = async (id: string) => {
    setError("")
    try {
      const bookmark = bookmarks.find(b => b.id === id)
      if (!bookmark) return
      const token = localStorage.getItem('token')
      const res = await fetch('/api/bookmarks', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...bookmark, tagNames: bookmark.tags, favorite: !bookmark.isFavorite })
      })
      if (!res.ok) throw new Error('Failed to update favorite')
      const updated = mapFromApi(await res.json())
      setBookmarks(bookmarks.map(b => b.id === updated.id ? updated : b))
    } catch (err: any) {
      setError(err.message || 'Error updating favorite')
    }
  }

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark)
    setIsModalOpen(true)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              My Bookmarks
            </h1>

            {/* Search and Add Button */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary flex items-center space-x-2 px-6 py-3"
              >
                <Plus className="w-5 h-5" />
                <span>Add Bookmark</span>
              </button>
            </div>
            {/* Pagination Controls */}
            <div className="flex gap-2 items-center mt-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!canPrev} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50">Prev</button>
              <span>Page {total === 0 ? 1 : page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={!canNext} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50">Next</button>
            </div>

            {/* Tag Filter */}
            <TagFilter
              tags={allTags}
              selectedTags={selectedTags}
              onTagToggle={(tag) => {
                setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
              }}
            />
          </div>

          {/* Bookmarks Grid */}
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <LoadingSkeleton key={i} type="bookmark" />
              ))}
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔖</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookmarks found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedTags.length > 0
                  ? "Try adjusting your search or filters"
                  : "Save your first bookmark to get started"}
              </p>
              <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                Add Your First Bookmark
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onEdit={handleEditBookmark}
                  onDelete={handleDeleteBookmark}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bookmark Modal */}
        <BookmarkModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingBookmark(null)
          }}
          onSave={handleSaveBookmark}
          bookmark={editingBookmark}
          existingTags={allTags}
        />
      </div>
    </ProtectedRoute>
  )
}
