'use client';
import { useState, useEffect } from 'react';
import { Tabs, Card } from 'antd';
import { useRouter } from 'next/navigation';
import type { TabsProps } from 'antd';
import { BarChartOutlined, PieChartOutlined } from '@ant-design/icons';

export default function FrontHomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('1');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '开始评分',
      icon: <BarChartOutlined />,
      children: (
        <Card className="p-8 card fade-in" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div className="text-center py-8">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-light text-primary">
              <BarChartOutlined style={{ fontSize: '36px' }} />
            </div>
            <h2 className="title title-3 mb-4 text-text-primary">开始您的评分</h2>
            <p className="mb-8 text-text-secondary max-w-md mx-auto">
              我们重视您的反馈，请花费几分钟时间完成评分，帮助我们持续改进服务质量
            </p>
            <button
              className="btn btn-primary text-lg px-10 py-3 font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
              onClick={() => router.push('/front/rate')}
              style={{ borderRadius: '8px', boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)', cursor: 'pointer' }}
            >
              开始评分
            </button>
          </div>
        </Card>
      ),
    },
    {
      key: '2',
      label: '评分统计',
      icon: <PieChartOutlined />,
      children: (
        <Card className="p-8 card fade-in" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div className="text-center py-8">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-light text-primary">
              <PieChartOutlined style={{ fontSize: '36px' }} />
            </div>
            <h2 className="title title-3 mb-4 text-text-primary">查看评分统计</h2>
            <p className="mb-8 text-text-secondary max-w-md mx-auto">
              查看所有评分项目的统计数据和分析结果，了解整体情况
            </p>
            <button
              className="btn btn-primary text-lg px-10 py-3 font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
              onClick={() => router.push('/front/stats')}
              style={{ borderRadius: '8px', boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)', cursor: 'pointer' }}
            >
              查看统计
            </button>
          </div>
        </Card>
      ),
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light/30 to-background py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-12">
          <h1 className="title title-1 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            评分系统
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto">
            一个简单、高效的评分反馈平台，帮助您收集和分析用户评价
          </p>
        </div>
        
        <div className="shadow-lg rounded-xl overflow-hidden bg-white dark:bg-gray-800">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={items}
            className="w-full"
            tabBarStyle={{
              padding: '0 24px',
              borderBottom: '1px solid var(--border)',
            }}
            tabBarItemStyle={{
              padding: '16px 0',
              margin: '0 16px',
              fontSize: '16px',
              fontWeight: '500',
            }}
          />
        </div>
        
        <div className="mt-16 text-center text-text-secondary text-sm">
          <p>© {new Date().getFullYear()} 评分系统 - 让反馈更有价值</p>
        </div>
      </div>
    </div>
  );
}