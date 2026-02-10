import { useState, useMemo } from 'react'
import { Table, Form, Input, ColorPicker, Tag, message, Select } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../api'
import { PageHeader, CrudDrawer, ActionButtons } from '../components'
import type { Category } from '../types'
import type { TableColumnsType } from 'antd'

const { TextArea } = Input

const CategoriesPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [searchText, setSearchText] = useState('')
    const [form] = Form.useForm()
    const queryClient = useQueryClient()

    const { data: categoriesData, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesApi.getAll({ limit: 100 }),
    })

    const filteredData = useMemo(() => {
        if (!searchText) return categoriesData?.data || []
        return (categoriesData?.data || []).filter((item) =>
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchText.toLowerCase())
        )
    }, [categoriesData?.data, searchText])

    const createMutation = useMutation({
        mutationFn: (data: Partial<Category>) => categoriesApi.create(data),
        onSuccess: () => {
            message.success('Kategoriya yaratildi!')
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            handleCloseDrawer()
        },
        onError: (error: any) => {
            console.error('Create Category Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => categoriesApi.update(id, data),
        onSuccess: () => {
            message.success('Kategoriya yangilandi!')
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            handleCloseDrawer()
        },
        onError: (error: any) => {
            console.error('Update Category Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => categoriesApi.delete(id),
        onSuccess: () => {
            message.success("Kategoriya o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
        onError: (error: any) => {
            console.error('Delete Category Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const handleOpenDrawer = (category?: Category) => {
        if (category) {
            setEditingCategory(category)
            form.setFieldsValue(category)
        } else {
            setEditingCategory(null)
            form.resetFields()
        }
        setIsDrawerOpen(true)
    }

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false)
        setEditingCategory(null)
        form.resetFields()
    }

    const handleSubmit = async (values: Record<string, unknown>) => {
        const data = {
            ...values,
            color: (values.color && typeof values.color === 'object') ? (values.color as any).toHexString() : values.color,
        } as Partial<Category>

        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const columns: TableColumnsType<Category> = [
        {
            title: 'Nomi',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <Tag color={record.color}>{text}</Tag>
            ),
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug'
        },
        {
            title: 'Tavsif',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true
        },
        {
            title: 'Loyihalar',
            dataIndex: 'projectCount',
            key: 'projectCount',
            render: (c) => c || 0,
            sorter: (a, b) => (a.projectCount || 0) - (b.projectCount || 0),
        },
        {
            title: 'Amallar',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <ActionButtons
                    onEdit={() => handleOpenDrawer(record)}
                    onDelete={() => deleteMutation.mutate(record.id)}
                    deleteLoading={deleteMutation.isPending}
                />
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title="Kategoriyalar"
                onAdd={() => handleOpenDrawer()}
                addButtonText="Yangi kategoriya"
                onSearch={setSearchText}
                searchPlaceholder="Kategoriyalarni qidirish..."
            >
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Jami: ${total}` }}
                    size="middle"
                />
            </PageHeader>

            <CrudDrawer
                open={isDrawerOpen}
                onClose={handleCloseDrawer}
                title={editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
                loading={createMutation.isPending || updateMutation.isPending}
                form={form}
                onSubmit={handleSubmit}
                isEdit={!!editingCategory}
            >
                <Form.Item name="name" label="Nomi" rules={[{ required: true }]}>
                    <Input placeholder="Web Development" />
                </Form.Item>
                <Form.Item name="type" label="Turi" rules={[{ required: true, message: 'Kategoriya turini tanlang' }]}>
                    <Select placeholder="Turini tanlang">
                        <Select.Option value="project">Loyiha</Select.Option>
                        <Select.Option value="blog">Blog</Select.Option>
                        <Select.Option value="service">Xizmat</Select.Option>
                        <Select.Option value="skill">Ko'nikma</Select.Option>
                        <Select.Option value="news">Yangilik</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="description" label="Tavsif">
                    <TextArea rows={3} placeholder="Kategoriya tavsifi" />
                </Form.Item>
                <Form.Item name="icon" label="Icon (URL)">
                    <Input placeholder="https://example.com/icon.svg" />
                </Form.Item>
                <Form.Item name="color" label="Rang" initialValue="#3B82F6">
                    <ColorPicker showText />
                </Form.Item>
            </CrudDrawer>
        </>
    )
}

export default CategoriesPage
