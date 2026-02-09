import { useState, useMemo } from 'react'
import { Table, Form, Input, Select, Slider, Tag, message } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { skillsApi } from '../api'
import { PageHeader, CrudDrawer, ActionButtons } from '../components'
import type { Skill } from '../types'
import type { ColumnsType } from 'antd/es/table'

const SkillsPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
    const [searchText, setSearchText] = useState('')
    const [form] = Form.useForm()
    const queryClient = useQueryClient()

    const { data: skillsData, isLoading } = useQuery({
        queryKey: ['skills'],
        queryFn: () => skillsApi.getAll({ limit: 100 }),
    })

    const filteredData = useMemo(() => {
        if (!searchText) return skillsData?.data || []
        return (skillsData?.data || []).filter((item) =>
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchText.toLowerCase())
        )
    }, [skillsData?.data, searchText])

    const createMutation = useMutation({
        mutationFn: (data: Partial<Skill>) => skillsApi.create(data),
        onSuccess: () => {
            message.success("Ko'nikma yaratildi!")
            queryClient.invalidateQueries({ queryKey: ['skills'] })
            handleCloseDrawer()
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Skill> }) => skillsApi.update(id, data),
        onSuccess: () => {
            message.success("Ko'nikma yangilandi!")
            queryClient.invalidateQueries({ queryKey: ['skills'] })
            handleCloseDrawer()
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => skillsApi.delete(id),
        onSuccess: () => {
            message.success("Ko'nikma o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['skills'] })
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const handleOpenDrawer = (skill?: Skill) => {
        if (skill) {
            setEditingSkill(skill)
            form.setFieldsValue(skill)
        } else {
            setEditingSkill(null)
            form.resetFields()
        }
        setIsDrawerOpen(true)
    }

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false)
        setEditingSkill(null)
        form.resetFields()
    }

    const handleSubmit = async (values: Partial<Skill>) => {
        if (editingSkill) {
            updateMutation.mutate({ id: editingSkill._id, data: values })
        } else {
            createMutation.mutate(values)
        }
    }

    const levelColors = {
        beginner: 'default',
        intermediate: 'blue',
        advanced: 'green',
        expert: 'gold',
    }

    const categoryColors = {
        frontend: 'cyan',
        backend: 'purple',
        database: 'orange',
        devops: 'red',
        design: 'pink',
        other: 'default',
    }

    const columns: ColumnsType<Skill> = [
        {
            title: 'Nomi',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text) => <strong>{text}</strong>
        },
        {
            title: 'Daraja',
            dataIndex: 'level',
            key: 'level',
            filters: [
                { text: 'Beginner', value: 'beginner' },
                { text: 'Intermediate', value: 'intermediate' },
                { text: 'Advanced', value: 'advanced' },
                { text: 'Expert', value: 'expert' },
            ],
            onFilter: (value, record) => record.level === value,
            render: (level) => <Tag color={levelColors[level as keyof typeof levelColors]}>{level}</Tag>,
        },
        {
            title: 'Foiz',
            dataIndex: 'percentage',
            key: 'percentage',
            sorter: (a, b) => a.percentage - b.percentage,
            render: (p) => `${p}%`,
        },
        {
            title: 'Kategoriya',
            dataIndex: 'category',
            key: 'category',
            filters: [
                { text: 'Frontend', value: 'frontend' },
                { text: 'Backend', value: 'backend' },
                { text: 'Database', value: 'database' },
                { text: 'DevOps', value: 'devops' },
                { text: 'Design', value: 'design' },
                { text: 'Boshqa', value: 'other' },
            ],
            onFilter: (value, record) => record.category === value,
            render: (cat) => <Tag color={categoryColors[cat as keyof typeof categoryColors]}>{cat}</Tag>,
        },
        {
            title: 'Tartib',
            dataIndex: 'order',
            key: 'order',
            sorter: (a, b) => (a.order || 0) - (b.order || 0),
        },
        {
            title: 'Amallar',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <ActionButtons
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
                title="Ko'nikmalar"
                onAdd={() => handleOpenDrawer()}
                addButtonText="Yangi ko'nikma"
                onSearch={setSearchText}
                searchPlaceholder="Ko'nikmalarni qidirish..."
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
                title={editingSkill ? "Ko'nikmani tahrirlash" : "Yangi ko'nikma"}
                loading={createMutation.isPending || updateMutation.isPending}
                form={form}
                onSubmit={handleSubmit}
                isEdit={!!editingSkill}
            >
                <Form.Item name="name" label="Nomi" rules={[{ required: true }]}>
                    <Input placeholder="JavaScript" />
                </Form.Item>
                <Form.Item name="level" label="Daraja" rules={[{ required: true }]}>
                    <Select placeholder="Tanlang">
                        <Select.Option value="beginner">Beginner</Select.Option>
                        <Select.Option value="intermediate">Intermediate</Select.Option>
                        <Select.Option value="advanced">Advanced</Select.Option>
                        <Select.Option value="expert">Expert</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="percentage" label="Foiz" initialValue={50}>
                    <Slider min={0} max={100} marks={{ 0: '0%', 50: '50%', 100: '100%' }} />
                </Form.Item>
                <Form.Item name="category" label="Kategoriya" rules={[{ required: true }]}>
                    <Select placeholder="Tanlang">
                        <Select.Option value="frontend">Frontend</Select.Option>
                        <Select.Option value="backend">Backend</Select.Option>
                        <Select.Option value="database">Database</Select.Option>
                        <Select.Option value="devops">DevOps</Select.Option>
                        <Select.Option value="design">Design</Select.Option>
                        <Select.Option value="other">Boshqa</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="icon" label="Icon (URL)">
                    <Input placeholder="https://example.com/icon.svg" />
                </Form.Item>
                <Form.Item name="order" label="Tartib" initialValue={0}>
                    <Input type="number" />
                </Form.Item>
            </CrudDrawer>
        </>
    )
}

export default SkillsPage
