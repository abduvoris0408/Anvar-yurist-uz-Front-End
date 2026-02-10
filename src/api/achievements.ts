import api from './client'
import type { Achievement, ApiResponse } from '../types'

export const achievementsApi = {
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<Achievement[]>> => {
        const { data } = await api.get('/achievements', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<Achievement>> => {
        const { data } = await api.get(`/achievements/${id}`)
        return data
    },

    create: async (achievement: Partial<Achievement>): Promise<ApiResponse<Achievement>> => {
        const { data } = await api.post('/achievements', achievement)
        return data
    },

    update: async (id: string, achievement: Partial<Achievement>): Promise<ApiResponse<Achievement>> => {
        const { data } = await api.put(`/achievements/${id}`, achievement)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/achievements/${id}`)
        return data
    },
}
