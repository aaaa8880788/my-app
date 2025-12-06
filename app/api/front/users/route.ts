import { NextRequest, NextResponse } from 'next/server';
import db from '../../database/db';

// 定义用户类型
interface User {
  id: number;
  username: string;
  createdAt: string;
}

// 获取所有用户（公共接口，不需要认证）
export async function GET(request: NextRequest) {
  try {
    // 从数据库获取所有用户
    const users = await db.getAll('users');
    
    return NextResponse.json({
      success: true,
      data: users,
      message: '获取用户列表成功'
    }, { status: 200 });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    return NextResponse.json({ success: false, message: '获取用户列表失败' }, { status: 500 });
  }
}