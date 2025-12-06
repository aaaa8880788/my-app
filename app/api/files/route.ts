import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import db from '../database/db';

// 文件存储目录
const FILES_DIR = path.join(process.cwd(), 'app', 'api', 'database', 'files');

// 定义文件类型
interface FileItem {
  id: number;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  createdAt: string;
}

// 获取文件信息或下载文件
export async function GET(request: Request) {
  try {
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const workId = searchParams.get('workId');
    const download = searchParams.get('download');

    // 获取文件数据
    const files = await db.getAll('files');

    if (fileId) {
      // 根据文件ID查询特定文件
      const file = files.find((file: FileItem) => file.id === parseInt(fileId));
      if (!file) {
        return NextResponse.json({ success: false, message: '文件不存在' }, { status: 404 });
      }

      // 如果请求包含preview或download参数，返回文件内容
      if (download || searchParams.get('preview')) {
        // 读取文件内容
        const filePath = path.join(FILES_DIR, file.filename);
        const fileContent = await fs.readFile(filePath);

        // 设置Content-Disposition，正确编码文件名
        const encodedFilename = encodeURIComponent(file.originalName);
        const contentDisposition = download 
          ? `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}` 
          : `inline; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`;

        // 返回文件，添加更完善的头信息确保在所有设备上正确预览
        return new NextResponse(fileContent, {
          headers: {
            'Content-Type': file.mimetype,
            'Content-Disposition': contentDisposition,
            'Content-Length': file.size.toString(),
            'X-Content-Type-Options': 'nosniff',
          },
        });
      }

      // 否则，返回文件信息和访问URL
      return NextResponse.json({
        success: true,
        data: {
          ...file,
          url: `/api/files?fileId=${file.id}`,
          previewUrl: `/api/files?fileId=${file.id}&preview=1`,
          downloadUrl: `/api/files?fileId=${file.id}&download=1`,
        },
      });
    }

    if (workId) {
      // 根据作品ID查询关联文件
      const work = await db.getOne('works', parseInt(workId));
      if (!work || !work.files || work.files.length === 0) {
        return NextResponse.json({ success: true, data: [] });
      }

      const workFiles = files
        .filter((file: FileItem) => work.files.some((id: number) => id === file.id))
        .map((file: FileItem) => ({
          ...file,
          url: `/api/files?fileId=${file.id}&download=true`,
        }));
      return NextResponse.json({ success: true, data: workFiles });
    }

    // 获取所有文件信息，并添加访问URL
    const allFilesWithUrl = files.map((file: FileItem) => ({
      ...file,
      url: `/api/files?fileId=${file.id}&download=true`,
    }));

    return NextResponse.json({ success: true, data: allFilesWithUrl });
  } catch (error) {
    console.error('获取文件信息或下载错误:', error);
    return NextResponse.json({ success: false, message: '操作失败' }, { status: 500 });
  }
}

// 上传文件
export async function POST(request: Request) {
  try {
    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('file') as globalThis.File;
    const workId = formData.get('workId');

    if (!file) {
      return NextResponse.json({ success: false, message: '未上传文件' }, { status: 400 });
    }

    // 验证文件类型
    if (!file.type.startsWith('application/pdf')) {
      return NextResponse.json({ success: false, message: '仅支持PDF文件上传' }, { status: 400 });
    }

    // 创建唯一文件名
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filePath = path.join(FILES_DIR, filename);

    // 保存文件
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    // 保存文件信息到数据库
    const newFile: Omit<FileItem, 'id'> = {
      filename,
      originalName: file.name,
      size: file.size,
      mimetype: file.type,
      createdAt: new Date().toLocaleString('zh-CN'),
    };

    const savedFile = await db.create('files', newFile);

    // 添加访问URL
    const fileWithUrl = {
      ...savedFile,
      url: `/api/files?fileId=${savedFile.id}&download=true`,
    };

    // 如果提供了作品ID，关联到作品
    if (workId && typeof workId === 'string') {
      const work = await db.getOne('works', parseInt(workId));
      if (work) {
        const updatedWork = {
          ...work,
          files: [...(work.files || []), savedFile.id],
        };
        await db.update('works', work.id, updatedWork);
      }
    }

    return NextResponse.json({ success: true, data: fileWithUrl });
  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json({ success: false, message: '文件上传失败' }, { status: 500 });
  }
}

// 删除文件
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ success: false, message: '缺少文件ID' }, { status: 400 });
    }

    // 获取文件信息
    const file = await db.getOne('files', parseInt(fileId));
    if (!file) {
      return NextResponse.json({ success: false, message: '文件不存在' }, { status: 404 });
    }

    // 删除物理文件
    const filePath = path.join(FILES_DIR, file.filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('删除物理文件失败:', error);
    }

    // 删除数据库记录
    await db.delete('files', parseInt(fileId));

    // 从所有作品中移除该文件的关联
    const works = await db.getAll('works');
    for (const work of works) {
      if (work.files && work.files.includes(parseInt(fileId))) {
        const updatedWork = {
          ...work,
          files: work.files.filter((id: number) => id !== parseInt(fileId)),
        };
        await db.update('works', work.id, updatedWork);
      }
    }

    return NextResponse.json({ success: true, message: '文件删除成功' });
  } catch (error) {
    console.error('文件删除错误:', error);
    return NextResponse.json({ success: false, message: '文件删除失败' }, { status: 500 });
  }
}
