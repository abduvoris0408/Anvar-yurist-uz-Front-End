import api from './client'
import type { ApiResponse, User } from '../types'

interface LoginResponse {
    success: boolean
    data: {
        accessToken: string
        refreshToken: string
        user: User
    }
}

export const authApi = {
    login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
        const { data } = await api.post('/auth/login', credentials)
        return data
    },

    refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
        const { data } = await api.post('/auth/refresh-token', { refreshToken })
        return data
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout')
    },

    getMe: async (): Promise<ApiResponse<User>> => {
        const { data } = await api.get('/auth/me')
        return data
    },

    updateDetails: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
        const { data } = await api.put('/auth/update-details', userData)
        return data
    },

    updatePassword: async (passwords: { currentPassword: string; newPassword: string }): Promise<ApiResponse<User>> => {
        const { data } = await api.put('/auth/update-password', passwords)
        return data
    },
}
