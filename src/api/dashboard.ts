import api from './client'
import type { DashboardData, ApiResponse } from '../types'

export const dashboardApi = {
    getStats: async (): Promise<ApiResponse<DashboardData>> => {
        const { data } = await api.get('/dashboard')
        return data
    },
}
