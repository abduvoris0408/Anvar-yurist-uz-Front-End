import { Card, Row, Col, Typography, Space, Tag, Button, Skeleton, Badge, Alert } from 'antd'
import {
    ProjectOutlined,
    ToolOutlined,
    TeamOutlined,
    AppstoreOutlined,
    ReadOutlined,
    TrophyOutlined,
    CustomerServiceOutlined,
    MessageOutlined,
    CommentOutlined,
    EyeOutlined,
    BookOutlined,
    TagsOutlined,
    UserOutlined,
    QuestionCircleOutlined,
    GlobalOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { dashboardApi } from '../api'
import type { DashboardData } from '../types'

const { Title, Text } = Typography

const DashboardPage = () => {
    const navigate = useNavigate()

    // Dashboard uchun umumiy ma'lumotlarni olish
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const response = await dashboardApi.getStats()
            return response.data
        },
    })

    const counts = dashboardData?.counts || ({} as DashboardData['counts'])
    const alerts = dashboardData?.alerts || ({} as DashboardData['alerts'])
    const recent = dashboardData?.recent || ({} as DashboardData['recent'])
    const popular = dashboardData?.popular || ({} as DashboardData['popular'])

    // Statistika kartalari
    const stats = [
        {
            title: 'Jami Loyihalar',
            value: counts.projects || 0,
            icon: <ProjectOutlined style={{ fontSize: 24 }} />,
            color: '#3b82f6',
            bg: '#dbeafe',
            path: '/projects'
        },
        {
            title: 'Blog Postlar',
            value: counts.blogPosts || 0,
            icon: <ReadOutlined style={{ fontSize: 24 }} />,
            color: '#10b981',
            bg: '#d1fae5',
            path: '/blog-posts'
        },
        {
            title: 'Xizmatlar',
            value: counts.services || 0,
            icon: <CustomerServiceOutlined style={{ fontSize: 24 }} />,
            color: '#8b5cf6',
            bg: '#ede9fe',
            path: '/services'
        },
        {
            title: 'Ko\'nikmalar',
            value: counts.skills || 0,
            icon: <ToolOutlined style={{ fontSize: 24 }} />,
            color: '#f59e0b',
            bg: '#fef3c7',
            path: '/skills'
        },
        {
            title: 'Kategoriyalar',
            value: counts.categories || 0,
            icon: <AppstoreOutlined style={{ fontSize: 24 }} />,
            color: '#ec4899',
            bg: '#fce7f3',
            path: '/categories'
        },
        {
            title: 'Tajriba',
            value: counts.experiences || 0,
            icon: <TeamOutlined style={{ fontSize: 24 }} />,
            color: '#06b6d4',
            bg: '#cffafe',
            path: '/experiences'
        },
        {
            title: 'Ta\'lim',
            value: counts.education || 0,
            icon: <BookOutlined style={{ fontSize: 24 }} />,
            color: '#6366f1',
            bg: '#e0e7ff',
            path: '/education'
        },
        {
            title: 'Teglar',
            value: counts.tags || 0,
            icon: <TagsOutlined style={{ fontSize: 24 }} />,
            color: '#14b8a6',
            bg: '#ccfbf1',
            path: '/tags'
        },
        {
            title: 'Fikr-mulohazalar',
            value: counts.testimonials || 0,
            icon: <MessageOutlined style={{ fontSize: 24 }} />,
            color: '#f97316',
            bg: '#ffedd5',
            path: '/testimonials'
        },
        {
            title: 'FAQ',
            value: counts.faqs || 0,
            icon: <QuestionCircleOutlined style={{ fontSize: 24 }} />,
            color: '#84cc16',
            bg: '#ecfccb',
            path: '/faqs'
        },
        {
            title: 'Hamkorlar',
            value: counts.partners || 0,
            icon: <GlobalOutlined style={{ fontSize: 24 }} />,
            color: '#a855f7',
            bg: '#f3e8ff',
            path: '/partners'
        },
        {
            title: 'Yutuqlar',
            value: counts.achievements || 0,
            icon: <TrophyOutlined style={{ fontSize: 24 }} />,
            color: '#eab308',
            bg: '#fef9c3',
            path: '/achievements'
        },
    ]



    return (
        <div className="space-y-6 pb-8">


            {/* Alerts Section */}
            {(alerts.unreadContacts > 0 || alerts.pendingComments > 0 || alerts.pendingConsultations > 0) && (
                <Row gutter={[16, 16]}>
                    {alerts.unreadContacts > 0 && (
                        <Col xs={24} sm={8}>
                            <Alert
                                message={`${alerts.unreadContacts} ta o'qilmagan xabar`}
                                type="info"
                                showIcon
                                icon={<MessageOutlined />}
                                action={
                                    <Button size="small" type="text" onClick={() => navigate('/contacts')}>
                                        Ko'rish
                                    </Button>
                                }
                            />
                        </Col>
                    )}
                    {alerts.pendingComments > 0 && (
                        <Col xs={24} sm={8}>
                            <Alert
                                message={`${alerts.pendingComments} ta kutilayotgan izoh`}
                                type="warning"
                                showIcon
                                icon={<CommentOutlined />}
                                action={
                                    <Button size="small" type="text" onClick={() => navigate('/comments')}>
                                        Ko'rish
                                    </Button>
                                }
                            />
                        </Col>
                    )}
                    {alerts.pendingConsultations > 0 && (
                        <Col xs={24} sm={8}>
                            <Alert
                                message={`${alerts.pendingConsultations} ta konsultatsiya so'rovi`}
                                type="success"
                                showIcon
                                icon={<CustomerServiceOutlined />}
                                action={
                                    <Button size="small" type="text" onClick={() => navigate('/consultations')}>
                                        Ko'rish
                                    </Button>
                                }
                            />
                        </Col>
                    )}
                </Row>
            )}

            {/* Main Stats Grid */}
            <Row gutter={[16, 16]}>
                {stats.map((stat, index) => (
                    <Col xs={12} sm={8} md={6} lg={4} key={index}>
                        <Card
                            bordered={false}
                            className="h-full hover:shadow-md transition-shadow cursor-pointer border border-slate-100"
                            bodyStyle={{ padding: '16px' }}
                            onClick={() => navigate(stat.path)}
                        >
                            <div className="flex flex-col items-center text-center gap-3">
                                <div
                                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-colors"
                                    style={{
                                        backgroundColor: stat.bg,
                                        color: stat.color,
                                    }}
                                >
                                    {stat.icon}
                                </div>
                                <div>
                                    <Title level={3} className="!m-0 !mb-1 !font-bold">
                                        {isLoading ? <Skeleton.Button active size="small" /> : stat.value}
                                    </Title>
                                    <Text type="secondary" className="text-xs font-medium">
                                        {stat.title}
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[24, 24]}>
                {/* Left Column: Projects & Posts */}
                <Col xs={24} lg={16} className="space-y-6">
                    {/* Popular Projects */}
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <ProjectOutlined className="text-blue-500" />
                                <span>Ommabop Loyihalar</span>
                            </div>
                        }
                        extra={<Button type="link" onClick={() => navigate('/projects')}>Barchasi</Button>}
                        className="shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex overflow-x-auto pb-4 gap-4 -mx-6 px-6 scrollbar-hide">
                            {isLoading ? (
                                Array(3).fill(null).map((_, i) => (
                                    <div key={i} className="min-w-[280px] w-[280px]">
                                        <Skeleton active paragraph={{ rows: 3 }} />
                                    </div>
                                ))
                            ) : popular.projects?.length > 0 ? (
                                popular.projects.map((project: any) => (
                                    <div
                                        key={project.id}
                                        className="min-w-[280px] w-[280px] border border-gray-100 rounded-lg p-4 hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-pointer group flex-shrink-0"
                                        onClick={() => navigate(`/projects`)}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 pr-2">
                                                    <Text strong className="text-base block truncate" title={project.title}>
                                                        {project.title}
                                                    </Text>
                                                </div>
                                                <Tag color={project.status === 'published' ? 'green' : 'orange'} className="m-0 shadow-sm flex-shrink-0">
                                                    {project.status === 'published' ? 'Nashr' : 'Draft'}
                                                </Tag>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <Space size={4}>
                                                    <EyeOutlined />
                                                    <span>{project.views || 0} ko'rish</span>
                                                </Space>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full text-center py-8">
                                    <Text type="secondary">Loyihalar topilmadi</Text>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Recent Blog Posts */}
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <ReadOutlined className="text-green-500" />
                                <span>So'nggi Blog Postlar</span>
                            </div>
                        }
                        extra={<Button type="link" onClick={() => navigate('/blog-posts')}>Barchasi</Button>}
                        className="shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="space-y-3">
                            {isLoading ? (
                                <Skeleton active paragraph={{ rows: 4 }} />
                            ) : recent.posts?.length > 0 ? (
                                recent.posts.map((post: any) => (
                                    <div
                                        key={post.id}
                                        className="border border-gray-100 rounded-lg p-4 hover:border-green-100 hover:bg-green-50/30 transition-all cursor-pointer"
                                        onClick={() => navigate(`/blog-posts`)}
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1">
                                                <Text strong className="text-base block mb-1">
                                                    {post.title}
                                                </Text>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <Space size={4}>
                                                        <EyeOutlined />
                                                        <span>{post.views || 0}</span>
                                                    </Space>
                                                    <span>•</span>
                                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <Tag color={post.status === 'published' ? 'green' : 'orange'}>
                                                {post.status === 'published' ? 'Nashr' : 'Draft'}
                                            </Tag>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Text type="secondary">Blog postlar topilmadi</Text>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>

                {/* Right Column: Contacts & Consultations */}
                <Col xs={24} lg={8} className="space-y-6">
                    {/* Recent Contacts */}
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <MessageOutlined className="text-blue-500" />
                                <span>So'nggi Xabarlar</span>
                                {alerts.unreadContacts > 0 && (
                                    <Badge count={alerts.unreadContacts} />
                                )}
                            </div>
                        }
                        extra={<Button type="link" size="small" onClick={() => navigate('/contacts')}>Ko'rish</Button>}
                        className="border border-slate-100"
                    >
                        {isLoading ? (
                            <Skeleton active paragraph={{ rows: 3 }} />
                        ) : recent.contacts?.length > 0 ? (
                            <div className="space-y-3">
                                {recent.contacts.slice(0, 5).map((contact: any) => (
                                    <div
                                        key={contact.id}
                                        className="border-b border-gray-100 pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-2 rounded transition-colors"
                                        onClick={() => navigate('/contacts')}
                                    >
                                        <div className="flex items-start gap-2">
                                            <UserOutlined className="text-gray-400 mt-1" />
                                            <div className="flex-1 min-w-0">
                                                <Text strong className="block truncate text-sm">
                                                    {contact.name}
                                                </Text>
                                                <Text type="secondary" className="text-xs block truncate">
                                                    {contact.message}
                                                </Text>
                                                <Text type="secondary" className="text-xs">
                                                    {new Date(contact.createdAt).toLocaleDateString()}
                                                </Text>
                                            </div>
                                            {!contact.isRead && (
                                                <Badge status="processing" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Text type="secondary">Xabarlar yo'q</Text>
                            </div>
                        )}
                    </Card>

                    {/* Recent Consultations */}
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <CustomerServiceOutlined className="text-purple-500" />
                                <span>Konsultatsiyalar</span>
                                {alerts.pendingConsultations > 0 && (
                                    <Badge count={alerts.pendingConsultations} />
                                )}
                            </div>
                        }
                        extra={<Button type="link" size="small" onClick={() => navigate('/consultations')}>Ko'rish</Button>}
                        className="border border-slate-100"
                    >
                        {isLoading ? (
                            <Skeleton active paragraph={{ rows: 3 }} />
                        ) : recent.consultations?.length > 0 ? (
                            <div className="space-y-3">
                                {recent.consultations.slice(0, 5).map((consultation: any) => (
                                    <div
                                        key={consultation.id}
                                        className="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                                    >
                                        <Text strong className="block text-sm">
                                            {consultation.name}
                                        </Text>
                                        <Text type="secondary" className="text-xs">
                                            {consultation.service} - {new Date(consultation.createdAt).toLocaleDateString()}
                                        </Text>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Text type="secondary">Konsultatsiyalar yo'q</Text>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions - Eng pastda */}
            <Card
                title={<span className="font-semibold text-lg">Tezkor Amallar</span>}
                bordered={false}
                className="border border-slate-100"
            >
                <Row gutter={[16, 16]}>
                    <Col xs={12} sm={8} md={6} lg={4}>
                        <Button
                            block
                            size="large"
                            type="dashed"
                            icon={<ProjectOutlined />}
                            className="h-24 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors"
                            onClick={() => navigate('/projects')}
                        >
                            Loyiha qo'shish
                        </Button>
                    </Col>
                    <Col xs={12} sm={8} md={6} lg={4}>
                        <Button
                            block
                            size="large"
                            type="dashed"
                            icon={<ReadOutlined />}
                            className="h-24 flex flex-col items-center justify-center gap-2 hover:border-green-500 hover:text-green-500 transition-colors"
                            onClick={() => navigate('/blog-posts')}
                        >
                            Blog yozish
                        </Button>
                    </Col>
                    <Col xs={12} sm={8} md={6} lg={4}>
                        <Button
                            block
                            size="large"
                            type="dashed"
                            icon={<ToolOutlined />}
                            className="h-24 flex flex-col items-center justify-center gap-2 hover:border-purple-500 hover:text-purple-500 transition-colors"
                            onClick={() => navigate('/skills')}
                        >
                            Ko'nikma
                        </Button>
                    </Col>
                    <Col xs={12} sm={8} md={6} lg={4}>
                        <Button
                            block
                            size="large"
                            type="dashed"
                            icon={<TrophyOutlined />}
                            className="h-24 flex flex-col items-center justify-center gap-2 hover:border-yellow-500 hover:text-yellow-500 transition-colors"
                            onClick={() => navigate('/achievements')}
                        >
                            Yutuq
                        </Button>
                    </Col>
                    <Col xs={12} sm={8} md={6} lg={4}>
                        <Button
                            block
                            size="large"
                            type="dashed"
                            icon={<CustomerServiceOutlined />}
                            className="h-24 flex flex-col items-center justify-center gap-2 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
                            onClick={() => navigate('/services')}
                        >
                            Xizmat
                        </Button>
                    </Col>
                    <Col xs={12} sm={8} md={6} lg={4}>
                        <Button
                            block
                            size="large"
                            type="dashed"
                            icon={<AppstoreOutlined />}
                            className="h-24 flex flex-col items-center justify-center gap-2 hover:border-pink-500 hover:text-pink-500 transition-colors"
                            onClick={() => navigate('/categories')}
                        >
                            Kategoriya
                        </Button>
                    </Col>
                </Row>
            </Card>
        </div>
    )
}

export default DashboardPage