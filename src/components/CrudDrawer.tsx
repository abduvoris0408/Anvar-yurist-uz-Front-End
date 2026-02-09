import { ReactNode } from 'react'
import { Drawer, Button, Form } from 'antd'
import type { FormInstance } from 'antd'

interface CrudDrawerProps {
    open: boolean
    onClose: () => void
    title: string
    loading?: boolean
    form: FormInstance
    onSubmit: (values: any) => void
    children: ReactNode
    width?: number
    submitText?: string
    isEdit?: boolean
}

const CrudDrawer = ({
    open,
    onClose,
    title,
    loading = false,
    form,
    onSubmit,
    children,
    width = 420,
    submitText,
    isEdit = false,
}: CrudDrawerProps) => {
    const handleSubmit = () => {
        form.validateFields().then((values) => {
            onSubmit(values)
        })
    }

    return (
        <Drawer
            title={
                <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {title}
                </span>
            }
            placement="right"
            onClose={onClose}
            open={open}
            width={width}
            destroyOnClose
            styles={{
                body: {
                    padding: '20px',
                    paddingBottom: 80,
                    background: 'var(--bg-card)'
                },
                header: {
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    background: 'var(--bg-card)'
                },
                content: { background: 'var(--bg-card)' },
                footer: {
                    padding: '12px 20px',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-card)'
                }
            }}
            footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button onClick={onClose}>Bekor qilish</Button>
                    <Button type="primary" onClick={handleSubmit} loading={loading}>
                        {submitText || (isEdit ? 'Yangilash' : 'Yaratish')}
                    </Button>
                </div>
            }
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
                requiredMark={false}
            >
                {children}
            </Form>
        </Drawer>
    )
}

export default CrudDrawer
