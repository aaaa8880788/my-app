'use client';
import { useState } from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, FileTextOutlined, StarOutlined, BarChartOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';

const { Sider, Content } = Layout;

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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={240}
        theme="light"
      >
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-xl font-bold">管理系统</h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getActiveKey()]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ height: 'calc(100vh - 4rem)', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Content className="p-6">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}