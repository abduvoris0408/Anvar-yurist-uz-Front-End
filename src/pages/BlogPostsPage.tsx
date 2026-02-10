import { useState } from 'react'
import { Table, Form, Input, Select, Switch, Space, Tag, message, Card, Button, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, StarOutlined, EyeOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blogApi, categoriesApi, tagsApi } from '../api'
import { PageHeader, CrudDrawer } from '../components'
import type { BlogPost, Category, Tag as TagType } from '../types'
import dayjs from 'dayjs'

const { TextArea } = Input

const BlogPostsPage = () => {
    const [form] = Form.useForm()
    const queryClient = useQueryClient()
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
    const [statusFilter, setStatusFilter] = useState<string>('')

    const { data: postsData, isLoading } = useQuery({
        queryKey: ['blog-posts', statusFilter],
        queryFn: () => blogApi.getAll(statusFilter ? { status: statusFilter } : undefined),
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
        mutationFn: (values: Partial<BlogPost>) => blogApi.create(values),
        onSuccess: () => {
            message.success('Blog post yaratildi!')
            queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
            setDrawerOpen(false)
            form.resetFields()
        },
        onError: (error: any) => {
            console.error('Create Blog Post Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, values }: { id: string; values: Partial<BlogPost> }) => blogApi.update(id, values),
        onSuccess: () => {
            message.success('Blog post yangilandi!')
            queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
            setDrawerOpen(false)
            setEditingPost(null)
            form.resetFields()
        },
        onError: (error: any) => {
            console.error('Update Blog Post Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => blogApi.delete(id),
        onSuccess: () => {
            message.success("Blog post o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
        },
        onError: (error: any) => {
            console.error('Delete Blog Post Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const handleSubmit = (values: Record<string, unknown>) => {
        if (editingPost) {
            updateMutation.mutate({ id: editingPost.id, values })
        } else {
            createMutation.mutate(values)
        }
    }

    const handleEdit = (record: BlogPost) => {
        setEditingPost(record)
        form.setFieldsValue({
            ...record,
            categoryId: record.categoryId || record.category?.id,
            tags: record.tags?.map(t => t.id),
        })
        setDrawerOpen(true)
    }

    const statusColors: Record<string, string> = {
        published: 'green',
        draft: 'orange',
        archived: 'default',
    }

    const statusLabels: Record<string, string> = {
        published: 'Chop etilgan',
        draft: 'Qoralama',
        archived: 'Arxiv',
    }

    const resetRatingMutation = useMutation({
        mutationFn: (id: string) => blogApi.deleteRatings(id),
        onSuccess: () => {
            message.success("Reytinglar tozalandi!")
            queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const columns = [
        {
            title: 'Sarlavha',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            render: (title: string, record: BlogPost) => (
                <Space>
                    <span>{title}</span>
                    {record.isFeatured && <StarOutlined style={{ color: '#f59e0b' }} />}
                </Space>
            ),
        },
        {
            title: 'Kategoriya',
            dataIndex: 'category',
            key: 'category',
            render: (cat: Category) => cat ? <Tag color={cat.color}>{cat.name}</Tag> : '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>,
        },
        {
            title: 'Ko\'rishlar',
            dataIndex: 'views',
            key: 'views',
            width: 100,
            render: (views: number) => <Space><EyeOutlined />{views || 0}</Space>,
        },
        {
            title: 'Reyting',
            dataIndex: 'averageRating',
            key: 'averageRating',
            width: 120,
            render: (rating: number, record: BlogPost) => rating ? `⭐ ${rating.toFixed(1)} (${record.totalRatings})` : '-',
        },
        {
            title: 'O\'qish vaqti',
            dataIndex: 'readTime',
            key: 'readTime',
            width: 100,
            render: (time: number) => time ? `${time} min` : '-',
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
            width: 150,
            render: (_: unknown, record: BlogPost) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    {(record.totalRatings || 0) > 0 && (
                        <Popconfirm title="Reytinglarni tozalash?" onConfirm={() => resetRatingMutation.mutate(record.id)}>
                            <Button size="small" icon={<StarOutlined />} title="Reytingni tozalash" />
                        </Popconfirm>
                    )}
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
                title="Blog Postlar"
                subtitle="Blog maqolalarni boshqarish"
                extra={
                    <Space>
                        <Select
                            placeholder="Status bo'yicha"
                            allowClear
                            style={{ width: 160 }}
                            onChange={(val) => setStatusFilter(val || '')}
                            options={[
                                { value: 'published', label: 'Chop etilgan' },
                                { value: 'draft', label: 'Qoralama' },
                                { value: 'archived', label: 'Arxiv' },
                            ]}
                        />
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingPost(null); form.resetFields(); setDrawerOpen(true) }}>
                            Yangi post
                        </Button>
                    </Space>
                }
            />

            <Card>
                <Table
                    columns={columns}
                    dataSource={postsData?.data || []}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <CrudDrawer
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setEditingPost(null); form.resetFields() }}
                title={editingPost ? 'Blog postni yangilash' : 'Yangi blog post'}
                form={form}
                onSubmit={handleSubmit}
                loading={createMutation.isPending || updateMutation.isPending}
                isEdit={!!editingPost}
                width={520}
            >
                <Form.Item name="title" label="Sarlavha" rules={[{ required: true }]}>
                    <Input placeholder="Node.js Bilan REST API Yaratish" />
                </Form.Item>
                <Form.Item name="excerpt" label="Qisqa tavsif">
                    <TextArea rows={2} placeholder="Bu maqolada..." />
                </Form.Item>
                <Form.Item name="content" label="Content (HTML)">
                    <TextArea rows={8} placeholder="<h2>Kirish</h2><p>Bu maqolada...</p>" />
                </Form.Item>
                <Form.Item name="image" label="Cover rasm URL">
                    <Input placeholder="https://..." />
                </Form.Item>
                <Form.Item name="categoryId" label="Kategoriya">
                    <Select placeholder="Tanlang" allowClear>
                        {categoriesData?.data?.map(cat => (
                            <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
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
                <Form.Item name="allowComments" label="Izohga ruxsat" valuePropName="checked" initialValue={true}>
                    <Switch />
                </Form.Item>
                <Form.Item name="metaTitle" label="Meta Title (SEO)">
                    <Input placeholder="SEO sarlavha" />
                </Form.Item>
                <Form.Item name="metaDescription" label="Meta Description (SEO)">
                    <TextArea rows={2} placeholder="SEO tavsif" />
                </Form.Item>
            </CrudDrawer>
        </div>
    )
}

export default BlogPostsPage
