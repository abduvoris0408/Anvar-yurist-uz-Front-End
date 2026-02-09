import api from './client'
import type { Contact, ApiResponse } from '../types'

interface ContactStats {
    total: number
    unread: number
    read: number
    replied: number
    lastWeekCount: number
}

export const contactApi = {
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<Contact[]> & { unreadCount?: number }> => {
        const { data } = await api.get('/contact', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<Contact>> => {
        const { data } = await api.get(`/contact/${id}`)
        return data
    },

    getStats: async (): Promise<ApiResponse<ContactStats>> => {
        const { data } = await api.get('/contact/stats')
        return data
    },

    markAsRead: async (id: string): Promise<ApiResponse<Contact>> => {
        const { data } = await api.put(`/contact/${id}/read`)
        return data
    },

    markAsReplied: async (id: string): Promise<ApiResponse<Contact>> => {
        const { data } = await api.put(`/contact/${id}/reply`)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/contact/${id}`)
        return data
    },
}
