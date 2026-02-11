import { useState } from 'react'
import { Table, Form, Input, ColorPicker, Tag, message, Upload, Button } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import { categoriesApi } from '../api'
import { PageHeader, CrudDrawer, ActionButtons } from '../components'
import { useDebounce } from '../hooks/useDebounce'
import type { Category } from '../types'

const CategoriesPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [form] = Form.useForm()
    const queryClient = useQueryClient()
    const [searchText, setSearchText] = useState('')
    const debouncedSearch = useDebounce(searchText, 500)

    const { data, isLoading } = useQuery({
        queryKey: ['categories', debouncedSearch],
        queryFn: () => categoriesApi.getAll({ search: debouncedSearch }),
    })

    const filteredData = data?.data || []

    const createMutation = useMutation({
        mutationFn: (newCategory: Partial<Category>) => categoriesApi.create(newCategory),
        onSuccess: () => {
            message.success('Kategoriya yaratildi')
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            handleClose()
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
            message.success('Kategoriya yangilandi')
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            handleClose()
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
            message.success('Kategoriya o\'chirildi')
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        },
        onError: (error: any) => {
            console.error('Delete Category Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const uploadImageMutation = useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => categoriesApi.uploadImage(id, file),
        onSuccess: (response: any) => {
            message.success('Rasm yuklandi!')
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            setEditingCategory(prev => prev ? { ...prev, image: response.data?.image } as Category : prev)
        },
        onError: () => message.error('Rasm yuklashda xatolik'),
    })

    const deleteImageMutation = useMutation({
        mutationFn: (id: string) => categoriesApi.deleteImage(id),
        onSuccess: () => {
            message.success("Rasm o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            setEditingCategory(prev => prev ? { ...prev, image: undefined } : prev)
        },
        onError: () => message.error("Rasm o'chirishda xatolik"),
    })

    const handleAdd = () => {
        setEditingId(null)
        setEditingCategory(null)
        form.resetFields()
        setIsDrawerOpen(true)
    }

    const handleEdit = (record: Category) => {
        setEditingId(record.id)
        setEditingCategory(record)
        form.setFieldsValue(record)
        setIsDrawerOpen(true)
    }

    const handleClose = () => {
        setIsDrawerOpen(false)
        setEditingId(null)
        setEditingCategory(null)
        form.resetFields()
    }

    const handleSubmit = (values: any) => {
        const { image, ...rest } = values
        const finalData = {
            ...rest,
            color: typeof rest.color === 'object' && rest.color?.toHexString ? rest.color.toHexString() : rest.color,
        }
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: finalData })
        } else {
            createMutation.mutate(finalData)
        }
    }

    const getImageUrl = (img: any): string | undefined => {
        if (!img) return undefined
        if (typeof img === 'string') return img
        if (typeof img === 'object' && img.url) return img.url
        return undefined
    }

    const columns = [
        {
            title: 'Rang',
            dataIndex: 'color',
            key: 'color',
            width: 60,
            render: (color: string) => (
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: color || '#ccc' }} />
            ),
        },
        {
            title: 'Nomi',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Category) => (
                <Tag color={record.color}>{text}</Tag>
            ),
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
        },
        {
            title: 'Amallar',
            key: 'actions',
            width: 100,
            render: (_: unknown, record: Category) => (
                <ActionButtons
                    onEdit={() => handleEdit(record)}
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
                onAdd={handleAdd}
                addButtonText="Yangi kategoriya"
                onSearch={setSearchText}
                searchPlaceholder="Kategoriya nomi bo'yicha qidirish..."
            >
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                />
            </PageHeader>

            <CrudDrawer
                title={editingId ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
                open={isDrawerOpen}
                onClose={handleClose}
                loading={createMutation.isPending || updateMutation.isPending}
                form={form}
                onSubmit={handleSubmit}
                isEdit={!!editingId}
            >
                <Form.Item
                    name="name"
                    label="Kategoriya nomi"
                    rules={[{ required: true, message: 'Nomini kiriting' }]}
                >
                    <Input placeholder="Huquq sohasi" />
                </Form.Item>
                <Form.Item name="description" label="Tavsif">
                    <Input.TextArea rows={2} placeholder="Kategoriya tavsifi" />
                </Form.Item>
                <Form.Item name="color" label="Rang">
                    <ColorPicker format="hex" />
                </Form.Item>
                <Form.Item name="icon" label="Icon (emoji yoki CSS class)">
                    <Input placeholder="🌐 yoki fa-globe" />
                </Form.Item>

                {/* Rasm yuklash — faqat tahrirlashda */}
                {editingCategory && (
                    <Form.Item label="Rasm">
                        <div className="space-y-2">
                            {getImageUrl(editingCategory.image) && (
                                <div className="relative">
                                    <img src={getImageUrl(editingCategory.image)} alt="Preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                                    <Button
                                        danger size="small" icon={<DeleteOutlined />}
                                        onClick={() => deleteImageMutation.mutate(editingCategory.id)}
                                        loading={deleteImageMutation.isPending}
                                        style={{ position: 'absolute', top: 8, right: 8 }}
                                    />
                                </div>
                            )}
                            <Upload
                                showUploadList={false}
                                accept="image/*"
                                beforeUpload={(file) => {
                                    uploadImageMutation.mutate({ id: editingCategory.id, file })
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
            </CrudDrawer>
        </>
    )
}

export default CategoriesPage
