import { useState, useMemo } from 'react'
import { Table, Form, Input, DatePicker, Switch, Tag, message, Space, Upload, Button } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import { educationApi } from '../api'
import { PageHeader, CrudDrawer, ActionButtons } from '../components'
import type { Education } from '../types'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { TextArea } = Input

const EducationPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingEducation, setEditingEducation] = useState<Education | null>(null)
    const [searchText, setSearchText] = useState('')
    const [form] = Form.useForm()
    const queryClient = useQueryClient()

    const { data: educationData, isLoading } = useQuery({
        queryKey: ['education'],
        queryFn: () => educationApi.getAll({ limit: 100 }),
    })

    const filteredData = useMemo(() => {
        if (!searchText) return educationData?.data || []
        return (educationData?.data || []).filter((item) =>
            item.school.toLowerCase().includes(searchText.toLowerCase()) ||
            item.degree?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.fieldOfStudy?.toLowerCase().includes(searchText.toLowerCase())
        )
    }, [educationData?.data, searchText])

    const createMutation = useMutation({
        mutationFn: (data: Partial<Education>) => educationApi.create(data),
        onSuccess: () => {
            message.success("Ta'lim yaratildi!")
            queryClient.invalidateQueries({ queryKey: ['education'] })
            handleCloseDrawer()
        },
        onError: (error: any) => {
            message.error(error.response?.data?.error || error.message || 'Xatolik yuz berdi')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Education> }) => educationApi.update(id, data),
        onSuccess: () => {
            message.success("Ta'lim yangilandi!")
            queryClient.invalidateQueries({ queryKey: ['education'] })
            handleCloseDrawer()
        },
        onError: (error: any) => {
            message.error(error.response?.data?.error || error.message || 'Xatolik yuz berdi')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => educationApi.delete(id),
        onSuccess: () => {
            message.success("Ta'lim o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['education'] })
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const uploadLogoMutation = useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => educationApi.uploadLogo(id, file),
        onSuccess: (response: any) => {
            message.success('Logo yuklandi!')
            queryClient.invalidateQueries({ queryKey: ['education'] })
            setEditingEducation(prev => prev ? { ...prev, schoolLogo: response.data?.schoolLogo } as any : prev)
        },
        onError: () => message.error('Logo yuklashda xatolik'),
    })

    const deleteLogoMutation = useMutation({
        mutationFn: (id: string) => educationApi.deleteLogo(id),
        onSuccess: () => {
            message.success("Logo o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['education'] })
            setEditingEducation(prev => prev ? { ...prev, schoolLogo: undefined } as any : prev)
        },
        onError: () => message.error("Logo o'chirishda xatolik"),
    })

    const getImageUrl = (img: any): string | undefined => {
        if (!img) return undefined
        if (typeof img === 'string') return img
        if (typeof img === 'object' && img.url) return img.url
        return undefined
    }

    const handleOpenDrawer = (education?: Education) => {
        if (education) {
            setEditingEducation(education)
            form.setFieldsValue({
                ...education,
                startDate: education.startDate ? dayjs(education.startDate) : null,
                endDate: education.endDate ? dayjs(education.endDate) : null,
            })
        } else {
            setEditingEducation(null)
            form.resetFields()
        }
        setIsDrawerOpen(true)
    }

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false)
        setEditingEducation(null)
        form.resetFields()
    }

    const handleSubmit = async (values: Record<string, unknown>) => {
        const { schoolLogo, ...rest } = values
        const data = {
            ...rest,
            startDate: rest.startDate ? (rest.startDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
            endDate: rest.current ? null : (rest.endDate ? (rest.endDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined),
            gpa: rest.gpa ? Number(rest.gpa) : undefined,
            achievements: typeof rest.achievements === 'string'
                ? (rest.achievements as string).split(',').map((t: string) => t.trim()).filter(Boolean)
                : rest.achievements,
        } as Partial<Education>

        if (editingEducation) {
            updateMutation.mutate({ id: editingEducation.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const columns: ColumnsType<Education> = [
        {
            title: 'Logo',
            dataIndex: 'schoolLogo',
            key: 'schoolLogo',
            width: 50,
            render: (logo) => {
                const url = getImageUrl(logo)
                return url ? <img src={url} alt="" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 4 }} /> : '-'
            },
        },
        {
            title: "O'quv muassasasi",
            dataIndex: 'school',
            key: 'school',
            sorter: (a, b) => a.school.localeCompare(b.school),
            render: (text) => <strong>{text}</strong>
        },
        {
            title: 'Daraja',
            dataIndex: 'degree',
            key: 'degree'
        },
        {
            title: "Yo'nalish",
            dataIndex: 'fieldOfStudy',
            key: 'fieldOfStudy'
        },
        {
            title: 'Davr',
            key: 'period',
            render: (_, record) => (
                <span>
                    {dayjs(record.startDate).format('YYYY')} - {record.current ? <Tag color="green">Hozir</Tag> : dayjs(record.endDate).format('YYYY')}
                </span>
            ),
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
                title="Ta'lim"
                onAdd={() => handleOpenDrawer()}
                addButtonText="Yangi ta'lim"
                onSearch={setSearchText}
                searchPlaceholder="Ta'limni qidirish..."
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
                title={editingEducation ? "Ta'limni tahrirlash" : "Yangi ta'lim"}
                loading={createMutation.isPending || updateMutation.isPending}
                form={form}
                onSubmit={handleSubmit}
                isEdit={!!editingEducation}
                width={450}
            >
                <Form.Item name="school" label="O'quv muassasasi" rules={[{ required: true }]}>
                    <Input placeholder="TDYU" />
                </Form.Item>
                <Form.Item name="degree" label="Daraja" rules={[{ required: true }]}>
                    <Input placeholder="Bakalavr" />
                </Form.Item>
                <Form.Item name="fieldOfStudy" label="O'qish yo'nalishi" rules={[{ required: true }]}>
                    <Input placeholder="Huquqshunoslik" />
                </Form.Item>
                <Form.Item name="location" label="Joylashuv">
                    <Input placeholder="Toshkent, O'zbekiston" />
                </Form.Item>
                <Form.Item name="description" label="Tavsif">
                    <TextArea rows={3} placeholder="Ta'lim haqida" />
                </Form.Item>

                {/* Logo yuklash — faqat tahrirlashda */}
                {editingEducation && (
                    <Form.Item label="Muassasa logosi">
                        <div className="space-y-2">
                            {getImageUrl(editingEducation.schoolLogo) && (
                                <div className="relative inline-block">
                                    <img src={getImageUrl(editingEducation.schoolLogo)} alt="Logo" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 8, border: '1px solid #eee' }} />
                                    <Button
                                        danger size="small" icon={<DeleteOutlined />}
                                        onClick={() => deleteLogoMutation.mutate(editingEducation.id)}
                                        loading={deleteLogoMutation.isPending}
                                        style={{ position: 'absolute', top: -8, right: -8 }}
                                    />
                                </div>
                            )}
                            <Upload
                                showUploadList={false}
                                accept="image/*"
                                beforeUpload={(file) => {
                                    uploadLogoMutation.mutate({ id: editingEducation.id, file })
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

                <Space className="w-full" size="middle">
                    <Form.Item name="startDate" label="Boshlanish" rules={[{ required: true }]}>
                        <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item name="endDate" label="Tugash">
                        <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>
                </Space>
                <Form.Item name="current" label="Hozirda o'qiyapman" valuePropName="checked">
                    <Switch />
                </Form.Item>
                <Form.Item name="gpa" label="GPA (Baho)">
                    <Input type="number" step="0.1" placeholder="4.5" />
                </Form.Item>
                <Form.Item name="achievements" label="Yutuqlar (vergul bilan)">
                    <Input placeholder="Stipendiat, Olim, ..." />
                </Form.Item>
            </CrudDrawer>
        </>
    )
}

export default EducationPage
