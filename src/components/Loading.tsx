import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

interface LoadingProps {
    isFull?: boolean
    tip?: string
}

const Loading = ({ isFull = false, tip = 'Yuklanmoqda...' }: LoadingProps) => {
    if (isFull) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary, #f5f5f5)',
            }}>
                <Spin
                    indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />}
                    tip={tip}
                    size="large"
                >
                    <div style={{ padding: 50 }} />
                </Spin>
            </div>
        )
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 0',
        }}>
            <Spin
                indicator={<LoadingOutlined style={{ fontSize: 28 }} spin />}
                tip={tip}
            >
                <div style={{ padding: 40 }} />
            </Spin>
        </div>
    )
}

export default Loading
