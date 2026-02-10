import api from './client'
import type { About, ApiResponse } from '../types'

export const aboutApi = {
    getPublic: async (): Promise<ApiResponse<About>> => {
        const { data } = await api.get('/about')
        return data
    },

    getAdmin: async (): Promise<ApiResponse<About>> => {
        const { data } = await api.get('/about/admin')
        return data
    },

    createOrUpdate: async (aboutData: Partial<About>): Promise<ApiResponse<About>> => {
        const { data } = await api.post('/about', aboutData)
        return data
    },

    delete: async (): Promise<ApiResponse<null>> => {
        const { data } = await api.delete('/about')
        return data
    },

    uploadAvatar: async (file: File): Promise<ApiResponse<About>> => {
        const formData = new FormData()
        formData.append('avatar', file)
        const { data } = await api.put('/about/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },

    uploadCover: async (file: File): Promise<ApiResponse<About>> => {
        const formData = new FormData()
        formData.append('cover', file)
        const { data } = await api.put('/about/cover', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },

    uploadResume: async (file: File): Promise<ApiResponse<About>> => {
        const formData = new FormData()
        formData.append('resume', file)
        const { data } = await api.put('/about/resume', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },

    deleteAvatar: async (): Promise<ApiResponse<null>> => {
        const { data } = await api.delete('/about/avatar')
        return data
    },

    deleteCover: async (): Promise<ApiResponse<null>> => {
        const { data } = await api.delete('/about/cover')
        return data
    },

    deleteResume: async (): Promise<ApiResponse<null>> => {
        const { data } = await api.delete('/about/resume')
        return data
    },

    updateSection: async (section: string, sectionData: Record<string, unknown>): Promise<ApiResponse<About>> => {
        const { data } = await api.patch(`/about/${section}`, sectionData)
        return data
    },
}
