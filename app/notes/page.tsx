"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import ProtectedRoute from "@/components/protected-route"
import NoteCardEnhanced from "@/components/note-card-enhanced"
import TagFilter from "@/components/tag-filter"
import NoteModal from "@/components/note-modal"
import SubNoteModal from "@/components/sub-note-modal"
import LoadingSkeleton from "@/components/loading-skeleton"
import { Plus, Search, BookOpen } from "lucide-react"
import type { Note, SubNote } from "@/types/note"

function mapFromApi(note: any): Note {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    tags: (note.tags || []).map((t: any) => t.tag?.name || t.name || t),
    isFavorite: note.favorite,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    subNotes: note.subNotes || [],
  }
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubNoteModalOpen, setIsSubNoteModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [editingSubNote, setEditingSubNote] = useState<SubNote | null>(null)
  const [selectedParentId, setSelectedParentId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null)

  // Fetch notes from API with pagination
  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true)
      setError("")
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/notes?page=${page}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to fetch notes')
        const data = await res.json()
        setNotes(data.notes.map(mapFromApi))
        setFilteredNotes(data.notes.map(mapFromApi))
        setTotal(data.total)
      } catch (err: any) {
        setError(err.message || 'Error fetching notes')
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotes()
  }, [page, limit])

  // Filter notes based on search and tags
  useEffect(() => {
    let filtered = notes
    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter((note) => selectedTags.every((tag) => (note.tags || []).includes(tag)))
    }
    setFilteredNotes(filtered)
  }, [notes, searchTerm, selectedTags])

  // Debounced search
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    if (searchDebounce) clearTimeout(searchDebounce)
    setSearchDebounce(setTimeout(() => {
      setSearchTerm(value)
    }, 300))
  }, [searchDebounce])

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags || [])))

  const handleSaveNote = async (noteData: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    setError("")
    try {
      const token = localStorage.getItem('token')
      let res;
      let saved: Note;
      const payload = {
        ...noteData,
        tagNames: noteData.tags,
        favorite: noteData.isFavorite,
      }
      if (editingNote) {
        // Update
        res = await fetch('/api/notes', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...payload, id: editingNote.id })
        })
        if (!res.ok) throw new Error('Failed to update note')
        saved = mapFromApi(await res.json())
        setNotes(notes.map(n => n.id === saved.id ? saved : n))
      } else {
        // Create
        res = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Failed to create note')
        saved = mapFromApi(await res.json())
        setNotes([saved, ...notes])
      }
      setIsModalOpen(false)
      setEditingNote(null)
    } catch (err: any) {
      setError(err.message || 'Error saving note')
    }
  }

  const handleDeleteNote = async (id: string) => {
    setError("")
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/notes', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error('Failed to delete note')
      setNotes(notes.filter(n => n.id !== id))
    } catch (err: any) {
      setError(err.message || 'Error deleting note')
    }
  }

  // Fetch sub-notes for a note
  const fetchSubNotes = async (noteId: string) => {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/notes', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'get', noteId }),
    })
    if (!res.ok) return []
    return await res.json()
  }

  // On notes load, fetch sub-notes for each note
  useEffect(() => {
    if (notes.length === 0) return
    const loadSubNotes = async () => {
      const updated = await Promise.all(
        notes.map(async (note) => {
          const subNotes = await fetchSubNotes(note.id)
          return { ...note, subNotes }
        })
      )
      setNotes(updated)
      setFilteredNotes(updated)
    }
    loadSubNotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes.length])

  // Save sub-note (create or update)
  const handleSaveSubNote = async (subNoteData: Omit<SubNote, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<SubNote, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const token = localStorage.getItem('token')
    let action = subNoteData.id ? 'update' : 'create'
    // Accept both noteId and parentId for compatibility with modal
    const noteId = (subNoteData as any).noteId || (subNoteData as any)['parentId']
    const res = await fetch('/api/notes', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        noteId,
        subNoteId: subNoteData.id,
        title: subNoteData.title,
        content: subNoteData.content,
      }),
    })
    if (!res.ok) return
    const saved = await res.json()
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId
          ? {
              ...note,
              subNotes: action === 'create'
                ? [...(note.subNotes || []), saved]
                : (note.subNotes || []).map((sn) => (sn.id === saved.id ? saved : sn)),
            }
          : note
      )
    )
    setIsSubNoteModalOpen(false)
    setEditingSubNote(null)
    setSelectedParentId("")
  }

  // Delete sub-note
  const handleDeleteSubNote = async (subNoteId: string, noteId: string) => {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/notes', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'delete', noteId, subNoteId }),
    })
    if (!res.ok) return
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId
          ? { ...note, subNotes: (note.subNotes || []).filter((sn) => sn.id !== subNoteId) }
          : note
      )
    )
  }

  const handleToggleFavorite = async (id: string) => {
    setError("")
    try {
      const note = notes.find(n => n.id === id)
      if (!note) return
      const token = localStorage.getItem('token')
      const res = await fetch('/api/notes', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...note, tagNames: note.tags, favorite: !note.isFavorite })
      })
      if (!res.ok) throw new Error('Failed to update favorite')
      const updated = mapFromApi(await res.json())
      setNotes(notes.map(n => n.id === updated.id ? updated : n))
    } catch (err: any) {
      setError(err.message || 'Error updating favorite')
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  const handleAddSubNote = (parentId: string) => {
    setSelectedParentId(parentId)
    setIsSubNoteModalOpen(true)
  }

  const handleEditSubNote = (subNote: SubNote) => {
    setEditingSubNote(subNote)
    setSelectedParentId(subNote.parentId)
    setIsSubNoteModalOpen(true)
  }

  const getParentTitle = (parentId: string) => {
    const parent = notes.find((note) => note.id === parentId)
    return parent?.title || ""
  }

  // Pagination controls
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])
  const canPrev = page > 1 && total > 0 && page !== 1 && totalPages > 1
  const canNext = page < totalPages && total > 0 && page !== totalPages && totalPages > 1

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <BookOpen className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                My Notes
              </h1>
            </div>
            <p className="text-gray-600 mb-6">Organize your thoughts with notes and sub-notes for better structure</p>
            {/* Search and Add Button */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search notes and sub-notes..."
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
                <span>Add Note</span>
              </button>
            </div>
            {/* Pagination Controls */}
            <div className="flex gap-2 items-center mt-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!canPrev} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50">Prev</button>
              <span>Page {total === 0 ? 1 : page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={!canNext} className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50">Next</button>
            </div>
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

        {/* Notes Grid */}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} type="note" />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No notes found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedTags.length > 0
                ? "Try adjusting your search or filters"
                : "Create your first note to get started"}
            </p>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
              Create Your First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCardEnhanced
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onToggleFavorite={handleToggleFavorite}
                onAddSubNote={handleAddSubNote}
                onEditSubNote={handleEditSubNote}
                onDeleteSubNote={handleDeleteSubNote}
              />
            ))}
          </div>
        )}
      </div>

      {/* Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingNote(null)
        }}
        onSave={handleSaveNote}
        note={editingNote}
        existingTags={allTags}
      />

      {/* Sub-Note Modal */}
      <SubNoteModal
        isOpen={isSubNoteModalOpen}
        onClose={() => {
          setIsSubNoteModalOpen(false)
          setEditingSubNote(null)
          setSelectedParentId("")
        }}
        onSave={handleSaveSubNote}
        subNote={editingSubNote}
        parentId={selectedParentId}
        parentTitle={getParentTitle(selectedParentId)}
      />
    </ProtectedRoute>
  )
}
