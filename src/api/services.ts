import api from './client'
import type { Service, ServiceDetail, ApiResponse } from '../types'

export const servicesApi = {
    // Services CRUD
    getAll: async (params?: Record<string, unknown>): Promise<ApiResponse<Service[]>> => {
        const { data } = await api.get('/services', { params })
        return data
    },

    getById: async (id: string): Promise<ApiResponse<Service>> => {
        const { data } = await api.get(`/services/${id}`)
        return data
    },

    create: async (service: Partial<Service>): Promise<ApiResponse<Service>> => {
        const { data } = await api.post('/services', service)
        return data
    },

    update: async (id: string, service: Partial<Service>): Promise<ApiResponse<Service>> => {
        const { data } = await api.put(`/services/${id}`, service)
        return data
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/services/${id}`)
        return data
    },

    // Service Details CRUD
    getAllDetails: async (params?: Record<string, unknown>): Promise<ApiResponse<ServiceDetail[]>> => {
        const { data } = await api.get('/service-details', { params })
        return data
    },

    getDetailById: async (id: string): Promise<ApiResponse<ServiceDetail>> => {
        const { data } = await api.get(`/service-details/${id}`)
        return data
    },

    createDetail: async (detail: Partial<ServiceDetail>): Promise<ApiResponse<ServiceDetail>> => {
        const { data } = await api.post('/service-details', detail)
        return data
    },

    updateDetail: async (id: string, detail: Partial<ServiceDetail>): Promise<ApiResponse<ServiceDetail>> => {
        const { data } = await api.put(`/service-details/${id}`, detail)
        return data
    },

    deleteDetail: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await api.delete(`/service-details/${id}`)
        return data
    },
}
