export interface SubNote {
  id: string
  title: string
  content: string
  noteId: string
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  subNotes?: SubNote[]
}
