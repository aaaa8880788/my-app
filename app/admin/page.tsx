'use client';
import { useState, useEffect } from 'react';
import { Layout, Menu, Typography, message, Avatar, Dropdown, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { UserOutlined, FileTextOutlined, StarOutlined, BarChartOutlined, LogoutOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';
import { authAPI } from '@/app/utils/admin/adminApi';

// 导入菜单内容组件
import UsersPage from '@/app/admin/home/userManagement/UsersPage';
import WorksPage from '@/app/admin/home/workManagement/WorksPage';
import RatingsPage from '@/app/admin/home/ratingManagement/RatingsPage';
import RatingDimensionsPage from '@/app/admin/home/ratingDimension/RatingDimensionsPage';
import DataStatisticsPage from '@/app/admin/home/dataStatistic/DataStatisticsPage';

const { Sider, Content, Header } = Layout;
const { Title } = Typography;

// 定义菜单项
const menuItems: MenuProps['items'] = [
  { key: 'users', icon: <UserOutlined />, label: '用户管理', },
  { key: 'works', icon: <FileTextOutlined />, label: '作品管理', },
  { key: 'ratings', icon: <StarOutlined />, label: '评分管理', },
  { key: 'rating-dimensions', icon: <BarChartOutlined />, label: '评分维度', },
  { key: 'statistics', icon: <BarChartOutlined />, label: '数据统计', },
];

export default function AdminPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [selectedMenuKey, setSelectedMenuKey] = useState('users'); // 默认选中用户管理
  const pathname = usePathname();
  const router = useRouter();

  // 登录状态检查和用户信息获取
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const userInfoStr = localStorage.getItem('userInfo');

      // 如果不是登录页面且未登录，重定向到登录页面
      if (pathname !== '/admin/login' && !token) {
        router.push('/admin/login');
      } else {
        if (userInfoStr) {
          try {
            const userInfo = JSON.parse(userInfoStr);
            setUsername(userInfo.username);
          } catch (error) {
            console.error('解析用户信息失败:', error);
          }
        }
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, [pathname, router]);

  // 处理菜单点击 - 不再路由跳转，只更新选中状态
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    setSelectedMenuKey(key);
  };

  // 根据选中的菜单键渲染对应的组件
  const renderContent = () => {
    switch (selectedMenuKey) {
      case 'users':
        return <UsersPage />;
      case 'works':
        return <WorksPage />;
      case 'ratings':
        return <RatingsPage />;
      case 'rating-dimensions':
        return <RatingDimensionsPage />;
      case 'statistics':
        return <DataStatisticsPage />;
      default:
        return <UsersPage />;
    }
  };

  // 处理登出
  const handleLogout = async () => {
    try {
      // 调用退出登录API
      await authAPI.logout();

      // 清除本地存储的token和用户信息
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');

      message.success('登出成功！');
      router.push('/admin/login');
    } catch (error) {
      console.error('登出失败:', error);
      // 即使API调用失败，也清除本地数据并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      router.push('/admin/login');
    }
  };

  // 用户下拉菜单项
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      label: (
        <div onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <LogoutOutlined /> 退出登录
        </div>
      ),
    },
  ];

  // 如果正在检查登录状态，不渲染内容
  if (loading) {
    return null;
  }

  return (
    <ConfigProvider locale={zhCN}>
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
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100px',
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
            selectedKeys={[selectedMenuKey]}
            onClick={handleMenuClick}
            items={menuItems}
            style={{
              height: 'calc(100vh - 100px)',
              borderRight: 0,
              background: '#fff'
            }}
          />
        </Sider>

        {/* 主内容区域 */}
        <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'all 0.3s' }}>
          {/* 顶部导航栏 */}
          <Header style={{
            padding: '0 24px',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            zIndex: 5
          }}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px' }}>
                <Avatar icon={<UserOutlined />} size="small" />
                <span style={{ fontSize: '14px', color: '#333' }}>{username}</span>
              </div>
            </Dropdown>
          </Header>

          <Content
            style={{
              padding: '12px 16px',
              background: '#f0f2f5',
              transition: 'all 0.3s',
              height: 'calc(100vh - 164px)',
              overflow: 'auto'
            }}
          >
            {/* 内容容器 */}
            <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: '8px', padding: '12px 20px', overflow: 'auto' }}>
              {renderContent()}
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}