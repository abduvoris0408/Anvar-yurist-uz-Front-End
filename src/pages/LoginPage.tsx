import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined, ArrowRightOutlined, EyeInvisibleOutlined, EyeOutlined, RocketOutlined } from '@ant-design/icons'
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
        onSuccess: (data) => {
            if (data.token && data.user) {
                localStorage.setItem('token', data.token)
                setAuth(data.token, data.user)
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
        <div
            className="min-h-screen flex items-center justify-center p-4 bg-slate-50"
            style={{ background: 'var(--bg-primary)' }}
        >
            <Card
                className="w-full max-w-md border-0"
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-lg)'
                }}
                bodyStyle={{ padding: '48px 40px' }}
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div
                        className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-transform hover:scale-105"
                        style={{
                            background: 'var(--primary-color)',
                            color: 'white',
                            boxShadow: 'var(--shadow-md)'
                        }}
                    >
                        <RocketOutlined style={{ fontSize: 32 }} />
                    </div>
                    <Title level={2} className="!mb-2 !mt-0" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                        Xush kelibsiz!
                    </Title>
                    <Text className="text-base" style={{ color: 'var(--text-secondary)' }}>
                        Portfolio Admin paneliga kirish
                    </Text>
                </div>

                {/* Form */}
                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="middle"
                    requiredMark={false}
                >
                    <Form.Item
                        name="email"
                        label={<span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Email</span>}
                        rules={[
                            { required: true, message: 'Email kiritish majburiy' },
                            { type: 'email', message: "Email formati noto'g'ri" },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: 'var(--text-muted)' }} />}
                            placeholder="admin@portfolio.com"
                            className="h-12 hover:border-indigo-300 focus:border-indigo-500 transition-colors"
                            style={{
                                borderRadius: 'var(--radius-md)',
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
                            { min: 6, message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />}
                            placeholder="••••••••"
                            className="h-12 hover:border-indigo-300 focus:border-indigo-500 transition-colors"
                            style={{
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-input)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-primary)'
                            }}
                            iconRender={(visible) => (
                                visible ? <EyeOutlined style={{ color: 'var(--text-muted)' }} /> : <EyeInvisibleOutlined style={{ color: 'var(--text-muted)' }} />
                            )}
                        />
                    </Form.Item>

                    <div className="flex justify-end mb-6">
                        <a
                            href="#"
                            className="text-sm font-medium hover:underline transition-all"
                            style={{ color: 'var(--primary-color)' }}
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
                            className="h-12 text-base font-semibold transition-all active:scale-95"
                            style={{
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--primary-color)',
                                border: 'none',
                                boxShadow: 'var(--shadow-sm)',
                            }}
                            icon={<ArrowRightOutlined />}
                        >
                            Kirish
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default LoginPage
