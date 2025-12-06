'use client';
import { Button, InputNumber } from 'antd';
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFViewerProps {
  fileUrl: string;
  downloadFileUrl?: string;
}

// 添加Promise.withResolvers的polyfill
if (typeof Promise.withResolvers === 'undefined') {
  (Promise as any).withResolvers = function () {
    let resolve: any, reject: any;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// 设置pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PDFPreview = ({ fileUrl, downloadFileUrl }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState(1);

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
    setNumPages(nextNumPages);
  };

  const handlePageNumberChange: any = (value: number) => {
    if (value >= 1 && value <= numPages) {
      setPage(value);
    }
  }

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < numPages) {
      setPage(page + 1);
    }
  };

  const handleDownload = () => {
    if (downloadFileUrl) {
      try {
        // 创建一个A标签来触发下载，兼容移动端和平板端
        const link = document.createElement('a');
        link.href = downloadFileUrl;
        link.target = '_blank';
        // 设置download属性可以强制浏览器下载文件而不是打开
        link.download = ''; // 使用默认文件名

        // 将A标签添加到DOM中
        document.body.appendChild(link);

        // 模拟点击A标签
        link.click();

        // 从DOM中移除A标签
        document.body.removeChild(link);
      } catch (error) {
        console.error('下载失败:', error);
        // 降级方案：如果创建A标签失败，尝试使用window.open
        if (typeof window.open === 'function') {
          window.open(downloadFileUrl, '_blank');
        }
      }
    }
  };

  return (
    <div>
      <>
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page
            pageNumber={page}
            renderTextLayer={false}
          />
        </Document>
        <div style={{ gap: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Button
            onClick={handlePreviousPage}
            disabled={page <= 1}
          >
            上一页
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={page >= numPages}
          >
            下一页
          </Button>
          <div>
            <span>第</span>
            <InputNumber style={{ width: 150, margin: '0 10px' }} mode='spinner' min={1} max={numPages} defaultValue={page} onChange={handlePageNumberChange} />
            <span>页</span>
          </div>
          <div>
            <span>共</span>
            <span>{numPages}</span>
            <span>页</span>
          </div>
          <div>
            <Button
              onClick={() => handleDownload()}
            >
              下载
            </Button>
          </div>
        </div>
      </>
    </div>
  );
};

export default PDFPreview;
