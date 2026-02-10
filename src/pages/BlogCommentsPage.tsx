import { Table, Space, Tag, message, Card, Button, Popconfirm, Typography } from 'antd'
import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blogApi } from '../api'
import { PageHeader } from '../components'
import type { BlogComment } from '../types'
import dayjs from 'dayjs'

const { Text } = Typography

const BlogCommentsPage = () => {
    const queryClient = useQueryClient()

    const { data: commentsData, isLoading } = useQuery({
        queryKey: ['blog-comments'],
        queryFn: () => blogApi.getAllComments(),
    })

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => blogApi.updateCommentStatus(id, status),
        onSuccess: () => {
            message.success('Status yangilandi!')
            queryClient.invalidateQueries({ queryKey: ['blog-comments'] })
        },
        onError: (error: any) => {
            console.error('Update Comment Status Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => blogApi.deleteComment(id),
        onSuccess: () => {
            message.success("Izoh o'chirildi!")
            queryClient.invalidateQueries({ queryKey: ['blog-comments'] })
        },
        onError: (error: any) => {
            console.error('Delete Comment Error:', error)
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Noma\'lum xatolik'
            message.error(errMsg)
        },
    })

    const statusColors: Record<string, string> = {
        pending: 'orange',
        approved: 'green',
        rejected: 'red',
    }

    const statusLabels: Record<string, string> = {
        pending: 'Kutilmoqda',
        approved: 'Tasdiqlangan',
        rejected: 'Rad etilgan',
    }

    const columns = [
        {
            title: 'Muallif',
            key: 'author',
            width: 160,
            render: (_: unknown, record: BlogComment) => (
                <div>
                    <Text strong style={{ color: 'var(--text-primary)' }}>{record.guestName}</Text>
                    <br />
                    <Text style={{ fontSize: 12, color: 'var(--text-muted)' }}>{record.guestEmail}</Text>
                </div>
            ),
        },
        {
            title: 'Izoh',
            dataIndex: 'content',
            key: 'content',
            ellipsis: true,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            render: (status: string) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>,
        },
        {
            title: 'Sana',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
        },
        {
            title: 'Amallar',
            key: 'actions',
            width: 160,
            render: (_: unknown, record: BlogComment) => (
                <Space>
                    {record.status !== 'approved' && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={() => statusMutation.mutate({ id: record.id, status: 'approved' })}
                            title="Tasdiqlash"
                            style={{ background: '#10b981' }}
                        />
                    )}
                    {record.status !== 'rejected' && (
                        <Button
                            size="small"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => statusMutation.mutate({ id: record.id, status: 'rejected' })}
                            title="Rad etish"
                        />
                    )}
                    <Popconfirm title="O'chirishni tasdiqlaysizmi?" onConfirm={() => deleteMutation.mutate(record.id)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div className="space-y-4">
            <PageHeader
                title="Blog Izohlar"
                subtitle="Izohlarni moderatsiya qilish"
            />

            <Card>
                <Table
                    columns={columns}
                    dataSource={commentsData?.data || []}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 15 }}
                />
            </Card>
        </div>
    )
}

export default BlogCommentsPage
