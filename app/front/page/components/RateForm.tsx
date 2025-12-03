'use client';
import { useState, useEffect } from 'react';
import { Card, InputNumber, Button, message, Typography, Divider } from 'antd';
import { FilePdfOutlined, EditOutlined, SaveOutlined, ArrowRightOutlined, PieChartOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// 评分维度定义
const ratingDimensions = [
  { id: 'practice', name: '实践性', icon: '⚙️', color: '#52c41a' },
  { id: 'completeness', name: '完整性', icon: '📋', color: '#1890ff' },
  { id: 'privacy', name: '私有性', icon: '🔒', color: '#eb2f96' },
];

// 模拟评分内容数据
const mockContentData = [
  { id: 1, content: '服务态度', icon: '😊' },
  { id: 2, content: '环境整洁', icon: '🏢' },
  // { id: 3, content: '响应速度', icon: '⚡' },
  // { id: 4, content: '专业程度', icon: '💼' },
  // { id: 5, content: '总体满意度', icon: '🌟' },
];

// 模拟历史评分数据，用于计算每个评分项的统计信息
const mockHistoricalRatings = [
  // 用户1的评分
  { userId: 1, ratings: {
    1: { practice: 95, completeness: 92, privacy: 88 },
    2: { practice: 88, completeness: 90, privacy: 85 },
    3: { practice: 92, completeness: 95, privacy: 88 },
    4: { practice: 90, completeness: 88, privacy: 85 },
    5: { practice: 94, completeness: 92, privacy: 89 }
  }},
  // 用户2的评分
  { userId: 2, ratings: {
    1: { practice: 88, completeness: 90, privacy: 85 },
    2: { practice: 90, completeness: 92, privacy: 88 },
    3: { practice: 85, completeness: 88, privacy: 82 },
    4: { practice: 87, completeness: 90, privacy: 85 },
    5: { practice: 89, completeness: 91, privacy: 86 }
  }},
  // 用户3的评分
  { userId: 3, ratings: {
    1: { practice: 92, completeness: 95, privacy: 88 },
    2: { practice: 95, completeness: 97, privacy: 90 },
    3: { practice: 88, completeness: 92, privacy: 86 },
    4: { practice: 93, completeness: 95, privacy: 89 },
    5: { practice: 92, completeness: 94, privacy: 88 }
  }},
  // 用户4的评分
  { userId: 4, ratings: {
    1: { practice: 85, completeness: 88, privacy: 82 },
    2: { practice: 82, completeness: 85, privacy: 78 },
    3: { practice: 90, completeness: 93, privacy: 87 },
    4: { practice: 88, completeness: 91, privacy: 84 },
    5: { practice: 86, completeness: 89, privacy: 83 }
  }},
  // 用户5的评分
  { userId: 5, ratings: {
    1: { practice: 90, completeness: 93, privacy: 87 },
    2: { practice: 88, completeness: 91, privacy: 85 },
    3: { practice: 95, completeness: 97, privacy: 90 },
    4: { practice: 92, completeness: 94, privacy: 88 },
    5: { practice: 93, completeness: 95, privacy: 89 }
  }},
];

// 评分等级配置
const getScoreLevel = (score: number) => {
    if (score >= 90) return { text: '优秀', color: '#52c41a' };
    if (score >= 80) return { text: '良好', color: '#faad14' };
    if (score >= 70) return { text: '一般', color: '#fa8c16' };
    return { text: '需改进', color: '#f5222d' };
  };

interface RateFormProps {
  backButtonClick: () => void;
}

export default function RateForm({backButtonClick}:RateFormProps) {
  const [ratings, setRatings] = useState<Record<number, Record<string, number>>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 处理评分变化
  const handleRatingChange = (contentId: number, dimensionId: string, value: number | null) => {
    setRatings(prev => {
      const itemRatings = prev[contentId] || {};
      return {
        ...prev,
        [contentId]: {
          ...itemRatings,
          [dimensionId]: value || 0
        }
      };
    });
  };

  // 检查是否所有评分都已填写
  const isAllRated = () => {
    return mockContentData.every(item => {
      const itemRatings = ratings[item.id];
      if (!itemRatings) return false;
      return ratingDimensions.every(dim => itemRatings[dim.id] !== undefined && itemRatings[dim.id] > 0);
    });
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
    // 评分完成后的处理
    setTimeout(() => {
      // 可以添加重置逻辑或其他操作
      setRatings({});
      setIsSaved(false);
      setShowStats(false);
    }, 1500);
  };

  // 计算每个评分项的统计数据
  const getStats = () => {
    if (mockHistoricalRatings.length === 0) return null;
    
    // 为每个评分项和维度计算统计数据
    const itemStats: Record<number, Record<string, { average: number; highest: number; lowest: number; count: number }>> = {};
    
    // 初始化每个评分项的统计对象
    mockContentData.forEach(item => {
      itemStats[item.id] = {};
      ratingDimensions.forEach(dim => {
        itemStats[item.id][dim.id] = {
          average: 0,
          highest: 0,
          lowest: 100,
          count: 0
        };
      });
    });
    
    // 遍历所有历史评分数据
    mockHistoricalRatings.forEach(userRating => {
      Object.entries(userRating.ratings).forEach(([contentId, contentRatings]) => {
        const id = parseInt(contentId);
        const stats = itemStats[id];
        
        if (stats && typeof contentRatings === 'object') {
          Object.entries(contentRatings).forEach(([dimId, score]) => {
            const dimStats = stats[dimId];
            if (dimStats && typeof score === 'number') {
              // 更新统计数据
              dimStats.average += score;
              dimStats.highest = Math.max(dimStats.highest, score);
              dimStats.lowest = Math.min(dimStats.lowest, score);
              dimStats.count += 1;
            }
          });
        }
      });
    });
    
    // 计算最终的平均分
    Object.keys(itemStats).forEach(id => {
      const stats = itemStats[parseInt(id)];
      Object.keys(stats).forEach(dimId => {
        const dimStats = stats[dimId];
        if (dimStats.count > 0) {
          dimStats.average = dimStats.average / dimStats.count;
        }
      });
    });
    
    return itemStats;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="rate-form">
          <div className="page-header">
            <Button 
              onClick={backButtonClick}
              icon={<ArrowLeftOutlined />}
              className="back-btn btn btn-secondary"
              style={{ padding: '8px 16px', marginBottom: '1rem' }}
              size="middle">
              返回
            </Button>
            <Title level={1} className="page-header-title">
              {showStats ? '评分统计' : '开始评分'}
            </Title>
          </div>
          
          <Card className="card fade-in" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          {showStats ? (
            // 评分统计内容
            <div className="stats-content">
              <div className="stats-header">
                <div className="icon-wrapper">
                  <PieChartOutlined />
                </div>
                <Title level={3} className="text-text-primary">您的评分详情</Title>
                <Text className="text-text-secondary">感谢您的反馈，以下是您的评分结果</Text>
              </div>
              
              <div className="stats-list">
                  {mockContentData.map(item => {
                    const itemRatings = ratings[item.id] || {};
                    return (
                      <div 
                        key={item.id} 
                        className="stat-item"
                      >
                        <div className="stat-item-header">
                          <Text className="stat-item-name">{item.content}</Text>
                        </div>
                        <div className="stat-item-info">
                          {ratingDimensions.map(dimension => {
                            const dimScore = itemRatings[dimension.id];
                            const dimLevel = dimScore !== undefined ? getScoreLevel(dimScore) : null;
                            return (
                              <div 
                                key={dimension.id} 
                                className="stat-item-dimension"
                              >
                                <div className="dimension-item">
                                  <Text className="dimension-item-label">{dimension.name}</Text>
                                  <Text className="dimension-item-value" style={{ color: dimension.color }}>{dimScore}</Text>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
            
              {getStats() && (
                <>  
                  <div className="stats-header">
                    <Title level={3} className="text-text-primary">评分概览</Title>
                  </div>
                  <div className="stats-overview">
                    <div className="overview-cards">
                      {mockContentData.map(item => {
                        const stats = getStats()![item.id];
                        if (!stats) return null;
                        
                        return (
                          <div key={item.id} className="overview-card fade-in">
                            <div className="overview-card-header">
                              <Text className="text-text-primary">{item.content}</Text>
                              <div className="overview-card-count">
                                {Object.values(stats)[0]?.count || 0}人已评分
                              </div>
                            </div>
                            
                            <div className="dimension-stats">
                              {ratingDimensions.map(dimension => {
                                const dimStat = stats[dimension.id];
                                if (!dimStat) return null;
                                const level = getScoreLevel(dimStat.average);
                                return (
                                  <div key={dimension.id} className="dimension-stat">
                                    <div className="dimension-stat-header">
                                      <Text className="dimension-stat-name">{dimension.name}</Text>
                                    </div>
                                    <div className="dimension-stat-info">
                                      <div className="dimension-range">
                                        <div className="range-item">
                                          <Text className="stat-label">平均分</Text>
                                          <Text className="stat-value" style={{ color: dimension.color }}>{dimStat.average.toFixed(1)}</Text>
                                        </div>
                                        <div className="range-item">
                                          <Text className="stat-label">最低分</Text>
                                          <Text className="stat-value" style={{ color: dimension.color }}>{dimStat.lowest}</Text>
                                        </div>
                                        <div className="range-item">
                                          <Text className="stat-label">最高分</Text>
                                          <Text className="stat-value" style={{ color: dimension.color }}>{dimStat.highest}</Text>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            // 评分表单内容
            <div className="rate-form-content">
              <div className="rate-form-header">
                <Title level={3} className="text-text-primary">请对以下内容进行评分</Title>
                <Text className="text-text-secondary">
                  请为每项内容评分（0-100分），所有项目都需要填写
                </Text>
              </div>
              
              <div className="rating-items">
                {mockContentData.map(item => {
                  const score = ratings[item.id];
                  // score是一个包含多个维度的对象，不需要在这里计算整体level
                  return (
                    <div 
                      key={item.id} 
                      className="rating-item"
                    >

                      <div className="rating-item-header">
                        <div className="rating-item-icon">
                          <FilePdfOutlined style={{ color: '#eb2f96', fontSize: '20px' }}/>
                        </div>
                        <div className="rating-item-title">
                          <Text className="text-text-primary">{item.content}</Text>
                        </div>
                      </div>
                      <div className="rating-item-details">
                        <div className="rating-item-detail">
                          <Text className="text-text-secondary">点击图标或标题可预览项目详情</Text>
                        </div>
                      </div>
                      <div className="rating-item-score-section">
                        {ratingDimensions.map(dimension => {
                          const dimScore = score?.[dimension.id];
                          const dimLevel = dimScore !== undefined ? getScoreLevel(dimScore) : null;
                          return (
                            <div key={dimension.id} className="rating-dimension">
                              <div className="rating-dimension-header">
                                <div className="rating-dimension-name">
                                  <Text className="text-text-primary">{dimension.name}</Text>
                                </div>
                                {dimScore !== undefined && (
                                <div className="rating-dimension-progress">
                                  <div className="progress-bar">
                                    <div 
                                      className="progress-fill"
                                      style={{ 
                                        width: `${dimScore}%`,
                                        backgroundColor: dimLevel?.color 
                                      }}
                                    />
                                  </div>
                                  <Text className="rating-dimension-score" style={{ color: dimLevel?.color }}>
                                    {dimScore}分
                                  </Text>
                                </div>
                              )}
                              </div>
                              <div className="rating-dimension-input">
                                <InputNumber
                                  min={0}
                                  max={100}
                                  value={dimScore || undefined}
                                  onChange={(value) => handleRatingChange(item.id, dimension.id, value)}
                                  placeholder="请输入分数"
                                  style={{
                                    height: '44px',
                                    borderRadius: '10px',
                                    borderColor: dimScore !== undefined ? dimLevel?.color : '#d9d9d9',
                                    fontSize: '14px',
                                    boxShadow: dimScore !== undefined ? `0 0 0 2px ${dimLevel?.color}30` : 'none',
                                    width: '100%'
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
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
    </div>
  );
}