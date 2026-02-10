import { useState, useMemo } from 'react'
import { Table, Form, Input, Select, Slider, Tag, message, InputNumber } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { skillsApi, categoriesApi } from '../api'
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

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesApi.getAll(),
    })

    const filteredData = useMemo(() => {
        if (!searchText) return skillsData?.data || []
        return (skillsData?.data || []).filter((item) =>
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            (typeof item.category === 'string' ? item.category : item.category?.name || '')?.toLowerCase().includes(searchText.toLowerCase())
        )
    }, [skillsData?.data, searchText])

    const createMutation = useMutation({
        mutationFn: (data: Partial<Skill>) => skillsApi.create(data),
        onSuccess: () => {
            message.success("Ko'nikma yaratildi!")
            queryClient.invalidateQueries({ queryKey: ['skills'] })
            handleCloseDrawer()
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
            message.success("Ko'nikma yangilandi!")
            queryClient.invalidateQueries({ queryKey: ['skills'] })
            handleCloseDrawer()
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
            message.success("Ko'nikma o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['skills'] })
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const handleOpenDrawer = (skill?: Skill) => {
        if (skill) {
            setEditingSkill(skill)
            form.setFieldsValue({
                ...skill,
                categoryId: typeof skill.category === 'object' ? skill.category?.id : skill.categoryId,
            })
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

    const handleSubmit = async (values: any) => {
        // Backend expects categoryId, not category
        const data = {
            ...values,
            categoryId: values.categoryId,
        }

        if (editingSkill) {
            updateMutation.mutate({ id: editingSkill.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const levelColors = {
        beginner: 'default',
        intermediate: 'blue',
        advanced: 'green',
        expert: 'gold',
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
            filters: categoriesData?.data?.map(cat => ({ text: cat.name, value: cat.name })),
            onFilter: (value, record) => {
                const catName = typeof record.category === 'object' && record.category ? record.category.name : record.category
                return catName === value
            },
            render: (cat) => {
                if (typeof cat === 'object' && cat) {
                    return <Tag color={cat.color}>{cat.name}</Tag>
                }
                return cat ? <Tag>{cat}</Tag> : '-'
            },
        },
        {
            title: 'Icon',
            dataIndex: 'icon',
            key: 'icon',
            render: (icon) => (
                icon ? <img src={icon} alt="icon" style={{ width: 24, height: 24, objectFit: 'contain' }} /> : '-'
            ),
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
                onAdd={() => handleOpenDrawer()}
                addButtonText="Yangi ko'nikma"
                onSearch={setSearchText}
                searchPlaceholder="Ko'nikmalarni qidirish..."
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
                <Form.Item name="categoryId" label="Kategoriya" rules={[{ required: true, message: 'Kategoriyani tanlang' }]}>
                    <Select placeholder="Tanlang">
                        {categoriesData?.data?.map(cat => (
                            <Select.Option key={cat.id} value={cat.id}>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                                    {cat.name}
                                </div>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="icon" label="Icon (URL)" tooltip="SVG yoki PNG rasm havolasi">
                    <Input placeholder="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" />
                </Form.Item>
                <Form.Item name="order" label="Tartib" initialValue={0}>
                    <InputNumber min={0} className="w-full" />
                </Form.Item>
            </CrudDrawer>
        </>
    )
}

export default SkillsPage
