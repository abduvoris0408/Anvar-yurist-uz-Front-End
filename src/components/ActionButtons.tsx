import { Button, Tooltip, Popconfirm, Space } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'

interface ActionButtonsProps {
    onEdit?: () => void
    onDelete?: () => void
    onView?: () => void
    viewIcon?: React.ReactNode
    deleteLoading?: boolean
    deleteTitle?: string
    size?: 'small' | 'middle' | 'large'
}

const ActionButtons = ({
    onEdit,
    onDelete,
    onView,
    viewIcon,
    deleteLoading = false,
    deleteTitle = "O'chirishni tasdiqlaysizmi?",
    size = 'small',
}: ActionButtonsProps) => {
    return (
        <Space size={4}>
            {onView && (
                <Tooltip title="Ko'rish">
                    <Button
                        icon={viewIcon || <EyeOutlined />}
                        size={size}
                        onClick={onView}
                    />
                </Tooltip>
            )}
            {onEdit && (
                <Tooltip title="Tahrirlash">
                    <Button
                        icon={<EditOutlined />}
                        size={size}
                        onClick={onEdit}
                    />
                </Tooltip>
            )}
            {onDelete && (
                <Popconfirm
                    title={deleteTitle}
                    onConfirm={onDelete}
                    okText="Ha"
                    cancelText="Yo'q"
                    okButtonProps={{ danger: true, loading: deleteLoading }}
                >
                    <Tooltip title="O'chirish">
                        <Button
                            icon={<DeleteOutlined />}
                            size={size}
                            danger
                        />
                    </Tooltip>
                </Popconfirm>
            )}
        </Space>
    )
}

export default ActionButtons
