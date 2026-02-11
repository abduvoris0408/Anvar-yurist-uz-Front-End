import { useState } from 'react'
import { Table, Form, Input, DatePicker, Tag, InputNumber, message, Upload, Button } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import { achievementsApi } from '../api'
import { PageHeader, CrudDrawer, ActionButtons } from '../components'
import { useDebounce } from '../hooks/useDebounce'
import type { Achievement } from '../types'
import type { TableColumnsType } from 'antd'
import dayjs from 'dayjs'

const AchievementsPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
    const [form] = Form.useForm()
    const queryClient = useQueryClient()
    const [searchText, setSearchText] = useState('')
    const debouncedSearch = useDebounce(searchText, 500)

    const { data, isLoading } = useQuery({
        queryKey: ['achievements', debouncedSearch],
        queryFn: () => achievementsApi.getAll({ search: debouncedSearch }),
    })

    const filteredData = data?.data || []

    const createMutation = useMutation({
        mutationFn: (newAchievement: Partial<Achievement>) => achievementsApi.create(newAchievement),
        onSuccess: () => {
            message.success('Yutuq yaratildi')
            queryClient.invalidateQueries({ queryKey: ['achievements'] })
            handleClose()
        },
        onError: (error: any) => {
            console.error('Create Achievement Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
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
            console.error('Update Achievement Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => achievementsApi.delete(id),
        onSuccess: () => {
            message.success('Yutuq o\'chirildi')
            queryClient.invalidateQueries({ queryKey: ['achievements'] })
        },
        onError: (error: any) => {
            console.error('Delete Achievement Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const uploadImageMutation = useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => achievementsApi.uploadImage(id, file),
        onSuccess: (response: any) => {
            message.success('Rasm yuklandi!')
            queryClient.invalidateQueries({ queryKey: ['achievements'] })
            setEditingAchievement(prev => prev ? { ...prev, image: response.data?.image } as any : prev)
        },
        onError: () => message.error('Rasm yuklashda xatolik'),
    })

    const deleteImageMutation = useMutation({
        mutationFn: (id: string) => achievementsApi.deleteImage(id),
        onSuccess: () => {
            message.success("Rasm o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['achievements'] })
            setEditingAchievement(prev => prev ? { ...prev, image: undefined } as any : prev)
        },
        onError: () => message.error("Rasm o'chirishda xatolik"),
    })

    const handleAdd = () => {
        setEditingId(null)
        setEditingAchievement(null)
        form.resetFields()
        setIsDrawerOpen(true)
    }

    const handleEdit = (record: Achievement) => {
        setEditingId(record.id)
        setEditingAchievement(record)
        form.setFieldsValue({
            ...record,
            date: record.date ? dayjs(record.date) : null,
        })
        setIsDrawerOpen(true)
    }

    const handleClose = () => {
        setIsDrawerOpen(false)
        setEditingId(null)
        setEditingAchievement(null)
        form.resetFields()
    }

    const handleSubmit = (values: any) => {
        const { image, ...rest } = values
        const data = {
            ...rest,
            date: rest.date ? rest.date.format('YYYY-MM-DD') : undefined,
        }
        if (editingId) {
            updateMutation.mutate({ id: editingId, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const getImageUrl = (img: any): string | undefined => {
        if (!img) return undefined
        if (typeof img === 'string') return img
        if (typeof img === 'object' && img.url) return img.url
        return undefined
    }

    const columns: TableColumnsType<Achievement> = [
        {
            title: 'Rasm',
            dataIndex: 'image',
            key: 'image',
            width: 60,
            render: (img) => {
                const url = getImageUrl(img)
                return url ? <img src={url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} /> : '-'
            },
        },
        {
            title: 'Yutuq',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Beruvchi',
            dataIndex: 'issuer',
            key: 'issuer',
        },
        {
            title: 'Sana',
            dataIndex: 'date',
            key: 'date',
            render: (date) => date ? dayjs(date).format('DD.MM.YYYY') : '-',
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
                title="Yutuqlar"
                onAdd={handleAdd}
                addButtonText="Yangi yutuq"
                onSearch={setSearchText}
                searchPlaceholder="Yutuq nomi bo'yicha qidirish..."
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
                title={editingId ? 'Yutuqni tahrirlash' : 'Yangi yutuq'}
                open={isDrawerOpen}
                onClose={handleClose}
                loading={createMutation.isPending || updateMutation.isPending}
                form={form}
                onSubmit={handleSubmit}
                isEdit={!!editingId}
            >
                <Form.Item
                    name="title"
                    label="Yutuq nomi"
                    rules={[{ required: true, message: 'Nomini kiriting' }]}
                >
                    <Input placeholder="Eng yaxshi himoya" />
                </Form.Item>
                <Form.Item name="description" label="Tavsif">
                    <Input.TextArea rows={3} placeholder="Yutuq tavsifi" />
                </Form.Item>

                <Form.Item name="issuer" label="Beruvchi tashkilot">
                    <Input placeholder="Yuristlar palatasi" />
                </Form.Item>

                <Form.Item name="date" label="Sana">
                    <DatePicker className="w-full" format="YYYY-MM-DD" />
                </Form.Item>

                {/* Rasm yuklash — faqat tahrirlashda */}
                {editingAchievement && (
                    <Form.Item label="Rasm/Hujjat">
                        <div className="space-y-2">
                            {getImageUrl(editingAchievement.image) && (
                                <div className="relative">
                                    <img src={getImageUrl(editingAchievement.image)} alt="Preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                                    <Button
                                        danger size="small" icon={<DeleteOutlined />}
                                        onClick={() => deleteImageMutation.mutate(editingAchievement.id)}
                                        loading={deleteImageMutation.isPending}
                                        style={{ position: 'absolute', top: 8, right: 8 }}
                                    />
                                </div>
                            )}
                            <Upload
                                showUploadList={false}
                                accept="image/*"
                                beforeUpload={(file) => {
                                    uploadImageMutation.mutate({ id: editingAchievement.id, file })
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

                <Form.Item name="order" label="Tartib raqami" initialValue={1}>
                    <InputNumber min={1} className="w-full" />
                </Form.Item>
            </CrudDrawer>
        </>
    )
}

export default AchievementsPage
