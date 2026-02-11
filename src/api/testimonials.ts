import api from './client'
import type { Testimonial, ApiResponse } from '../types'

export const testimonialsApi = {
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<Testimonial[]>> => {
        const { data } = await api.get('/testimonials', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<Testimonial>> => {
        const { data } = await api.get(`/testimonials/${id}`)
        return data
    },

    create: async (testimonial: Partial<Testimonial>): Promise<ApiResponse<Testimonial>> => {
        const { data } = await api.post('/testimonials', testimonial)
        return data
    },

    update: async (id: string, testimonial: Partial<Testimonial>): Promise<ApiResponse<Testimonial>> => {
        const { data } = await api.put(`/testimonials/${id}`, testimonial)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/testimonials/${id}`)
        return data
    },

    uploadImage: async (id: string, file: File): Promise<ApiResponse<Testimonial>> => {
        const formData = new FormData()
        formData.append('image', file)
        const { data } = await api.put(`/testimonials/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return data
    },

    deleteImage: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/testimonials/${id}/image`)
        return data
    },
}
