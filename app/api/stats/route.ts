import { NextResponse } from 'next/server';

// 定义统计相关类型
interface UserStat {
  totalUsers: number;
  activeUsers: number;
}

interface ContentStat {
  contentId: number;
  contentTitle: string;
  totalRatings: number;
  maxScore: number;
  minScore: number;
  avgScore: number;
}

interface StatsResponse {
  userStats: UserStat;
  contentStats: ContentStat[];
}

// 模拟统计数据
const mockStats: StatsResponse = {
  userStats: {
    totalUsers: 150,
    activeUsers: 120,
  },
  contentStats: [
    { contentId: 1, contentTitle: '内容一', totalRatings: 85, maxScore: 100, minScore: 60, avgScore: 85.6 },
    { contentId: 2, contentTitle: '内容二', totalRatings: 76, maxScore: 98, minScore: 55, avgScore: 82.3 },
    { contentId: 3, contentTitle: '内容三', totalRatings: 92, maxScore: 99, minScore: 65, avgScore: 88.1 },
    { contentId: 4, contentTitle: '内容四', totalRatings: 68, maxScore: 97, minScore: 50, avgScore: 80.5 },
    { contentId: 5, contentTitle: '内容五', totalRatings: 72, maxScore: 95, minScore: 62, avgScore: 83.7 },
  ],
};

// 获取统计数据
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // 获取用户统计数据
    if (pathname.endsWith('/stats/users')) {
      return NextResponse.json({ 
        success: true, 
        data: mockStats.userStats 
      }, { status: 200 });
    }
    
    // 获取内容统计数据
    if (pathname.endsWith('/stats/contents')) {
      return NextResponse.json({ 
        success: true, 
        data: mockStats.contentStats 
      }, { status: 200 });
    }
    
    // 获取所有统计数据
    return NextResponse.json({ success: true, data: mockStats }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: '获取统计数据失败' 
    }, { status: 500 });
  }
}