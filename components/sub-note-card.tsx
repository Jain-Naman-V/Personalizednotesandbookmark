"use client"

import { useState } from "react"
import { Edit, Trash2, Calendar, FileText } from "lucide-react"
import type { SubNote } from "@/types/note"

interface SubNoteCardProps {
  subNote: SubNote
  onEdit: (subNote: SubNote) => void
  onDelete: (id: string) => void
}

export default function SubNoteCard({ subNote, onEdit, onDelete }: SubNoteCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    setTimeout(() => {
      onDelete(subNote.id)
    }, 300)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div
      className={`card-hover bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-lg p-4 shadow-sm transition-all duration-300 ${isDeleting ? "opacity-50 scale-95" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-2 flex-1">
          <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <h4 className="text-md font-medium text-gray-900 line-clamp-2">{subNote.title}</h4>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-600 text-sm line-clamp-3 mb-3 ml-6">{subNote.content}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-blue-100 ml-6">
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(subNote.updatedAt)}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(subNote)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-all duration-200"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-md transition-all duration-200 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
