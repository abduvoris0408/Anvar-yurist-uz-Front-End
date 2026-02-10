import { useState } from 'react'
import { Card, Form, Input, Button, Upload, Avatar, Row, Col, Select, Switch, Tabs, Space, Tag, message, Popconfirm, Typography } from 'antd'
import { UploadOutlined, UserOutlined, DeleteOutlined, SaveOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aboutApi } from '../api'
import { PageHeader } from '../components'

const { TextArea } = Input
const { Text } = Typography

const AboutPage = () => {
    const [form] = Form.useForm()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState('basic')

    const { data: aboutData, isLoading } = useQuery({
        queryKey: ['about-admin'],
        queryFn: () => aboutApi.getAdmin(),
    })

    const about = aboutData?.data

    const saveMutation = useMutation({
        mutationFn: (values: Record<string, unknown>) => aboutApi.createOrUpdate(values),
        onSuccess: () => {
            message.success("Ma'lumotlar saqlandi!")
            queryClient.invalidateQueries({ queryKey: ['about-admin'] })
        },
        onError: (error: any) => {
            console.error('Save About Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const avatarMutation = useMutation({
        mutationFn: (file: File) => aboutApi.uploadAvatar(file),
        onSuccess: () => {
            message.success('Avatar yuklandi!')
            queryClient.invalidateQueries({ queryKey: ['about-admin'] })
        },
        onError: (error: any) => {
            console.error('Avatar Upload Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Avatar yuklashda xatolik!'
            message.error(errMsg)
        },
    })

    const coverMutation = useMutation({
        mutationFn: (file: File) => aboutApi.uploadCover(file),
        onSuccess: () => {
            message.success('Cover rasm yuklandi!')
            queryClient.invalidateQueries({ queryKey: ['about-admin'] })
        },
        onError: (error: any) => {
            console.error('Cover Upload Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Cover yuklashda xatolik!'
            message.error(errMsg)
        },
    })

    const resumeMutation = useMutation({
        mutationFn: (file: File) => aboutApi.uploadResume(file),
        onSuccess: () => {
            message.success('Resume yuklandi!')
            queryClient.invalidateQueries({ queryKey: ['about-admin'] })
        },
        onError: (error: any) => {
            console.error('Resume Upload Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Resume yuklashda xatolik!'
            message.error(errMsg)
        },
    })

    const deleteAvatarMutation = useMutation({
        mutationFn: () => aboutApi.deleteAvatar(),
        onSuccess: () => {
            message.success("Avatar o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['about-admin'] })
        },
    })

    const deleteCoverMutation = useMutation({
        mutationFn: () => aboutApi.deleteCover(),
        onSuccess: () => {
            message.success("Cover o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['about-admin'] })
        },
    })

    const deleteResumeMutation = useMutation({
        mutationFn: () => aboutApi.deleteResume(),
        onSuccess: () => {
            message.success("Resume o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['about-admin'] })
        },
    })

    const sectionMutation = useMutation({
        mutationFn: ({ section, data }: { section: string; data: Record<string, unknown> }) =>
            aboutApi.updateSection(section, data),
        onSuccess: () => {
            message.success("Bo'lim yangilandi!")
            queryClient.invalidateQueries({ queryKey: ['about-admin'] })
        },
        onError: (error: any) => {
            console.error('Section Update Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const handleSave = (values: Record<string, unknown>) => {
        saveMutation.mutate(values)
    }

    const tabItems = [
        {
            key: 'basic',
            label: 'Asosiy',
            children: (
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={about || {}}
                    onFinish={handleSave}
                    requiredMark={false}
                    key={about?.id}
                >
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item name="fullName" label="To'liq ism" rules={[{ required: true }]}>
                                <Input placeholder="Abduvoris Abduvoxidov" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="title" label="Lavozim" rules={[{ required: true }]}>
                                <Input placeholder="Full Stack Developer" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="subtitle" label="Qo'shimcha sarlavha">
                                <Input placeholder="Building modern web applications" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="email" label="Email">
                                <Input placeholder="info@example.com" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="phone" label="Telefon">
                                <Input placeholder="+998 90 123 45 67" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="address" label="Manzil">
                                <Input placeholder="Toshkent, O'zbekiston" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="birthday" label="Tug'ilgan sana">
                                <Input placeholder="2004-08-15" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="nationality" label="Millati">
                                <Input placeholder="O'zbek" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="freelanceStatus" label="Freelance holati">
                                <Select>
                                    <Select.Option value="available">Mavjud ✅</Select.Option>
                                    <Select.Option value="busy">Band 🔶</Select.Option>
                                    <Select.Option value="not_available">Mavjud emas ❌</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="isActive" label="Faol" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item name="shortBio" label="Qisqa bio">
                                <Input placeholder="Full Stack Developer | Node.js & React" />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item name="bio" label="To'liq bio">
                                <TextArea rows={4} placeholder="Men 5 yillik tajribaga ega..." />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saveMutation.isPending}>
                            Saqlash
                        </Button>
                    </Form.Item>
                </Form>
            ),
        },
        {
            key: 'media',
            label: 'Rasmlar & Resume',
            children: (
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={8}>
                        <Card title="Avatar" size="small">
                            <Space direction="vertical" align="center" className="w-full">
                                <Avatar
                                    size={100}
                                    icon={<UserOutlined />}
                                    src={about?.avatar}
                                    style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}
                                />
                                <Upload
                                    showUploadList={false}
                                    beforeUpload={(file) => {
                                        avatarMutation.mutate(file)
                                        return false
                                    }}
                                    accept="image/*"
                                >
                                    <Button icon={<UploadOutlined />} loading={avatarMutation.isPending}>Yuklash</Button>
                                </Upload>
                                {about?.avatar && (
                                    <Popconfirm title="O'chirishni tasdiqlaysizmi?" onConfirm={() => deleteAvatarMutation.mutate()}>
                                        <Button danger icon={<DeleteOutlined />} size="small">O'chirish</Button>
                                    </Popconfirm>
                                )}
                            </Space>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card title="Cover rasm" size="small">
                            <Space direction="vertical" align="center" className="w-full">
                                {about?.cover ? (
                                    <img src={about.cover} alt="cover" style={{ width: '100%', borderRadius: 8, maxHeight: 100, objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: 100, background: 'var(--bg-input)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: 'var(--text-muted)' }}>Rasm yo'q</Text>
                                    </div>
                                )}
                                <Upload
                                    showUploadList={false}
                                    beforeUpload={(file) => {
                                        coverMutation.mutate(file)
                                        return false
                                    }}
                                    accept="image/*"
                                >
                                    <Button icon={<UploadOutlined />} loading={coverMutation.isPending}>Yuklash</Button>
                                </Upload>
                                {about?.cover && (
                                    <Popconfirm title="O'chirishni tasdiqlaysizmi?" onConfirm={() => deleteCoverMutation.mutate()}>
                                        <Button danger icon={<DeleteOutlined />} size="small">O'chirish</Button>
                                    </Popconfirm>
                                )}
                            </Space>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card title="Resume (PDF/DOC)" size="small">
                            <Space direction="vertical" align="center" className="w-full">
                                {about?.resume ? (
                                    <Tag color="green">Resume yuklangan ✅</Tag>
                                ) : (
                                    <Tag color="default">Resume yo'q</Tag>
                                )}
                                <Upload
                                    showUploadList={false}
                                    beforeUpload={(file) => {
                                        resumeMutation.mutate(file)
                                        return false
                                    }}
                                    accept=".pdf,.doc,.docx"
                                >
                                    <Button icon={<UploadOutlined />} loading={resumeMutation.isPending}>Yuklash</Button>
                                </Upload>
                                {about?.resume && (
                                    <Popconfirm title="O'chirishni tasdiqlaysizmi?" onConfirm={() => deleteResumeMutation.mutate()}>
                                        <Button danger icon={<DeleteOutlined />} size="small">O'chirish</Button>
                                    </Popconfirm>
                                )}
                            </Space>
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: 'social',
            label: 'Ijtimoiy tarmoqlar',
            children: (
                <Card size="small">
                    <Form
                        layout="vertical"
                        initialValues={about?.socialLinks || {}}
                        onFinish={(values) => sectionMutation.mutate({ section: 'socialLinks', data: values })}
                        requiredMark={false}
                    >
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Item name="github" label="GitHub"><Input placeholder="https://github.com/..." /></Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="linkedin" label="LinkedIn"><Input placeholder="https://linkedin.com/in/..." /></Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="telegram" label="Telegram"><Input placeholder="https://t.me/..." /></Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="twitter" label="Twitter"><Input placeholder="https://twitter.com/..." /></Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="instagram" label="Instagram"><Input placeholder="https://instagram.com/..." /></Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="youtube" label="YouTube"><Input placeholder="https://youtube.com/..." /></Form.Item>
                            </Col>
                        </Row>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={sectionMutation.isPending}>
                            Saqlash
                        </Button>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'stats',
            label: 'Statistika',
            children: (
                <Card size="small">
                    <Form
                        layout="vertical"
                        initialValues={about?.stats || {}}
                        onFinish={(values) => sectionMutation.mutate({ section: 'stats', data: values })}
                        requiredMark={false}
                    >
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Item name="projectsCompleted" label="Tugallangan loyihalar">
                                    <Input type="number" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="happyClients" label="Mamnun mijozlar">
                                    <Input type="number" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="yearsExperience" label="Yillik tajriba">
                                    <Input type="number" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="awardsWon" label="Mukofotlar">
                                    <Input type="number" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="coffeesDrunk" label="Kofe ichilgan ☕">
                                    <Input type="number" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="linesOfCode" label="Kod qatorlari">
                                    <Input type="number" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={sectionMutation.isPending}>
                            Saqlash
                        </Button>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'interests',
            label: 'Qiziqishlar',
            children: (
                <Card size="small">
                    <Form
                        layout="vertical"
                        initialValues={{ interests: about?.interests || [] }}
                        onFinish={(values) => sectionMutation.mutate({ section: 'interests', data: values })}
                        requiredMark={false}
                    >
                        <Form.List name="interests">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Row key={key} gutter={16} align="middle">
                                            <Col xs={24} md={10}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'name']}
                                                    rules={[{ required: true, message: 'Nomini kiriting' }]}
                                                >
                                                    <Input placeholder="Qiziqish nomi (masalan, Kitob o'qish)" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={10}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'icon']}
                                                    rules={[{ required: true, message: 'Icon kiriting' }]}
                                                >
                                                    <Input placeholder="Icon nomi (masalan, book)" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} md={4}>
                                                <Form.Item>
                                                    <Button type="dashed" onClick={() => remove(name)} icon={<MinusCircleOutlined />} danger block>
                                                        O'chirish
                                                    </Button>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Qiziqish qo'shish
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={sectionMutation.isPending}>
                            Saqlash
                        </Button>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'whatIDo',
            label: 'Nima qilaman',
            children: (
                <Card size="small">
                    <Form
                        layout="vertical"
                        initialValues={{ whatIDo: about?.whatIDo || [] }}
                        onFinish={(values) => sectionMutation.mutate({ section: 'whatIDo', data: values })}
                        requiredMark={false}
                    >
                        <Form.List name="whatIDo">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Card key={key} size="small" className="mb-4 bg-gray-50">
                                            <Row gutter={16}>
                                                <Col xs={24} md={12}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'title']}
                                                        label="Sarlavha"
                                                        rules={[{ required: true, message: 'Sarlavhani kiriting' }]}
                                                    >
                                                        <Input placeholder="Web Development" />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'icon']}
                                                        label="Icon"
                                                        rules={[{ required: true, message: 'Icon kiriting' }]}
                                                    >
                                                        <Input placeholder="code" />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'description']}
                                                        label="Tavsif"
                                                        rules={[{ required: true, message: 'Tavsifni kiriting' }]}
                                                    >
                                                        <TextArea rows={2} placeholder="Men zamonaviy veb-saytlar yarataman..." />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'order']}
                                                        label="Tartib raqami"
                                                        initialValue={0}
                                                    >
                                                        <Input type="number" />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={12} className="flex items-end">
                                                    <Form.Item>
                                                        <Button type="dashed" onClick={() => remove(name)} icon={<MinusCircleOutlined />} danger>
                                                            O'chirish
                                                        </Button>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Yangi xizmat/faoliyat qo'shish
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={sectionMutation.isPending}>
                            Saqlash
                        </Button>
                    </Form>
                </Card>
            ),
        },
    ]

    return (
        <div className="space-y-4">
            <PageHeader
                title="Men haqimda"
                subtitle="Shaxsiy ma'lumotlarni boshqarish"
            />
            <Card loading={isLoading}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                />
            </Card>
        </div>
    )
}

export default AboutPage
