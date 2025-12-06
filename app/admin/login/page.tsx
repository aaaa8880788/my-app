'use client';
import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { FormInstance } from 'antd';
import { authAPI } from '@/app/utils/admin/adminApi';

const { Title } = Typography;

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LoginFormData>();
  const router = useRouter();

  // 处理登录提交
  const handleLogin = async (values: LoginFormData) => {
    setLoading(true);
    try {
      // 调用真实的登录API
      const response: Record<string, any> = await authAPI.login(values.username, values.password);
      if (response.success && response.data) {
        // 保存token和用户信息到本地存储（仅在浏览器环境中执行）
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userInfo', JSON.stringify({
            id: response.data.id,
            username: response.data.username,
            createdAt: response.data.createdAt
          }));
        }
        message.success('登录成功！');
        router.push('/admin');
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error) {
      message.error('登录失败，请稍后重试');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      background: '#f0f2f5',
      padding: '24px'
    }}>
      <Card 
        style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ marginBottom: '8px', color: '#333' }}>
            评分管理系统
          </Title>
          <p style={{ color: '#666', margin: 0 }}>请登录您的账号</p>
        </div>
        
        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            initialValue="admin"
            rules={[{ required: true, message: '请输入用户名' }]}
            style={{ marginBottom: '24px' }}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
              style={{ height: '48px' }}
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            initialValue="123456"
            rules={[{ required: true, message: '请输入密码' }]}
            style={{ marginBottom: '24px' }}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
              style={{ height: '48px' }}
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: '24px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ height: '48px', borderRadius: '4px', fontSize: '16px' }}
            >
              登录
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center', color: '#999' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>用户名：admin | 密码：123456</p>
          </div>
        </Form>
      </Card>
    </div>
  );
}