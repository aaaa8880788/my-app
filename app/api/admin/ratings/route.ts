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

// 获取所有评分
// 支持分页、状态过滤、用户ID过滤、作品ID过滤和排序
export async function GET(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const workId = searchParams.get('workId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const sortField = searchParams.get('sortField');
    const sortOrder = searchParams.get('sortOrder');
    
    // 从数据库获取所有评分
    let ratings = await db.getAll('ratings');
    
    // 应用过滤条件
    if (status) {
      ratings = ratings.filter((rating: Rating) => rating.status === parseInt(status));
    }
    
    if (workId) {
      ratings = ratings.filter((rating: Rating) => rating.workId === parseInt(workId));
    }
    
    if (userId) {
      ratings = ratings.filter((rating: Rating) => rating.userId === parseInt(userId));
    }
    
    // 应用排序
    if (sortField) {
      ratings.sort((a: Rating, b: Rating) => {
        const aValue = a[sortField as keyof Rating];
        const bValue = b[sortField as keyof Rating];
        
        // 字符串类型比较
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (sortOrder === 'ascend') {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        }
        
        // 数字类型比较
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          if (sortOrder === 'ascend') {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        }
        
        return 0;
      });
    }
    
    // 计算总条数
    const total = ratings.length;
    
    // 分页处理
    const startIndex = (page - 1) * pageSize;
    const paginatedRatings = ratings.slice(startIndex, startIndex + pageSize);
    
    return NextResponse.json({
      success: true,
      data: {
        list: paginatedRatings,
        total,
        page,
        pageSize
      },
      message: '获取评分列表成功'
    }, { status: 200 });
  } catch (error) {
    console.error('获取评分列表错误:', error);
    return NextResponse.json({ success: false, message: '获取评分列表失败' }, { status: 500 });
  }
}

// 创建评分
export async function POST(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    const { userId, workId, content, scores, status = 1 } = await request.json();
    
    // 验证必填字段
    if (!userId || !workId || !scores || !Array.isArray(scores) || scores.length === 0) {
      return NextResponse.json({ success: false, message: '用户ID、作品ID和评分不能为空' }, { status: 400 });
    }
    
    // 验证评分格式和范围
    for (const scoreItem of scores) {
      if (!scoreItem.ratingDimensionId || scoreItem.score === undefined) {
        return NextResponse.json({ success: false, message: '每个评分维度必须包含维度ID和分数' }, { status: 400 });
      }
      if (scoreItem.score < 0 || scoreItem.score > 100) {
        return NextResponse.json({ success: false, message: '评分必须在0-100之间' }, { status: 400 });
      }
    }
    
    // 验证状态值
    if (status !== 1 && status !== 2) {
      return NextResponse.json({ success: false, message: '状态值必须是1或2' }, { status: 400 });
    }
    
    // 检查是否已经存在相同用户和作品的评分
    const existingRatings = await db.getAll('ratings');
    const duplicateRating = existingRatings.find((rating: Rating) => 
      rating.userId === userId && 
      rating.workId === workId
    );
    
    if (duplicateRating) {
      return NextResponse.json({ success: false, message: '该作品已被此用户评分，不可重复评分' }, { status: 400 });
    }
    
    // 获取当前时间
    const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    
    // 创建新评分
    const newRating: Omit<Rating, 'id'> = {
      userId,
      workId,
      content: content || '',
      scores,
      status,
      createdAt: now,
      updatedAt: now
    };
    
    // 保存新评分到数据库
    const savedRating = await db.create('ratings', newRating);
    
    return NextResponse.json({
      success: true,
      data: savedRating,
      message: '创建评分成功'
    }, { status: 200 });
  } catch (error) {
    console.error('创建评分错误:', error);
    return NextResponse.json({ success: false, message: '创建评分失败' }, { status: 500 });
  }
}

// 更新评分
export async function PUT(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    const { id, userId, workId, content, scores, status } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, message: '评分ID不能为空' }, { status: 400 });
    }
    
    // 构建更新对象
    const updateData: Partial<Rating> = {
      updatedAt: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    };
    
    if (userId !== undefined) updateData.userId = userId;
    if (workId !== undefined) updateData.workId = workId;
    if (content !== undefined) updateData.content = content;
    
    if (scores !== undefined) {
      // 验证评分格式和范围
      if (!Array.isArray(scores) || scores.length === 0) {
        return NextResponse.json({ success: false, message: '评分不能为空' }, { status: 400 });
      }
      for (const scoreItem of scores) {
        if (!scoreItem.ratingDimensionId || scoreItem.score === undefined) {
          return NextResponse.json({ success: false, message: '每个评分维度必须包含维度ID和分数' }, { status: 400 });
        }
        if (scoreItem.score < 0 || scoreItem.score > 100) {
          return NextResponse.json({ success: false, message: '评分必须在0-100之间' }, { status: 400 });
        }
      }
      updateData.scores = scores;
    }
    
    if (status !== undefined) {
      // 验证状态值
      if (status !== 1 && status !== 2) {
        return NextResponse.json({ success: false, message: '状态值必须是1或2' }, { status: 400 });
      }
      updateData.status = status;
    }
    
    // 检查是否存在除当前记录外的重复评分
    // 对于多维度评分，我们只需要检查同一用户对同一作品是否已有评分
    const existingRatings = await db.getAll('ratings');
    const targetUserId = updateData.userId || existingRatings.find(r => r.id === id)?.userId;
    const targetWorkId = updateData.workId || existingRatings.find(r => r.id === id)?.workId;
    
    const duplicateRating = existingRatings.find((rating: Rating) => 
      rating.id !== id && // 排除当前要更新的记录
      rating.userId === targetUserId && 
      rating.workId === targetWorkId
    );
    
    if (duplicateRating) {
      return NextResponse.json({ success: false, message: '该作品已被此用户评分，不可重复评分' }, { status: 400 });
    }
    
    // 更新评分信息
    const updatedRating = await db.update('ratings', id, updateData);
    
    if (!updatedRating) {
      return NextResponse.json({ success: false, message: '评分不存在' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: updatedRating,
      message: '更新评分成功'
    }, { status: 200 });
  } catch (error) {
    console.error('更新评分错误:', error);
    return NextResponse.json({ success: false, message: '更新评分失败' }, { status: 500 });
  }
}

// 删除评分
export async function DELETE(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, message: '评分ID不能为空' }, { status: 400 });
    }
    
    // 检查评分是否存在
    const rating = await db.getOne('ratings', id);
    if (!rating) {
      return NextResponse.json({ success: false, message: '评分不存在' }, { status: 404 });
    }
    
    // 从数据库删除评分
    const deleted = await db.delete('ratings', id);
    
    if (!deleted) {
      return NextResponse.json({ success: false, message: '删除评分失败' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: '删除评分成功'
    }, { status: 200 });
  } catch (error) {
    console.error('删除评分错误:', error);
    return NextResponse.json({ success: false, message: '删除评分失败' }, { status: 500 });
  }
}
