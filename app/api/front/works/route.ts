import { NextRequest, NextResponse } from 'next/server';
import db from '../../database/db';

// 定义作品类型
interface Work {
  id: number;
  title: string;
  description: string;
  files?: number[];
  ratingDimensionIds?: number[];
  createdAt: string;
  updatedAt?: string;
}

// 定义文件类型
interface File {
  id: number;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  createdAt: string;
}

// 获取可评分作品列表
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get('title');
    // 从数据库获取所有文件
    const allFiles = await db.getAll('files');
    // 从数据库获取所有评分维度
    let dimensions = await db.getAll('rating-dimensions');
    // 从数据库获取所有作品
    let works = await db.getAll('works');
    // 如果有搜索参数，过滤作品
    if (title) {
      works = works.filter((work: Work) => 
        work.title.toLowerCase().includes(title.toLowerCase())
      );
    }
    // 处理作品数据，将files字段从ID数组转换为实际的文件对象数组
    const processedWorks = works.map((work: Work) => {
      let newWork: Record<string, any> = { ...work }
      if (work.ratingDimensionIds && Array.isArray(work.ratingDimensionIds)) {
        const workRatingDimensions = work.ratingDimensionIds.map((dimId: string | number) => {
          const dim = dimensions.find((d: any) => d.id === dimId);
          if (dim) {
            return {
              ...dim
            };
          }
          return null;
        }).filter(Boolean);
        newWork = {
          ...newWork,
          ratingDimensions: workRatingDimensions
        }
      }
      // 如果作品有files字段，转换为实际的文件对象
      if (work.files && Array.isArray(work.files)) {
        const workFiles = work.files.map(fileId => {
          const file = allFiles.find((f: File) => f.id === fileId);
          if (file) {
            return {
              ...file,
              fileUrl: `/api/files?fileId=${file.id}&preview=1`,
              downloadFileUrl: `/api/files?fileId=${file.id}&download=1`,
            };
          }
          return null;
        }).filter(Boolean);
        newWork = {
          ...newWork,
          files: workFiles
        }
      }
      return newWork;
    });
    
    return NextResponse.json({
      success: true,
      data: processedWorks,
      message: '获取可评分作品列表成功'
    }, { status: 200 });
  } catch (error) {
    console.error('获取可评分作品列表错误:', error);
    return NextResponse.json({ success: false, message: '获取可评分作品列表失败' }, { status: 500 });
  }
}
