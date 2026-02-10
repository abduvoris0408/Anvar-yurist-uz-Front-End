import { useState, useMemo } from 'react'
import { Table, Form, Input, Select, Switch, Tag, message, Drawer, Button, Upload, Image } from 'antd'
import { DeleteOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons'
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

    // Gallery states
    const [galleryDrawerOpen, setGalleryDrawerOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)

    const { data: projectsData, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectsApi.getAll({ limit: 100 }),
    })

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesApi.getAll(),
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
        onError: (error: any) => {
            console.error('Create Project Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => projectsApi.update(id, data),
        onSuccess: () => {
            message.success('Loyiha yangilandi!')
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            handleCloseDrawer()
        },
        onError: (error: any) => {
            console.error('Update Project Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => projectsApi.delete(id),
        onSuccess: () => {
            message.success("Loyiha o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['projects'] })
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const uploadGalleryMutation = useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => {
            const formData = new FormData()
            formData.append('image', file)
            return projectsApi.uploadGallery(id, formData)
        },
        onSuccess: () => {
            message.success('Rasm yuklandi')
            queryClient.invalidateQueries({ queryKey: ['projects'] })
        },
        onError: () => message.error('Rasm yuklashda xatolik'),
    })

    const deleteGalleryMutation = useMutation({
        mutationFn: ({ id, index }: { id: string; index: number }) => projectsApi.deleteGalleryImage(id, index),
        onSuccess: () => {
            message.success('Rasm o\'chirildi')
            queryClient.invalidateQueries({ queryKey: ['projects'] })
        },
        onError: () => message.error('O\'chirishda xatolik'),
    })

    const handleOpenDrawer = (project?: Project) => {
        if (project) {
            setEditingProject(project)
            form.setFieldsValue({
                ...project,
                categoryId: typeof project.category === 'object' ? project.category?.id : project.categoryId,
                // technologies: project.technologies?.join(', '), // Removed for lawyer context
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
            categoryId: values.categoryId,
            // technologies: typeof values.technologies === 'string'
            //     ? values.technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
            //     : values.technologies,
        } as Partial<Project>

        if (editingProject) {
            updateMutation.mutate({ id: editingProject.id, data })
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
            dataIndex: 'isFeatured',
            key: 'isFeatured',
            filters: [
                { text: 'Featured', value: true },
                { text: 'Regular', value: false },
            ],
            onFilter: (value, record) => record.isFeatured === value,
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
                    onView={() => {
                        setSelectedProject(record)
                        setGalleryDrawerOpen(true)
                    }}
                    viewIcon={<PictureOutlined />}
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
                title="Amaliyotlar (Keyslar)"
                onAdd={() => handleOpenDrawer()}
                addButtonText="Yangi amaliyot"
                onSearch={setSearchText}
                searchPlaceholder="Amaliyotlarni qidirish..."
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
                title={editingProject ? 'Amaliyotni tahrirlash' : 'Yangi amaliyot'}
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
                <Form.Item name="categoryId" label="Kategoriya" rules={[{ required: true, message: 'Kategoriyani tanlang' }]}>
                    <Select placeholder="Kategoriya tanlang">
                        {categoriesData?.data?.map((cat) => (
                            <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="image" label="Rasm URL">
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
                <Form.Item name="status" label="Status" initialValue="published">
                    <Select>
                        <Select.Option value="draft">Draft</Select.Option>
                        <Select.Option value="published">Published</Select.Option>
                        <Select.Option value="archived">Archived</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="isFeatured" label="Featured" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </CrudDrawer>

            <Drawer
                title={`${selectedProject?.title} — Galereya`}
                open={galleryDrawerOpen}
                onClose={() => { setGalleryDrawerOpen(false); setSelectedProject(null) }}
                width={600}
            >
                <div className="mb-4">
                    <Upload
                        showUploadList={false}
                        beforeUpload={(file) => {
                            if (selectedProject) {
                                uploadGalleryMutation.mutate({ id: selectedProject.id, file })
                            }
                            return false
                        }}
                        accept="image/*"
                    >
                        <Button icon={<UploadOutlined />} loading={uploadGalleryMutation.isPending}>
                            Rasm qo'shish
                        </Button>
                    </Upload>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {selectedProject?.gallery?.map((url, index) => (
                        <div key={index} className="relative group border rounded-lg overflow-hidden">
                            <Image
                                src={url}
                                alt={`Gallery ${index}`}
                                className="object-cover w-full h-40"
                                width="100%"
                                height={160}
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => {
                                        if (selectedProject) {
                                            deleteGalleryMutation.mutate({ id: selectedProject.id, index })
                                        }
                                    }}
                                    loading={deleteGalleryMutation.isPending}
                                />
                            </div>
                        </div>
                    ))}
                    {(!selectedProject?.gallery || selectedProject.gallery.length === 0) && (
                        <div className="col-span-2 text-center py-8 text-gray-400 border-dashed border-2 rounded-lg">
                            Rasmlar yo'q
                        </div>
                    )}
                </div>
            </Drawer>
        </>
    )
}

export default ProjectsPage
