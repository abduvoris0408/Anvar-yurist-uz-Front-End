import { Breadcrumb as AntBreadcrumb } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'

const routeLabels: Record<string, string> = {
    '': 'Dashboard',
    'projects': 'Loyihalar',
    'skills': "Ko'nikmalar",
    'categories': 'Kategoriyalar',
    'experiences': 'Tajriba',
    'education': "Ta'lim",
    'messages': 'Xabarlar',
    'profile': 'Profil',
}

const AppBreadcrumb = () => {
    const location = useLocation()
    const pathSnippets = location.pathname.split('/').filter(i => i)

    const items = [
        {
            title: (
                <Link to="/">
                    <HomeOutlined />
                </Link>
            ),
        },
        ...pathSnippets.map((snippet, index) => {
            const url = `/${pathSnippets.slice(0, index + 1).join('/')}`
            const label = routeLabels[snippet] || snippet
            const isLast = index === pathSnippets.length - 1

            return {
                title: isLast ? (
                    <span>{label}</span>
                ) : (
                    <Link to={url}>{label}</Link>
                ),
            }
        }),
    ]

    if (pathSnippets.length === 0) return null

    return (
        <AntBreadcrumb
            items={items}
            className="mb-4"
            style={{
                fontSize: '13px',
            }}
        />
    )
}

export default AppBreadcrumb
