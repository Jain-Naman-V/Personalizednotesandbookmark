interface LoadingSkeletonProps {
  type: "note" | "bookmark"
}

export default function LoadingSkeleton({ type }: LoadingSkeletonProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="loading-skeleton h-6 w-3/4 rounded"></div>
        <div className="loading-skeleton h-5 w-5 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        <div className="loading-skeleton h-4 w-full rounded"></div>
        <div className="loading-skeleton h-4 w-5/6 rounded"></div>
        <div className="loading-skeleton h-4 w-4/6 rounded"></div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <div className="loading-skeleton h-6 w-16 rounded-full"></div>
        <div className="loading-skeleton h-6 w-20 rounded-full"></div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="loading-skeleton h-4 w-24 rounded"></div>
        <div className="flex space-x-2">
          <div className="loading-skeleton h-8 w-8 rounded-lg"></div>
          <div className="loading-skeleton h-8 w-8 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}
