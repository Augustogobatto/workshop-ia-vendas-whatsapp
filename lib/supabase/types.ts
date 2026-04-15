export interface Lead {
  id: string
  phone: string
  name: string | null
  first_name: string | null
  email: string | null
  auth_user_id: string | null
  created_at: string
}

export interface CatalogProduct {
  product_id: string
  product_name: string
  product_slug: string
  product_description: string | null
  product_type: 'course' | 'workshop' | 'mentorship' | 'community'
  price_cents: number | null
  is_active: boolean
  has_access: boolean
}

export interface Module {
  id: string
  product_id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_published: boolean
}

export interface Lesson {
  id: string
  module_id: string
  name: string
  slug: string
  description: string | null
  content_type: 'video' | 'loom' | 'text' | 'embed' | 'pdf'
  content_url: string | null
  content_body: string | null
  duration_seconds: number | null
  sort_order: number
  is_published: boolean
  is_free: boolean
}

export interface LessonProgress {
  lesson_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  completed_at: string | null
  progress_pct: number
}

export interface LessonContent {
  lesson_id: string
  lesson_name: string
  lesson_slug: string
  content_type: 'video' | 'loom' | 'text' | 'embed' | 'pdf'
  content_url: string | null
  content_body: string | null
  duration_seconds: number | null
  is_free: boolean
  module_name: string
  product_name: string
}
