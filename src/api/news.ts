import api from './client'
import type { News, ApiResponse } from '../types'

export const newsApi = {
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<News[]>> => {
        const { data } = await api.get('/news', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<News>> => {
        const { data } = await api.get(`/news/${id}`)
        return data
    },

    getBySlug: async (slug: string): Promise<ApiResponse<News>> => {
        const { data } = await api.get(`/news/slug/${slug}`)
        return data
    },

    create: async (news: Partial<News>): Promise<ApiResponse<News>> => {
        const { data } = await api.post('/news', news)
        return data
    },

    update: async (id: string, news: Partial<News>): Promise<ApiResponse<News>> => {
        const { data } = await api.put(`/news/${id}`, news)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/news/${id}`)
        return data
    },

    uploadImage: async (id: string, file: File): Promise<ApiResponse<News>> => {
        const formData = new FormData()
        formData.append('image', file)
        const { data } = await api.put(`/news/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },

    deleteImage: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/news/${id}/image`)
        return data
    },
}
