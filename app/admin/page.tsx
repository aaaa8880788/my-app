'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function AdminHomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // 默认跳转到用户管理页面
    router.push('/admin/users');
  }, [router]);
  
  return (
    <div className="welcome-page">
      <Card>
        <Typography>
          <Title level={2}>欢迎使用评分系统管理后台</Title>
          <Paragraph>正在跳转到用户管理页面...</Paragraph>
        </Typography>
      </Card>
    </div>
  );
}