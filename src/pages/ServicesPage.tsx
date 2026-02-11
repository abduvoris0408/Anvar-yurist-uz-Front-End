import { useState } from 'react'
import { Table, Form, Input, Select, Switch, InputNumber, Space, Tag, message, Card, Button, Popconfirm, Drawer, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined, UploadOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { servicesApi, categoriesApi } from '../api'
import { PageHeader, CrudDrawer } from '../components'
import { useDebounce } from '../hooks/useDebounce'
import type { Service, ServiceDetail } from '../types'

const ServicesPage = () => {
    const [form] = Form.useForm()
    const [detailForm] = Form.useForm()
    const queryClient = useQueryClient()

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [editingDetail, setEditingDetail] = useState<ServiceDetail | null>(null)
    const [searchText, setSearchText] = useState('')
    const debouncedSearch = useDebounce(searchText, 500)

    const { data: servicesData, isLoading } = useQuery({
        queryKey: ['services', debouncedSearch],
        queryFn: () => servicesApi.getAll({ search: debouncedSearch }),
    })

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesApi.getAll(),
    })

    const { data: detailsData } = useQuery({
        queryKey: ['service-details', selectedService?.id],
        queryFn: () => servicesApi.getAllDetails({ serviceId: selectedService?.id }),
        enabled: !!selectedService,
    })

    const createMutation = useMutation({
        mutationFn: (values: Partial<Service>) => servicesApi.create(values),
        onSuccess: () => {
            message.success('Xizmat yaratildi!')
            queryClient.invalidateQueries({ queryKey: ['services'] })
            setDrawerOpen(false)
            form.resetFields()
        },
        onError: (error: any) => {
            console.error('Create Service Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, values }: { id: string; values: Partial<Service> }) => servicesApi.update(id, values),
        onSuccess: () => {
            message.success('Xizmat yangilandi!')
            queryClient.invalidateQueries({ queryKey: ['services'] })
            setDrawerOpen(false)
            setEditingService(null)
            form.resetFields()
        },
        onError: (error: any) => {
            console.error('Update Service Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => servicesApi.delete(id),
        onSuccess: () => {
            message.success("Xizmat o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['services'] })
        },
        onError: (error: any) => {
            console.error('Delete Service Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const uploadImageMutation = useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => servicesApi.uploadImage(id, file),
        onSuccess: (response: any) => {
            message.success('Rasm yuklandi!')
            queryClient.invalidateQueries({ queryKey: ['services'] })
            setEditingService(prev => prev ? { ...prev, image: response.data?.image } as Service : prev)
        },
        onError: () => message.error('Rasm yuklashda xatolik'),
    })

    const deleteImageMutation = useMutation({
        mutationFn: (id: string) => servicesApi.deleteImage(id),
        onSuccess: () => {
            message.success("Rasm o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['services'] })
            setEditingService(prev => prev ? { ...prev, image: undefined } : prev)
        },
        onError: () => message.error("Rasm o'chirishda xatolik"),
    })

    // Detail mutations
    const createDetailMutation = useMutation({
        mutationFn: (values: Partial<ServiceDetail>) => servicesApi.createDetail(values),
        onSuccess: () => {
            message.success('Tafsilot yaratildi!')
            queryClient.invalidateQueries({ queryKey: ['service-details'] })
            setDetailDrawerOpen(false)
            detailForm.resetFields()
        },
        onError: (error: any) => {
            console.error('Create Service Detail Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const updateDetailMutation = useMutation({
        mutationFn: ({ id, values }: { id: string; values: Partial<ServiceDetail> }) => servicesApi.updateDetail(id, values),
        onSuccess: () => {
            message.success('Tafsilot yangilandi!')
            queryClient.invalidateQueries({ queryKey: ['service-details'] })
            setDetailDrawerOpen(false)
            setEditingDetail(null)
            detailForm.resetFields()
        },
        onError: (error: any) => {
            console.error('Update Service Detail Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const deleteDetailMutation = useMutation({
        mutationFn: (id: string) => servicesApi.deleteDetail(id),
        onSuccess: () => {
            message.success("Tafsilot o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['service-details'] })
        },
        onError: (error: any) => {
            console.error('Delete Service Detail Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const getImageUrl = (img: any): string | undefined => {
        if (!img) return undefined
        if (typeof img === 'string') return img
        if (typeof img === 'object' && img.url) return img.url
        return undefined
    }

    const handleSubmit = (values: Record<string, unknown>) => {
        const { image, ...rest } = values
        if (editingService) {
            updateMutation.mutate({ id: editingService.id, values: rest })
        } else {
            createMutation.mutate(rest)
        }
    }

    const handleDetailSubmit = (values: Record<string, unknown>) => {
        if (editingDetail) {
            updateDetailMutation.mutate({ id: editingDetail.id, values })
        } else {
            const serviceId = selectedService?.id
            createDetailMutation.mutate({ ...values, serviceId: serviceId })
        }
    }

    const handleEdit = (record: Service) => {
        setEditingService(record)
        form.setFieldsValue(record)
        setDrawerOpen(true)
    }

    const columns = [
        {
            title: 'Icon',
            dataIndex: 'icon',
            key: 'icon',
            width: 60,
            render: (icon: string) => <span style={{ fontSize: 20 }}>{icon || '🔧'}</span>,
        },
        { title: 'Nomi', dataIndex: 'title', key: 'title' },
        { title: 'Narx', dataIndex: 'price', key: 'price' },
        {
            title: 'Kategoriya',
            dataIndex: 'category',
            key: 'category',
            render: (cat: Service['category']) => cat ? <Tag>{cat.name}</Tag> : '-',
        },
        {
            title: 'Holat',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (active: boolean) => <Tag color={active ? 'green' : 'default'}>{active ? 'Faol' : 'Nofaol'}</Tag>,
        },
        { title: 'Tartib', dataIndex: 'order', key: 'order', width: 80 },
        {
            title: 'Amallar',
            key: 'actions',
            width: 150,
            render: (_: unknown, record: Service) => (
                <Space>
                    <Button size="small" icon={<UnorderedListOutlined />} onClick={() => setSelectedService(record)} title="Tafsilotlar" />
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="O'chirishni tasdiqlaysizmi?" onConfirm={() => deleteMutation.mutate(record.id)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    const detailColumns = [
        { title: 'Icon', dataIndex: 'icon', key: 'icon', width: 60, render: (icon: string) => <span style={{ fontSize: 18 }}>{icon || '•'}</span> },
        { title: 'Nomi', dataIndex: 'title', key: 'title' },
        { title: 'Tavsif', dataIndex: 'description', key: 'description', ellipsis: true },
        { title: 'Tartib', dataIndex: 'order', key: 'order', width: 80 },
        {
            title: 'Amallar',
            key: 'actions',
            width: 120,
            render: (_: unknown, record: ServiceDetail) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingDetail(record); detailForm.setFieldsValue(record); setDetailDrawerOpen(true) }} />
                    <Popconfirm title="O'chirish?" onConfirm={() => deleteDetailMutation.mutate(record.id)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div className="space-y-4">
            <PageHeader
                title="Xizmatlar"
                subtitle="Xizmatlarni boshqarish"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingService(null); form.resetFields(); setDrawerOpen(true) }}>
                        Yangi xizmat
                    </Button>
                }
                onSearch={setSearchText}
                searchPlaceholder="Xizmat nomi bo'yicha qidirish..."
            />

            <Card>
                <Table
                    columns={columns}
                    dataSource={servicesData?.data || []}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <CrudDrawer
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setEditingService(null); form.resetFields() }}
                title={editingService ? 'Xizmatni yangilash' : 'Yangi xizmat'}
                form={form}
                onSubmit={handleSubmit}
                loading={createMutation.isPending || updateMutation.isPending}
                isEdit={!!editingService}
            >
                <Form.Item name="title" label="Nomi" rules={[{ required: true }]}>
                    <Input placeholder="Huquqiy maslahat" />
                </Form.Item>
                <Form.Item name="description" label="Tavsif">
                    <Input.TextArea rows={3} placeholder="Professional huquqiy xizmatlar..." />
                </Form.Item>
                <Form.Item name="icon" label="Icon (emoji)">
                    <Input placeholder="🌐" />
                </Form.Item>

                {/* Rasm yuklash — faqat tahrirlashda */}
                {editingService && (
                    <Form.Item label="Rasm">
                        <div className="space-y-2">
                            {getImageUrl(editingService.image) && (
                                <div className="relative">
                                    <img src={getImageUrl(editingService.image)} alt="Preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                                    <Button
                                        danger size="small" icon={<DeleteOutlined />}
                                        onClick={() => deleteImageMutation.mutate(editingService.id)}
                                        loading={deleteImageMutation.isPending}
                                        style={{ position: 'absolute', top: 8, right: 8 }}
                                    />
                                </div>
                            )}
                            <Upload
                                showUploadList={false}
                                accept="image/*"
                                beforeUpload={(file) => {
                                    uploadImageMutation.mutate({ id: editingService.id, file })
                                    return false
                                }}
                            >
                                <Button icon={<UploadOutlined />} loading={uploadImageMutation.isPending}>
                                    Rasm yuklash
                                </Button>
                            </Upload>
                        </div>
                    </Form.Item>
                )}

                <Form.Item name="categoryId" label="Kategoriya">
                    <Select placeholder="Tanlang" allowClear>
                        {categoriesData?.data?.map(cat => (
                            <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="price" label="Narx">
                    <Input placeholder="dan $500" />
                </Form.Item>
                <Form.Item name="order" label="Tartib">
                    <InputNumber min={0} className="w-full" />
                </Form.Item>
                <Form.Item name="isActive" label="Faol" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </CrudDrawer>

            {/* Service Details Drawer */}
            <Drawer
                title={`${selectedService?.title || ''} — Tafsilotlar`}
                open={!!selectedService}
                onClose={() => { setSelectedService(null); setEditingDetail(null) }}
                width={600}
                styles={{ body: { padding: '16px', background: 'var(--bg-card)' }, header: { background: 'var(--bg-card)' }, content: { background: 'var(--bg-card)' } }}
            >
                <Space direction="vertical" className="w-full" size="middle">
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingDetail(null); detailForm.resetFields(); setDetailDrawerOpen(true) }}>
                        Yangi tafsilot
                    </Button>
                    <Table
                        columns={detailColumns}
                        dataSource={detailsData?.data || []}
                        rowKey="id"
                        pagination={false}
                        size="small"
                    />
                </Space>
            </Drawer>

            <CrudDrawer
                open={detailDrawerOpen}
                onClose={() => { setDetailDrawerOpen(false); setEditingDetail(null); detailForm.resetFields() }}
                title={editingDetail ? 'Tafsilotni yangilash' : 'Yangi tafsilot'}
                form={detailForm}
                onSubmit={handleDetailSubmit}
                loading={createDetailMutation.isPending || updateDetailMutation.isPending}
                isEdit={!!editingDetail}
                width={380}
            >
                <Form.Item name="title" label="Nomi" rules={[{ required: true }]}>
                    <Input placeholder="Shartnomalar tayyorlash" />
                </Form.Item>
                <Form.Item name="description" label="Tavsif">
                    <Input.TextArea rows={2} placeholder="Professional shartnomalar" />
                </Form.Item>
                <Form.Item name="icon" label="Icon (emoji)">
                    <Input placeholder="📱" />
                </Form.Item>
                <Form.Item name="order" label="Tartib">
                    <InputNumber min={0} className="w-full" />
                </Form.Item>
            </CrudDrawer>
        </div>
    )
}

export default ServicesPage
