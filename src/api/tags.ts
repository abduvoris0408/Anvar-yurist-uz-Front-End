import api from './client'
import type { Tag, ApiResponse } from '../types'

export const tagsApi = {
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<Tag[]>> => {
        const { data } = await api.get('/tags', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<Tag>> => {
        const { data } = await api.get(`/tags/${id}`)
        return data
    },

    create: async (tag: Partial<Tag>): Promise<ApiResponse<Tag>> => {
        const { data } = await api.post('/tags', tag)
        return data
    },

    update: async (id: string, tag: Partial<Tag>): Promise<ApiResponse<Tag>> => {
        const { data } = await api.put(`/tags/${id}`, tag)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/tags/${id}`)
        return data
    },
}
