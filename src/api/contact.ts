import api from './client'
import type { Contact, ApiResponse } from '../types'

export const contactApi = {
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<Contact[]>> => {
        const { data } = await api.get('/contacts', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<Contact>> => {
        const { data } = await api.get(`/contacts/${id}`)
        return data
    },

    markAsRead: async (id: string): Promise<ApiResponse<Contact>> => {
        const { data } = await api.put(`/contacts/${id}/read`)
        return data
    },

    markAsReplied: async (id: string): Promise<ApiResponse<Contact>> => {
        const { data } = await api.put(`/contacts/${id}/reply`)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/contacts/${id}`)
        return data
    },
}
