import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// 处理GET请求，返回文件内容
export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    // 获取文件存储目录
    const filesDir = path.join(process.cwd(), 'app', 'api', 'database', 'files');
    
    // 获取文件名参数 - 在Next.js 16中，params是一个Promise
    const resolvedParams = await params;
    const filename = resolvedParams?.filename;
    console.log('filename:', filename);
    
    // 验证filename是否存在
    if (!filename) {
      return NextResponse.json({ success: false, message: '文件名不能为空' }, { status: 400 });
    }
    
    // 构建完整的文件路径
    const filePath = path.join(filesDir, filename);
    
    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error('文件不存在:', filePath);
      return NextResponse.json({ success: false, message: '文件不存在' }, { status: 404 });
    }
    
    // 读取文件内容
    const fileContent = await fs.readFile(filePath);
    
    // 根据文件名后缀确定Content-Type
    let contentType = 'application/octet-stream';
    if (filename.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (filename.endsWith('.png')) {
      contentType = 'image/png';
    } else if (filename.endsWith('.gif')) {
      contentType = 'image/gif';
    }
    
    // 返回文件
    // 正确编码文件名
    const encodedFilename = encodeURIComponent(filename);
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error) {
    console.error('文件访问错误:', error);
    return NextResponse.json({ success: false, message: '文件访问失败' }, { status: 500 });
  }
}
