'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Tabs, Spin, Typography, Statistic, Button } from 'antd';
import * as echarts from 'echarts';
import type { TabsProps } from 'antd';
import { BarChartOutlined, PieChartOutlined, RiseOutlined, LineChartOutlined, DatabaseOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// 模拟统计数据
const mockStatsData = [
  {
    id: 1,
    content: '服务态度',
    ratedCount: 156,
    highestScore: 100,
    lowestScore: 60,
    averageScore: 85.6
  },
  {
    id: 2,
    content: '环境整洁',
    ratedCount: 145,
    highestScore: 98,
    lowestScore: 55,
    averageScore: 82.3
  },
  {
    id: 3,
    content: '响应速度',
    ratedCount: 167,
    highestScore: 100,
    lowestScore: 65,
    averageScore: 88.9
  },
  {
    id: 4,
    content: '专业程度',
    ratedCount: 159,
    highestScore: 99,
    lowestScore: 70,
    averageScore: 86.7
  },
  {
    id: 5,
    content: '总体满意度',
    ratedCount: 170,
    highestScore: 100,
    lowestScore: 62,
    averageScore: 87.2
  }
];

// 获取统计摘要数据
const getSummaryData = () => {
  const maxRatedCount = Math.max(...mockStatsData.map(item => item.ratedCount));
  const maxAverageScore = Math.max(...mockStatsData.map(item => item.averageScore));
  const minAverageScore = Math.min(...mockStatsData.map(item => item.averageScore));
  const totalRatedCount = mockStatsData.reduce((sum, item) => sum + item.ratedCount, 0);
  const overallAverage = mockStatsData.reduce((sum, item) => sum + item.averageScore, 0) / mockStatsData.length;
  
  return {
    maxRatedCount,
    maxAverageScore,
    minAverageScore,
    totalRatedCount,
    overallAverage,
    itemCount: mockStatsData.length
  };
};

// 获取响应式图表配置
const getResponsiveChartSize = () => {
  // 为了避免服务器端渲染时的错误，提供默认值
  return { width: '100%', height: '400px' };
};

// 在组件中使用 useEffect 来获取真实的视口大小
const useResponsiveChartSize = () => {
  const [size, setSize] = useState({ width: '100%', height: '400px' });
  
  useEffect(() => {
    const updateSize = () => {
      const isMobile = window.innerWidth < 768;
      setSize({
        width: '100%',
        height: isMobile ? '300px' : '400px'
      });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  return size;
};

export default function StatsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(true);
  const chartSize = useResponsiveChartSize();
  const avgChartRef = useRef<HTMLDivElement>(null);
  const distChartRef = useRef<HTMLDivElement>(null);
  const avgChartInstance = useRef<echarts.ECharts | null>(null);
  const distChartInstance = useRef<echarts.ECharts | null>(null);
  const summaryData = getSummaryData();

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  
  // 响应式处理
  useEffect(() => {
    const handleResize = () => {
      // 调整图表大小
      if (avgChartInstance.current) {
        avgChartInstance.current.resize();
      }
      if (distChartInstance.current) {
        distChartInstance.current.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 初始化图表
  useEffect(() => {
    if (loading) return;

    // 平均分柱状图
    if (avgChartRef.current) {
      // 销毁之前的实例
      if (avgChartInstance.current) {
        avgChartInstance.current.dispose();
      }
      
      const avgChart = echarts.init(avgChartRef.current);
      avgChartInstance.current = avgChart;
      
      const isMobile = window.innerWidth < 768;
      
      avgChart.setOption({
        title: {
          text: '各项目平均分对比',
          left: 'center',
          textStyle: {
            fontSize: isMobile ? 16 : 18,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#f0f0f0',
          textStyle: {
            color: '#333'
          },
          formatter: '{b}: {c}分'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: isMobile ? '20%' : '10%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: mockStatsData.map(item => item.content),
          axisLabel: {
            interval: 0,
            rotate: isMobile ? 45 : 30,
            textStyle: {
              fontSize: isMobile ? 10 : 12
            }
          },
          axisLine: {
            lineStyle: {
              color: '#e8e8e8'
            }
          }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          interval: 20,
          axisLine: {
            lineStyle: {
              color: '#e8e8e8'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#f5f5f5',
              type: 'dashed'
            }
          }
        },
        series: [
          {
            data: mockStatsData.map(item => ({
              value: item.averageScore,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#1890ff' },
                  { offset: 1, color: '#40a9ff' }
                ]),
                borderRadius: [4, 4, 0, 0]
              }
            })),
            type: 'bar',
            barWidth: '60%',
            label: {
              show: !isMobile,
              position: 'top',
              formatter: '{c}',
              fontSize: 12
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#096dd9' },
                  { offset: 1, color: '#1890ff' }
                ])
              }
            },
            animationEasing: 'elasticOut',
            animationDelay: (idx: number) => idx * 100
          }
        ]
      });
    }

    // 评分分布饼图
    if (distChartRef.current) {
      // 销毁之前的实例
      if (distChartInstance.current) {
        distChartInstance.current.dispose();
      }
      
      const distChart = echarts.init(distChartRef.current);
      distChartInstance.current = distChart;
      
      const isMobile = window.innerWidth < 768;
      
      // 模拟评分分布数据
      const distributionData = [
        { value: 40, name: '90-100分', itemStyle: { color: '#52c41a' } },
        { value: 30, name: '80-89分', itemStyle: { color: '#1890ff' } },
        { value: 20, name: '70-79分', itemStyle: { color: '#faad14' } },
        { value: 10, name: '60-69分', itemStyle: { color: '#f5222d' } }
      ];
      
      distChart.setOption({
        title: {
          text: '评分分布情况',
          left: 'center',
          textStyle: {
            fontSize: isMobile ? 16 : 18,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#f0f0f0',
          textStyle: {
            color: '#333'
          }
        },
        legend: {
          orient: isMobile ? 'horizontal' : 'vertical',
          left: isMobile ? 'center' : 'left',
          bottom: isMobile ? 0 : 'center',
          top: isMobile ? '15%' : 'center',
          textStyle: {
            fontSize: isMobile ? 10 : 12
          }
        },
        series: [
          {
            name: '评分分布',
            type: 'pie',
            radius: isMobile ? ['40%', '70%'] : ['50%', '70%'],
            center: ['50%', isMobile ? '55%' : '50%'],
            data: distributionData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              scaleSize: 5
            },
            animationType: 'scale',
            animationEasing: 'elasticOut',
            label: {
              show: false
            },
            labelLine: {
              show: false
            }
          }
        ]
      });
    }
    
    // 组件卸载时清理图表
    return () => {
      if (avgChartInstance.current) {
        avgChartInstance.current.dispose();
        avgChartInstance.current = null;
      }
      if (distChartInstance.current) {
        distChartInstance.current.dispose();
        distChartInstance.current = null;
      }
    };
  }, [loading, chartSize]);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '统计概览',
      icon: <LineChartOutlined />,
      children: (
        <Card className="shadow-sm" style={{ borderRadius: '12px', border: 'none' }}>
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="card fade-in" style={{ borderRadius: '12px', border: 'none' }}>
              <Statistic
                title="参与评分人数"
                value={summaryData.maxRatedCount}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<RiseOutlined />}
                suffix="人"
              />
            </Card>
            <Card className="card fade-in" style={{ borderRadius: '12px', border: 'none' }}>
              <Statistic
                title="最高平均分"
                value={summaryData.maxAverageScore}
                precision={1}
                valueStyle={{ color: '#52c41a' }}
                prefix={<RiseOutlined />}
                suffix="分"
              />
            </Card>
            <Card className="card fade-in" style={{ borderRadius: '12px', border: 'none' }}>
              <Statistic
                title="总评分次数"
                value={summaryData.totalRatedCount}
                precision={0}
                valueStyle={{ color: '#faad14' }}
                prefix={<DatabaseOutlined />}
                suffix="次"
              />
            </Card>
            <Card className="card fade-in" style={{ borderRadius: '12px', border: 'none' }}>
              <Statistic
                title="评分项目数"
                value={summaryData.itemCount}
                precision={0}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </div>
          
          {/* 总体平均分卡片 */}
          <Card className="mb-10 fade-in" style={{ borderRadius: '12px', border: 'none', backgroundColor: 'rgba(24, 144, 255, 0.05)' }}>
            <div className="text-center">
              <Title level={4} style={{ margin: 0, color: 'var(--text-secondary)' }}>总体平均评分</Title>
              <div className="mt-2">
                <span className="text-5xl font-bold text-primary">{summaryData.overallAverage.toFixed(1)}</span>
                <span className="text-xl text-text-secondary ml-2">分</span>
              </div>
            </div>
          </Card>
          
          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="chart-container fade-in">
              <div ref={avgChartRef} style={chartSize}></div>
            </div>
            <div className="chart-container fade-in">
              <div ref={distChartRef} style={chartSize}></div>
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: '2',
      label: '详细数据',
      icon: <DatabaseOutlined />,
      children: (
        <Card className="shadow-sm fade-in" style={{ borderRadius: '12px', border: 'none' }}>
          <div className="overflow-x-auto">
            <table className="table w-full border-collapse">
              <thead>
                <tr className="bg-primary-light/20">
                  <th className="p-4 text-left border border-primary-light/30">评分项目</th>
                  <th className="p-4 text-center border border-primary-light/30">已评分人数</th>
                  <th className="p-4 text-center border border-primary-light/30">最高分</th>
                  <th className="p-4 text-center border border-primary-light/30">最低分</th>
                  <th className="p-4 text-center border border-primary-light/30">平均分</th>
                </tr>
              </thead>
              <tbody>
                {mockStatsData.map((item, index) => (
                  <tr key={item.id} className={`hover:bg-primary-light/10 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-4 border border-primary-light/30 font-medium">{item.content}</td>
                    <td className="p-4 text-center border border-primary-light/30">{item.ratedCount}</td>
                    <td className="p-4 text-center border border-primary-light/30 text-success">{item.highestScore}</td>
                    <td className="p-4 text-center border border-primary-light/30 text-danger">{item.lowestScore}</td>
                    <td className="p-4 text-center border border-primary-light/30 font-semibold text-primary">{item.averageScore.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light/30 to-background py-12">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex justify-start mb-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/front/page')}
            className="btn btn-secondary"
            style={{ borderRadius: '8px' }}
          >
            返回首页
          </Button>
        </div>
        <Title level={1} className="text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          评分统计分析
        </Title>
        
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Spin size="large" tip="加载统计数据中..." />
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={items}
            className="w-full"
            tabBarStyle={{
              padding: '0 24px',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'transparent',
              marginBottom: '20px'
            }}
            tabBarItemStyle={{
              padding: '16px 0',
              margin: '0 16px',
              fontSize: '16px',
              fontWeight: '500',
              color: 'var(--text-secondary)',
              '&.ant-tabs-tab-active': {
                color: 'var(--primary)'
              }
            }}
          />
        )}
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center text-text-secondary text-sm">
            <LineChartOutlined className="mr-2" /> 数据更新时间: {new Date().toLocaleDateString()}
          </div>
        </div>
        
        <div className="mt-8 text-center text-text-secondary text-sm">
          <Text>© {new Date().getFullYear()} 评分系统 - 让反馈更有价值</Text>
        </div>
      </div>
    </div>
  );
}