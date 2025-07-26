"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { Menu, X, BookOpen, Bookmark, User, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                NotesKeeper
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user && (
              <>
                <Link
                  href="/notes"
                  className={`flex items-center space-x-1 transition-all duration-200 group px-3 py-2 rounded-lg ${
                    pathname === "/notes"
                      ? "text-purple-600 bg-purple-50 font-medium"
                      : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>Notes</span>
                </Link>
                <Link
                  href="/bookmarks"
                  className={`flex items-center space-x-1 transition-all duration-200 group px-3 py-2 rounded-lg ${
                    pathname === "/bookmarks"
                      ? "text-blue-600 bg-blue-50 font-medium"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Bookmark className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>Bookmarks</span>
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-purple-600 transition-colors duration-200">
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-purple-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user && (
              <>
                <Link
                  href="/notes"
                  className={`block px-3 py-2 rounded-lg transition-all duration-200 ${
                    pathname === "/notes"
                      ? "text-purple-600 bg-purple-50 font-medium"
                      : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  Notes
                </Link>
                <Link
                  href="/bookmarks"
                  className={`block px-3 py-2 rounded-lg transition-all duration-200 ${
                    pathname === "/bookmarks"
                      ? "text-blue-600 bg-blue-50 font-medium"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Bookmarks
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
