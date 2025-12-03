'use client';
import { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { UserOutlined, FileTextOutlined, StarOutlined, BarChartOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';

const { Sider, Content } = Layout;
const { Title } = Typography;

// 定义菜单项
const menuItems: MenuProps['items'] = [
  {
    key: 'users',
    icon: <UserOutlined />,
    label: '用户管理',
  },
  {
    key: 'contents',
    icon: <FileTextOutlined />,
    label: '内容管理',
  },
  {
    key: 'ratings',
    icon: <StarOutlined />,
    label: '评分管理',
  },
  {
    key: 'stats',
    icon: <BarChartOutlined />,
    label: '统计展示',
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // 获取当前激活的菜单项
  const getActiveKey = () => {
    const parts = pathname.split('/');
    return parts[2] || 'users'; // 默认激活用户管理
  };

  // 处理菜单点击
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    router.push(`/admin/${key}`);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* 侧边栏导航 - PC专用 */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={260}
        theme="light"
        style={{ 
          background: '#fff', 
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 10,
          transition: 'all 0.3s'
        }}
      >
        {/* 侧边栏头部 */}
        <div 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '80px',
              padding: '0 16px',
              transition: 'all 0.3s',
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              borderBottom: 'none'
            }}
          >
            <div 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s'
              }}
            >
              <div 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: collapsed ? 0 : '32px',
                  height: collapsed ? 0 : '32px',
                  borderRadius: '50%',
                  backgroundColor: '#fff',
                  transition: 'all 0.3s',
                  opacity: collapsed ? 0 : 1
                }}
              >
                <StarOutlined 
                  style={{ 
                    color: 'var(--primary)',
                    fontSize: '20px'
                  }} 
                />
              </div>
              
              <Title 
                level={3} 
                style={{ 
                  margin: 0,
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease-in-out',
                  color: '#333',
                  fontSize: collapsed ? '16px' : '24px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {collapsed ? '评分系统' : '评分管理系统'}
              </Title>
            </div>
          </div>
        
        {/* 菜单列表 */}
        <Menu
          mode="inline"
          selectedKeys={[getActiveKey()]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ 
            height: 'calc(100vh - 80px)', 
            borderRight: 0,
            background: '#fff'
          }}
        />
      </Sider>
      
      {/* 主内容区域 */}
      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'all 0.3s' }}>
        <Content 
          style={{ 
            minHeight: '100vh', 
            padding: '24px 32px',
            background: '#f0f2f5',
            transition: 'all 0.3s'
          }}
        >
          {/* 内容容器 */}
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}