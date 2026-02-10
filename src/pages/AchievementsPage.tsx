import { useState, useMemo } from 'react'
import { Table, Form, Input, InputNumber, Switch, Tag, message, Select, DatePicker } from 'antd'
import dayjs from 'dayjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { achievementsApi } from '../api'
import { PageHeader, CrudDrawer, ActionButtons } from '../components'
import type { Achievement } from '../types'
import type { TableColumnsType } from 'antd'

const { TextArea } = Input

const AchievementsPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form] = Form.useForm()
    const queryClient = useQueryClient()
    const [searchText, setSearchText] = useState('')

    // 1. Data
    const { data, isLoading } = useQuery({
        queryKey: ['achievements'],
        queryFn: () => achievementsApi.getAll(),
    })

    const filteredData = useMemo(() => {
        if (!data?.data) return []
        if (!searchText) return data.data
        return data.data.filter((item) =>
            item.title.toLowerCase().includes(searchText.toLowerCase()) ||
            item.issuer?.toLowerCase().includes(searchText.toLowerCase())
        )
    }, [data?.data, searchText])

    // 2. Mutations
    const createMutation = useMutation({
        mutationFn: (newAchievement: Partial<Achievement>) => achievementsApi.create(newAchievement),
        onSuccess: () => {
            message.success('Yutuq yaratildi')
            queryClient.invalidateQueries({ queryKey: ['achievements'] })
            handleClose()
        },
        onError: (error: any) => {
            message.error(error.response?.data?.error || error.message || 'Xatolik yuz berdi')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Achievement> }) => achievementsApi.update(id, data),
        onSuccess: () => {
            message.success('Yutuq yangilandi')
            queryClient.invalidateQueries({ queryKey: ['achievements'] })
            handleClose()
        },
        onError: (error: any) => {
            message.error(error.response?.data?.error || error.message || 'Xatolik yuz berdi')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => achievementsApi.delete(id),
        onSuccess: () => {
            message.success('Yutuq o\'chirildi')
            queryClient.invalidateQueries({ queryKey: ['achievements'] })
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    // 3. Handlers
    const handleAdd = () => {
        setEditingId(null)
        form.resetFields()
        setIsDrawerOpen(true)
    }

    const handleEdit = (record: Achievement) => {
        setEditingId(record.id)
        form.setFieldsValue({
            ...record,
            date: record.date ? dayjs(record.date) : null,
        })
        setIsDrawerOpen(true)
    }

    const handleClose = () => {
        setIsDrawerOpen(false)
        setEditingId(null)
        form.resetFields()
    }

    const handleSubmit = (values: any) => {
        const formattedValues = {
            ...values,
            date: values.date ? values.date.format('YYYY-MM-DD') : null,
        }
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: formattedValues })
        } else {
            createMutation.mutate(formattedValues)
        }
    }

    // 4. Columns
    const columns: TableColumnsType<Achievement> = [
        {
            title: 'Nomi',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-xs text-gray-500">{record.issuer}</div>
                </div>
            ),
        },
        {
            title: 'Turi',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                const colors: Record<string, string> = {
                    license: 'blue',
                    certificate: 'green',
                    award: 'gold',
                    membership: 'purple',
                }
                const labels: Record<string, string> = {
                    license: 'Litsenziya',
                    certificate: 'Sertifikat',
                    award: 'Mukofot',
                    membership: 'A\'zolik',
                }
                return <Tag color={colors[type] || 'default'}>{labels[type] || type}</Tag>
            },
        },
        {
            title: 'Sanasi',
            dataIndex: 'date',
            key: 'date',
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
                title="Yutuqlar va Sertifikatlar"
                onAdd={handleAdd}
                addButtonText="Yangi yutuq"
                onSearch={setSearchText}
                searchPlaceholder="Nomi yoki tashkilot bo'yicha qidirish..."
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
                title={editingId ? 'Yutuqni tahrirlash' : 'Yangi yutuq qo\'shish'}
                open={isDrawerOpen}
                onClose={handleClose}
                loading={createMutation.isPending || updateMutation.isPending}
                form={form}
                onSubmit={handleSubmit}
                isEdit={!!editingId}
            >
                <Form.Item
                    name="title"
                    label="Nomi"
                    rules={[{ required: true, message: 'Yutuq nomini kiriting' }]}
                >
                    <Input placeholder="Sertifikat nomi / Mukofot nomi" />
                </Form.Item>

                <Form.Item name="issuer" label="Beruvchi Tashkilot">
                    <Input placeholder="Google, Coursera, Adliya vazirligi..." />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Turi"
                    rules={[{ required: true, message: 'Turni tanlang' }]}
                    initialValue="certificate"
                >
                    <Select>
                        <Select.Option value="license">Litsenziya</Select.Option>
                        <Select.Option value="certificate">Sertifikat</Select.Option>
                        <Select.Option value="award">Mukofot</Select.Option>
                        <Select.Option value="membership">A'zolik</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item name="date" label="Sanasi">
                    <DatePicker className="w-full" format="YYYY-MM-DD" />
                </Form.Item>

                <Form.Item name="image" label="Rasm/Hujjat URL">
                    <Input placeholder="https://..." onChange={(e) => {
                        form.setFieldsValue({ image: e.target.value })
                    }} />
                </Form.Item>
                <Form.Item shouldUpdate={(prev, current) => prev.image !== current.image}>
                    {() => {
                        const img = form.getFieldValue('image')
                        return img ? (
                            <div className="mt-2">
                                <img src={img} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                            </div>
                        ) : null
                    }}
                </Form.Item>

                <Form.Item name="description" label="Tavsif">
                    <TextArea rows={3} placeholder="Qisqacha ma'lumot..." />
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

export default AchievementsPage
