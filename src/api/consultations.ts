import api from './client'
import type { Consultation, ApiResponse } from '../types'

export const consultationsApi = {
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<Consultation[]>> => {
        const { data } = await api.get('/consultations', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<Consultation>> => {
        const { data } = await api.get(`/consultations/${id}`)
        return data
    },

    update: async (id: string, consultation: Partial<Consultation>): Promise<ApiResponse<Consultation>> => {
        const { data } = await api.put(`/consultations/${id}`, consultation)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/consultations/${id}`)
        return data
    },
}
