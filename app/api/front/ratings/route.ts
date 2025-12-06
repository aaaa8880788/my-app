import { NextRequest, NextResponse } from 'next/server';
import db from '../../database/db';

// 定义评分维度类型
interface RatingDimension {
  id: string;
  ratingDimensionName: string;
  createdAt: string;
}

// 定义作品类型
interface Work {
  id: number;
  title: string;
  description: string;
  files?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

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

// 获取评分
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    // 从数据库获取所有评分
    let ratings = await db.getAll('ratings');
    if (userId) {
      // 过滤特定用户的评分
      ratings = ratings.filter((rating: Rating) => rating.userId === Number(userId));
    }

    return NextResponse.json({
      success: true,
      data: ratings,
      message: '获取评分数据成功'
    }, { status: 200 });
  } catch (error) {
    console.error('获取评分相关数据错误:', error);
    return NextResponse.json({
      success: false,
      message: '获取评分相关数据失败'
    }, { status: 500 });
  }
}

// 提交评分
export async function POST(request: NextRequest) {
  try {
    const ratingData = await request.json();
    console.log('提交评分数据:', ratingData);
    
    // 验证请求数据
    if (!ratingData.userId || !ratingData.workId || !ratingData.scores) {
      return NextResponse.json({
        success: false,
        message: '缺少必要的评分数据'
      }, { status: 400 });
    }

    // 获取评分维度用于验证
    const dimensions = await db.getAll('rating-dimensions');

    // 验证评分数据格式
    const invalidRatings = ratingData.scores.filter((rating: any) => {
      // 检查评分维度是否存在
      const dimensionExists = dimensions.some(dim => dim.id === rating.ratingDimensionId);
      // 检查分数是否在有效范围内
      const scoreValid = rating.score !== undefined && rating.score >= 0 && rating.score <= 100;

      return !dimensionExists || !scoreValid;
    });

    if (invalidRatings.length > 0) {
      return NextResponse.json({
        success: false,
        message: '评分数据格式错误'
      }, { status: 400 });
    }

    // 创建评分记录
    const newRating: Rating = {
      ...ratingData,
      createdAt: new Date().toLocaleString('zh-CN')
    };
    console.log('创建评分记录: newRating', newRating);
    const savedRating = await db.create('ratings', newRating);

    return NextResponse.json({
      success: true,
      data: savedRating,
      message: '提交评分成功'
    }, { status: 201 });
  } catch (error) {
    console.error('提交评分错误:', error);
    return NextResponse.json({
      success: false,
      message: '提交评分失败'
    }, { status: 500 });
  }
}

// 更新评分
export async function PUT(request: NextRequest) {
  try {
    const ratingData = await request.json();

    // 验证请求数据
    if (!ratingData.id || !ratingData.scores) {
      return NextResponse.json({
        success: false,
        message: '缺少必要的评分数据'
      }, { status: 400 });
    }

    // 获取评分维度用于验证
    const dimensions = await db.getAll('rating-dimensions');

    // 验证评分数据格式
    const invalidRatings = ratingData.scores.filter((rating: any) => {
      const dimensionExists = dimensions.some(dim => dim.id === rating.ratingDimensionId);
      const scoreValid = rating.score !== undefined && rating.score >= 0 && rating.score <= 100;

      return !dimensionExists || !scoreValid;
    });

    if (invalidRatings.length > 0) {
      return NextResponse.json({
        success: false,
        message: '评分数据格式错误'
      }, { status: 400 });
    }

    // 更新评分记录
    const updatedRating = {
      ...ratingData,
      updatedAt: new Date().toLocaleString('zh-CN')
    };

    const savedRating = await db.update('ratings', ratingData.id, updatedRating);

    if (!savedRating) {
      return NextResponse.json({
        success: false,
        message: '评分记录不存在'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: savedRating,
      message: '更新评分成功'
    }, { status: 200 });
  } catch (error) {
    console.error('更新评分错误:', error);
    return NextResponse.json({
      success: false,
      message: '更新评分失败'
    }, { status: 500 });
  }
}
