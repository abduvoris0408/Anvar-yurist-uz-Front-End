import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Space, Badge, Drawer } from 'antd'
import {
    DashboardOutlined,
    ProjectOutlined,
    AppstoreOutlined,
    ToolOutlined,
    ReadOutlined,
    TeamOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
    BellOutlined,
    MenuOutlined,
    SunOutlined,
    MoonOutlined,
    AppstoreAddOutlined,
    CustomerServiceOutlined,
    TagsOutlined,
    FileTextOutlined,
    CommentOutlined,
    NotificationOutlined,
    InfoCircleOutlined,
    StarOutlined,
    QuestionCircleOutlined,
    GlobalOutlined,
    PhoneOutlined,
    TrophyOutlined,
    MailOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api'
import { AppBreadcrumb } from '../components'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed')
        return saved ? JSON.parse(saved) : false
    })

    const [mobileOpen, setMobileOpen] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuthStore()
    const { theme: currentTheme, toggleTheme } = useThemeStore()

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed))
    }, [collapsed])

    useEffect(() => {
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark')
        } else {
            document.documentElement.removeAttribute('data-theme')
        }
    }, [currentTheme])

    const { data: dashboardData } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => dashboardApi.getStats(),
    })

    const unreadCount = dashboardData?.data?.alerts?.unreadContacts || 0
    const pendingComments = dashboardData?.data?.alerts?.pendingComments || 0

    const menuItems = [
        { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/about', icon: <InfoCircleOutlined />, label: 'Men haqimda' },
        {
            key: 'content',
            icon: <FileTextOutlined />,
            label: 'Kontent',
            children: [
                { key: '/projects', icon: <ProjectOutlined />, label: 'Loyihalar' },
                { key: '/blog-posts', icon: <FileTextOutlined />, label: 'Blog Postlar' },
                { key: '/news', icon: <NotificationOutlined />, label: 'Yangiliklar' },
                { key: '/testimonials', icon: <StarOutlined />, label: 'Mijoz Fikrlari' },
                { key: '/faqs', icon: <QuestionCircleOutlined />, label: 'FAQ' },
            ],
        },
        { key: '/skills', icon: <ToolOutlined />, label: "Ko'nikmalar" },
        { key: '/services', icon: <CustomerServiceOutlined />, label: 'Xizmatlar' },
        {
            key: 'organize',
            icon: <AppstoreOutlined />,
            label: 'Tashkil etish',
            children: [
                { key: '/categories', icon: <AppstoreOutlined />, label: 'Kategoriyalar' },
                { key: '/tags', icon: <TagsOutlined />, label: 'Teglar' },
                { key: '/partners', icon: <GlobalOutlined />, label: 'Hamkorlar' },
            ],
        },
        { key: '/achievements', icon: <TrophyOutlined />, label: 'Yutuqlar' },
        {
            key: '/blog-comments',
            icon: <Badge count={pendingComments} size="small" offset={[8, 0]}><CommentOutlined /></Badge>,
            label: 'Blog Izohlar',
        },
        { key: '/experiences', icon: <TeamOutlined />, label: 'Tajriba' },
        { key: '/education', icon: <ReadOutlined />, label: "Ta'lim" },
        {
            key: '/consultations',
            icon: <PhoneOutlined />,
            label: 'Maslahat',
        },
        {
            key: '/contacts',
            icon: <MailOutlined />,
            label: 'Xabarlar',
        },

    ]

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profil',
            onClick: () => navigate('/profile'),
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Sozlamalar',
        },
        { type: 'divider' as const },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Chiqish',
            onClick: handleLogout,
            danger: true,
        },
    ]

    // Format date properly
    const formatDate = () => {
        const now = new Date()
        const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
        const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
        return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
    }

    const handleMenuClick = ({ key }: { key: string }) => {
        if (key.startsWith('/')) {
            navigate(key)
            setMobileOpen(false)
        }
    }

    return (
        <Layout className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Desktop Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme={currentTheme === 'dark' ? 'dark' : 'light'}
                width={220}
                collapsedWidth={64}
                className="hidden md:block border-r h-screen sticky top-0"
                style={{
                    background: 'var(--bg-sidebar)',
                    borderColor: 'var(--border-color)'
                }}
            >
                <SidebarContent
                    collapsed={collapsed}
                    mobileOpen={mobileOpen}
                    user={user}
                    location={location}
                    menuItems={menuItems}
                    onMenuClick={handleMenuClick}
                />
            </Sider>

            {/* Mobile Drawer */}
            <Drawer
                placement="left"
                onClose={() => setMobileOpen(false)}
                open={mobileOpen}
                width={220}
                styles={{ body: { padding: 0, background: 'var(--bg-sidebar)' } }}
                closable={false}
            >
                <SidebarContent
                    collapsed={collapsed}
                    mobileOpen={mobileOpen}
                    user={user}
                    location={location}
                    menuItems={menuItems}
                    onMenuClick={handleMenuClick}
                />
            </Drawer>

            <Layout style={{ background: 'transparent' }}>
                <Header
                    style={{
                        background: 'var(--bg-card)',
                        padding: '0 20px',
                        borderBottom: '1px solid var(--border-color)',
                        height: '56px'
                    }}
                    className="flex items-center justify-between sticky top-0 z-10"
                >
                    {/* Left Section */}
                    <Space size="middle">
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => setMobileOpen(true)}
                            className="md:hidden"
                            style={{ color: 'var(--text-primary)' }}
                        />
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden md:flex items-center justify-center p-0"
                            style={{ width: 32, height: 32, color: 'var(--text-secondary)' }}
                        />
                        <div className="hidden md:block">
                            <Text className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                {formatDate()}
                            </Text>
                        </div>
                    </Space>

                    {/* Right Section */}
                    <Space size="small">
                        <Button
                            type="text"
                            icon={currentTheme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
                            onClick={toggleTheme}
                            style={{ width: 32, height: 32, color: 'var(--text-secondary)' }}
                        />

                        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                            <Button
                                type="text"
                                icon={<BellOutlined />}
                                style={{ width: 32, height: 32, color: 'var(--text-secondary)' }}
                                onClick={() => navigate('/messages')}
                            />
                        </Badge>

                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                            <div
                                className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg transition-colors"
                                style={{ background: 'transparent' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <Avatar
                                    size={32}
                                    icon={<UserOutlined />}
                                    src={user?.avatar}
                                    style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}
                                />
                                <div className="hidden md:flex flex-col">
                                    <Text strong className="text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</Text>
                                    <Text className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>Admin</Text>
                                </div>
                            </div>
                        </Dropdown>
                    </Space>
                </Header>

                <Content
                    style={{
                        margin: '16px',
                        padding: 0,
                        minHeight: 280,
                        overflow: 'hidden'
                    }}
                >
                    <AppBreadcrumb />
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    )
}

interface SidebarContentProps {
    collapsed: boolean
    mobileOpen: boolean
    user: any
    location: any
    menuItems: any[]
    onMenuClick: (info: { key: string }) => void
}

const SidebarContent = ({ collapsed, mobileOpen, user, location, menuItems, onMenuClick }: SidebarContentProps) => {
    const { theme: currentTheme } = useThemeStore()

    return (
        <div className="flex flex-col h-full">
            {/* Logo Section */}
            <div
                className="h-14 flex items-center justify-center border-b shrink-0"
                style={{ borderColor: 'var(--border-color)' }}
            >
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: 'var(--primary-color)' }}
                    >
                        <AppstoreAddOutlined />
                    </div>
                    {(!collapsed || mobileOpen) && (
                        <Text strong className="text-base" style={{ color: 'var(--text-primary)' }}>
                            Admin Panel
                        </Text>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 py-3 overflow-y-auto">
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={onMenuClick}
                    className="border-none"
                    style={{ background: 'transparent' }}
                    theme={currentTheme === 'dark' ? 'dark' : 'light'}
                />
            </div>

            {/* User Info at Bottom */}
            {(!collapsed || mobileOpen) && (
                <div className="p-3 border-t shrink-0" style={{ borderColor: 'var(--border-color)' }}>
                    <div
                        className="p-2 rounded-lg flex items-center gap-2"
                        style={{ background: 'var(--bg-input)' }}
                    >
                        <Avatar
                            size={32}
                            icon={<UserOutlined />}
                            src={user?.avatar}
                            style={{
                                backgroundColor: 'var(--primary-light)',
                                color: 'var(--primary-color)',
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <Text strong className="block truncate text-sm" style={{ color: 'var(--text-primary)' }}>
                                {user?.name || 'User'}</Text>
                            <Text className="text-xs truncate block" style={{ color: 'var(--text-muted)' }}>
                                {user?.email || 'admin@portfolio.com'}
                            </Text>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MainLayout
