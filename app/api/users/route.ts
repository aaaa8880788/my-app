import { NextRequest, NextResponse } from 'next/server';

// 定义用户类型
interface User {
  id: number;
  username: string;
  createdAt: string;
}

// 模拟数据库
let mockUsers: User[] = [
  { id: 1, username: '用户一', createdAt: '2024-01-01 10:00:00' },
  { id: 2, username: '用户二', createdAt: '2024-01-02 11:30:00' },
  { id: 3, username: '用户三', createdAt: '2024-01-03 14:20:00' },
];

// 获取所有用户
export async function GET() {
  try {
    return NextResponse.json({ success: true, data: mockUsers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: '获取用户列表失败' }, { status: 500 });
  }
}

// 创建新用户
export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return NextResponse.json({ success: false, message: '用户名不能为空' }, { status: 400 });
    }
    
    const newUser: User = {
      id: Math.max(...mockUsers.map(u => u.id), 0) + 1,
      username: username.trim(),
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    
    mockUsers.push(newUser);
    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: '创建用户失败' }, { status: 500 });
  }
}

// 更新用户
export async function PUT(request: NextRequest) {
  try {
    const { id, username } = await request.json();
    
    if (!id || !username || typeof username !== 'string' || username.trim() === '') {
      return NextResponse.json({ success: false, message: '参数错误' }, { status: 400 });
    }
    
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 });
    }
    
    mockUsers[userIndex].username = username.trim();
    return NextResponse.json({ success: true, data: mockUsers[userIndex] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: '更新用户失败' }, { status: 500 });
  }
}

// 删除用户
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, message: '用户ID不能为空' }, { status: 400 });
    }
    
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 });
    }
    
    mockUsers.splice(userIndex, 1);
    return NextResponse.json({ success: true, message: '用户删除成功' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: '删除用户失败' }, { status: 500 });
  }
}