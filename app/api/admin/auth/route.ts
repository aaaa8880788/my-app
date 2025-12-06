import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '../../database/db';

// 定义管理员类型
interface Admin {
  id: number;
  username: string;
  password: string;
  createdAt: string;
}

// 管理员登录
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    console.log('管理员登录请求参数:', { username });

    if (!username || !password) {
      return NextResponse.json({ success: false, message: '用户名和密码不能为空' }, { status: 400 });
    }

    // 从数据库获取所有管理员
    const auth = await db.getAll('auth');

    // 查找匹配的管理员
    const admin = auth.find((a: Admin) => a.username === username && a.password === password);

    if (admin) {
      // 登录成功，返回管理员信息（不包含密码）
      const { password, ...adminWithoutPassword } = admin;

      // 生成JWT token
      const token = jwt.sign(
        { id: admin.id, username: admin.username },
        'default-secret-key',
        { expiresIn: '10h' }
      );

      return NextResponse.json({
        success: true,
        data: {
          ...adminWithoutPassword,
          token
        },
        message: '登录成功'
      }, { status: 200 });
    } else {
      // 登录失败
      return NextResponse.json({ success: false, message: '用户名或密码错误' }, { status: 200 });
    }
  } catch (error) {
    console.error('登录接口错误:', error);
    return NextResponse.json({ success: false, message: '登录失败', error: JSON.stringify(error) }, { status: 500 });
  }
}

// 管理员退出登录
export async function GET(request: NextRequest) {
  try {
    // 在JWT认证系统中，退出登录主要是客户端删除token
    // 这里可以添加一些服务器端的清理操作，如记录日志等
    console.log('管理员退出登录');
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '退出登录成功'
    }, { status: 200 });
  } catch (error) {
    console.error('退出登录接口错误:', error);
    return NextResponse.json({ success: false, message: '退出登录失败', error: JSON.stringify(error) }, { status: 500 });
  }
}
