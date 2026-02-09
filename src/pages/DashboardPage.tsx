import { Card, Row, Col, Typography, Space, Progress, List, Avatar, Tag } from 'antd'
import {
    ProjectOutlined,
    ToolOutlined,
    TeamOutlined,
    MailOutlined,
    ReadOutlined,
    AppstoreOutlined,
    EyeOutlined,
    RocketOutlined,
    TrophyOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { projectsApi, skillsApi, experiencesApi, educationApi, contactApi, categoriesApi } from '../api'
import { useNavigate } from 'react-router-dom'

const { Title, Text, Paragraph } = Typography

const DashboardPage = () => {
    const navigate = useNavigate()

    const { data: projects } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectsApi.getAll({ limit: 5 }),
    })

    const { data: skills } = useQuery({
        queryKey: ['skills'],
        queryFn: () => skillsApi.getAll({ limit: 100 }),
    })

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesApi.getAll({ limit: 100 }),
    })

    const { data: experiences } = useQuery({
        queryKey: ['experiences'],
        queryFn: () => experiencesApi.getAll({ limit: 5 }),
    })

    const { data: education } = useQuery({
        queryKey: ['education'],
        queryFn: () => educationApi.getAll({ limit: 100 }),
    })

    const { data: contactStats } = useQuery({
        queryKey: ['contact-stats'],
        queryFn: () => contactApi.getStats(),
    })

    const stats = [
        {
            title: 'Loyihalar',
            value: projects?.total || 0,
            icon: <ProjectOutlined style={{ fontSize: 22 }} />,
            color: 'var(--primary-color)',
        },
        {
            title: "Ko'nikmalar",
            value: skills?.total || 0,
            icon: <ToolOutlined style={{ fontSize: 22 }} />,
            color: '#10b981',
        },
        {
            title: 'Kategoriyalar',
            value: categories?.total || 0,
            icon: <AppstoreOutlined style={{ fontSize: 22 }} />,
            color: '#8b5cf6',
        },
        {
            title: 'Tajribalar',
            value: experiences?.total || 0,
            icon: <TeamOutlined style={{ fontSize: 22 }} />,
            color: '#f59e0b',
        },
        {
            title: "Ta'lim",
            value: education?.total || 0,
            icon: <ReadOutlined style={{ fontSize: 22 }} />,
            color: '#06b6d4',
        },
        {
            title: "Yangi xabarlar",
            value: contactStats?.data?.unread || 0,
            icon: <MailOutlined style={{ fontSize: 22 }} />,
            color: '#ef4444',
            isAlert: true,
        },
    ]

    const recentProjects = projects?.data?.slice(0, 4) || []
    const topSkills = skills?.data?.sort((a, b) => b.percentage - a.percentage).slice(0, 5) || []

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <Row gutter={[16, 16]}>
                {stats.map((stat, index) => (
                    <Col xs={24} sm={12} lg={8} xl={4} key={index}>
                        <Card
                            className="cursor-pointer"
                            bodyStyle={{ padding: '20px' }}
                            onClick={() => {
                                if (stat.title === 'Loyihalar') navigate('/projects')
                                else if (stat.title === "Ko'nikmalar") navigate('/skills')
                                else if (stat.title === 'Kategoriyalar') navigate('/categories')
                                else if (stat.title === 'Tajribalar') navigate('/experiences')
                                else if (stat.title === "Ta'lim") navigate('/education')
                                else if (stat.title === 'Yangi xabarlar') navigate('/messages')
                            }}
                        >
                            <Space direction="vertical" className="w-full" size={8}>
                                <div className="flex items-center justify-between">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{
                                            backgroundColor: `${stat.color}15`,
                                            color: stat.color,
                                        }}
                                    >
                                        {stat.icon}
                                    </div>
                                    {stat.isAlert && stat.value > 0 && (
                                        <Tag color="error" className="m-0">Yangi</Tag>
                                    )}
                                </div>
                                <div>
                                    <Text style={{ color: 'var(--text-secondary)' }} className="text-xs uppercase tracking-wider font-medium">
                                        {stat.title}
                                    </Text>
                                    <Title level={3} className="!m-0 !mt-1" style={{ color: 'var(--text-primary)' }}>
                                        {stat.value}
                                    </Title>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Content Row */}
            <Row gutter={[16, 16]}>
                {/* Recent Projects */}
                <Col xs={24} lg={14}>
                    <Card
                        title={
                            <Space>
                                <ProjectOutlined style={{ color: 'var(--primary-color)' }} />
                                <span style={{ color: 'var(--text-primary)' }}>So'nggi Loyihalar</span>
                            </Space>
                        }
                        extra={<a onClick={() => navigate('/projects')} style={{ color: 'var(--primary-color)' }}>Barchasi →</a>}
                        className="h-full"
                    >
                        {recentProjects.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={recentProjects}
                                renderItem={(project) => (
                                    <List.Item
                                        className="rounded-lg px-3 transition-colors cursor-pointer"
                                        style={{ borderColor: 'var(--border-color)' }}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    size={44}
                                                    shape="square"
                                                    className="rounded-lg"
                                                    style={{
                                                        backgroundColor: 'var(--primary-light)',
                                                        color: 'var(--primary-color)',
                                                    }}
                                                    icon={<ProjectOutlined />}
                                                    src={project.image}
                                                />
                                            }
                                            title={
                                                <Space>
                                                    <Text strong style={{ color: 'var(--text-primary)' }}>{project.title}</Text>
                                                    {project.featured && <Tag color="gold" icon={<TrophyOutlined />}>Featured</Tag>}
                                                </Space>
                                            }
                                            description={
                                                <Space size={12}>
                                                    <Tag color="blue">
                                                        {typeof project.category === 'object' ? project.category.name : project.category}
                                                    </Tag>
                                                    <Space size={4}>
                                                        <EyeOutlined style={{ color: 'var(--text-muted)' }} />
                                                        <Text style={{ color: 'var(--text-secondary)' }}>{project.views} ko'rish</Text>
                                                    </Space>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <div className="text-center py-8">
                                <ProjectOutlined style={{ fontSize: 40, color: 'var(--text-muted)' }} />
                                <Paragraph style={{ color: 'var(--text-muted)' }} className="mt-3">Hali loyihalar yo'q</Paragraph>
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Top Skills */}
                <Col xs={24} lg={10}>
                    <Card
                        title={
                            <Space>
                                <ToolOutlined style={{ color: '#10b981' }} />
                                <span style={{ color: 'var(--text-primary)' }}>Top Ko'nikmalar</span>
                            </Space>
                        }
                        extra={<a onClick={() => navigate('/skills')} style={{ color: '#10b981' }}>Barchasi →</a>}
                        className="h-full"
                    >
                        {topSkills.length > 0 ? (
                            <Space direction="vertical" className="w-full" size={12}>
                                {topSkills.map((skill, index) => (
                                    <div key={skill._id}>
                                        <div className="flex items-center justify-between mb-2">
                                            <Space>
                                                <div
                                                    className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold"
                                                    style={{
                                                        backgroundColor: 'var(--primary-light)',
                                                        color: 'var(--primary-color)',
                                                    }}
                                                >
                                                    {index + 1}
                                                </div>
                                                <Text strong style={{ color: 'var(--text-primary)' }}>{skill.name}</Text>
                                            </Space>
                                            <Text style={{ color: 'var(--text-secondary)' }} className="font-medium">{skill.percentage}%</Text>
                                        </div>
                                        <Progress
                                            percent={skill.percentage}
                                            showInfo={false}
                                            strokeColor="var(--primary-color)"
                                            trailColor="var(--bg-input)"
                                            size="small"
                                        />
                                    </div>
                                ))}
                            </Space>
                        ) : (
                            <div className="text-center py-8">
                                <ToolOutlined style={{ fontSize: 40, color: 'var(--text-muted)' }} />
                                <Paragraph style={{ color: 'var(--text-muted)' }} className="mt-3">Hali ko'nikmalar yo'q</Paragraph>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Card
                title={
                    <Space>
                        <RocketOutlined style={{ color: 'var(--primary-color)' }} />
                        <span style={{ color: 'var(--text-primary)' }}>Tezkor Havolalar</span>
                    </Space>
                }
            >
                <Row gutter={[12, 12]}>
                    {[
                        { title: 'Yangi Loyiha', icon: <ProjectOutlined />, path: '/projects', color: 'var(--primary-color)' },
                        { title: "Yangi Ko'nikma", icon: <ToolOutlined />, path: '/skills', color: '#10b981' },
                        { title: 'Yangi Tajriba', icon: <TeamOutlined />, path: '/experiences', color: '#f59e0b' },
                        { title: 'Xabarlarni Ko\'rish', icon: <MailOutlined />, path: '/messages', color: '#ef4444' },
                    ].map((action, index) => (
                        <Col xs={12} sm={6} key={index}>
                            <Card
                                className="text-center cursor-pointer"
                                bodyStyle={{ padding: '20px 16px' }}
                                onClick={() => navigate(action.path)}
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                }}
                                hoverable
                            >
                                <div
                                    className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center text-xl"
                                    style={{
                                        backgroundColor: `${action.color}15`,
                                        color: action.color
                                    }}
                                >
                                    {action.icon}
                                </div>
                                <Text strong style={{ color: 'var(--text-primary)' }} className="text-sm">{action.title}</Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>
        </div>
    )
}

export default DashboardPage
