"use client"

import { useState } from "react"
import { Heart, Edit, Trash2, ExternalLink, Calendar } from "lucide-react"

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

interface BookmarkCardProps {
  bookmark: Bookmark
  onEdit: (bookmark: Bookmark) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export default function BookmarkCard({ bookmark, onEdit, onDelete, onToggleFavorite }: BookmarkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    // Add a small delay for better UX
    setTimeout(() => {
      onDelete(bookmark.id)
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

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "")
    } catch {
      return url
    }
  }

  return (
    <div
      className={`card-hover bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 transition-all duration-300 ${isDeleting ? "opacity-50 scale-95" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          {bookmark.favicon && (
            <img
              src={bookmark.favicon || "/placeholder.svg"}
              alt=""
              className="w-5 h-5 mt-0.5 rounded"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">{bookmark.title}</h3>
            <p className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 truncate">
              {getDomain(bookmark.url)}
            </p>
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite(bookmark.id)}
          className={`ml-2 p-1 rounded-full transition-all duration-200 ${
            bookmark.isFavorite
              ? "text-red-500 hover:text-red-600 hover:scale-110"
              : "text-gray-400 hover:text-red-500 hover:scale-110"
          }`}
        >
          <Heart className={`w-5 h-5 ${bookmark.isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Description */}
      {bookmark.description && <p className="text-gray-600 text-sm line-clamp-3 mb-4">{bookmark.description}</p>}

      {/* Tags */}
      {bookmark.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {bookmark.tags.map((tag) => (
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
          {formatDate(bookmark.updatedAt)}
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={() => onEdit(bookmark)}
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
