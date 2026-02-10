import api from './client'
import type { Project, ApiResponse } from '../types'

export const projectsApi = {
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<Project[]>> => {
        const { data } = await api.get('/projects', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<Project>> => {
        const { data } = await api.get(`/projects/${id}`)
        return data
    },

    create: async (project: Partial<Project>): Promise<ApiResponse<Project>> => {
        const { data } = await api.post('/projects', project)
        return data
    },

    update: async (id: string, project: Partial<Project>): Promise<ApiResponse<Project>> => {
        const { data } = await api.put(`/projects/${id}`, project)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/projects/${id}`)
        return data
    },

    uploadGallery: async (id: string, formData: FormData): Promise<ApiResponse<Project>> => {
        const { data } = await api.put(`/projects/${id}/gallery`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },

    deleteGalleryImage: async (id: string, index: number): Promise<ApiResponse<Project>> => {
        const { data } = await api.delete(`/projects/${id}/gallery/${index}`)
        return data
    },
}
