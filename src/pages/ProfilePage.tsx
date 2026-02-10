import { Card, Form, Input, Button, Avatar, message, Divider, Typography } from 'antd'
import { UserOutlined, SaveOutlined, LockOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api'
import { useAuthStore } from '../store/authStore'

const { Title, Text } = Typography
const { TextArea } = Input

const ProfilePage = () => {
    const { user, updateUser } = useAuthStore()
    const [detailsForm] = Form.useForm()
    const [passwordForm] = Form.useForm()

    const updateDetailsMutation = useMutation({
        mutationFn: (data: { name?: string; email?: string; bio?: string }) => authApi.updateDetails(data),
        onSuccess: (response) => {
            message.success("Profil yangilandi!")
            updateUser(response.data)
        },
        onError: (error: any) => {
            console.error('Update Profile Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const updatePasswordMutation = useMutation({
        mutationFn: (data: { currentPassword: string; newPassword: string }) => authApi.updatePassword(data),
        onSuccess: () => {
            message.success('Parol yangilandi!')
            passwordForm.resetFields()
        },
        onError: (error: any) => {
            console.error('Update Password Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Joriy parol noto\'g\'ri'
            message.error(errMsg)
        },
    })

    const handleUpdateDetails = (values: { name: string; email: string; bio?: string }) => {
        updateDetailsMutation.mutate(values)
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
        <div className="max-w-2xl mx-auto">
            <Title level={3} className="!mb-6">Profil</Title>

            <Card className="mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <Avatar size={80} icon={<UserOutlined />} src={user?.avatar} />
                    <div>
                        <Title level={4} className="!mb-0">{user?.name}</Title>
                        <Text type="secondary">{user?.email}</Text>
                        <br />
                        <Text type="secondary" className="text-xs">Rol: {user?.role}</Text>
                    </div>
                </div>

                <Divider />

                <Form
                    form={detailsForm}
                    layout="vertical"
                    initialValues={{
                        name: user?.name,
                        email: user?.email,
                        bio: user?.bio,
                    }}
                    onFinish={handleUpdateDetails}
                >
                    <Form.Item name="name" label="Ism" rules={[{ required: true }]}>
                        <Input placeholder="Ismingiz" />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input placeholder="Email" />
                    </Form.Item>
                    <Form.Item name="bio" label="Bio">
                        <TextArea rows={3} placeholder="O'zingiz haqingizda qisqacha" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={updateDetailsMutation.isPending}>
                            Saqlash
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card title={<><LockOutlined /> Parolni o'zgartirish</>}>
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
                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<LockOutlined />} loading={updatePasswordMutation.isPending}>
                            Parolni yangilash
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default ProfilePage
