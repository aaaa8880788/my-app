'use client';
import { useState, useEffect } from 'react';
import { Layout, Menu, Button } from 'antd';
import { UserOutlined, FileTextOutlined, StarOutlined, BarChartOutlined, MenuOutlined } from '@ant-design/icons';
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
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  // 监听窗口大小变化，在小屏幕上自动收起侧边栏
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    
    // 初始化
    handleResize();
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    // 清理函数
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
      {/* 移动端菜单按钮 */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setMobileMenuVisible(!mobileMenuVisible)}
          size="large"
          style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        />
      </div>
      
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={240}
        theme="light"
        breakpoint="lg"
        collapsedWidth="80"
        style={{ transition: 'all 0.3s' }}
        className={mobileMenuVisible ? 'block' : 'hidden md:block'}
      >
        <div className={`flex items-center justify-center h-16 border-b transition-all duration-300 ${collapsed ? 'justify-center' : 'justify-center'}`}>
          <h1 className={`font-bold transition-all duration-300 ${collapsed ? 'text-lg' : 'text-xl'}`}>
            {collapsed ? '管理' : '管理系统'}
          </h1>
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
        <Content className="p-4 sm:p-6 lg:p-8 transition-all duration-300">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}