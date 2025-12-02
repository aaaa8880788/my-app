'use client';
import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { UserOutlined, BarChartOutlined, LineChartOutlined, PieChartOutlined } from '@ant-design/icons';

// 定义模拟数据
interface ContentStat {
  contentId: number;
  contentTitle: string;
  totalRatings: number;
  maxScore: number;
  minScore: number;
  avgScore: number;
}

interface UserStat {
  totalUsers: number;
  activeUsers: number;
}

// 模拟用户统计数据
const mockUserStats: UserStat = {
  totalUsers: 3,
  activeUsers: 3,
};

// 模拟评分内容统计数据
const mockContentStats: ContentStat[] = [
  { contentId: 1, contentTitle: '内容一', totalRatings: 85, maxScore: 100, minScore: 60, avgScore: 85.6 },
  { contentId: 2, contentTitle: '内容二', totalRatings: 76, maxScore: 98, minScore: 55, avgScore: 82.3 },
  { contentId: 3, contentTitle: '内容三', totalRatings: 92, maxScore: 99, minScore: 65, avgScore: 88.1 },
  { contentId: 4, contentTitle: '内容四', totalRatings: 68, maxScore: 97, minScore: 50, avgScore: 80.5 },
  { contentId: 5, contentTitle: '内容五', totalRatings: 72, maxScore: 95, minScore: 62, avgScore: 83.7 },
];

export default function AdminStatsPage() {
  const [userStats] = useState<UserStat>(mockUserStats);
  const [contentStats] = useState<ContentStat[]>(mockContentStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      // 初始化图表
      initAvgScoreChart();
      initRatingsCountChart();
      initScoreDistributionChart();
    }

    // 清理函数
    return () => {
      const avgChartDom = document.getElementById('avg-score-chart');
      const countChartDom = document.getElementById('ratings-count-chart');
      const distributionChartDom = document.getElementById('score-distribution-chart');
      
      if (avgChartDom) {
        const chart = echarts.getInstanceByDom(avgChartDom);
        if (chart) chart.dispose();
      }
      if (countChartDom) {
        const chart = echarts.getInstanceByDom(countChartDom);
        if (chart) chart.dispose();
      }
      if (distributionChartDom) {
        const chart = echarts.getInstanceByDom(distributionChartDom);
        if (chart) chart.dispose();
      }
    };
  }, [loading, contentStats]);

  // 初始化平均分图表
  const initAvgScoreChart = () => {
    const chartDom = document.getElementById('avg-score-chart');
    if (!chartDom) return;

    const chart = echarts.init(chartDom);
    const option: EChartsOption = {
      title: {
        text: '各内容平均分对比',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const data = params[0];
          return `${data.name}<br/>平均分: ${data.value.toFixed(1)}`;
        },
      },
      xAxis: {
        type: 'category',
        data: contentStats.map(stat => stat.contentTitle),
        axisLabel: {
          interval: 0,
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
      },
      series: [
        {
          data: contentStats.map(stat => stat.avgScore),
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' },
            ]),
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' },
              ]),
            },
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
          },
        },
      ],
    };

    chart.setOption(option);

    // 响应式处理
    window.addEventListener('resize', () => chart.resize());
  };

  // 初始化评分人数图表
  const initRatingsCountChart = () => {
    const chartDom = document.getElementById('ratings-count-chart');
    if (!chartDom) return;

    const chart = echarts.init(chartDom);
    const option: EChartsOption = {
      title: {
        text: '各内容评分人数',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        formatter: (params: any) => {
          const data = params[0];
          return `${data.name}<br/>评分人数: ${data.value}`;
        },
      },
      xAxis: {
        type: 'category',
        data: contentStats.map(stat => stat.contentTitle),
        axisLabel: {
          interval: 0,
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
      },
      series: [
        {
          data: contentStats.map(stat => stat.totalRatings),
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: '#52c41a',
            width: 3,
          },
          itemStyle: {
            color: '#52c41a',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
            ]),
          },
          label: {
            show: true,
            position: 'top',
          },
        },
      ],
    };

    chart.setOption(option);

    // 响应式处理
    window.addEventListener('resize', () => chart.resize());
  };

  // 初始化评分分布图表
  const initScoreDistributionChart = () => {
    const chartDom = document.getElementById('score-distribution-chart');
    if (!chartDom) return;

    // 计算总体评分分布（简化版）
    const distributionData = [
      { name: '0-59分', value: 15 },
      { name: '60-69分', value: 32 },
      { name: '70-79分', value: 48 },
      { name: '80-89分', value: 95 },
      { name: '90-100分', value: 60 },
    ];

    const chart = echarts.init(chartDom);
    const option: EChartsOption = {
      title: {
        text: '整体评分分布',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: '评分分布',
          type: 'pie',
          radius: '50%',
          center: ['60%', '50%'],
          data: distributionData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            formatter: '{b}: {d}%',
          },
        },
      ],
    };

    chart.setOption(option);

    // 响应式处理
    window.addEventListener('resize', () => chart.resize());
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">统计展示</h1>
      </div>

      <Spin spinning={loading} tip="数据加载中...">
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="用户总数"
                value={userStats.totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="活跃用户"
                value={userStats.activeUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="评分内容数"
                value={contentStats.length}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总评分次数"
                value={contentStats.reduce((sum, stat) => sum + stat.totalRatings, 0)}
                prefix={<LineChartOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-6">
          <Col span={24}>
            <Card title="评分内容详细统计" extra={<PieChartOutlined />}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3">内容ID</th>
                      <th className="p-3">内容标题</th>
                      <th className="p-3">评分人数</th>
                      <th className="p-3">最高分</th>
                      <th className="p-3">最低分</th>
                      <th className="p-3">平均分</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contentStats.map(stat => (
                      <tr key={stat.contentId} className="border-b hover:bg-gray-50">
                        <td className="p-3">{stat.contentId}</td>
                        <td className="p-3 font-medium">{stat.contentTitle}</td>
                        <td className="p-3">{stat.totalRatings}</td>
                        <td className="p-3 text-green-600 font-semibold">{stat.maxScore}</td>
                        <td className="p-3 text-red-600 font-semibold">{stat.minScore}</td>
                        <td className="p-3 text-blue-600 font-semibold">{stat.avgScore.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="平均分对比图表" className="h-full">
              <div id="avg-score-chart" style={{ height: 400 }}></div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="评分人数统计" className="h-full">
              <div id="ratings-count-chart" style={{ height: 400 }}></div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="整体评分分布" className="h-full">
              <div id="score-distribution-chart" style={{ height: 400 }}></div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="系统概况" className="h-full">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">评分系统运行状态</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>用户活跃度</span>
                      <span>{Math.round((userStats.activeUsers / userStats.totalUsers) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${(userStats.activeUsers / userStats.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>内容完成率</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>平均评分满意度</span>
                      <span>83.6%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '83.6%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}