'use client';
import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { FileTextOutlined, StarOutlined, TeamOutlined, BarChartOutlined } from '@ant-design/icons';

interface OverviewCardsProps {
  overall: {
    totalWorks: number;
    totalRatedWorks: number;
    totalRatings: number;
    totalUsers: number;
    // 兼容最新统计数据结构的可选字段
    totalViews?: number;
    averageRating?: number;
    totalComments?: number;
  };
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ overall }) => {
  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic
            title="总作品数"
            value={overall.totalWorks}
            prefix={<FileTextOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="已评分作品数"
            value={overall.totalRatedWorks}
            prefix={<StarOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="总评分数"
            value={overall.totalRatings}
            prefix={<BarChartOutlined />}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="参与评分人数"
            value={overall.totalUsers}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default OverviewCards;