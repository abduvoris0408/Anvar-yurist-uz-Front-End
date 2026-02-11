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
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
                zIndex: 9999,
            }}>
                <Spin
                    indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}
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
            width: '100%',
            height: '100%',
            minHeight: '200px'
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
