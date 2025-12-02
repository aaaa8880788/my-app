import { NextRequest, NextResponse } from 'next/server';

// 定义评分类型
interface Rating {
  id: number;
  userId: number;
  contentId: number;
  score: number;
  createdAt: string;
  status: 'draft' | 'submitted';
}

// 模拟数据库
let mockRatings: Rating[] = [
  { id: 1, userId: 1, contentId: 1, score: 85, createdAt: '2024-01-01 10:00:00', status: 'submitted' },
  { id: 2, userId: 1, contentId: 2, score: 90, createdAt: '2024-01-01 10:05:00', status: 'submitted' },
  { id: 3, userId: 1, contentId: 3, score: 75, createdAt: '2024-01-01 10:10:00', status: 'submitted' },
  { id: 4, userId: 2, contentId: 1, score: 92, createdAt: '2024-01-02 14:20:00', status: 'submitted' },
  { id: 5, userId: 2, contentId: 2, score: 88, createdAt: '2024-01-02 14:25:00', status: 'submitted' },
  { id: 6, userId: 3, contentId: 1, score: 78, createdAt: '2024-01-03 09:15:00', status: 'submitted' },
  { id: 7, userId: 3, contentId: 3, score: 83, createdAt: '2024-01-03 09:20:00', status: 'draft' },
];

// 获取所有评分数据
export async function GET(request: NextRequest) {
  try {
    // 检查是否有userId参数
    const userId = request.nextUrl.searchParams.get('userId');
    let filteredRatings = mockRatings;
    
    if (userId) {
      filteredRatings = mockRatings.filter(rating => rating.userId === parseInt(userId));
    }
    
    return NextResponse.json({ success: true, data: filteredRatings }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: '获取评分列表失败' }, { status: 500 });
  }
}

// 创建新评分
export async function POST(request: NextRequest) {
  try {
    const { userId, contentId, score, status = 'draft' } = await request.json();
    
    if (!userId || !contentId || score === undefined) {
      return NextResponse.json({ success: false, message: '参数错误' }, { status: 400 });
    }
    
    if (score < 0 || score > 100 || !Number.isInteger(score)) {
      return NextResponse.json({ success: false, message: '评分必须是0-100之间的整数' }, { status: 400 });
    }
    
    // 检查是否已存在相同用户和内容的评分
    const existingRatingIndex = mockRatings.findIndex(
      rating => rating.userId === userId && rating.contentId === contentId
    );
    
    if (existingRatingIndex !== -1) {
      // 更新现有评分
      mockRatings[existingRatingIndex].score = score;
      mockRatings[existingRatingIndex].status = status;
      mockRatings[existingRatingIndex].createdAt = new Date().toLocaleString('zh-CN');
      
      return NextResponse.json({ 
        success: true, 
        data: mockRatings[existingRatingIndex],
        message: '评分更新成功'
      }, { status: 200 });
    } else {
      // 创建新评分
      const newRating: Rating = {
        id: Math.max(...mockRatings.map(r => r.id), 0) + 1,
        userId,
        contentId,
        score,
        status,
        createdAt: new Date().toLocaleString('zh-CN'),
      };
      
      mockRatings.push(newRating);
      return NextResponse.json({ success: true, data: newRating }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: '创建评分失败' }, { status: 500 });
  }
}

// 更新评分状态（提交评分）
export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    
    if (!id || !status || !['draft', 'submitted'].includes(status)) {
      return NextResponse.json({ success: false, message: '参数错误' }, { status: 400 });
    }
    
    const ratingIndex = mockRatings.findIndex(rating => rating.id === id);
    if (ratingIndex === -1) {
      return NextResponse.json({ success: false, message: '评分不存在' }, { status: 404 });
    }
    
    mockRatings[ratingIndex].status = status;
    mockRatings[ratingIndex].createdAt = new Date().toLocaleString('zh-CN');
    
    return NextResponse.json({ success: true, data: mockRatings[ratingIndex] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: '更新评分失败' }, { status: 500 });
  }
}

// 删除评分
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, message: '评分ID不能为空' }, { status: 400 });
    }
    
    const ratingIndex = mockRatings.findIndex(rating => rating.id === id);
    if (ratingIndex === -1) {
      return NextResponse.json({ success: false, message: '评分不存在' }, { status: 404 });
    }
    
    mockRatings.splice(ratingIndex, 1);
    return NextResponse.json({ success: true, message: '评分删除成功' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: '删除评分失败' }, { status: 500 });
  }
}