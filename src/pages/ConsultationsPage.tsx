import { useState, useMemo } from 'react'
import { Table, Form, Input, Tag, message, Select, Descriptions } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { consultationsApi } from '../api'
import { PageHeader, CrudDrawer, ActionButtons } from '../components'
import type { Consultation } from '../types'
import type { TableColumnsType } from 'antd'

const { TextArea } = Input

const ConsultationsPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingItem, setEditingItem] = useState<Consultation | null>(null)
    const [form] = Form.useForm()
    const queryClient = useQueryClient()
    const [searchText, setSearchText] = useState('')

    // 1. Data
    const { data, isLoading } = useQuery({
        queryKey: ['consultations'],
        queryFn: () => consultationsApi.getAll(),
    })

    const filteredData = useMemo(() => {
        if (!data?.data) return []
        if (!searchText) return data.data
        return data.data.filter((item) =>
            item.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.phone.toLowerCase().includes(searchText.toLowerCase())
        )
    }, [data?.data, searchText])

    // 2. Mutations
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Consultation> }) => consultationsApi.update(id, data),
        onSuccess: () => {
            message.success('Status yangilandi')
            queryClient.invalidateQueries({ queryKey: ['consultations'] })
            handleClose()
        },
        onError: (error: any) => {
            console.error('Update Consultation Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => consultationsApi.delete(id),
        onSuccess: () => {
            message.success('So\'rov o\'chirildi')
            queryClient.invalidateQueries({ queryKey: ['consultations'] })
        },
        onError: (error: any) => {
            console.error('Delete Consultation Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    // 3. Handlers
    const handleManage = (record: Consultation) => {
        setEditingId(record.id)
        setEditingItem(record)
        form.setFieldsValue({
            status: record.status,
            adminNotes: record.adminNotes
        })
        setIsDrawerOpen(true)
    }

    const handleClose = () => {
        setIsDrawerOpen(false)
        setEditingId(null)
        setEditingItem(null)
        form.resetFields()
    }

    const handleSubmit = (values: any) => {
        if (editingId) {
            updateMutation.mutate({
                id: editingId,
                data: {
                    status: values.status,
                    adminNotes: values.adminNotes
                }
            })
        }
    }

    // 4. Columns
    const columns: TableColumnsType<Consultation> = [
        {
            title: 'Mijoz',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-xs text-gray-500">{record.phone}</div>
                </div>
            ),
        },
        {
            title: 'Xizmat',
            dataIndex: 'service',
            key: 'service',
            render: (service) => service?.title || '-',
        },
        {
            title: 'Sana',
            dataIndex: 'preferredDate',
            key: 'preferredDate',
            render: (date, record) => (
                <div>
                    <div>{date || '-'}</div>
                    <div className="text-xs text-gray-500">{record.preferredTime || '-'}</div>
                </div>
            )
        },
        {
            title: 'Holat',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors: Record<string, string> = {
                    pending: 'orange',
                    confirmed: 'blue',
                    completed: 'green',
                    cancelled: 'red',
                }
                const labels: Record<string, string> = {
                    pending: 'Kutilmoqda',
                    confirmed: 'Tasdiqlandi',
                    completed: 'Yakunlandi',
                    cancelled: 'Bekor qilindi',
                }
                return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>
            },
        },
        {
            title: 'Amallar',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <ActionButtons
                    onEdit={() => handleManage(record)}
                    onDelete={() => deleteMutation.mutate(record.id)}
                    deleteLoading={deleteMutation.isPending}
                />
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title="Maslahat So'rovlari"
                onSearch={setSearchText}
                searchPlaceholder="Mijoz ismi, telefon yoki email bo'yicha..."
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
                title="So'rovni ko'rish / Status o'zgartirish"
                open={isDrawerOpen}
                onClose={handleClose}
                loading={updateMutation.isPending}
                form={form}
                onSubmit={handleSubmit}
                isEdit={true}
            >
                {editingItem && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Mijoz">{editingItem.fullName}</Descriptions.Item>
                            <Descriptions.Item label="Telefon">{editingItem.phone}</Descriptions.Item>
                            <Descriptions.Item label="Email">{editingItem.email || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Xizmat">{editingItem.service?.title || '-'}</Descriptions.Item>
                            <Descriptions.Item label="Sana">{editingItem.preferredDate}</Descriptions.Item>
                            <Descriptions.Item label="Vaqt">{editingItem.preferredTime}</Descriptions.Item>
                        </Descriptions>
                        {editingItem.message && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">Xabar:</div>
                                <div className="text-sm">{editingItem.message}</div>
                            </div>
                        )}
                    </div>
                )}

                <Form.Item
                    name="status"
                    label="Holati"
                    rules={[{ required: true, message: 'Statusni tanlang' }]}
                >
                    <Select>
                        <Select.Option value="pending">Kutilmoqda</Select.Option>
                        <Select.Option value="confirmed">Tasdiqlandi</Select.Option>
                        <Select.Option value="completed">Yakunlandi</Select.Option>
                        <Select.Option value="cancelled">Bekor qilindi</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item name="adminNotes" label="Admin izohi">
                    <TextArea rows={4} placeholder="Izoh yoki eslatma yozing..." />
                </Form.Item>
            </CrudDrawer>
        </>
    )
}

export default ConsultationsPage
