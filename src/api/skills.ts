import api from './client'
import type { Skill, ApiResponse } from '../types'

export const skillsApi = {
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<Skill[]>> => {
        const { data } = await api.get('/skills', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<Skill>> => {
        const { data } = await api.get(`/skills/${id}`)
        return data
    },

    create: async (skill: Partial<Skill>): Promise<ApiResponse<Skill>> => {
        const { data } = await api.post('/skills', skill)
        return data
    },

    update: async (id: string, skill: Partial<Skill>): Promise<ApiResponse<Skill>> => {
        const { data } = await api.put(`/skills/${id}`, skill)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/skills/${id}`)
        return data
    },

    uploadImage: async (id: string, file: File): Promise<ApiResponse<Skill>> => {
        const formData = new FormData()
        formData.append('image', file)
        const { data } = await api.put(`/skills/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },

    deleteImage: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/skills/${id}/image`)
        return data
    },
}
