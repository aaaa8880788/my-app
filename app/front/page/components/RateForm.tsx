'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, Button, message, Typography, Spin } from 'antd';
import { FilePdfOutlined, EditOutlined, SaveOutlined, ArrowRightOutlined, PieChartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import RatingFormContent from './RatingFormContent';
import RatingButtons from './RatingButtons';
import { ratingsApi } from '@/app/utils/front/frontApi';

const { Title, Text } = Typography;

// 常量定义
const colors: string[] = ['#52c41a', '#1890ff', '#eb2f96', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#fa8c16', '#a0d911', '#eb2f06'];

const submitRating = async (ratingData: any) => {
  try {
    const response = await ratingsApi.submitRating(ratingData);
    return response;
  } catch (error) {
    console.error('提交评分错误:', error);
    message.error('提交评分失败');
    return null;
  }
};

const updateRating = async (ratingData: any) => {
  try {
    const response = await ratingsApi.updateRating(ratingData);
    return response;
  } catch (error) {
    console.error('更新评分错误:', error);
    message.error('更新评分失败');
    return null;
  }
};

interface RateFormProps {
  backButtonClick: () => void;
  onFileClick: (file: Record<string, any>) => void;
  userId: number;
}

export default function RateForm({ backButtonClick, onFileClick, userId }: RateFormProps) {
  const [ratings, setRatings] = useState<Record<number, Record<string, number>>>({});
  const [isEdit, setIsEdit] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [workData, setWorkData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [userRatings, setUserRatings] = useState<Record<string, any>[]>([]);

  // 当前用户的评分数据是否是已提交状态
  const hasAllSubmitted = useMemo(() => {
    return userRatings.length > 0 && userRatings.every((rating: any) => rating.status == 2);
  }, [userRatings]);

  // 标题文本
  const titleContent = useMemo(() => {
    if(hasAllSubmitted) {
      return '评分统计'
    }else {
      if(isEdit) {
        return '开始评分'
      }else {
        return '评分统计'
      }
    }
  }, [hasAllSubmitted, isEdit]);
  
  const isShowStats = useMemo(() => {
    return hasAllSubmitted || !isEdit;
  }, [hasAllSubmitted, isEdit]);

  useEffect(() => {
    setMounted(true);
    // 获取待评分作品和用户评分数据
    const loadData = async () => {
      setLoading(true);
      try {
        // 只有当userId可用时才获取用户评分数据
        const [
          works, 
          userRatingsData
        ] = await Promise.all([
          fetchRatingWorks(),
          userId ? fetchUserRatings() : Promise.resolve([])
        ]);
        console.log('works', works);
        console.log('userRatingsData', userRatingsData);

        setWorkData(works);
        setUserRatings(userRatingsData);

        // 初始化评分数据（无论评分是否已提交都需要初始化，以便显示评分统计）
        const initialRatings: Record<number, Record<string, number>> = {};
        
        // 为每个作品初始化评分
        works.forEach((work: any) => {
          initialRatings[work.id] = {};
          
          // 查找当前作品的评分维度
          const workRatingDimensionIds = work.ratingDimensionIds || [];
          
          // 查找当前用户对该作品的评分
          const userRatingForWork = userRatingsData.find((rating: any) => rating.workId === work.id);
          
          if (userRatingForWork) {
            // 如果有评分数据，填充已有的评分
            userRatingForWork.scores.forEach((item: any) => {
              if (workRatingDimensionIds.includes(item.ratingDimensionId)) {
                initialRatings[work.id][item.ratingDimensionId] = item.score;
              }
            });
          } else {
            // 如果没有评分数据，初始化所有维度为0
            workRatingDimensionIds.forEach((dimensionId: number) => {
              initialRatings[work.id][dimensionId] = 0;
            });
          }
        });
        
        setRatings(initialRatings);
      } catch (error) {
        console.error('加载数据错误:', error);
        message.error('加载数据失败');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]); // 当userId变化时重新加载数据

  useEffect(() => {
    if(hasAllSubmitted) {
      setIsEdit(false);
    }
  }, [hasAllSubmitted])

  // 获取当前用户的所有评分数据
  const fetchUserRatings = async () => {
    try {
      const response: any = userId ? await ratingsApi.getUserRatings(userId) : await ratingsApi.getUserRatings();
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('获取用户评分数据错误:', error);
      message.error('获取用户评分数据失败');
      return [];
    }
  };

  // 获取待评分作品数据
  const fetchRatingWorks = async () => {
    try {
      const response: any = await ratingsApi.getWorksToRate();
      if (response.success) {
        return response.data
      }
      return [];
    } catch (error) {
      console.error('获取待评分作品错误:', error);
      message.error('获取待评分作品失败');
      return [];
    }
  };

  // 处理文件点击
  const handleFileClick = (file: Record<string, any>) => {
    onFileClick(file);
  };

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
    return workData.every(item => {
      const itemRatings = ratings[item.id];
      if (!itemRatings) return false;
      
      // 获取当前作品的评分维度
      const workDimensionIds = item.ratingDimensionIds || [];
      if (workDimensionIds.length === 0) return true; // 如果没有评分维度，默认已完成
      
      // 检查当前作品的所有评分维度是否都已填写
      return workDimensionIds.every((dimensionId: number) => {
        const score = itemRatings[dimensionId];
        return score !== undefined && score > 0 && score <= 100;
      });
    });
  };

  // 保存评分
  const handleSave = async () => {
    if (!isAllRated()) {
      message.warning('请完成所有评分项');
      return;
    }
    setLoading(true);
    try {
      // 创建所有需要执行的Promise
      const ratingPromises = workData.map(work => {
        const itemRatings: Record<string, any> = ratings[work.id] || {};
        const workDimensionIds = work.ratingDimensionIds || [];
        
        // 准备评分数据
        const ratingData: Record<string, any> = {
          userId: userId,
          workId: work.id,
          content: '',
          status: 1, // 1草稿 2提交
          scores: workDimensionIds.map((dimensionId: number) => ({
            ratingDimensionId: dimensionId,
            score: itemRatings[dimensionId] || 0
          }))
        };

        // 查找当前用户对该作品的评分
        const userRatingForWork = userRatings.find((rating: any) => rating.workId == work.id);
        
        if (userRatingForWork) {
          // 如果是更新现有评分
          ratingData.id = userRatingForWork.id;
          return () => updateRating(ratingData);
        } else {
          // 如果是新评分
          return () => submitRating(ratingData);
        }
      });
      await ratingPromises.reduce(async(pre: any, cur: any) => { 
        await pre; 
        return cur() }
      , Promise.resolve());

      // 更新用户评分数据
      const updatedUserRatings = await fetchUserRatings();
      setUserRatings(updatedUserRatings);

      // 所有评分保存/更新成功后显示一次提示
      message.success('评分已保存', 3);
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('保存评分错误:', error);
      message.error('保存评分失败');
    } finally {
      setIsEdit(false);
      setLoading(false);
    }
  };

  // 修改评分
  const handleModify = () => {
    setIsEdit(true);
  };

  // 提交评分
  const handleSubmit = async() => {
    setLoading(true);
    try {
      // 创建所有需要执行的Promise
      const ratingPromises = workData.map(work => {
        const itemRatings: Record<string, any> = ratings[work.id] || {};
        const workDimensionIds = work.ratingDimensionIds || [];
        // 准备评分数据
        const ratingData: Record<string, any> = {
          userId: userId,
          workId: work.id,
          content: '',
          status: 2, // 1草稿 2提交
          scores: workDimensionIds.map((dimensionId: number) => ({
            ratingDimensionId: dimensionId,
            score: itemRatings[dimensionId] || 0
          }))
        };
        // 查找当前用户对该作品的评分
        const userRatingForWork = userRatings.find((rating: any) => rating.workId === work.id);
        
        if (userRatingForWork) {
          // 如果是更新现有评分
          ratingData.id = userRatingForWork.id;
          return () => updateRating(ratingData);
        } else {
          // 如果是新评分
          return () => submitRating(ratingData);
        }
      });
      await ratingPromises.reduce(async(pre: any, cur: any) => { 
        await pre; 
        return cur() }
      , Promise.resolve());

      // 更新用户评分数据
      const updatedUserRatings = await fetchUserRatings();
      setUserRatings(updatedUserRatings);
      
      // 所有评分提交成功后显示一次提示
      message.success('所有评分已提交', 3);
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });     
    } catch (error) {
      console.error('提交评分错误:', error);
      message.error('提交评分失败');
    } finally {
      setIsEdit(false);
      setLoading(false);
    }
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
          { titleContent }
        </Title>
      </div>
      <Spin className="page-main" spinning={loading}>
        <Card className="card fade-in" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          {isShowStats ? (
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
                {workData.map(item => {
                  const itemRatings = ratings[item.id] || {};
                  return (
                    <div
                      key={item.id}
                      className="stat-item"
                    >
                      <div className="stat-item-header">
                        <Text className="stat-item-name">{item.title}</Text>
                      </div>
                      <div className="stat-item-info">
                        {item.ratingDimensions.map((dimension: Record<string, any>, index: number) => {
                          const dimScore = itemRatings[dimension.id];
                          return (
                            <div
                              key={dimension.id}
                              className="stat-item-dimension"
                            >
                              <div className="dimension-item">
                                <Text className="dimension-item-label">{dimension.name}</Text>
                                <Text className="dimension-item-value" style={{ color: colors[index] }}>{dimScore}</Text>
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
          ) : (
            // 评分表单内容
            <RatingFormContent
              workData={workData}
              ratings={ratings}
              handleRatingChange={handleRatingChange}
              colors={colors}
              onFileClick={handleFileClick}
            />
          )}
        </Card>

        {/* 使用RatingButtons组件 */}
        {!hasAllSubmitted && (
          <RatingButtons
            isEditStatus={isEdit}
            handleModify={handleModify}
            handleSubmit={handleSubmit}
            handleSave={() => handleSave()}
          />
        )}
      </Spin>
    </div>
  );
}