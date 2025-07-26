"use client"

interface TagFilterProps {
  tags: string[]
  selectedTags: string[]
  onTagToggle: (tag: string) => void
}

function getTagColor(tag: string, isSelected: boolean) {
  const colors = [
    { bg: "bg-purple-100", text: "text-purple-800", selectedBg: "bg-purple-500", selectedText: "text-white" },
    { bg: "bg-blue-100", text: "text-blue-800", selectedBg: "bg-blue-500", selectedText: "text-white" },
    { bg: "bg-green-100", text: "text-green-800", selectedBg: "bg-green-500", selectedText: "text-white" },
    { bg: "bg-yellow-100", text: "text-yellow-800", selectedBg: "bg-yellow-500", selectedText: "text-white" },
    { bg: "bg-pink-100", text: "text-pink-800", selectedBg: "bg-pink-500", selectedText: "text-white" },
    { bg: "bg-indigo-100", text: "text-indigo-800", selectedBg: "bg-indigo-500", selectedText: "text-white" },
    { bg: "bg-red-100", text: "text-red-800", selectedBg: "bg-red-500", selectedText: "text-white" },
    { bg: "bg-orange-100", text: "text-orange-800", selectedBg: "bg-orange-500", selectedText: "text-white" },
    { bg: "bg-teal-100", text: "text-teal-800", selectedBg: "bg-teal-500", selectedText: "text-white" },
    { bg: "bg-cyan-100", text: "text-cyan-800", selectedBg: "bg-cyan-500", selectedText: "text-white" },
  ];
  // Use a hash of the tag name for consistent color
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % colors.length;
  const colorSet = colors[index];
  return isSelected ? `${colorSet.selectedBg} ${colorSet.selectedText}` : `${colorSet.bg} ${colorSet.text}`;
}

export default function TagFilter({ tags, selectedTags, onTagToggle }: TagFilterProps) {
  if (tags.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by tags:</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`tag-pill ${getTagColor(tag, isSelected)} ${
                isSelected ? "ring-2 ring-offset-2 ring-purple-300" : ""
              }`}
            >
              {tag}
            </button>
          )
        })}
      </div>
    </div>
  )
}
