import { useState, useMemo } from 'react'
import { Table, Form, Input, Select, Tag, message, InputNumber, Switch } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { faqsApi, categoriesApi } from '../api'
import { PageHeader, CrudDrawer, ActionButtons } from '../components'
import type { FAQ } from '../types'
import type { TableColumnsType } from 'antd'

const { TextArea } = Input

const FaqsPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form] = Form.useForm()
    const queryClient = useQueryClient()
    const [searchText, setSearchText] = useState('')

    // 1. Data
    const { data, isLoading } = useQuery({
        queryKey: ['faqs'],
        queryFn: () => faqsApi.getAll(),
    })

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesApi.getAll(),
    })

    const filteredData = useMemo(() => {
        if (!data?.data) return []
        if (!searchText) return data.data
        return data.data.filter((item) =>
            item.question.toLowerCase().includes(searchText.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchText.toLowerCase())
        )
    }, [data?.data, searchText])

    // 2. Mutations
    const createMutation = useMutation({
        mutationFn: (newFaq: Partial<FAQ>) => faqsApi.create(newFaq),
        onSuccess: () => {
            message.success('Savol-javob yaratildi')
            queryClient.invalidateQueries({ queryKey: ['faqs'] })
            handleClose()
        },
        onError: (error: any) => {
            console.error('Create FAQ Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<FAQ> }) => faqsApi.update(id, data),
        onSuccess: () => {
            message.success('Savol-javob yangilandi')
            queryClient.invalidateQueries({ queryKey: ['faqs'] })
            handleClose()
        },
        onError: (error: any) => {
            console.error('Update FAQ Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => faqsApi.delete(id),
        onSuccess: () => {
            message.success('Savol-javob o\'chirildi')
            queryClient.invalidateQueries({ queryKey: ['faqs'] })
        },
        onError: (error: any) => {
            console.error('Delete FAQ Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    // 3. Handlers
    const handleAdd = () => {
        setEditingId(null)
        form.resetFields()
        setIsDrawerOpen(true)
    }

    const handleEdit = (record: FAQ) => {
        setEditingId(record.id)
        form.setFieldsValue(record)
        setIsDrawerOpen(true)
    }

    const handleClose = () => {
        setIsDrawerOpen(false)
        setEditingId(null)
        form.resetFields()
    }

    const handleSubmit = (values: any) => {
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: values })
        } else {
            createMutation.mutate(values)
        }
    }

    // 4. Columns
    const columns: TableColumnsType<FAQ> = [
        {
            title: 'Savol',
            dataIndex: 'question',
            key: 'question',
            ellipsis: true,
        },
        {
            title: 'Javob',
            dataIndex: 'answer',
            key: 'answer',
            ellipsis: true,
        },
        {
            title: 'Kategoriya',
            dataIndex: 'category',
            key: 'category',
            render: (cat) => cat?.name ? <Tag>{cat.name}</Tag> : '-',
        },
        {
            title: 'Holat',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Faol' : 'Nofaol'}
                </Tag>
            ),
        },
        {
            title: 'Amallar',
            key: 'actions',
            width: 100,
            render: (_, record) => (
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
                title="FAQ (Savol-Javoblar)"
                onAdd={handleAdd}
                addButtonText="Yangi savol"
                onSearch={setSearchText}
                searchPlaceholder="Savol yoki javob bo'yicha qidirish..."
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
                title={editingId ? 'Savolni tahrirlash' : 'Yangi savol qo\'shish'}
                open={isDrawerOpen}
                onClose={handleClose}
                loading={createMutation.isPending || updateMutation.isPending}
                form={form}
                onSubmit={handleSubmit}
                isEdit={!!editingId}
            >
                <Form.Item
                    name="question"
                    label="Savol"
                    rules={[{ required: true, message: 'Savolni kiriting' }]}
                >
                    <TextArea rows={2} placeholder="Savol matni..." />
                </Form.Item>

                <Form.Item
                    name="answer"
                    label="Javob"
                    rules={[{ required: true, message: 'Javobni kiriting' }]}
                >
                    <TextArea rows={4} placeholder="Javob matni..." />
                </Form.Item>

                <Form.Item name="categoryId" label="Kategoriya">
                    <Select placeholder="Kategoriyani tanlang" allowClear>
                        {categories?.data?.map((cat: any) => (
                            <Select.Option key={cat._id || cat.id} value={cat._id || cat.id}>
                                {cat.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="order"
                    label="Tartib raqami"
                    initialValue={1}
                >
                    <InputNumber min={1} className="w-full" />
                </Form.Item>

                <Form.Item
                    name="isActive"
                    label="Holati"
                    valuePropName="checked"
                    initialValue={true}
                >
                    <Switch checkedChildren="Faol" unCheckedChildren="Nofaol" />
                </Form.Item>
            </CrudDrawer>
        </>
    )
}

export default FaqsPage
