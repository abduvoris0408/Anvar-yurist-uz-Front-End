import { useState, useMemo } from 'react'
import { Table, Tag, message, Button, Space, Drawer, Descriptions, Popconfirm, Tooltip } from 'antd'
import {
    EyeOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    MailOutlined
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactApi } from '../api'
import { PageHeader } from '../components'
import type { Contact } from '../types'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const ContactsPage = () => {
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [searchText, setSearchText] = useState('')
    const queryClient = useQueryClient()

    const { data: contactsData, isLoading } = useQuery({
        queryKey: ['contacts'],
        queryFn: () => contactApi.getAll(),
    })

    const filteredData = useMemo(() => {
        if (!contactsData?.data) return []
        if (!searchText) return contactsData.data
        const lowerSearch = searchText.toLowerCase()
        return contactsData.data.filter((item) =>
            item.name.toLowerCase().includes(lowerSearch) ||
            item.email.toLowerCase().includes(lowerSearch) ||
            item.subject.toLowerCase().includes(lowerSearch)
        )
    }, [contactsData?.data, searchText])

    const markReadMutation = useMutation({
        mutationFn: (id: string) => contactApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
            if (selectedContact) {
                setSelectedContact(prev => prev ? { ...prev, isRead: true } : null)
            }
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const markRepliedMutation = useMutation({
        mutationFn: (id: string) => contactApi.markAsReplied(id),
        onSuccess: () => {
            message.success('Xabar javob berildi deb belgilandi')
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
            if (selectedContact) {
                setSelectedContact(prev => prev ? { ...prev, isReplied: true } : null)
            }
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => contactApi.delete(id),
        onSuccess: () => {
            message.success('Xabar o\'chirildi')
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
            setIsDrawerOpen(false)
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const handleView = (contact: Contact) => {
        setSelectedContact(contact)
        setIsDrawerOpen(true)
        if (!contact.isRead) {
            markReadMutation.mutate(contact.id)
        }
    }

    const columns: ColumnsType<Contact> = [
        {
            title: 'Ism',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <span className="font-medium">{text}</span>
                    <span className="text-xs text-gray-400">{record.email}</span>
                </Space>
            ),
        },
        {
            title: 'Mavzu',
            dataIndex: 'subject',
            key: 'subject',
            ellipsis: true,
        },
        {
            title: 'Holat',
            key: 'status',
            render: (_, record) => (
                <Space>
                    {record.isRead ? <Tag color="blue">O'qilgan</Tag> : <Tag color="gold">Yangi</Tag>}
                    {record.isReplied && <Tag color="green">Javob berilgan</Tag>}
                </Space>
            ),
        },
        {
            title: 'Sana',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm'),
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
            defaultSortOrder: 'descend',
        },
        {
            title: 'Amallar',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Ko'rish">
                        <Button
                            color="primary"
                            variant="outlined"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="O'chirishni tasdiqlaysizmi?"
                        onConfirm={() => deleteMutation.mutate(record.id)}
                    >
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            loading={deleteMutation.isPending && deleteMutation.variables === record.id}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title="Aloqa Xabarlari"
                subtitle="Foydalanuvchilardan kelgan xabarlar"
                onSearch={setSearchText}
                searchPlaceholder="Ism, email yoki mavzu bo'yicha..."
            >
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                // rowClassName={(record) => !record.isRead ? 'bg-blue-50/10' : ''}
                />
            </PageHeader>

            <Drawer
                title="Xabar tafsilotlari"
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                width={500}
                extra={
                    <Space>
                        {selectedContact && !selectedContact.isReplied && (
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => markRepliedMutation.mutate(selectedContact.id)}
                                loading={markRepliedMutation.isPending}
                            >
                                Javob berildi
                            </Button>
                        )}
                    </Space>
                }
            >
                {selectedContact && (
                    <div className="space-y-6">
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Yuboruvchi">
                                {selectedContact.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                <Space>
                                    <MailOutlined />
                                    <a href={`mailto:${selectedContact.email}`}>{selectedContact.email}</a>
                                </Space>
                            </Descriptions.Item>
                            {selectedContact.phone && (
                                <Descriptions.Item label="Telefon">
                                    {selectedContact.phone}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Sana">
                                {dayjs(selectedContact.createdAt).format('DD MMMM YYYY, HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Space>
                                    {selectedContact.isRead ? <Tag color="blue">O'qilgan</Tag> : <Tag color="gold">Yangi</Tag>}
                                    {selectedContact.isReplied ? <Tag color="green">Javob berilgan</Tag> : <Tag color="default">Javob kutilmoqda</Tag>}
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>

                        <div>
                            <div className="text-gray-500 mb-2 text-xs uppercase tracking-wide font-semibold">Mavzu</div>
                            <div className="text-lg font-medium mb-4">{selectedContact.subject}</div>

                            <div className="text-gray-500 mb-2 text-xs uppercase tracking-wide font-semibold">Xabar</div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 dark:border-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                                {selectedContact.message}
                            </div>
                        </div>

                        {!selectedContact.isReplied && (
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                <Button
                                    type="dashed"
                                    block
                                    icon={<MailOutlined />}
                                    href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                                >
                                    Email orqali javob yozish
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Drawer>
        </>
    )
}

export default ContactsPage
