import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Upload, Avatar, message, Typography, Row, Col } from 'antd'
import { UserOutlined, UploadOutlined, DeleteOutlined, SaveOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api'
import { useMutation } from '@tanstack/react-query'
import { PageHeader } from '../components'

const { Title, Text } = Typography
const { TextArea } = Input

const ProfilePage = () => {
    const { user, setUser } = useAuthStore()
    const [detailsForm] = Form.useForm()
    const [passwordForm] = Form.useForm()
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)

    // Separate update user function since updateUser in store might be limited
    const handleUserUpdate = (userData: any) => {
        if (setUser && typeof setUser === 'function') {
            setUser(userData)
        }
    }

    useEffect(() => {
        if (user) {
            detailsForm.setFieldsValue({
                name: user.name,
                email: user.email,
                bio: user.bio,
            })
            setAvatarUrl(getAvatarString(user.avatar))
        }
    }, [user, detailsForm])

    const getAvatarString = (avatar: any): string | undefined => {
        if (!avatar) return undefined
        if (typeof avatar === 'string') return avatar
        return avatar.url
    }

    const uploadAvatarMutation = useMutation({
        mutationFn: (file: File) => authApi.uploadAvatar(file),
        onSuccess: (data) => {
            message.success('Profil rasmi yangilandi')
            if (user) {
                // Handle the response data structure correctly
                // The API returns ApiResponse<{ url: string; publicId: string }>
                const newAvatar = data.data
                const updatedUser = { ...user, avatar: newAvatar }
                handleUserUpdate(updatedUser)
                setAvatarUrl(newAvatar.url)
            }
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Rasm yuklashda xatolik')
        },
    })

    const deleteAvatarMutation = useMutation({
        mutationFn: () => authApi.deleteAvatar(),
        onSuccess: () => {
            message.success('Profil rasmi o\'chirildi')
            if (user) {
                const updatedUser = { ...user, avatar: undefined }
                handleUserUpdate(updatedUser)
                setAvatarUrl(undefined)
            }
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Rasm o\'chirishda xatolik')
        },
    })

    const updateDetailsMutation = useMutation({
        mutationFn: (values: { name: string; email: string; bio?: string }) => authApi.updateDetails(values),
        onSuccess: (data) => {
            message.success('Ma\'lumotlar saqlandi')
            // The API returns ApiResponse<User>
            handleUserUpdate(data.data)
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Ma\'lumotlarni saqlashda xatolik')
        },
    })

    const updatePasswordMutation = useMutation({
        mutationFn: (data: { currentPassword: string; newPassword: string }) => authApi.updatePassword(data),
        onSuccess: () => {
            message.success('Parol yangilandi!')
            passwordForm.resetFields()
        },
        onError: (error: any) => {
            message.error(error.response?.data?.error || error.response?.data?.message || 'Joriy parol noto\'g\'ri')
        },
    })

    const handleBeforeUpload = (file: File) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
        if (!isJpgOrPng) {
            message.error('Faqat JPG/PNG/WEBP fayllarni yuklashingiz mumkin!');
            return Upload.LIST_IGNORE;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Rasm hajmi 2MB dan kichik bo\'lishi kerak!');
            return Upload.LIST_IGNORE;
        }

        uploadAvatarMutation.mutate(file)
        return false // Prevent auto upload
    }

    const handleUpdatePassword = (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('Parollar mos kelmadi!')
            return
        }
        updatePasswordMutation.mutate({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
        })
    }

    return (
        <PageHeader title="Profil Sozlamalari">
            <div className="mx-auto">
                {/* Avatar Section */}
                <Card className="mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative group">
                            <Avatar
                                size={120}
                                icon={<UserOutlined />}
                                src={avatarUrl}
                                className="border-4 border-indigo-100"
                            />
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload
                                    showUploadList={false}
                                    beforeUpload={handleBeforeUpload}
                                    accept="image/*"
                                >
                                    <Button
                                        type="text"
                                        icon={<UploadOutlined />}
                                        className="text-white hover:text-white"
                                        loading={uploadAvatarMutation.isPending}
                                    >
                                        Yuklash
                                    </Button>
                                </Upload>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <Title level={4} className="!mb-0">{user?.name}</Title>
                            <Text type="secondary">{user?.email}</Text>
                            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                                <Upload
                                    showUploadList={false}
                                    beforeUpload={handleBeforeUpload}
                                    accept="image/*"
                                >
                                    <Button
                                        icon={<UploadOutlined />}
                                        loading={uploadAvatarMutation.isPending}
                                    >
                                        Rasm yuklash
                                    </Button>
                                </Upload>
                                {avatarUrl && (
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => deleteAvatarMutation.mutate()}
                                        loading={deleteAvatarMutation.isPending}
                                    >
                                        O'chirish
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                        {/* Details Section */}
                        <Card title="Shaxsiy Ma'lumotlar" className="h-full">
                            <Form
                                form={detailsForm}
                                layout="vertical"
                                onFinish={(values) => updateDetailsMutation.mutate(values)}
                            >
                                <Form.Item
                                    name="name"
                                    label="Ism"
                                    rules={[{ required: true, message: 'Ismingizni kiriting' }]}
                                >
                                    <Input prefix={<UserOutlined className="text-gray-400" />} />
                                </Form.Item>

                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: 'Emailingizni kiriting' },
                                        { type: 'email', message: 'To\'g\'ri email kiriting' }
                                    ]}
                                >
                                    <Input />
                                </Form.Item>

                                <Form.Item name="bio" label="Bio">
                                    <TextArea rows={4} placeholder="O'zingiz haqingizda qisqacha" />
                                </Form.Item>

                                <Form.Item className="mb-0 text-right">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SaveOutlined />}
                                        loading={updateDetailsMutation.isPending}
                                    >
                                        Saqlash
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        {/* Password Section */}
                        <Card title={<><LockOutlined /> Parolni o'zgartirish</>} className="h-full">
                            <Form form={passwordForm} layout="vertical" onFinish={handleUpdatePassword}>
                                <Form.Item name="currentPassword" label="Joriy parol" rules={[{ required: true }]}>
                                    <Input.Password placeholder="Joriy parol" />
                                </Form.Item>
                                <Form.Item name="newPassword" label="Yangi parol" rules={[{ required: true, min: 6 }]}>
                                    <Input.Password placeholder="Yangi parol" />
                                </Form.Item>
                                <Form.Item name="confirmPassword" label="Yangi parolni tasdiqlash" rules={[{ required: true }]}>
                                    <Input.Password placeholder="Yangi parolni tasdiqlang" />
                                </Form.Item>
                                <Form.Item className="mb-0 text-right">
                                    <Button type="primary" htmlType="submit" icon={<LockOutlined />} loading={updatePasswordMutation.isPending}>
                                        Parolni yangilash
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
        </PageHeader>
    )
}

export default ProfilePage
