import { useState } from 'react'
import { Table, Form, Input, Select, Switch, Space, Tag, message, Card, Button, Popconfirm, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, LinkOutlined, UploadOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { newsApi, categoriesApi, tagsApi } from '../api'
import { PageHeader, CrudDrawer } from '../components'
import type { News, Category, Tag as TagType } from '../types'
import dayjs from 'dayjs'

const { TextArea } = Input

const NewsPage = () => {
    const [form] = Form.useForm()
    const queryClient = useQueryClient()
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingNews, setEditingNews] = useState<News | null>(null)

    const { data: newsData, isLoading } = useQuery({
        queryKey: ['news'],
        queryFn: () => newsApi.getAll(),
    })

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesApi.getAll(),
    })

    const { data: tagsData } = useQuery({
        queryKey: ['tags'],
        queryFn: () => tagsApi.getAll(),
    })

    const createMutation = useMutation({
        mutationFn: (values: Partial<News>) => newsApi.create(values),
        onSuccess: () => {
            message.success('Yangilik yaratildi!')
            queryClient.invalidateQueries({ queryKey: ['news'] })
            setDrawerOpen(false)
            form.resetFields()
        },
        onError: (error: any) => {
            console.error('Create News Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, values }: { id: string; values: Partial<News> }) => newsApi.update(id, values),
        onSuccess: () => {
            message.success('Yangilik yangilandi!')
            queryClient.invalidateQueries({ queryKey: ['news'] })
            setDrawerOpen(false)
            setEditingNews(null)
            form.resetFields()
        },
        onError: (error: any) => {
            console.error('Update News Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => newsApi.delete(id),
        onSuccess: () => {
            message.success("Yangilik o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['news'] })
        },
        onError: (error: any) => {
            console.error('Delete News Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const uploadImageMutation = useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => newsApi.uploadImage(id, file),
        onSuccess: (response: any) => {
            message.success('Rasm yuklandi!')
            queryClient.invalidateQueries({ queryKey: ['news'] })
            setEditingNews(prev => prev ? { ...prev, image: response.data?.image } as any : prev)
        },
        onError: () => message.error('Rasm yuklashda xatolik'),
    })

    const deleteImageMutation = useMutation({
        mutationFn: (id: string) => newsApi.deleteImage(id),
        onSuccess: () => {
            message.success("Rasm o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['news'] })
            setEditingNews(prev => prev ? { ...prev, image: undefined } as any : prev)
        },
        onError: () => message.error("Rasm o'chirishda xatolik"),
    })

    const getImageUrl = (img: any): string | undefined => {
        if (!img) return undefined
        if (typeof img === 'string') return img
        if (typeof img === 'object' && img.url) return img.url
        return undefined
    }

    const handleSubmit = (values: Record<string, unknown>) => {
        const { image, ...rest } = values
        if (editingNews) {
            updateMutation.mutate({ id: editingNews.id, values: rest })
        } else {
            createMutation.mutate(rest)
        }
    }

    const handleEdit = (record: News) => {
        setEditingNews(record)
        form.setFieldsValue({
            ...record,
            categoryId: record.categoryId || record.category?.id,
            tags: record.tags?.map(t => t.id),
        })
        setDrawerOpen(true)
    }

    const statusColors: Record<string, string> = { published: 'green', draft: 'orange', archived: 'default' }
    const statusLabels: Record<string, string> = { published: 'Chop etilgan', draft: 'Qoralama', archived: 'Arxiv' }

    const columns = [
        { title: 'Sarlavha', dataIndex: 'title', key: 'title', ellipsis: true },
        {
            title: 'Kategoriya',
            dataIndex: 'category',
            key: 'category',
            render: (cat: Category) => cat ? <Tag color={cat.color}>{cat.name}</Tag> : '-',
        },
        {
            title: 'Manba',
            dataIndex: 'source',
            key: 'source',
            render: (source: string, record: News) => source ? (
                <Space>
                    {source}
                    {record.sourceUrl && <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer"><LinkOutlined /></a>}
                </Space>
            ) : '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>,
        },
        {
            title: 'Ko\'rishlar',
            dataIndex: 'views',
            key: 'views',
            width: 100,
            render: (views: number) => <Space><EyeOutlined />{views || 0}</Space>,
        },
        {
            title: 'Sana',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
        },
        {
            title: 'Amallar',
            key: 'actions',
            width: 120,
            render: (_: unknown, record: News) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="O'chirishni tasdiqlaysizmi?" onConfirm={() => deleteMutation.mutate(record.id)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div className="space-y-4">
            <PageHeader
                title="Yangiliklar"
                subtitle="Yangiliklarni boshqarish"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingNews(null); form.resetFields(); setDrawerOpen(true) }}>
                        Yangi yangilik
                    </Button>
                }
            />

            <Card>
                <Table
                    columns={columns}
                    dataSource={newsData?.data || []}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <CrudDrawer
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setEditingNews(null); form.resetFields() }}
                title={editingNews ? 'Yangilikni yangilash' : 'Yangi yangilik'}
                form={form}
                onSubmit={handleSubmit}
                loading={createMutation.isPending || updateMutation.isPending}
                isEdit={!!editingNews}
                width={520}
            >
                <Form.Item name="title" label="Sarlavha" rules={[{ required: true }]}>
                    <Input placeholder="Yangi texnologiya trendi" />
                </Form.Item>
                <Form.Item name="excerpt" label="Qisqa tavsif">
                    <TextArea rows={2} placeholder="Qisqa tavsif..." />
                </Form.Item>
                <Form.Item name="content" label="Content (HTML)">
                    <TextArea rows={6} placeholder="<p>Maqola matni...</p>" />
                </Form.Item>

                {/* Rasm yuklash — faqat tahrirlashda */}
                {editingNews && (
                    <Form.Item label="Rasm">
                        <div className="space-y-2">
                            {getImageUrl(editingNews.image) && (
                                <div className="relative">
                                    <img src={getImageUrl(editingNews.image)} alt="Preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                                    <Button
                                        danger size="small" icon={<DeleteOutlined />}
                                        onClick={() => deleteImageMutation.mutate(editingNews.id)}
                                        loading={deleteImageMutation.isPending}
                                        style={{ position: 'absolute', top: 8, right: 8 }}
                                    />
                                </div>
                            )}
                            <Upload
                                showUploadList={false}
                                accept="image/*"
                                beforeUpload={(file) => {
                                    uploadImageMutation.mutate({ id: editingNews.id, file })
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
                            <Select.Option key={(cat as any)._id || cat.id} value={(cat as any)._id || cat.id}>{cat.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="tags" label="Teglar">
                    <Select mode="multiple" placeholder="Teglarni tanlang" allowClear>
                        {tagsData?.data?.map((tag: TagType) => (
                            <Select.Option key={tag.id} value={tag.id}>
                                <Tag color={tag.color}>{tag.name}</Tag>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="source" label="Manba nomi">
                    <Input placeholder="TechCrunch" />
                </Form.Item>
                <Form.Item name="sourceUrl" label="Manba URL">
                    <Input placeholder="https://techcrunch.com/..." />
                </Form.Item>
                <Form.Item name="status" label="Status" initialValue="draft">
                    <Select>
                        <Select.Option value="draft">Qoralama</Select.Option>
                        <Select.Option value="published">Chop etish</Select.Option>
                        <Select.Option value="archived">Arxivlash</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="isFeatured" label="Featured" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </CrudDrawer>
        </div>
    )
}

export default NewsPage
