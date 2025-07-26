"use client"

import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { BookOpen, Bookmark, Star, Search, Tag, Heart } from "lucide-react"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 float-animation">
              Your Digital
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Memory Palace
              </span>
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Capture thoughts, organize bookmarks, and never lose track of what matters most. Beautiful, fast, and
              designed for the way you think.
            </p>

            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/notes" className="btn-primary text-lg px-8 py-3">
                  View My Notes
                </Link>
                <Link
                  href="/bookmarks"
                  className="bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-white/30"
                >
                  View Bookmarks
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="btn-primary text-lg px-8 py-3">
                  Get Started Free
                </Link>
                <Link
                  href="/login"
                  className="bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-white/30"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to stay organized</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you capture, organize, and find your content effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Smart Notes",
                description: "Rich text editing with markdown support, tags, and powerful search capabilities.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Bookmark,
                title: "Bookmark Manager",
                description: "Save and organize your favorite links with automatic metadata fetching.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Tag,
                title: "Tag Organization",
                description: "Organize everything with colorful tags and smart filtering options.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: Search,
                title: "Instant Search",
                description: "Find anything instantly with our lightning-fast search engine.",
                gradient: "from-orange-500 to-red-500",
              },
              {
                icon: Heart,
                title: "Favorites",
                description: "Mark your most important notes and bookmarks for quick access.",
                gradient: "from-pink-500 to-rose-500",
              },
              {
                icon: Star,
                title: "Beautiful UI",
                description: "Enjoy a clean, modern interface that makes organization a pleasure.",
                gradient: "from-indigo-500 to-purple-500",
              },
            ].map((feature, index) => (
              <div key={index} className="card-hover bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to get organized?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of users who have transformed their digital organization.
          </p>
          {!user && (
            <Link
              href="/register"
              className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Start Your Journey Today
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
