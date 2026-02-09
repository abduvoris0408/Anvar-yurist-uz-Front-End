import api from './client'
import type { Education, ApiResponse } from '../types'

export const educationApi = {
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<Education[]>> => {
        const { data } = await api.get('/education', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<Education>> => {
        const { data } = await api.get(`/education/${id}`)
        return data
    },

    create: async (education: Partial<Education>): Promise<ApiResponse<Education>> => {
        const { data } = await api.post('/education', education)
        return data
    },

    update: async (id: string, education: Partial<Education>): Promise<ApiResponse<Education>> => {
        const { data } = await api.put(`/education/${id}`, education)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/education/${id}`)
        return data
    },
}
