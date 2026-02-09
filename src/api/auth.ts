import api from './client'
import type {
    AuthResponse,
    LoginCredentials,
    RegisterData,
    User,
    ApiResponse
} from '../types'

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const { data } = await api.post('/auth/login', credentials)
        return data
    },

    register: async (userData: RegisterData): Promise<AuthResponse> => {
        const { data } = await api.post('/auth/register', userData)
        return data
    },

    logout: async (): Promise<void> => {
        await api.get('/auth/logout')
    },

    getMe: async (): Promise<ApiResponse<User>> => {
        const { data } = await api.get('/auth/me')
        return data
    },

    updateDetails: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
        const { data } = await api.put('/auth/updatedetails', userData)
        return data
    },

    updatePassword: async (passwords: { currentPassword: string; newPassword: string }): Promise<ApiResponse<User>> => {
        const { data } = await api.put('/auth/updatepassword', passwords)
        return data
    },
}
