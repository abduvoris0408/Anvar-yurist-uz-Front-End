import { useState, useMemo } from 'react'
import { Table, Form, Input, Select, Switch, Tag, message } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi, categoriesApi } from '../api'
import { PageHeader, CrudDrawer, ActionButtons } from '../components'
import type { Project, Category } from '../types'
import type { ColumnsType } from 'antd/es/table'

const { TextArea } = Input

const ProjectsPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [searchText, setSearchText] = useState('')
    const [form] = Form.useForm()
    const queryClient = useQueryClient()

    const { data: projectsData, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectsApi.getAll({ limit: 100 }),
    })

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesApi.getAll({ limit: 100 }),
    })

    const filteredData = useMemo(() => {
        if (!searchText) return projectsData?.data || []
        return (projectsData?.data || []).filter((item) =>
            item.title.toLowerCase().includes(searchText.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchText.toLowerCase())
        )
    }, [projectsData?.data, searchText])

    const createMutation = useMutation({
        mutationFn: (data: Partial<Project>) => projectsApi.create(data),
        onSuccess: () => {
            message.success('Loyiha yaratildi!')
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            handleCloseDrawer()
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => projectsApi.update(id, data),
        onSuccess: () => {
            message.success('Loyiha yangilandi!')
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            handleCloseDrawer()
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => projectsApi.delete(id),
        onSuccess: () => {
            message.success("Loyiha o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['projects'] })
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const handleOpenDrawer = (project?: Project) => {
        if (project) {
            setEditingProject(project)
            form.setFieldsValue({
                ...project,
                category: typeof project.category === 'object' ? project.category._id : project.category,
                technologies: project.technologies?.join(', '),
            })
        } else {
            setEditingProject(null)
            form.resetFields()
        }
        setIsDrawerOpen(true)
    }

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false)
        setEditingProject(null)
        form.resetFields()
    }

    const handleSubmit = async (values: Record<string, unknown>) => {
        const data = {
            ...values,
            technologies: typeof values.technologies === 'string'
                ? values.technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
                : values.technologies,
        } as Partial<Project>

        if (editingProject) {
            updateMutation.mutate({ id: editingProject._id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const columns: ColumnsType<Project> = [
        {
            title: 'Nomi',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => a.title.localeCompare(b.title),
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: 'Kategoriya',
            dataIndex: 'category',
            key: 'category',
            render: (cat: Category | string) => (
                <Tag color="blue">{typeof cat === 'object' ? cat.name : cat}</Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Published', value: 'published' },
                { text: 'Draft', value: 'draft' },
                { text: 'Archived', value: 'archived' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Tag color={status === 'published' ? 'green' : status === 'draft' ? 'orange' : 'default'}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Featured',
            dataIndex: 'featured',
            key: 'featured',
            filters: [
                { text: 'Featured', value: true },
                { text: 'Regular', value: false },
            ],
            onFilter: (value, record) => record.featured === value,
            render: (featured) => (featured ? <Tag color="gold">Featured</Tag> : '-'),
        },
        {
            title: "Ko'rishlar",
            dataIndex: 'views',
            key: 'views',
            sorter: (a, b) => (a.views || 0) - (b.views || 0),
        },
        {
            title: 'Amallar',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <ActionButtons
                    onView={record.liveUrl ? () => window.open(record.liveUrl, '_blank') : undefined}
                    onEdit={() => handleOpenDrawer(record)}
                    onDelete={() => deleteMutation.mutate(record._id)}
                    deleteLoading={deleteMutation.isPending}
                />
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title="Loyihalar"
                onAdd={() => handleOpenDrawer()}
                addButtonText="Yangi loyiha"
                onSearch={setSearchText}
                searchPlaceholder="Loyihalarni qidirish..."
            >
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="_id"
                    loading={isLoading}
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Jami: ${total}` }}
                    size="middle"
                />
            </PageHeader>

            <CrudDrawer
                open={isDrawerOpen}
                onClose={handleCloseDrawer}
                title={editingProject ? 'Loyihani tahrirlash' : 'Yangi loyiha'}
                loading={createMutation.isPending || updateMutation.isPending}
                form={form}
                onSubmit={handleSubmit}
                isEdit={!!editingProject}
                width={500}
            >
                <Form.Item name="title" label="Nomi" rules={[{ required: true }]}>
                    <Input placeholder="Loyiha nomi" />
                </Form.Item>
                <Form.Item name="description" label="Tavsif" rules={[{ required: true }]}>
                    <TextArea rows={3} placeholder="Loyiha tavsifi" />
                </Form.Item>
                <Form.Item name="category" label="Kategoriya" rules={[{ required: true }]}>
                    <Select placeholder="Kategoriya tanlang">
                        {categoriesData?.data?.map((cat) => (
                            <Select.Option key={cat._id} value={cat._id}>{cat.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="technologies" label="Texnologiyalar (vergul bilan)">
                    <Input placeholder="React, Node.js, MongoDB" />
                </Form.Item>
                <Form.Item name="liveUrl" label="Live URL">
                    <Input placeholder="https://example.com" />
                </Form.Item>
                <Form.Item name="githubUrl" label="GitHub URL">
                    <Input placeholder="https://github.com/user/repo" />
                </Form.Item>
                <Form.Item name="status" label="Status" initialValue="published">
                    <Select>
                        <Select.Option value="draft">Draft</Select.Option>
                        <Select.Option value="published">Published</Select.Option>
                        <Select.Option value="archived">Archived</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="featured" label="Featured" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </CrudDrawer>
        </>
    )
}

export default ProjectsPage
