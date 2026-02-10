import axios from 'axios'

const API_URL = 'http://localhost:5001/api/v1'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
})

// Request interceptor - token qo'shish
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor - refresh token + xatolarni handle qilish
let isRefreshing = false
let failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // 401 — token muddati tugagan
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return api(originalRequest)
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = localStorage.getItem('refreshToken')

            if (!refreshToken) {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('auth-storage')
                window.location.href = '/login'
                return Promise.reject(error)
            }

            try {
                const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
                    refreshToken,
                })

                const newAccessToken = data.data?.accessToken || data.accessToken
                const newRefreshToken = data.data?.refreshToken || data.refreshToken

                localStorage.setItem('accessToken', newAccessToken)
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken)
                }

                api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
                processQueue(null, newAccessToken)

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return api(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError, null)
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('auth-storage')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // 423 — Account bloklangan
        if (error.response?.status === 423) {
            console.error('Account bloklangan. 30 daqiqa kutib turing.')
        }

        return Promise.reject(error)
    }
)

export default api
