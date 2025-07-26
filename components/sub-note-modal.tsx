"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, FileText } from "lucide-react"
import type { SubNote } from "@/types/note"

interface SubNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (subNote: Omit<SubNote, "id" | "createdAt" | "updatedAt">) => void
  subNote?: SubNote | null
  parentId: string
  parentTitle: string
}

export default function SubNoteModal({ isOpen, onClose, onSave, subNote, parentId, parentTitle }: SubNoteModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  useEffect(() => {
    if (subNote) {
      setTitle(subNote.title)
      setContent(subNote.content)
    } else {
      setTitle("")
      setContent("")
    }
  }, [subNote, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      id: subNote?.id || '',
      title: title.trim(),
      content: content.trim(),
      noteId: parentId,
      createdAt: subNote?.createdAt || '',
      updatedAt: subNote?.updatedAt || '',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 text-blue-500 mr-2" />
              {subNote ? "Edit Sub-Note" : "Add Sub-Note"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Under: <span className="font-medium text-blue-600">{parentTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Sub-Note Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter sub-note title..."
                required
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Write your sub-note content here..."
              />
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
              <button type="submit" className="btn-primary">
                {subNote ? "Update Sub-Note" : "Create Sub-Note"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
