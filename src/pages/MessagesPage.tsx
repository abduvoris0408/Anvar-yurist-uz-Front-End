import { Table, Button, Space, Tag, message, Card, Popconfirm, Drawer, Typography, Badge, Avatar, Row, Col, Statistic, Input, Tooltip, Empty } from 'antd'
import { DeleteOutlined, EyeOutlined, CheckOutlined, MailOutlined, SearchOutlined, PhoneOutlined, CalendarOutlined, InboxOutlined, SendOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactApi } from '../api'
import type { Contact } from '../types'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/uz-latn'

dayjs.extend(relativeTime)
dayjs.locale('uz-latn')

const { Paragraph, Text, Title } = Typography

const MessagesPage = () => {
    const [viewingMessage, setViewingMessage] = useState<Contact | null>(null)
    const [searchText, setSearchText] = useState('')
    const queryClient = useQueryClient()

    const { data: messagesData, isLoading } = useQuery({
        queryKey: ['messages'],
        queryFn: () => contactApi.getAll({ limit: 100 }),
    })

    const { data: statsData } = useQuery({
        queryKey: ['contact-stats'],
        queryFn: () => contactApi.getStats(),
    })

    const markReadMutation = useMutation({
        mutationFn: (id: string) => contactApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] })
            queryClient.invalidateQueries({ queryKey: ['contact-stats'] })
        },
    })

    const markRepliedMutation = useMutation({
        mutationFn: (id: string) => contactApi.markAsReplied(id),
        onSuccess: () => {
            message.success('Javob berilgan deb belgilandi!')
            queryClient.invalidateQueries({ queryKey: ['messages'] })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => contactApi.delete(id),
        onSuccess: () => {
            message.success("Xabar o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['messages'] })
            queryClient.invalidateQueries({ queryKey: ['contact-stats'] })
        },
        onError: () => message.error('Xatolik yuz berdi'),
    })

    const handleView = (msg: Contact) => {
        setViewingMessage(msg)
        if (!msg.isRead) {
            markReadMutation.mutate(msg._id)
        }
    }

    const filteredMessages = messagesData?.data?.filter((msg: Contact) =>
        msg.name.toLowerCase().includes(searchText.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchText.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchText.toLowerCase())
    ) || []

    const columns: ColumnsType<Contact> = [
        {
            title: '',
            key: 'status',
            width: 40,
            render: (_, record) => !record.isRead ? (
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: 'var(--primary-color)' }}
                />
            ) : null,
        },
        {
            title: "Jo'natuvchi",
            key: 'sender',
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Avatar
                        size={36}
                        style={{
                            background: !record.isRead
                                ? 'var(--primary-color)'
                                : 'var(--text-muted)'
                        }}
                    >
                        {record.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                        <Text strong={!record.isRead}>{record.name}</Text>
                        <br />
                        <Text type="secondary" className="text-xs">{record.email}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Mavzu',
            dataIndex: 'subject',
            key: 'subject',
            ellipsis: true,
            render: (text, record) => (
                <Text strong={!record.isRead}>{text}</Text>
            )
        },
        {
            title: 'Status',
            key: 'tags',
            width: 180,
            filters: [
                { text: "O'qilmagan", value: 'unread' },
                { text: "O'qilgan", value: 'read' },
                { text: 'Javob berilgan', value: 'replied' },
            ],
            onFilter: (value, record) => {
                if (value === 'unread') return !record.isRead
                if (value === 'read') return record.isRead && !record.isReplied
                if (value === 'replied') return record.isReplied
                return true
            },
            render: (_, record) => (
                <Space>
                    {record.isRead ? (
                        <Tag color="green">O'qilgan</Tag>
                    ) : (
                        <Tag color="blue">Yangi</Tag>
                    )}
                    {record.isReplied && (
                        <Tag color="purple" icon={<SendOutlined />}>Javob berilgan</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: 'Sana',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 140,
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            render: (date) => (
                <Tooltip title={dayjs(date).format('DD.MM.YYYY HH:mm')}>
                    <Text type="secondary">{dayjs(date).fromNow()}</Text>
                </Tooltip>
            ),
        },
        {
            title: 'Amallar',
            key: 'actions',
            width: 130,
            render: (_, record) => (
                <Space size={4}>
                    <Tooltip title="Ko'rish">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Javob berildi">
                        <Button
                            icon={<CheckOutlined />}
                            size="small"
                            onClick={() => markRepliedMutation.mutate(record._id)}
                            disabled={record.isReplied}
                        />
                    </Tooltip>
                    <Popconfirm title="O'chirishni tasdiqlaysizmi?" onConfirm={() => deleteMutation.mutate(record._id)}>
                        <Tooltip title="O'chirish">
                            <Button icon={<DeleteOutlined />} size="small" danger />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    const stats = [
        { title: 'Jami xabarlar', value: statsData?.data?.total || 0, icon: <InboxOutlined />, color: 'var(--primary-color)' },
        { title: "O'qilmagan", value: statsData?.data?.unread || 0, icon: <MailOutlined />, color: '#3b82f6' },
        { title: 'Javob berilgan', value: statsData?.data?.replied || 0, icon: <SendOutlined />, color: '#10b981' },
    ]

    return (
        <div className="space-y-4">
            {/* Stats Row */}
            <Row gutter={[16, 16]}>
                {stats.map((stat, index) => (
                    <Col xs={24} sm={8} key={index}>
                        <Card bodyStyle={{ padding: 16 }}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                                >
                                    {stat.icon}
                                </div>
                                <Statistic
                                    title={<Text type="secondary" className="text-xs">{stat.title}</Text>}
                                    value={stat.value}
                                    valueStyle={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}
                                />
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Messages Table */}
            <Card
                title={
                    <Space>
                        <MailOutlined />
                        <span>Xabarlar</span>
                        {statsData?.data?.unread ? (
                            <Badge count={statsData.data.unread} style={{ backgroundColor: 'var(--primary-color)' }} />
                        ) : null}
                    </Space>
                }
                extra={
                    <Input
                        placeholder="Qidirish..."
                        prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
                        className="w-56"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                }
            >
                <Table
                    columns={columns}
                    dataSource={filteredMessages}
                    rowKey="_id"
                    loading={isLoading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Jami: ${total}`,
                        showSizeChanger: true,
                    }}
                    size="middle"
                    locale={{
                        emptyText: (
                            <Empty
                                image={<InboxOutlined style={{ fontSize: 48, color: 'var(--text-muted)' }} />}
                                description={<Text type="secondary">Hali xabarlar yo'q</Text>}
                            />
                        )
                    }}
                />
            </Card>

            {/* Message Detail Drawer */}
            <Drawer
                title={
                    <Space>
                        <MailOutlined />
                        <span>{viewingMessage?.subject}</span>
                    </Space>
                }
                open={!!viewingMessage}
                onClose={() => setViewingMessage(null)}
                width={500}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setViewingMessage(null)}>Yopish</Button>
                            <Button
                                type="primary"
                                icon={<MailOutlined />}
                                onClick={() => window.open(`mailto:${viewingMessage?.email}?subject=Re: ${viewingMessage?.subject}`)}
                            >
                                Javob berish
                            </Button>
                        </Space>
                    </div>
                }
            >
                {viewingMessage && (
                    <div className="space-y-4">
                        {/* Sender Info */}
                        <Card bodyStyle={{ padding: 16 }}>
                            <div className="flex items-start gap-3">
                                <Avatar
                                    size={48}
                                    style={{ background: 'var(--primary-color)' }}
                                >
                                    {viewingMessage.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <div className="flex-1">
                                    <Title level={5} className="!m-0">{viewingMessage.name}</Title>
                                    <Space direction="vertical" size={2} className="mt-2">
                                        <Space>
                                            <MailOutlined style={{ color: 'var(--text-muted)' }} />
                                            <Text copyable>{viewingMessage.email}</Text>
                                        </Space>
                                        {viewingMessage.phone && (
                                            <Space>
                                                <PhoneOutlined style={{ color: 'var(--text-muted)' }} />
                                                <Text>{viewingMessage.phone}</Text>
                                            </Space>
                                        )}
                                        <Space>
                                            <CalendarOutlined style={{ color: 'var(--text-muted)' }} />
                                            <Text type="secondary">{dayjs(viewingMessage.createdAt).format('DD.MM.YYYY HH:mm')}</Text>
                                        </Space>
                                    </Space>
                                </div>
                                <Space>
                                    {viewingMessage.isRead ? (
                                        <Tag color="green">O'qilgan</Tag>
                                    ) : (
                                        <Tag color="blue">Yangi</Tag>
                                    )}
                                    {viewingMessage.isReplied && (
                                        <Tag color="purple">Javob berilgan</Tag>
                                    )}
                                </Space>
                            </div>
                        </Card>

                        {/* Message Content */}
                        <div>
                            <Text type="secondary" className="text-xs uppercase">Xabar matni</Text>
                            <Card className="mt-2" bodyStyle={{ padding: 16 }}>
                                <Paragraph className="!m-0 whitespace-pre-wrap">
                                    {viewingMessage.message}
                                </Paragraph>
                            </Card>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    )
}

export default MessagesPage
