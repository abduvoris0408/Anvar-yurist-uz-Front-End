import { useState, useMemo } from 'react'
import { Table, Form, Input, Select, Slider, InputNumber, Tag, message, Upload, Button } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import { skillsApi, categoriesApi } from '../api'
import { PageHeader, CrudDrawer, ActionButtons } from '../components'
import type { Skill } from '../types'
import type { TableColumnsType } from 'antd'

const SkillsPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
    const [form] = Form.useForm()
    const queryClient = useQueryClient()
    const [searchText, setSearchText] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['skills'],
        queryFn: () => skillsApi.getAll(),
    })

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesApi.getAll(),
    })

    const filteredData = useMemo(() => {
        if (!data?.data) return []
        if (!searchText) return data.data
        return data.data.filter((item) =>
            item.name.toLowerCase().includes(searchText.toLowerCase())
        )
    }, [data?.data, searchText])

    const createMutation = useMutation({
        mutationFn: (newSkill: Partial<Skill>) => skillsApi.create(newSkill),
        onSuccess: () => {
            message.success('Ko\'nikma yaratildi')
            queryClient.invalidateQueries({ queryKey: ['skills'] })
            handleClose()
        },
        onError: (error: any) => {
            console.error('Create Skill Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Skill> }) => skillsApi.update(id, data),
        onSuccess: () => {
            message.success('Ko\'nikma yangilandi')
            queryClient.invalidateQueries({ queryKey: ['skills'] })
            handleClose()
        },
        onError: (error: any) => {
            console.error('Update Skill Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => skillsApi.delete(id),
        onSuccess: () => {
            message.success('Ko\'nikma o\'chirildi')
            queryClient.invalidateQueries({ queryKey: ['skills'] })
        },
        onError: (error: any) => {
            console.error('Delete Skill Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const uploadImageMutation = useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => skillsApi.uploadImage(id, file),
        onSuccess: (response: any) => {
            message.success('Rasm yuklandi!')
            queryClient.invalidateQueries({ queryKey: ['skills'] })
            setEditingSkill(prev => prev ? { ...prev, image: response.data?.image } as Skill : prev)
        },
        onError: () => message.error('Rasm yuklashda xatolik'),
    })

    const deleteImageMutation = useMutation({
        mutationFn: (id: string) => skillsApi.deleteImage(id),
        onSuccess: () => {
            message.success("Rasm o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['skills'] })
            setEditingSkill(prev => prev ? { ...prev, image: undefined } : prev)
        },
        onError: () => message.error("Rasm o'chirishda xatolik"),
    })

    const handleAdd = () => {
        setEditingId(null)
        setEditingSkill(null)
        form.resetFields()
        setIsDrawerOpen(true)
    }

    const handleEdit = (record: Skill) => {
        setEditingId(record.id)
        setEditingSkill(record)
        form.setFieldsValue(record)
        setIsDrawerOpen(true)
    }

    const handleClose = () => {
        setIsDrawerOpen(false)
        setEditingId(null)
        setEditingSkill(null)
        form.resetFields()
    }

    const handleSubmit = (values: any) => {
        const { image, ...rest } = values
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: rest })
        } else {
            createMutation.mutate(rest)
        }
    }

    const getImageUrl = (img: any): string | undefined => {
        if (!img) return undefined
        if (typeof img === 'string') return img
        if (typeof img === 'object' && img.url) return img.url
        return undefined
    }

    const columns: TableColumnsType<Skill> = [
        {
            title: 'Icon',
            dataIndex: 'icon',
            key: 'icon',
            width: 50,
            render: (icon) => icon ? <img src={icon} alt="" style={{ width: 24, height: 24 }} /> : '-',
        },
        {
            title: 'Nomi',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Daraja',
            dataIndex: 'percentage',
            key: 'percentage',
            render: (p) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 100, height: 6, background: '#f0f0f0', borderRadius: 3 }}>
                        <div style={{ width: `${p}%`, height: '100%', background: '#1677ff', borderRadius: 3 }} />
                    </div>
                    <span>{p}%</span>
                </div>
            ),
        },
        {
            title: 'Kategoriya',
            dataIndex: 'category',
            key: 'category',
            render: (cat) => cat ? <Tag color={cat.color}>{cat.name}</Tag> : '-',
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
                title="Ko'nikmalar"
                onAdd={handleAdd}
                addButtonText="Yangi ko'nikma"
                onSearch={setSearchText}
                searchPlaceholder="Ko'nikma nomi bo'yicha qidirish..."
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
                title={editingId ? 'Ko\'nikmani tahrirlash' : 'Yangi ko\'nikma'}
                open={isDrawerOpen}
                onClose={handleClose}
                loading={createMutation.isPending || updateMutation.isPending}
                form={form}
                onSubmit={handleSubmit}
                isEdit={!!editingId}
            >
                <Form.Item
                    name="name"
                    label="Ko'nikma nomi"
                    rules={[{ required: true, message: 'Nomini kiriting' }]}
                >
                    <Input placeholder="Fuqarolik huquqi" />
                </Form.Item>
                <Form.Item name="icon" label="Icon (URL)" tooltip="SVG yoki PNG rasm havolasi">
                    <Input placeholder="https://example.com/icon.svg" />
                </Form.Item>

                {/* Rasm yuklash — faqat tahrirlashda */}
                {editingSkill && (
                    <Form.Item label="Rasm">
                        <div className="space-y-2">
                            {getImageUrl(editingSkill.image) && (
                                <div className="relative">
                                    <img src={getImageUrl(editingSkill.image)} alt="Preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />
                                    <Button
                                        danger size="small" icon={<DeleteOutlined />}
                                        onClick={() => deleteImageMutation.mutate(editingSkill.id)}
                                        loading={deleteImageMutation.isPending}
                                        style={{ position: 'absolute', top: 8, right: 8 }}
                                    />
                                </div>
                            )}
                            <Upload
                                showUploadList={false}
                                accept="image/*"
                                beforeUpload={(file) => {
                                    uploadImageMutation.mutate({ id: editingSkill.id, file })
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

                <Form.Item name="percentage" label="Daraja (%)" initialValue={50}>
                    <Slider marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }} />
                </Form.Item>
                <Form.Item name="category" label="Kategoriya">
                    <Select placeholder="Kategoriya tanlang" allowClear>
                        {categoriesData?.data?.map(cat => (
                            <Select.Option key={cat.id} value={cat.id}>
                                <Tag color={cat.color}>{cat.name}</Tag>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="order" label="Tartib raqami">
                    <InputNumber min={0} className="w-full" />
                </Form.Item>
            </CrudDrawer>
        </>
    )
}

export default SkillsPage
