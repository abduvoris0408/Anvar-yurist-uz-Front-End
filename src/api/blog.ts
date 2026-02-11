import api from './client'
import type { BlogPost, BlogComment, ApiResponse } from '../types'

export const blogApi = {
    // Blog Posts CRUD
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<BlogPost[]>> => {
        const { data } = await api.get('/blog-posts', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<BlogPost>> => {
        const { data } = await api.get(`/blog-posts/${id}`)
        return data
    },

    getBySlug: async (slug: string): Promise<ApiResponse<BlogPost>> => {
        const { data } = await api.get(`/blog-posts/slug/${slug}`)
        return data
    },

    create: async (post: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> => {
        const { data } = await api.post('/blog-posts', post)
        return data
    },

    update: async (id: string, post: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> => {
        const { data } = await api.put(`/blog-posts/${id}`, post)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/blog-posts/${id}`)
        return data
    },

    uploadImage: async (id: string, file: File): Promise<ApiResponse<BlogPost>> => {
        const formData = new FormData()
        formData.append('image', file)
        const { data } = await api.put(`/blog-posts/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },

    deleteImage: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/blog-posts/${id}/image`)
        return data
    },

    // Blog Comments
    getAllComments: async (params?: Record<string, unknown>): Promise<ApiResponse<BlogComment[]>> => {
        const { data } = await api.get('/blog-comments', { params })
        return data
    },

    getCommentsByPost: async (postId: string): Promise<ApiResponse<BlogComment[]>> => {
        const { data } = await api.get(`/blog-comments/post/${postId}`)
        return data
    },

    updateCommentStatus: async (id: string, status: string): Promise<ApiResponse<BlogComment>> => {
        const { data } = await api.put(`/blog-comments/${id}/status`, { status })
        return data
    },

    deleteComment: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/blog-comments/${id}`)
        return data
    },

    // Blog Ratings
    getRatings: async (postId: string): Promise<ApiResponse<{ averageRating: number; totalRatings: number }>> => {
        const { data } = await api.get(`/blog-ratings/${postId}`)
        return data
    },

    deleteRatings: async (postId: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/blog-ratings/${postId}`)
        return data
    },
}
