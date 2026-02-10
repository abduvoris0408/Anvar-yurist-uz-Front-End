import { Component, ErrorInfo, ReactNode } from 'react'
import { Button, Result } from 'antd'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-primary, #f5f5f5)',
                }}>
                    <Result
                        status="error"
                        title="Kutilmagan xato yuz berdi"
                        subTitle={this.state.error?.message || "Nimadir noto'g'ri ketdi. Iltimos, qayta urinib ko'ring."}
                        extra={[
                            <Button type="primary" key="home" onClick={this.handleReset}>
                                Bosh sahifaga qaytish
                            </Button>,
                            <Button key="reload" onClick={() => window.location.reload()}>
                                Sahifani yangilash
                            </Button>,
                        ]}
                    />
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
