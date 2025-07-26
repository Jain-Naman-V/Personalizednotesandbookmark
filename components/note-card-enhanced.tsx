"use client"

import { useState } from "react"
import { Heart, Edit, Trash2, Calendar, Plus, ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react"
import SubNoteCard from "./sub-note-card"
import type { Note, SubNote } from "@/types/note"

interface NoteCardEnhancedProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  onAddSubNote: (parentId: string) => void
  onEditSubNote: (subNote: SubNote) => void
  onDeleteSubNote: (subNoteId: string, parentId: string) => void
}

export default function NoteCardEnhanced({
  note,
  onEdit,
  onDelete,
  onToggleFavorite,
  onAddSubNote,
  onEditSubNote,
  onDeleteSubNote,
}: NoteCardEnhancedProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    setTimeout(() => {
      onDelete(note.id)
    }, 300)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getTagColor = (tag: string) => {
    const colors = [
      "bg-purple-100 text-purple-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
    ]
    const index = tag.length % colors.length
    return colors[index]
  }

  const subNotesCount = note.subNotes?.length || 0

  return (
    <div
      className={`card-hover bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 transition-all duration-300 ${isDeleting ? "opacity-50 scale-95" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-2 flex-1">
          {subNotesCount > 0 ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 p-1 hover:bg-gray-100 rounded transition-colors duration-200"
            >
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-purple-500" />
              ) : (
                <Folder className="w-4 h-4 text-purple-500" />
              )}
            </button>
          ) : (
            <Folder className="w-4 h-4 text-purple-500 mt-1" />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{note.title}</h3>
            {subNotesCount > 0 && (
              <p className="text-xs text-purple-600 mt-1">
                {subNotesCount} sub-note{subNotesCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite(note.id)}
          className={`ml-2 p-1 rounded-full transition-all duration-200 ${
            note.isFavorite
              ? "text-red-500 hover:text-red-600 hover:scale-110"
              : "text-gray-400 hover:text-red-500 hover:scale-110"
          }`}
        >
          <Heart className={`w-5 h-5 ${note.isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <p className="text-gray-600 text-sm line-clamp-3 mb-4">{note.content}</p>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {note.tags.map((tag) => (
            <span key={tag} className={`tag-pill ${getTagColor(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Sub-notes section */}
      {isExpanded && subNotesCount > 0 && (
        <div className="mb-4 space-y-3 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <ChevronDown className="w-4 h-4 mr-1" />
              Sub-Notes ({subNotesCount})
            </h4>
            <button
              onClick={() => onAddSubNote(note.id)}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-200 transition-colors duration-200 flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {note.subNotes?.map((subNote) => (
              <SubNoteCard
                key={subNote.id}
                subNote={subNote}
                onEdit={onEditSubNote}
                onDelete={(subNoteId) => onDeleteSubNote(subNoteId, note.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(note.updatedAt)}
        </div>

        <div className="flex items-center space-x-2">
          {!isExpanded && subNotesCount === 0 && (
            <button
              onClick={() => onAddSubNote(note.id)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Add sub-note"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          {subNotesCount > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={() => onEdit(note)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
