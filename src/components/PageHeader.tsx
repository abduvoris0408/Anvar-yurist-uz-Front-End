import { ReactNode } from 'react'
import { Card, Button, Input, Space, Row, Col, Typography } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'

const { Search } = Input
const { Text } = Typography

interface PageHeaderProps {
    title: string
    subtitle?: string
    onAdd?: () => void
    addButtonText?: string
    onSearch?: (value: string) => void
    searchPlaceholder?: string
    extra?: ReactNode
    children?: ReactNode
}

const PageHeader = ({
    title,
    subtitle,
    onAdd,
    addButtonText = "Yangi qo'shish",
    onSearch,
    searchPlaceholder = 'Qidirish...',
    extra,
    children,
}: PageHeaderProps) => {
    return (
        <Card
            title={
                <div>
                    <span>{title}</span>
                    {subtitle && (
                        <Text style={{ display: 'block', fontSize: 13, fontWeight: 400, color: 'var(--text-muted)', marginTop: 2 }}>
                            {subtitle}
                        </Text>
                    )}
                </div>
            }
            extra={
                <Space>
                    {extra}
                    {onAdd && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                            {addButtonText}
                        </Button>
                    )}
                </Space>
            }
        >
            {onSearch && (
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8}>
                        <Search
                            placeholder={searchPlaceholder}
                            allowClear
                            onSearch={onSearch}
                            onChange={(e) => !e.target.value && onSearch('')}
                            prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
                        />
                    </Col>
                </Row>
            )}
            {children}
        </Card>
    )
}

export default PageHeader
