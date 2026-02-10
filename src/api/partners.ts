import api from './client'
import type { Partner, ApiResponse } from '../types'

export const partnersApi = {
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<Partner[]>> => {
        const { data } = await api.get('/partners', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<Partner>> => {
        const { data } = await api.get(`/partners/${id}`)
        return data
    },

    create: async (partner: Partial<Partner>): Promise<ApiResponse<Partner>> => {
        const { data } = await api.post('/partners', partner)
        return data
    },

    update: async (id: string, partner: Partial<Partner>): Promise<ApiResponse<Partner>> => {
        const { data } = await api.put(`/partners/${id}`, partner)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/partners/${id}`)
        return data
    },
}
