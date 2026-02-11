import api from './client'
import type { Experience, ApiResponse } from '../types'

export const experiencesApi = {
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<Experience[]>> => {
        const { data } = await api.get('/experiences', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<Experience>> => {
        const { data } = await api.get(`/experiences/${id}`)
        return data
    },

    create: async (experience: Partial<Experience>): Promise<ApiResponse<Experience>> => {
        const { data } = await api.post('/experiences', experience)
        return data
    },

    update: async (id: string, experience: Partial<Experience>): Promise<ApiResponse<Experience>> => {
        const { data } = await api.put(`/experiences/${id}`, experience)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/experiences/${id}`)
        return data
    },

    uploadLogo: async (id: string, file: File): Promise<ApiResponse<Experience>> => {
        const formData = new FormData()
        formData.append('logo', file)
        const { data } = await api.put(`/experiences/${id}/logo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },

    deleteLogo: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/experiences/${id}/logo`)
        return data
    },
}
