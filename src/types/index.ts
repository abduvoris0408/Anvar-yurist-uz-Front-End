// User types
export interface User {
    id: string
    name: string
    email: string
    role: 'admin' | 'user'
    avatar?: string | { url: string; publicId: string }
    bio?: string
    createdAt: string
    updatedAt: string
}

// Auth types
export interface LoginCredentials {
    email: string
    password: string
}

export interface AuthResponse {
    success: boolean
    data: {
        accessToken: string
        refreshToken: string
        user: User
    }
}

// About Me types
export interface About {
    id: string
    fullName: string
    title: string
    subtitle?: string
    typingTexts?: string[]
    bio?: string
    shortBio?: string
    phone?: string
    email?: string
    address?: string
    birthday?: string
    nationality?: string
    freelanceStatus?: 'available' | 'busy' | 'not_available'
    avatar?: string
    cover?: string
    resume?: string
    location?: {
        city: string
        country: string
        mapUrl?: string
    }
    languages?: { name: string; level: string }[]
    socialLinks?: Record<string, string>
    stats?: {
        projectsCompleted?: number
        happyClients?: number
        yearsExperience?: number
        awardsWon?: number
        coffeesDrunk?: number
        linesOfCode?: number
    }
    interests?: { name: string; icon: string }[]
    whatIDo?: { title: string; description: string; icon: string; order: number }[]
    seo?: {
        metaTitle?: string
        metaDescription?: string
        metaKeywords?: string[]
        ogImage?: string
    }
    isActive: boolean
    createdAt: string
    updatedAt: string
}

// Category types
export interface Category {
    id: string
    name: string
    slug?: string
    type: 'project' | 'blog' | 'service' | 'skill' | 'news'
    description?: string
    icon?: string
    color?: string
    image?: string
    projectCount?: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

// Tag types
export interface Tag {
    id: string
    name: string
    slug?: string
    color?: string
    createdAt: string
    updatedAt: string
}

// Project types
export interface Project {
    id: string
    title: string
    shortDescription?: string
    description?: string
    image?: string
    gallery?: string[]
    technologies: string[]
    liveUrl?: string
    githubUrl?: string
    categoryId?: string
    category?: Category
    status: 'published' | 'draft' | 'archived'
    isFeatured: boolean
    order?: number
    views: number
    completedAt?: string
    createdAt: string
    updatedAt: string
}

// Skill types
export interface Skill {
    id: string
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    percentage: number
    icon?: string
    image?: string
    categoryId?: string
    category?: Category
    order: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

// Service types
export interface Service {
    id: string
    title: string
    description?: string
    icon?: string
    image?: string
    categoryId?: string
    category?: Category
    price?: string
    order: number
    isActive: boolean
    details?: ServiceDetail[]
    createdAt: string
    updatedAt: string
}

export interface ServiceDetail {
    id: string
    serviceId: string
    title: string
    description?: string
    icon?: string
    order: number
    createdAt: string
    updatedAt: string
}

// Blog types
export interface BlogPost {
    id: string
    title: string
    slug?: string
    content?: string
    excerpt?: string
    image?: string
    categoryId?: string
    category?: Category
    tags?: Tag[]
    status: 'published' | 'draft' | 'archived'
    isFeatured: boolean
    allowComments: boolean
    views: number
    readTime?: number
    averageRating?: number
    totalRatings?: number
    metaTitle?: string
    metaDescription?: string
    publishedAt?: string
    createdAt: string
    updatedAt: string
}

export interface BlogComment {
    id: string
    blogPostId: string
    blogPost?: BlogPost
    guestName: string
    guestEmail: string
    content: string
    parentCommentId?: string | null
    status: 'pending' | 'approved' | 'rejected'
    createdAt: string
    updatedAt: string
}

export interface BlogRating {
    id: string
    blogPostId: string
    rating: number
    ipAddress?: string
    createdAt: string
}

// News types
export interface News {
    id: string
    title: string
    slug?: string
    content?: string
    excerpt?: string
    image?: string
    categoryId?: string
    category?: Category
    tags?: Tag[]
    source?: string
    sourceUrl?: string
    status: 'published' | 'draft' | 'archived'
    isFeatured: boolean
    views: number
    createdAt: string
    updatedAt: string
}

// Experience types
export interface Experience {
    id: string
    company: string
    position: string
    description?: string
    technologies: string[]
    location?: string
    companyUrl?: string
    companyLogo?: string
    startDate: string
    endDate?: string | null
    current: boolean
    order: number
    createdAt: string
    updatedAt: string
}

// Education types
export interface Education {
    id: string
    school: string
    degree: string
    fieldOfStudy: string
    description?: string
    gpa?: number
    achievements?: string[]
    schoolUrl?: string
    schoolLogo?: string
    startDate: string
    endDate?: string | null
    current: boolean
    order: number
    createdAt: string
    updatedAt: string
}

// Contact types
export interface Contact {
    id: string
    name: string
    email: string
    phone?: string
    subject: string
    message: string
    isRead: boolean
    isReplied: boolean
    repliedAt?: string
    ipAddress?: string
    createdAt: string
    updatedAt: string
}

// Dashboard types
export interface DashboardData {
    counts: {
        projects: number
        blogPosts: number
        news: number
        services: number
        skills: number
        contacts: number
        experiences: number
        education: number
        categories: number
        tags: number
        testimonials: number
        faqs: number
        partners: number
        achievements: number
    }
    alerts: {
        unreadContacts: number
        pendingComments: number
        pendingConsultations: number
    }
    recent: {
        contacts: Contact[]
        posts: BlogPost[]
        consultations: Consultation[]
    }
    popular: {
        projects: Project[]
    }
}

// Testimonial types
export interface Testimonial {
    id: string
    clientName: string
    clientPosition?: string
    content: string
    rating: number
    caseType?: string
    image?: string
    order: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

// FAQ types
export interface FAQ {
    id: string
    question: string
    answer: string
    categoryId?: string
    category?: Category
    order: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

// Partner types
export interface Partner {
    id: string
    name: string
    url?: string
    description?: string
    logo?: string
    order: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

// Consultation types
export interface Consultation {
    id: string
    fullName: string
    phone: string
    email?: string
    serviceId?: string
    service?: Service
    preferredDate?: string
    preferredTime?: string
    message?: string
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    adminNotes?: string
    createdAt: string
    updatedAt: string
}

// Achievement types
export interface Achievement {
    id: string
    title: string
    issuer?: string
    date?: string
    description?: string
    type: 'license' | 'certificate' | 'award' | 'membership'
    image?: string
    order: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

// API Response types
export interface ApiResponse<T> {
    success: boolean
    data: T
    count?: number
    pagination?: {
        total: number
        page: number
        limit: number
        totalPages: number
        next?: number
        prev?: number
    }
    message?: string
}
