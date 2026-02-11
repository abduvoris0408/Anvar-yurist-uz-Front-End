import { useState } from 'react'
import { Table, Form, Input, InputNumber, Switch, Tag, message, Avatar, Upload, Button } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import { partnersApi } from '../api'
import { PageHeader, CrudDrawer, ActionButtons } from '../components'
import { useDebounce } from '../hooks/useDebounce'
import type { Partner } from '../types'
import type { TableColumnsType } from 'antd'

const { TextArea } = Input

const PartnersPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
    const [form] = Form.useForm()
    const queryClient = useQueryClient()
    const [searchText, setSearchText] = useState('')
    const debouncedSearch = useDebounce(searchText, 500)

    const { data, isLoading } = useQuery({
        queryKey: ['partners', debouncedSearch],
        queryFn: () => partnersApi.getAll({ search: debouncedSearch }),
    })

    const filteredData = data?.data || []

    const createMutation = useMutation({
        mutationFn: (newPartner: Partial<Partner>) => partnersApi.create(newPartner),
        onSuccess: () => {
            message.success('Hamkor yaratildi')
            queryClient.invalidateQueries({ queryKey: ['partners'] })
            handleClose()
        },
        onError: (error: any) => {
            console.error('Create Partner Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Partner> }) => partnersApi.update(id, data),
        onSuccess: () => {
            message.success('Hamkor yangilandi')
            queryClient.invalidateQueries({ queryKey: ['partners'] })
            handleClose()
        },
        onError: (error: any) => {
            console.error('Update Partner Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => partnersApi.delete(id),
        onSuccess: () => {
            message.success('Hamkor o\'chirildi')
            queryClient.invalidateQueries({ queryKey: ['partners'] })
        },
        onError: (error: any) => {
            console.error('Delete Partner Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const uploadLogoMutation = useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => partnersApi.uploadLogo(id, file),
        onSuccess: (response: any) => {
            message.success('Logo yuklandi!')
            queryClient.invalidateQueries({ queryKey: ['partners'] })
            setEditingPartner(prev => prev ? { ...prev, logo: response.data?.logo } as any : prev)
        },
        onError: () => message.error('Logo yuklashda xatolik'),
    })

    const deleteLogoMutation = useMutation({
        mutationFn: (id: string) => partnersApi.deleteLogo(id),
        onSuccess: () => {
            message.success("Logo o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['partners'] })
            setEditingPartner(prev => prev ? { ...prev, logo: undefined } as any : prev)
        },
        onError: () => message.error("Logo o'chirishda xatolik"),
    })

    const handleAdd = () => {
        setEditingId(null)
        setEditingPartner(null)
        form.resetFields()
        setIsDrawerOpen(true)
    }

    const handleEdit = (record: Partner) => {
        setEditingId(record.id)
        setEditingPartner(record)
        form.setFieldsValue(record)
        setIsDrawerOpen(true)
    }

    const handleClose = () => {
        setIsDrawerOpen(false)
        setEditingId(null)
        setEditingPartner(null)
        form.resetFields()
    }

    const handleSubmit = (values: any) => {
        const { logo, ...rest } = values
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

    const columns: TableColumnsType<Partner> = [
        {
            title: 'Logo',
            dataIndex: 'logo',
            key: 'logo',
            render: (logo) => {
                const url = getImageUrl(logo)
                return <Avatar src={url} shape="square" size="large" />
            },
        },
        {
            title: 'Nomi',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    {record.description && <div className="text-xs text-gray-500 truncate max-w-xs">{record.description}</div>}
                </div>
            ),
        },
        {
            title: 'Veb-sayt',
            dataIndex: 'url',
            key: 'url',
            render: (url) => url ? <a href={url} target="_blank" rel="noopener noreferrer">{url}</a> : '-',
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
                title="Hamkorlar"
                onAdd={handleAdd}
                addButtonText="Yangi hamkor"
                onSearch={setSearchText}
                searchPlaceholder="Hamkor nomi yoki URL bo'yicha qidirish..."
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
                title={editingId ? 'Hamkorni tahrirlash' : 'Yangi hamkor qo\'shish'}
                open={isDrawerOpen}
                onClose={handleClose}
                loading={createMutation.isPending || updateMutation.isPending}
                form={form}
                onSubmit={handleSubmit}
                isEdit={!!editingId}
            >
                <Form.Item
                    name="name"
                    label="Hamkor Nomi"
                    rules={[{ required: true, message: 'Hamkor nomini kiriting' }]}
                >
                    <Input placeholder="Kompaniya nomi" />
                </Form.Item>

                <Form.Item name="url" label="Veb-sayt URL">
                    <Input placeholder="https://company.com" />
                </Form.Item>

                {/* Logo yuklash — faqat tahrirlashda */}
                {editingPartner && (
                    <Form.Item label="Logo">
                        <div className="space-y-2">
                            {getImageUrl(editingPartner.logo) && (
                                <div className="relative inline-block">
                                    <img src={getImageUrl(editingPartner.logo)} alt="Logo" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8, border: '1px solid #eee' }} />
                                    <Button
                                        danger size="small" icon={<DeleteOutlined />}
                                        onClick={() => deleteLogoMutation.mutate(editingPartner.id)}
                                        loading={deleteLogoMutation.isPending}
                                        style={{ position: 'absolute', top: -8, right: -8 }}
                                    />
                                </div>
                            )}
                            <Upload
                                showUploadList={false}
                                accept="image/*"
                                beforeUpload={(file) => {
                                    uploadLogoMutation.mutate({ id: editingPartner.id, file })
                                    return false
                                }}
                            >
                                <Button icon={<UploadOutlined />} loading={uploadLogoMutation.isPending}>
                                    Logo yuklash
                                </Button>
                            </Upload>
                        </div>
                    </Form.Item>
                )}

                <Form.Item name="description" label="Tavsif">
                    <TextArea rows={3} placeholder="Hamkor haqida qisqacha..." />
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

export default PartnersPage
