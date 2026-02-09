import api from './client'
import type { Category, ApiResponse } from '../types'

export const categoriesApi = {
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<Category[]>> => {
        const { data } = await api.get('/categories', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<Category>> => {
        const { data } = await api.get(`/categories/${id}`)
        return data
    },

    create: async (category: Partial<Category>): Promise<ApiResponse<Category>> => {
        const { data } = await api.post('/categories', category)
        return data
    },

    update: async (id: string, category: Partial<Category>): Promise<ApiResponse<Category>> => {
        const { data } = await api.put(`/categories/${id}`, category)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/categories/${id}`)
        return data
    },
}
