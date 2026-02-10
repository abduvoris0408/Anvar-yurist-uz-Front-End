import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import ErrorBoundary from './components/ErrorBoundary'
import Loading from './components/Loading'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 daqiqa
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: '#1890ff',
                            borderRadius: 6,
                        },
                    }}
                >
                    <BrowserRouter>
                        <Suspense fallback={<Loading isFull />}>
                            <App />
                        </Suspense>
                    </BrowserRouter>
                </ConfigProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    </React.StrictMode>,
)
