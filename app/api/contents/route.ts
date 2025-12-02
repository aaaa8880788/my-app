import { NextRequest, NextResponse } from 'next/server';

// 定义内容类型
interface Content {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

// 模拟数据库
let mockContents: Content[] = [
  { 
    id: 1, 
    title: '内容一', 
    description: '这是第一条评分内容的详细描述', 
    createdAt: '2024-01-01 10:00:00' 
  },
  { 
    id: 2, 
    title: '内容二', 
    description: '这是第二条评分内容的详细描述', 
    createdAt: '2024-01-02 11:30:00' 
  },
  { 
    id: 3, 
    title: '内容三', 
    description: '这是第三条评分内容的详细描述', 
    createdAt: '2024-01-03 14:20:00' 
  },
];

// 获取所有评分内容
export async function GET() {
  try {
    return NextResponse.json({ success: true, data: mockContents }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: '获取内容列表失败' }, { status: 500 });
  }
}

// 创建新评分内容
export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json();
    
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ success: false, message: '标题不能为空' }, { status: 400 });
    }
    
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json({ success: false, message: '描述不能为空' }, { status: 400 });
    }
    
    const newContent: Content = {
      id: Math.max(...mockContents.map(c => c.id), 0) + 1,
      title: title.trim(),
      description: description.trim(),
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    
    mockContents.push(newContent);
    return NextResponse.json({ success: true, data: newContent }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: '创建内容失败' }, { status: 500 });
  }
}

// 更新评分内容
export async function PUT(request: NextRequest) {
  try {
    const { id, title, description } = await request.json();
    
    if (!id || !title || !description) {
      return NextResponse.json({ success: false, message: '参数错误' }, { status: 400 });
    }
    
    const contentIndex = mockContents.findIndex(content => content.id === id);
    if (contentIndex === -1) {
      return NextResponse.json({ success: false, message: '内容不存在' }, { status: 404 });
    }
    
    mockContents[contentIndex].title = title.trim();
    mockContents[contentIndex].description = description.trim();
    
    return NextResponse.json({ success: true, data: mockContents[contentIndex] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: '更新内容失败' }, { status: 500 });
  }
}

// 删除评分内容
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, message: '内容ID不能为空' }, { status: 400 });
    }
    
    const contentIndex = mockContents.findIndex(content => content.id === id);
    if (contentIndex === -1) {
      return NextResponse.json({ success: false, message: '内容不存在' }, { status: 404 });
    }
    
    mockContents.splice(contentIndex, 1);
    return NextResponse.json({ success: true, message: '内容删除成功' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: '删除内容失败' }, { status: 500 });
  }
}