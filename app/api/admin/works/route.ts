import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '../../database/db';

// 定义作品类型
interface Work {
  id: number;
  title: string;
  description: string;
  ratingDimensionIds: number[];
  createdAt: string;
  updatedAt?: string;
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

// 获取所有作品或单个作品
export async function GET(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get('title');
    const idParam = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    
    if (idParam) {
      // 根据ID获取单个作品
      let work = await db.getOne('works', parseInt(idParam));
      if (!work) {
        return NextResponse.json({ success: false, message: '作品不存在' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: work,
        message: '获取作品成功'
      }, { status: 200 });
    }
    
    // 从数据库获取所有作品
    let works = await db.getAll('works');
    
    // 如果有搜索参数，过滤作品
    if (title) {
      works = works.filter((work: Work) => 
        work.title.toLowerCase().includes(title.toLowerCase())
      );
    }
    
    // 计算总条数
    const total = works.length;
    
    // 分页处理
    const startIndex = (page - 1) * pageSize;
    const paginatedWorks = works.slice(startIndex, startIndex + pageSize);
    
    return NextResponse.json({
      success: true,
      data: {
        list: paginatedWorks,
        total,
        page,
        pageSize
      },
      message: '获取作品列表成功'
    }, { status: 200 });
  } catch (error) {
    console.error('获取作品列表错误:', error);
    return NextResponse.json({ success: false, message: '获取作品列表失败' }, { status: 500 });
  }
}

// 创建作品
export async function POST(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    const { title, description, ratingDimensionIds } = await request.json();
    
    if (!title || !description || !ratingDimensionIds) {
      return NextResponse.json({ success: false, message: '作品标题、描述和评分维度ID不能为空' }, { status: 400 });
    }
    
    // 创建新作品
    const newWork: Omit<Work, 'id' | 'createdAt'> = {
      title,
      description,
      ratingDimensionIds
    };
    
    // 保存新作品到数据库
    const savedWork = await db.create('works', newWork);
    
    return NextResponse.json({
      success: true,
      data: savedWork,
      message: '创建作品成功'
    }, { status: 200 });
  } catch (error) {
    console.error('创建作品错误:', error);
    return NextResponse.json({ success: false, message: '创建作品失败' }, { status: 500 });
  }
}

// 更新作品
export async function PUT(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    const { id, title, description, ratingDimensionIds } = await request.json();
    
    if (!id || !title || !description || !ratingDimensionIds) {
      return NextResponse.json({ success: false, message: '作品ID、标题、描述和评分维度ID不能为空' }, { status: 400 });
    }
    
    // 更新作品信息
    const updatedWork: Omit<Work, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      description,
      ratingDimensionIds
    };
    
    // 更新数据库
    const result = await db.update('works', id, updatedWork);
    
    if (!result) {
      return NextResponse.json({ success: false, message: '作品不存在' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: result,
      message: '更新作品成功'
    }, { status: 200 });
  } catch (error) {
    console.error('更新作品错误:', error);
    return NextResponse.json({ success: false, message: '更新作品失败' }, { status: 500 });
  }
}

// 删除作品
export async function DELETE(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, message: '作品ID不能为空' }, { status: 400 });
    }
    
    // 检查作品是否存在
    const work = await db.getOne('works', id);
    if (!work) {
      return NextResponse.json({ success: false, message: '作品不存在' }, { status: 404 });
    }
    
    // 从数据库删除作品
    await db.delete('works', id);
    
    return NextResponse.json({
      success: true,
      message: '删除作品成功'
    }, { status: 200 });
  } catch (error) {
    console.error('删除作品错误:', error);
    return NextResponse.json({ success: false, message: '删除作品失败' }, { status: 500 });
  }
}