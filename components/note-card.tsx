"use client"

import { useState } from "react"
import { Heart, Edit, Trash2, Calendar } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export default function NoteCard({ note, onEdit, onDelete, onToggleFavorite }: NoteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    // Add a small delay for better UX
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

  return (
    <div
      className={`card-hover bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 transition-all duration-300 ${isDeleting ? "opacity-50 scale-95" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">{note.title}</h3>
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

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(note.updatedAt)}
        </div>

        <div className="flex items-center space-x-2">
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
