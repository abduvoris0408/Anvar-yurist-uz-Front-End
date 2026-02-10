import { useState, useMemo } from 'react'
import { Table, Form, Input, DatePicker, Switch, Tag, message, Space } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { experiencesApi } from '../api'
import { PageHeader, CrudDrawer, ActionButtons } from '../components'
import type { Experience } from '../types'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { TextArea } = Input

const ExperiencesPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null)
    const [searchText, setSearchText] = useState('')
    const [form] = Form.useForm()
    const queryClient = useQueryClient()

    const { data: experiencesData, isLoading } = useQuery({
        queryKey: ['experiences'],
        queryFn: () => experiencesApi.getAll({ limit: 100 }),
    })

    const filteredData = useMemo(() => {
        if (!searchText) return experiencesData?.data || []
        return (experiencesData?.data || []).filter((item) =>
            item.company.toLowerCase().includes(searchText.toLowerCase()) ||
            item.position?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.location?.toLowerCase().includes(searchText.toLowerCase())
        )
    }, [experiencesData?.data, searchText])

    const createMutation = useMutation({
        mutationFn: (data: Partial<Experience>) => experiencesApi.create(data),
        onSuccess: () => {
            message.success('Tajriba yaratildi!')
            queryClient.invalidateQueries({ queryKey: ['experiences'] })
            handleCloseDrawer()
        },
        onError: (error: any) => {
            message.error(error.response?.data?.error || error.message || 'Xatolik yuz berdi')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Experience> }) => experiencesApi.update(id, data),
        onSuccess: () => {
            message.success('Tajriba yangilandi!')
            queryClient.invalidateQueries({ queryKey: ['experiences'] })
            handleCloseDrawer()
        },
        onError: (error: any) => {
            message.error(error.response?.data?.error || error.message || 'Xatolik yuz berdi')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => experiencesApi.delete(id),
        onSuccess: () => {
            message.success("Tajriba o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['experiences'] })
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const handleOpenDrawer = (experience?: Experience) => {
        if (experience) {
            setEditingExperience(experience)
            form.setFieldsValue({
                ...experience,
                startDate: experience.startDate ? dayjs(experience.startDate) : null,
                endDate: experience.endDate ? dayjs(experience.endDate) : null,
                // technologies: experience.technologies?.join(', '), // Removed
            })
        } else {
            setEditingExperience(null)
            form.resetFields()
        }
        setIsDrawerOpen(true)
    }

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false)
        setEditingExperience(null)
        form.resetFields()
    }

    const handleSubmit = async (values: Record<string, unknown>) => {
        const data = {
            ...values,
            startDate: values.startDate ? (values.startDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
            endDate: values.current ? null : (values.endDate ? (values.endDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined),
            specializations: typeof values.specializations === 'string'
                ? (values.specializations as string).split(',').map((t: string) => t.trim()).filter(Boolean)
                : values.specializations,
        } as Partial<Experience>

        if (editingExperience) {
            updateMutation.mutate({ id: editingExperience.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const columns: ColumnsType<Experience> = [
        {
            title: 'Kompaniya',
            dataIndex: 'company',
            key: 'company',
            sorter: (a, b) => a.company.localeCompare(b.company),
            render: (text) => <strong>{text}</strong>
        },
        {
            title: 'Lavozim',
            dataIndex: 'position',
            key: 'position'
        },
        {
            title: 'Joylashuv',
            dataIndex: 'location',
            key: 'location'
        },
        {
            title: 'Davr',
            key: 'period',
            render: (_, record) => (
                <span>
                    {dayjs(record.startDate).format('MMM YYYY')} - {record.current ? <Tag color="green">Hozir</Tag> : dayjs(record.endDate).format('MMM YYYY')}
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
                title="Ish Tajribasi"
                onAdd={() => handleOpenDrawer()}
                addButtonText="Yangi tajriba"
                onSearch={setSearchText}
                searchPlaceholder="Tajribani qidirish..."
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
                title={editingExperience ? 'Tajribani tahrirlash' : 'Yangi tajriba'}
                loading={createMutation.isPending || updateMutation.isPending}
                form={form}
                onSubmit={handleSubmit}
                isEdit={!!editingExperience}
                width={450}
            >
                <Form.Item name="company" label="Kompaniya" rules={[{ required: true }]}>
                    <Input placeholder="Google" />
                </Form.Item>
                <Form.Item name="position" label="Lavozim" rules={[{ required: true }]}>
                    <Input placeholder="Senior Developer" />
                </Form.Item>
                <Form.Item name="location" label="Joylashuv">
                    <Input placeholder="San Francisco, CA" />
                </Form.Item>
                <Form.Item name="description" label="Tavsif">
                    <TextArea rows={3} placeholder="Ish haqida ma'lumot" />
                </Form.Item>
                <Space className="w-full" size="middle">
                    <Form.Item name="startDate" label="Boshlanish" rules={[{ required: true }]}>
                        <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item name="endDate" label="Tugash">
                        <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>
                </Space>
                <Form.Item name="current" label="Hozirda ishlayapman" valuePropName="checked">
                    <Switch />
                </Form.Item>
                <Form.Item name="specializations" label="Ixtisoslashuvlar (vergul bilan)">
                    <Input placeholder="Korporativ huquq, Mehnat huquqi" />
                </Form.Item>
                <Form.Item name="companyUrl" label="Kompaniya URL">
                    <Input placeholder="https://google.com" />
                </Form.Item>
            </CrudDrawer>
        </>
    )
}

export default ExperiencesPage
