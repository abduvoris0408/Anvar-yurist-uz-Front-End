import { useState, useMemo } from 'react'
import { Table, Form, Input, Rate, Tag, message, InputNumber, Switch } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testimonialsApi } from '../api'
import { PageHeader, CrudDrawer, ActionButtons } from '../components'
import type { Testimonial } from '../types'
import type { TableColumnsType } from 'antd'

const { TextArea } = Input

const TestimonialsPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form] = Form.useForm()
    const queryClient = useQueryClient()
    const [searchText, setSearchText] = useState('')

    // 1. Get Data
    const { data, isLoading } = useQuery({
        queryKey: ['testimonials'],
        queryFn: () => testimonialsApi.getAll(),
    })

    const filteredData = useMemo(() => {
        if (!data?.data) return []
        if (!searchText) return data.data
        return data.data.filter((item) =>
            item.clientName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.content.toLowerCase().includes(searchText.toLowerCase())
        )
    }, [data?.data, searchText])

    // 2. Mutations
    const createMutation = useMutation({
        mutationFn: (newTestimonial: Partial<Testimonial>) => testimonialsApi.create(newTestimonial),
        onSuccess: () => {
            message.success('Mijoz fikri qo\'shildi')
            queryClient.invalidateQueries({ queryKey: ['testimonials'] })
            handleClose()
        },
        onError: (error: any) => {
            console.error('Create Testimonial Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Testimonial> }) => testimonialsApi.update(id, data),
        onSuccess: () => {
            message.success('Mijoz fikri yangilandi')
            queryClient.invalidateQueries({ queryKey: ['testimonials'] })
            handleClose()
        },
        onError: (error: any) => {
            console.error('Update Testimonial Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => testimonialsApi.delete(id),
        onSuccess: () => {
            message.success('Mijoz fikri o\'chirildi')
            queryClient.invalidateQueries({ queryKey: ['testimonials'] })
        },
        onError: (error: any) => {
            console.error('Delete Testimonial Error:', error)
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

    const handleEdit = (record: Testimonial) => {
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
    const columns: TableColumnsType<Testimonial> = [
        {
            title: 'Mijoz',
            dataIndex: 'clientName',
            key: 'clientName',
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-xs text-gray-500">{record.clientPosition}</div>
                </div>
            ),
        },
        {
            title: 'Baho',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => <Rate disabled defaultValue={rating} style={{ fontSize: 12 }} />,
            sorter: (a, b) => a.rating - b.rating,
        },
        {
            title: 'Fikr',
            dataIndex: 'content',
            key: 'content',
            ellipsis: true,
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
                title="Mijoz Fikrlari"
                onAdd={handleAdd}
                addButtonText="Yangi fikr"
                onSearch={setSearchText}
                searchPlaceholder="Mijoz ismi yoki fikr bo'yicha qidirish..."
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
                title={editingId ? 'Fikrni tahrirlash' : 'Yangi fikr qo\'shish'}
                open={isDrawerOpen}
                onClose={handleClose}
                loading={createMutation.isPending || updateMutation.isPending}
                form={form}
                onSubmit={handleSubmit}
                isEdit={!!editingId}
            >
                <Form.Item
                    name="clientName"
                    label="Mijoz Ismi"
                    rules={[{ required: true, message: 'Mijoz ismini kiriting' }]}
                >
                    <Input placeholder="Mijoz ismini kiriting" />
                </Form.Item>

                <Form.Item name="clientPosition" label="Lavozimi">
                    <Input placeholder="CEO, Google" />
                </Form.Item>

                <Form.Item name="image" label="Rasm URL">
                    <Input placeholder="https://..." />
                </Form.Item>

                <Form.Item name="caseType" label="Loyiha turi">
                    <Input placeholder="Web sayt, Mobil ilova..." />
                </Form.Item>

                <Form.Item
                    name="rating"
                    label="Baho (1-5)"
                    rules={[{ required: true, message: 'Bahoni tanlang' }]}
                    initialValue={5}
                >
                    <Rate />
                </Form.Item>

                <Form.Item
                    name="content"
                    label="Fikr matni"
                    rules={[{ required: true, message: 'Fikr matnini kiriting' }]}
                >
                    <TextArea rows={4} placeholder="Mijoz fikrini shu yerga yozing..." />
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

export default TestimonialsPage
