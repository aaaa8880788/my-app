'use client';
import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Spin, message, Button } from 'antd';
import { BarChartOutlined, TableOutlined } from '@ant-design/icons';
import { adminRatingAPI } from '@/app/utils/admin/ratingsApi';
import OverviewCards from './components/OverviewCards';
import WorkRatingChart from './components/WorkRatingChart';
import RatingTable from './components/RatingTable';

const { Title } = Typography;

interface WorkStatistic {
  workId: number;
  workName: string;
  ratedCount: number;
  highestScore: number;
  lowestScore: number;
  averageScore: number;
}

interface DetailedRating {
  id: number;
  userId: number;
  userName: string;
  workId: number;
  workName: string;
  content: string;
  scores: Array<{ ratingDimensionId: number; score: number }>;
  finalScore: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

interface StatisticsData {
  overall: {
    totalWorks: number;
    totalRatedWorks: number;
    totalRatings: number;
    totalUsers: number;
  };
  workStatistics: WorkStatistic[];
  detailedRatings: DetailedRating[];
}

const DataStatisticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'visualization' | 'table'>('visualization');

  // 获取统计数据
  const fetchStatisticsData = async () => {
    setLoading(true);
    try {
      // 调用统计API获取数据
      const response: any = await adminRatingAPI.getStatistics();
      if (response && response.success) {
        setStatisticsData(response.data);
        message.success('统计数据获取成功');
      } else {
        console.error('获取统计数据失败:', response?.message || '未知错误');
        message.error('获取统计数据失败');
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    fetchStatisticsData();
  }, []);

  return (
    <div className="data-statistics-page">
      {/* 统计概览卡片 */}
      <div style={{ marginBottom: 24 }}>
        <OverviewCards overall={statisticsData?.overall || {
          totalWorks: 0,
          totalRatedWorks: 0,
          totalRatings: 0,
          totalUsers: 0
        }} />
      </div>

      {/* 标签页 */}
      <div className="tab-buttons" style={{ marginBottom: 24 }}>
        <Button
          type={activeTab === 'visualization' ? 'primary' : 'default'}
          icon={<BarChartOutlined />}
          onClick={() => setActiveTab('visualization')}
          style={{ marginRight: 16 }}
        >
          可视化统计
        </Button>
        <Button
          type={activeTab === 'table' ? 'primary' : 'default'}
          icon={<TableOutlined />}
          onClick={() => setActiveTab('table')}
        >
          表格统计
        </Button>
      </div>

      <Spin spinning={loading} tip="加载中...">
        {/* 可视化统计 */}
        {activeTab === 'visualization' && (
          <>
            <Card title="作品评分统计">
              <WorkRatingChart workStatistics={statisticsData?.workStatistics || []} />
            </Card>
          </>
          
        )}

        {/* 表格统计 */}
        {activeTab === 'table' && (
          <>
            <Card title="作品评分详情">
              <RatingTable detailedRatings={statisticsData?.detailedRatings || []} />
            </Card>
          </>
        )}
      </Spin>
    </div>
  );
};

export default DataStatisticsPage;