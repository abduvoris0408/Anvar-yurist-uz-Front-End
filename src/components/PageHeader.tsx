import { ReactNode } from 'react'
import { Card, Button, Input, Space, Row, Col } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'

const { Search } = Input

interface PageHeaderProps {
    title: string
    onAdd?: () => void
    addButtonText?: string
    onSearch?: (value: string) => void
    searchPlaceholder?: string
    extra?: ReactNode
    children: ReactNode
}

const PageHeader = ({
    title,
    onAdd,
    addButtonText = "Yangi qo'shish",
    onSearch,
    searchPlaceholder = 'Qidirish...',
    extra,
    children,
}: PageHeaderProps) => {
    return (
        <Card
            title={title}
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
