import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '../../database/db';

// 定义评分维度类型
interface RatingDimension {
  id: number;
  name: string;
  description: string;
  createdAt: string;
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

// 获取所有评分维度
export async function GET(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    
    // 从数据库获取所有评分维度
    let dimensions = await db.getAll('rating-dimensions');
    
    // 如果有搜索参数，过滤评分维度
    if (name) {
      dimensions = dimensions.filter((dimension: RatingDimension) => 
        dimension.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    // 计算总条数
    const total = dimensions.length;
    
    // 分页处理
    const startIndex = (page - 1) * pageSize;
    const paginatedDimensions = dimensions.slice(startIndex, startIndex + pageSize);
    
    return NextResponse.json({
      success: true,
      data: {
        list: paginatedDimensions,
        total,
        page,
        pageSize
      },
      message: '获取评分维度列表成功'
    }, { status: 200 });
  } catch (error) {
    console.error('获取评分维度列表错误:', error);
    return NextResponse.json({ success: false, message: '获取评分维度列表失败' }, { status: 500 });
  }
}

// 创建评分维度
export async function POST(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    const { name, description } = await request.json();
    
    if (!name) {
      return NextResponse.json({ success: false, message: '维度名称不能为空' }, { status: 400 });
    }
    
    // 从数据库获取所有评分维度
    const dimensions = await db.getAll('rating-dimensions');
    
    // 创建新评分维度
    const newDimension: RatingDimension = {
      id: Math.max(...dimensions.map((d: RatingDimension) => d.id), 0) + 1,
      name,
      description: description || '',
      createdAt: new Date().toLocaleString('zh-CN')
    };
    
    // 保存新评分维度到数据库
    await db.create('rating-dimensions', newDimension);
    
    return NextResponse.json({
      success: true,
      data: newDimension,
      message: '创建评分维度成功'
    }, { status: 200 });
  } catch (error) {
    console.error('创建评分维度错误:', error);
    return NextResponse.json({ success: false, message: '创建评分维度失败' }, { status: 500 });
  }
}

// 更新评分维度
export async function PUT(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    const { id, name, description } = await request.json();
    
    if (!id || !name) {
      return NextResponse.json({ success: false, message: '评分维度ID和名称不能为空' }, { status: 400 });
    }
    
    // 从数据库获取所有评分维度
    const dimensions = await db.getAll('rating-dimensions');
    
    // 查找要更新的评分维度
    const dimensionIndex = dimensions.findIndex((d: RatingDimension) => d.id === id);
    if (dimensionIndex === -1) {
      return NextResponse.json({ success: false, message: '评分维度不存在' }, { status: 404 });
    }
    
    // 更新评分维度信息
    const updatedDimension: RatingDimension = {
      ...dimensions[dimensionIndex],
      name,
      description: description || ''
    };
    
    // 更新数据库
    await db.update('rating-dimensions', id, updatedDimension);
    
    return NextResponse.json({
      success: true,
      data: updatedDimension,
      message: '更新评分维度成功'
    }, { status: 200 });
  } catch (error) {
    console.error('更新评分维度错误:', error);
    return NextResponse.json({ success: false, message: '更新评分维度失败' }, { status: 500 });
  }
}

// 删除评分维度
export async function DELETE(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, message: '评分维度ID不能为空' }, { status: 400 });
    }
    
    // 检查评分维度是否存在
    const dimension = await db.getOne('rating-dimensions', id);
    if (!dimension) {
      return NextResponse.json({ success: false, message: '评分维度不存在' }, { status: 404 });
    }
    
    // 从数据库删除评分维度
    await db.delete('rating-dimensions', id);
    
    return NextResponse.json({
      success: true,
      message: '删除评分维度成功'
    }, { status: 200 });
  } catch (error) {
    console.error('删除评分维度错误:', error);
    return NextResponse.json({ success: false, message: '删除评分维度失败' }, { status: 500 });
  }
}