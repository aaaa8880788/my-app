import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '../../database/db';

// 定义评分维度分数类型
interface DimensionScore {
  ratingDimensionId: number;
  score: number;
}

// 定义评分类型
interface Rating {
  id: number;
  userId: number;
  workId: number;
  content: string;
  scores: DimensionScore[];
  status: number;
  createdAt: string;
  updatedAt: string;
}

// JWT验证中间件
async function verifyToken(request: NextRequest): Promise<boolean> {
  try {
    // 获取请求头中的Authorization字段
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    
    // 提取token
    const token = authHeader.split(' ')[1];
    
    // 验证token
    jwt.verify(token, 'default-secret-key');
    return true;
  } catch (error) {
    console.error('Token验证失败:', error);
    return false;
  }
}

// 获取评分统计数据
export async function GET(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    // 从数据库获取所有评分
    const allRatings = await db.getAll('ratings');
    const allWorks = await db.getAll('works');
    const allUsers = await db.getAll('users');
    
    // 筛选出已提交的评分（status=2）
    const submittedRatings = allRatings.filter((rating: Rating) => rating.status === 2);
    
    // 计算每个作品的统计信息
    const workStatistics = allWorks.map(work => {
      // 获取该作品的所有已提交评分
      const workRatings = submittedRatings.filter((rating: Rating) => rating.workId === work.id);
      
      // 计算每个用户对该作品的最终评分（各维度平均分）
      const userFinalScores = workRatings.map((rating: Rating) => {
        if (rating.scores && rating.scores.length > 0) {
          const totalScore = rating.scores.reduce((sum, item) => sum + item.score, 0);
          return totalScore / rating.scores.length;
        }
        return 0;
      });
      
      // 计算作品的统计指标
      const highestScore = userFinalScores.length > 0 ? Math.max(...userFinalScores) : 0;
      const lowestScore = userFinalScores.length > 0 ? Math.min(...userFinalScores) : 0;
      const averageScore = userFinalScores.length > 0 
        ? userFinalScores.reduce((sum, score) => sum + score, 0) / userFinalScores.length 
        : 0;
      
      return {
        workId: work.id,
        workName: work.title || `作品${work.id}`,
        ratedCount: workRatings.length,
        highestScore: parseFloat(highestScore.toFixed(0)),
        lowestScore: parseFloat(lowestScore.toFixed(0)),
        averageScore: parseFloat(averageScore.toFixed(0))
      };
    });
    
    // 处理评分记录，添加用户和作品信息
    const detailedRatings = submittedRatings.map((rating: Rating) => {
      // 计算最终评分
      const finalScore = rating.scores && rating.scores.length > 0 
        ? rating.scores.reduce((sum, item) => sum + item.score, 0) / rating.scores.length 
        : 0;
      
      // 获取用户信息
      const user = allUsers.find(user => user.id === rating.userId);
      
      // 获取作品信息
      const work = allWorks.find(work => work.id === rating.workId);
      
      return {
        ...rating,
        finalScore: parseFloat(finalScore.toFixed(0)),
        userName: user?.username || `用户${rating.userId}`,
        workName: work?.title || `作品${rating.workId}`
      };
    });
    
    // 计算总体统计
    const totalWorks = workStatistics.length;
    const totalRatedWorks = workStatistics.filter(work => work.ratedCount > 0).length;
    const totalRatings = submittedRatings.length;
    const totalUsers = [...new Set(submittedRatings.map(rating => rating.userId))].length;
    
    return NextResponse.json({
      success: true,
      data: {
        overall: {
          totalWorks,
          totalRatedWorks,
          totalRatings,
          totalUsers
        },
        workStatistics,
        detailedRatings
      },
      message: '获取统计数据成功'
    }, { status: 200 });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    return NextResponse.json({ success: false, message: '获取统计数据失败' }, { status: 500 });
  }
}