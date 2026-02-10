import api from './client'
import type { FAQ, ApiResponse } from '../types'

export const faqsApi = {
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<FAQ[]>> => {
        const { data } = await api.get('/faqs', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<FAQ>> => {
        const { data } = await api.get(`/faqs/${id}`)
        return data
    },

    create: async (faq: Partial<FAQ>): Promise<ApiResponse<FAQ>> => {
        const { data } = await api.post('/faqs', faq)
        return data
    },

    update: async (id: string, faq: Partial<FAQ>): Promise<ApiResponse<FAQ>> => {
        const { data } = await api.put(`/faqs/${id}`, faq)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/faqs/${id}`)
        return data
    },
}
