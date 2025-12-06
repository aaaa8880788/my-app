'use client';
import React from 'react';
import { Table } from 'antd';
import type { ColumnType } from 'antd/es/table';

interface RatingUser {
  id: number;
  userId: number;
  userName: string;
  scores: Array<{
    ratingDimensionId: number;
    score: number;
  }>;
  finalScore: number;
  createdAt: string;
  isHighest?: boolean;
  isLowest?: boolean;
}

interface WorkRating {
  workId: number;
  workName: string;
  ratedUserCount: number;
  ratedUsers: RatingUser[];
  avgScore: number;
}

interface RatingTableProps {
  detailedRatings: Array<{
    id: number;
    userId: number;
    userName: string;
    workId: number;
    workName: string;
    content: string;
    scores: Array<{
      ratingDimensionId: number;
      score: number;
    }>;
    finalScore: number;
    status: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

const RatingTable: React.FC<RatingTableProps> = ({ detailedRatings }) => {
  // 排序状态管理
  const [sortOrder, setSortOrder] = React.useState<'ascend' | 'descend'>('ascend');
  
  // 将详细评分数据按作品分组
  const groupByWork = (): WorkRating[] => {
    const workMap = new Map<number, WorkRating>();
    
    detailedRatings.forEach((rating) => {
      const { workId, workName } = rating;
      
      // 如果作品不存在，创建新的作品记录
      if (!workMap.has(workId)) {
        workMap.set(workId, {
          workId,
          workName,
          ratedUserCount: 0,
          ratedUsers: [],
          avgScore: 0,
        });
      }
      
      const work = workMap.get(workId)!;
      
      // 仅统计status为2的评分
      if (rating.status === 2) {
        work.ratedUserCount++;
        work.ratedUsers.push({
          id: rating.id,
          userId: rating.userId,
          userName: rating.userName,
          scores: rating.scores,
          finalScore: rating.finalScore,
          createdAt: rating.createdAt,
        });
      }
    });
    
    // 对每个作品的用户按最终评分排序并标记最高分和最低分
    workMap.forEach((work) => {
      // 先排序
      work.ratedUsers.sort((a, b) => {
        if (sortOrder === 'ascend') {
          return a.finalScore - b.finalScore;
        } else {
          return b.finalScore - a.finalScore;
        }
      });
      
      // 如果有评分用户，标记最高分和最低分
      if (work.ratedUserCount > 0) {
        // 先重置所有用户的标识
        work.ratedUsers.forEach(user => {
          user.isHighest = false;
          user.isLowest = false;
        });
        
        // 找出最高分和最低分
        const scores = work.ratedUsers.map(user => user.finalScore);
        const highestScore = Math.max(...scores);
        const lowestScore = Math.min(...scores);
        
        // 标记最高分和最低分用户
        work.ratedUsers.forEach(user => {
          if (user.finalScore === highestScore) {
            user.isHighest = true;
          }
          if (user.finalScore === lowestScore) {
            user.isLowest = true;
          }
        });
        
        // 计算平均分
        const totalScore = work.ratedUsers.reduce((sum, user) => sum + user.finalScore, 0);
        work.avgScore = parseFloat((totalScore / work.ratedUserCount).toFixed(2));
      } else {
        work.avgScore = 0;
      }
    });
    
    // 将Map转换为数组
    return Array.from(workMap.values());
  };
  
  const workRatings = groupByWork();
  
  // 表格列配置
  const columns: ColumnType<WorkRating>[] = [
    {
      title: '作品名称',
      dataIndex: 'workName',
      key: 'workName',
      align: 'center',
    },
    {
      title: '已评分用户数',
      dataIndex: 'ratedUserCount',
      key: 'ratedUserCount',
      width: 150,
      align: 'center',
      sorter: (a, b) => a.ratedUserCount - b.ratedUserCount,
    },
    {
      title: '平均分',
      dataIndex: 'avgScore',
      key: 'avgScore',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.avgScore - b.avgScore,
      render: (avgScore: number) => avgScore > 0 ? `${avgScore}分` : '暂无评分',
    },
    {
      title: (
        <div className="rating-header-with-sort">
          <span>已评分用户信息</span>
          <button
            className={`sort-button ${sortOrder}`}
            onClick={() => setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend')}
            style={{
              marginLeft: '8px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#666'
            }}
          >
            {sortOrder === 'ascend' ? '↑ 升序' : '↓ 降序'}
          </button>
        </div>
      ),
      key: 'ratedUsers',
      align: 'center',
      render: (_: any, record: WorkRating) => (
        <div>
          {record.ratedUsers.length > 0 ? (
            <div className="rated-users-list">
              {record.ratedUsers.map((user) => (
                <div key={user.id} className="rated-user-item">
                  <div className="user-info">
                    <div className="user-info-name">
                      {user.userName}
                      {user.isHighest && (
                        <span className="score-tag highest-tag">最高分</span>
                      )}
                      {user.isLowest && (
                        <span className="score-tag lowest-tag">最低分</span>
                      )}
                    </div>
                    <div className="user-info-score">
                      <div className="score-final">最终评分: {user.finalScore.toFixed(0)}分</div>
                      <div className="score-dimensions">
                        {user.scores.map((score, index) => (
                          <div key={score.ratingDimensionId} className="score-dimension">
                            维度{index + 1}: {score.score}分
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="user-info-rating-tiem">
                      {new Date(user.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className="no-ratings">暂无评分</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={workRatings}
      rowKey="workId"
      pagination={{ pageSize: 10 }}
      scroll={{ x: 800 }}
      style={{ marginTop: 20 }}
    />
  );
};

// 添加一些基本样式
const styles = `
.rated-users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rated-user-item {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px;
  background-color: #fafafa;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info-name {
  font-weight: bold;
  color: #1890ff;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 180px;
}

.score-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.highest-tag {
  background-color: #52c41a;
}

.lowest-tag {
  background-color: #ff4d4f;
}

.user-info-score {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.score-final {
  font-weight: bold;
  color: #ff7875;
}

.score-dimensions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.user-info-rating-tiem {
  font-size: 12px;
  color: #888;
}
`;

// 移除动态添加样式的代码，避免服务端渲染问题

export default RatingTable;