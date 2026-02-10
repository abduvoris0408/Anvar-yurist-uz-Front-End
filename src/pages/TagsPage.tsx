import { useState } from 'react'
import { Table, Form, Input, Space, Tag, message, Card, Button, Popconfirm, ColorPicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi } from '../api'
import { PageHeader, CrudDrawer } from '../components'
import type { Tag as TagType } from '../types'
import dayjs from 'dayjs'

const TagsPage = () => {
    const [form] = Form.useForm()
    const queryClient = useQueryClient()
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingTag, setEditingTag] = useState<TagType | null>(null)

    const { data: tagsData, isLoading } = useQuery({
        queryKey: ['tags'],
        queryFn: () => tagsApi.getAll(),
    })

    const createMutation = useMutation({
        mutationFn: (values: Partial<TagType>) => tagsApi.create(values),
        onSuccess: () => {
            message.success('Teg yaratildi!')
            queryClient.invalidateQueries({ queryKey: ['tags'] })
            setDrawerOpen(false)
            form.resetFields()
        },
        onError: (error: any) => {
            console.error('Create Tag Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, values }: { id: string; values: Partial<TagType> }) => tagsApi.update(id, values),
        onSuccess: () => {
            message.success('Teg yangilandi!')
            queryClient.invalidateQueries({ queryKey: ['tags'] })
            setDrawerOpen(false)
            setEditingTag(null)
            form.resetFields()
        },
        onError: (error: any) => {
            console.error('Update Tag Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => tagsApi.delete(id),
        onSuccess: () => {
            message.success("Teg o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['tags'] })
        },
        onError: (error: any) => {
            console.error('Delete Tag Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const handleSubmit = (values: Record<string, unknown>) => {
        const color = typeof values.color === 'string' ? values.color : (values.color as any)?.toHexString?.() || '#1890ff'
        const payload = { ...values, color }

        if (editingTag) {
            updateMutation.mutate({ id: editingTag.id, values: payload })
        } else {
            createMutation.mutate(payload)
        }
    }

    const handleEdit = (record: TagType) => {
        setEditingTag(record)
        form.setFieldsValue(record)
        setDrawerOpen(true)
    }

    const columns = [
        {
            title: 'Rang',
            dataIndex: 'color',
            key: 'color',
            width: 60,
            render: (color: string) => (
                <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: color || '#ccc' }} />
            ),
        },
        {
            title: 'Nomi',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: TagType) => <Tag color={record.color}>{name}</Tag>,
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
            render: (slug: string) => slug || '-',
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
            render: (_: unknown, record: TagType) => (
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
                title="Teglar"
                subtitle="Blog va yangiliklar uchun teglarni boshqarish"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingTag(null); form.resetFields(); setDrawerOpen(true) }}>
                        Yangi teg
                    </Button>
                }
            />

            <Card>
                <Table
                    columns={columns}
                    dataSource={tagsData?.data || []}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 15 }}
                />
            </Card>

            <CrudDrawer
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setEditingTag(null); form.resetFields() }}
                title={editingTag ? 'Tegni yangilash' : 'Yangi teg'}
                form={form}
                onSubmit={handleSubmit}
                loading={createMutation.isPending || updateMutation.isPending}
                isEdit={!!editingTag}
                width={380}
            >
                <Form.Item name="name" label="Nomi" rules={[{ required: true }]}>
                    <Input placeholder="JavaScript" />
                </Form.Item>
                <Form.Item name="color" label="Rang">
                    <ColorPicker />
                </Form.Item>
            </CrudDrawer>
        </div>
    )
}

export default TagsPage
