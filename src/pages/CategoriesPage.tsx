import { useState, useMemo } from 'react'
import { Table, Form, Input, ColorPicker, Tag, message } from 'antd'
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
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => categoriesApi.update(id, data),
        onSuccess: () => {
            message.success('Kategoriya yangilandi!')
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            handleCloseDrawer()
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => categoriesApi.delete(id),
        onSuccess: () => {
            message.success("Kategoriya o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
        onError: () => message.error('Xatolik yuz berdi'),
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
            updateMutation.mutate({ id: editingCategory._id, data })
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
                    onDelete={() => deleteMutation.mutate(record._id)}
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
                    rowKey="_id"
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
