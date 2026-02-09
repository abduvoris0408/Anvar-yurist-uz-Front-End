// User types
export interface User {
    _id: string
    name: string
    email: string
    role: 'user' | 'admin'
    avatar?: string
    bio?: string
    createdAt: string
    updatedAt: string
}

// Project types
export interface Project {
    _id: string
    title: string
    description: string
    image?: string
    technologies: string[]
    liveUrl?: string
    githubUrl?: string
    category: Category | string
    user: User | string
    status: 'draft' | 'published' | 'archived'
    featured: boolean
    views: number
    createdAt: string
    updatedAt: string
}

// Skill types
export interface Skill {
    _id: string
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    percentage: number
    icon?: string
    category: 'frontend' | 'backend' | 'database' | 'devops' | 'design' | 'other'
    user: User | string
    order: number
    createdAt: string
    updatedAt: string
}

// Category types
export interface Category {
    _id: string
    name: string
    slug: string
    description?: string
    icon?: string
    color: string
    user: User | string
    projectCount?: number
    createdAt: string
    updatedAt: string
}

// Experience types
export interface Experience {
    _id: string
    company: string
    position: string
    location?: string
    description?: string
    startDate: string
    endDate?: string
    current: boolean
    technologies: string[]
    companyLogo?: string
    companyUrl?: string
    user: User | string
    order: number
    createdAt: string
    updatedAt: string
}

// Education types
export interface Education {
    _id: string
    school: string
    degree: string
    fieldOfStudy: string
    location?: string
    description?: string
    startDate: string
    endDate?: string
    current: boolean
    grade?: string
    schoolLogo?: string
    schoolUrl?: string
    user: User | string
    order: number
    createdAt: string
    updatedAt: string
}

// Contact types
export interface Contact {
    _id: string
    name: string
    email: string
    subject: string
    message: string
    phone?: string
    isRead: boolean
    isReplied: boolean
    repliedAt?: string
    ipAddress?: string
    createdAt: string
    updatedAt: string
}

// API Response types
export interface ApiResponse<T> {
    success: boolean
    data: T
    count?: number
    total?: number
    pagination?: {
        next?: { page: number; limit: number }
        prev?: { page: number; limit: number }
    }
    message?: string
}

export interface AuthResponse {
    success: boolean
    token: string
    user?: User
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterData {
    name: string
    email: string
    password: string
}
