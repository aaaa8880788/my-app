'use client';
import { useState, useEffect } from 'react';
import { Card, InputNumber, Button, message, Typography, Divider } from 'antd';
import { useRouter } from 'next/navigation';
import { CheckOutlined, EditOutlined, SaveOutlined, ArrowRightOutlined, PieChartOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// 模拟评分内容数据
const mockContentData = [
  { id: 1, content: '服务态度', icon: '😊' },
  { id: 2, content: '环境整洁', icon: '🏢' },
  { id: 3, content: '响应速度', icon: '⚡' },
  { id: 4, content: '专业程度', icon: '💼' },
  { id: 5, content: '总体满意度', icon: '🌟' },
];

// 模拟历史评分数据，用于计算每个评分项的统计信息
const mockHistoricalRatings = [
  // 用户1的评分
  { userId: 1, ratings: { 1: 95, 2: 88, 3: 92, 4: 90, 5: 94 } },
  // 用户2的评分
  { userId: 2, ratings: { 1: 88, 2: 90, 3: 85, 4: 87, 5: 89 } },
  // 用户3的评分
  { userId: 3, ratings: { 1: 92, 2: 95, 3: 88, 4: 93, 5: 92 } },
  // 用户4的评分
  { userId: 4, ratings: { 1: 85, 2: 82, 3: 90, 4: 88, 5: 86 } },
  // 用户5的评分
  { userId: 5, ratings: { 1: 90, 2: 88, 3: 95, 4: 92, 5: 93 } },
];

// 评分等级配置
const getScoreLevel = (score: number) => {
  if (score >= 90) return { text: '优秀', color: '#52c41a' };
  if (score >= 80) return { text: '良好', color: '#faad14' };
  if (score >= 70) return { text: '一般', color: '#fa8c16' };
  return { text: '需改进', color: '#f5222d' };
};

export default function RatingPage() {
  const router = useRouter();
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 处理评分变化
  const handleRatingChange = (contentId: number, value: number | null) => {
    setRatings(prev => ({
      ...prev,
      [contentId]: value || 0
    }));
  };

  // 检查是否所有评分都已填写
  const isAllRated = () => {
    return mockContentData.every(item => ratings[item.id] !== undefined && ratings[item.id] > 0);
  };

  // 保存评分
  const handleSave = () => {
    if (!isAllRated()) {
      message.warning('请完成所有评分项');
      return;
    }
    
    setIsSaved(true);
    setShowStats(true);
    message.success('评分已保存', 3);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 修改评分
  const handleModify = () => {
    setShowStats(false);
  };

  // 提交评分
  const handleSubmit = () => {
    // 这里应该发送API请求保存评分
    message.success('评分已提交', 3);
    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      router.push('/front/page');
    }, 1500);
  };

  // 计算每个评分项的统计数据
  const getStats = () => {
    if (mockHistoricalRatings.length === 0) return null;
    
    // 为每个评分项计算统计数据
    const itemStats: Record<number, { average: number; highest: number; lowest: number; count: number }> = {};
    
    // 初始化每个评分项的统计对象
    mockContentData.forEach(item => {
      itemStats[item.id] = {
        average: 0,
        highest: 0,
        lowest: 100,
        count: 0
      };
    });
    
    // 遍历所有历史评分数据
    mockHistoricalRatings.forEach(userRating => {
      Object.entries(userRating.ratings).forEach(([contentId, score]) => {
        const id = parseInt(contentId);
        const stats = itemStats[id];
        
        if (stats) {
          // 更新统计数据
          stats.average += score;
          stats.highest = Math.max(stats.highest, score);
          stats.lowest = Math.min(stats.lowest, score);
          stats.count += 1;
        }
      });
    });
    
    // 计算最终的平均分
    Object.keys(itemStats).forEach(id => {
      const stats = itemStats[parseInt(id)];
      if (stats.count > 0) {
        stats.average = stats.average / stats.count;
      }
    });
    
    return itemStats;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="rating-page">
          <div className="back-button">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/front/page')}
              className="btn btn-secondary"
              style={{ borderRadius: '8px', minWidth: '100px', padding: '6px 12px' }}
              size="middle"
            >
              返回首页
            </Button>
          </div>
          <Title level={1} className="page-title">
            {showStats ? '评分统计' : '开始评分'}
          </Title>
          
          <Card className="card fade-in" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          {showStats ? (
            // 评分统计内容
            <div className="stats-content">
              <div className="stats-header">
                <div className="icon-wrapper">
                  <PieChartOutlined className="text-4xl sm:text-5xl" />
                </div>
                <Title level={3} className="mb-2 text-text-primary text-xl sm:text-2xl">您的评分详情</Title>
                <Text className="text-text-secondary max-w-md mx-auto">感谢您的反馈，以下是您的评分结果</Text>
              </div>
              
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {mockContentData.map(item => {
                  const score = ratings[item.id] || 0;
                  const level = getScoreLevel(score);
                  return (
                    <div 
                      key={item.id} 
                      className="flex items-center p-3 sm:p-4 rounded-lg transition-all duration-300 hover:bg-background"
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-light flex items-center justify-center text-xl sm:text-2xl mr-3 sm:mr-4">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <Text className="font-medium text-text-primary">{item.content}</Text>
                        <div className="mt-1 h-2 bg-background rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${score}%`,
                              backgroundColor: score > 0 ? level.color : 'var(--border)'
                            }}
                          />
                        </div>
                      </div>
                      <div 
                        className="ml-3 sm:ml-4 px-2 sm:px-3 py-1 rounded-full font-medium text-white text-sm"
                        style={{ backgroundColor: score > 0 ? level.color : 'var(--border)' }}
                      >
                        {score}分
                      </div>
                    </div>
                  );
                })}
              </div>
            
              {getStats() && (
                <div className="mt-8 p-6 bg-background rounded-xl shadow-sm">
                  <Title level={4} className="mb-6 text-text-primary">评分概览</Title>
                  <div className="space-y-6 stats-overview">
                    {mockContentData.map(item => {
                      const stats = getStats()![item.id];
                      if (!stats) return null;
                      
                      return (
                        <Card key={item.id} className="overview-card fade-in" style={{ borderRadius: '12px', border: 'none' }}>
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-xl mr-3">
                              {item.icon}
                            </div>
                            <Text className="font-medium text-text-primary text-lg">{item.content}</Text>
                            <div className="ml-auto px-2 py-1 rounded-full text-xs sm:text-sm font-medium"
                              style={{ 
                                backgroundColor: getScoreLevel(stats.average).color + '20',
                                color: getScoreLevel(stats.average).color
                              }}
                            >
                              {stats.count}人评价
                            </div>
                          </div>
                          <div className="card-stats">
              <div className="stat-box stat-average">
                <div className="stat-label">平均分</div>
                <div className="stat-value">{stats.average.toFixed(1)}</div>
                <div className="stat-level" 
                  style={{ 
                    backgroundColor: getScoreLevel(stats.average).color + '30',
                    color: getScoreLevel(stats.average).color
                  }}
                >
                  {getScoreLevel(stats.average).text}
                </div>
              </div>
              <div className="stat-box stat-highest">
                <div className="stat-label">最高分</div>
                <div className="stat-value stat-highest">{stats.highest}</div>
                <div className="stat-level stat-level-highest">
                  优秀
                </div>
              </div>
              <div className="stat-box stat-lowest">
                <div className="stat-label">最低分</div>
                <div className="stat-value" style={{ color: getScoreLevel(stats.lowest).color }}>
                  {stats.lowest}
                </div>
                <div className="stat-level" 
                  style={{ 
                    backgroundColor: getScoreLevel(stats.lowest).color + '30',
                    color: getScoreLevel(stats.lowest).color
                  }}
                >
                  {getScoreLevel(stats.lowest).text}
                </div>
              </div>
            </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 评分表单内容
            <div className="rate-form-content">
              <div className="rate-form-header">
                <Title level={3} className="mb-2 text-text-primary text-xl sm:text-2xl">请对以下内容进行评分</Title>
                <Text className="text-text-secondary max-w-md mx-auto">
                  请为每项内容评分（0-100分），所有项目都需要填写
                </Text>
              </div>
              
              <div className="rating-items">
                {mockContentData.map(item => {
                  const score = ratings[item.id];
                  const level = score !== undefined ? getScoreLevel(score) : null;
                  return (
                    <div 
                      key={item.id} 
                      className="rating-item"
                    >
                      <div className="item-header">
                        <div className="item-icon">
                          {item.icon}
                        </div>
                        <Text className="font-medium text-text-primary">{item.content}</Text>
                        {score !== undefined && (
                          <span 
                          className="item-level"
                          style={{ backgroundColor: level?.color }}
                        >
                          {level?.text}
                        </span>
                        )}
                      </div>
                      <div className="item-content">
                        <Text className="text-text-secondary">分数：</Text>
                        <div className="item-input">
                          <div className="input-number">
                            <InputNumber
                              min={0}
                              max={100}
                              value={ratings[item.id] || undefined}
                              onChange={(value) => handleRatingChange(item.id, value)}
                              className="w-full hover:shadow-md focus:shadow-lg transition-all duration-300 cursor-pointer"
                              placeholder="请输入分数"
                              style={{
                                height: '44px',
                                borderRadius: '10px',
                                borderColor: score !== undefined ? level?.color : '#d9d9d9',
                                fontSize: '14px',
                                boxShadow: score !== undefined ? `0 0 0 2px ${level?.color}30` : 'none',
                                width: '100%'
                              }}
                            />
                          </div>
                          {score !== undefined && (
                            <div className="progress-bar">
                              <div className="progress-fill"
                                style={{ 
                                  width: `${score}%`,
                                  backgroundColor: level?.color || 'var(--border)'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
        
        <div className="rate-buttons">
          {isSaved && showStats ? (
            <>
              <Button 
                onClick={handleModify}
                icon={<EditOutlined />}
                className="btn btn-secondary"
                style={{ minWidth: '100px', padding: '8px 16px' }}
                size="middle"
              >
                修改评分
              </Button>
              <Button 
                type="primary" 
                onClick={handleSubmit}
                icon={<ArrowRightOutlined />}
                className="btn btn-primary"
                style={{ minWidth: '100px', padding: '8px 16px' }}
                size="middle"
              >
                提交评分
              </Button>
            </>
          ) : (
            <Button 
              type="primary" 
              onClick={handleSave}
              icon={<SaveOutlined />}
              className="btn btn-primary"
              style={{ minWidth: '120px', padding: '10px 20px' }}
              size="middle"
              disabled={!isAllRated()}
            >
              保存评分
            </Button>
          )}
        </div>
        
        <div className="page-footer">
          <Text>© {new Date().getFullYear()} 评分系统 - 让反馈更有价值</Text>
        </div>
    </div>
  );
}