import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '../../database/db';

// 定义用户类型
interface User {
  id: number;
  username: string;
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

// 获取所有用户
export async function GET(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    
    // 从数据库获取所有用户
    let users = await db.getAll('users');
    
    // 如果有搜索参数，过滤用户
    if (username) {
      users = users.filter((user: User) => 
        user.username.toLowerCase().includes(username.toLowerCase())
      );
    }
    
    // 计算总条数
    const total = users.length;
    
    // 分页处理
    const startIndex = (page - 1) * pageSize;
    const paginatedUsers = users.slice(startIndex, startIndex + pageSize);
    
    return NextResponse.json({
      success: true,
      data: {
        list: paginatedUsers,
        total,
        page,
        pageSize
      },
      message: '获取用户列表成功'
    }, { status: 200 });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    return NextResponse.json({ success: false, message: '获取用户列表失败' }, { status: 500 });
  }
}

// 创建用户
export async function POST(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json({ success: false, message: '用户名不能为空' }, { status: 400 });
    }
    
    // 从数据库获取所有用户
    const users = await db.getAll('users');
    
    // 创建新用户
    const newUser: User = {
      id: Math.max(...users.map((u: User) => u.id), 0) + 1,
      username,
      createdAt: new Date().toLocaleString('zh-CN')
    };
    
    // 保存新用户到数据库
    await db.create('users', newUser);
    
    return NextResponse.json({
      success: true,
      data: newUser,
      message: '创建用户成功'
    }, { status: 200 });
  } catch (error) {
    console.error('创建用户错误:', error);
    return NextResponse.json({ success: false, message: '创建用户失败' }, { status: 500 });
  }
}

// 更新用户
export async function PUT(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    const { id, username } = await request.json();
    
    if (!id || !username) {
      return NextResponse.json({ success: false, message: '用户ID和用户名不能为空' }, { status: 400 });
    }
    
    // 从数据库获取所有用户
    const users = await db.getAll('users');
    
    // 查找要更新的用户
    const userIndex = users.findIndex((u: User) => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 });
    }
    
    // 更新用户信息
    const updatedUser: User = {
      ...users[userIndex],
      username
    };
    
    // 更新数据库
    await db.update('users', id, updatedUser);
    
    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: '更新用户成功'
    }, { status: 200 });
  } catch (error) {
    console.error('更新用户错误:', error);
    return NextResponse.json({ success: false, message: '更新用户失败' }, { status: 500 });
  }
}

// 删除用户
export async function DELETE(request: NextRequest) {
  // 验证token
  const isValidToken = await verifyToken(request);
  if (!isValidToken) {
    return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
  }
  
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, message: '用户ID不能为空' }, { status: 400 });
    }
    
    // 从数据库获取所有用户
    const users = await db.getAll('users');
    
    // 检查用户是否存在
    const user = users.find((u: User) => u.id === id);
    if (!user) {
      return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 });
    }
    
    // 从数据库删除用户
    await db.delete('users', id);
    
    return NextResponse.json({
      success: true,
      message: '删除用户成功'
    }, { status: 200 });
  } catch (error) {
    console.error('删除用户错误:', error);
    return NextResponse.json({ success: false, message: '删除用户失败' }, { status: 500 });
  }
}