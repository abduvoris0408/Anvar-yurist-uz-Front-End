import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Typography, message } from 'antd'
import { UserOutlined, LockOutlined, ArrowRightOutlined, EyeInvisibleOutlined, EyeOutlined, BankOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api'
import { useAuthStore } from '../store/authStore'
import type { LoginCredentials } from '../types'

const { Title, Text } = Typography

const LoginPage = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const setAuth = useAuthStore((state) => state.setAuth)

    const loginMutation = useMutation({
        mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
        onSuccess: (response) => {
            if (response.data?.accessToken && response.data?.user) {
                setAuth(response.data.accessToken, response.data.refreshToken, response.data.user)
                message.success('Tizimga muvaffaqiyatli kiringiz')
                navigate('/')
            }
        },
        onError: (error: any) => {
            console.error('Login error:', error)
            message.error(error.response?.data?.message || 'Tizimga kirishda xatolik yuz berdi')
        },
    })

    const onFinish = async (values: LoginCredentials) => {
        setLoading(true)
        try {
            await loginMutation.mutateAsync(values)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex w-full">
            {/* Left Side - Login Form */}
            <div
                className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 lg:p-16 transition-colors duration-300"
                style={{
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)'
                }}
            >
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <div
                            className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-indigo-500/20"
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                color: 'white',
                            }}
                        >
                            <BankOutlined style={{ fontSize: 32 }} />
                        </div>
                        <Title level={2} className="!mb-2" style={{ color: 'var(--text-primary)', fontWeight: 800, letterSpacing: '-0.5px' }}>
                            Admin Panel
                        </Title>
                        <Text className="text-lg block" style={{ color: 'var(--text-secondary)' }}>
                            Boshqaruv paneliga xush kelibsiz
                        </Text>
                    </div>

                    {/* Form */}
                    <Form
                        name="login"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                        requiredMark={false}
                        className="mt-8"
                    >
                        <Form.Item
                            name="email"
                            label={<span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Email manzil</span>}
                            rules={[
                                { required: true, message: 'Email kiritish majburiy' },
                                { type: 'email', message: "Email formati noto'g'ri" },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined className="text-gray-400" />}
                                placeholder="admin@portfolio.com"
                                className="h-14 hover:border-indigo-400 focus:border-indigo-500 !rounded-xl transition-all"
                                style={{
                                    background: 'var(--bg-input)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Parol</span>}
                            rules={[
                                { required: true, message: 'Parol kiritish majburiy' },
                                { min: 6, message: "Kamida 6 ta belgi" },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="••••••••"
                                className="h-14 hover:border-indigo-400 focus:border-indigo-500 !rounded-xl transition-all"
                                style={{
                                    background: 'var(--bg-input)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-primary)'
                                }}
                                iconRender={(visible) => (
                                    visible ? <EyeOutlined className="text-gray-400" /> : <EyeInvisibleOutlined className="text-gray-400" />
                                )}
                            />
                        </Form.Item>

                        <div className="flex justify-end mb-6">
                            <a
                                href="#"
                                className="text-sm font-medium hover:text-indigo-500 transition-colors"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Parolni unutdingizmi?
                            </a>
                        </div>

                        <Form.Item className="mb-0">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                className="h-14 text-base font-bold !rounded-xl shadow-xl shadow-indigo-500/20 hover:!shadow-indigo-500/30 transition-all transform active:scale-[0.98]"
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                    border: 'none',
                                }}
                                icon={<ArrowRightOutlined />}
                            >
                                Tizimga kirish
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="text-center mt-8">
                        <Text style={{ color: 'var(--text-secondary)' }}>
                            Yangi hisob yaratmoqchimisiz? <a href="#" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Ro'yxatdan o'tish</a>
                        </Text>
                    </div>
                </div>
            </div>

            {/* Right Side - Visual */}
            <div
                className="hidden md:flex md:w-1/2 relative overflow-hidden bg-cover bg-center"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1555374018-13a8994ab246?q=80&w=2515&auto=format&fit=crop")',
                }}
            >
                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.6))',
                        backdropFilter: 'blur(2px)'
                    }}
                />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-16 z-10">
                    <div className="max-w-lg">
                        <div className="w-12 h-1 mb-6 bg-white/50 rounded-full"></div>
                        <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                            Adolat va Qonun <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                                Ustuvorligi
                            </span>
                        </h1>
                        <p className="text-lg text-white/90 leading-relaxed font-light">
                            Yuridik faoliyatingizni samarali boshqaring va nazorat qiling.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
