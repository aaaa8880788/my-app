'use client';
import { useState } from 'react';
import { FilePdfOutlined } from '@ant-design/icons';

interface RatingWork {
  id: string;
  projectName: string;
  fileName: string;
  fileUrl: string;
}

interface RatingWorksProps {
  onWorkClick: (work: RatingWork) => void;
}

export default function RatingWorks({ onWorkClick }: RatingWorksProps) {
  // 模拟数据 - 实际项目中应该从API获取
  const [works] = useState<RatingWork[]>([
    {
      id: '1',
      projectName: '项目A',
      fileName: '年度工作报告.pdf',
      fileUrl: '/files/annual-report.pdf'
    },
    {
      id: '2',
      projectName: '项目B',
      fileName: '产品设计方案.pdf',
      fileUrl: '/files/product-design.pdf'
    },
    {
      id: '3',
      projectName: '项目C',
      fileName: '项目进度报告.pdf',
      fileUrl: '/files/project-progress.pdf'
    },
    {
      id: '4',
      projectName: '项目D',
      fileName: '市场分析报告.pdf',
      fileUrl: '/files/market-analysis.pdf'
    }
  ]);

  const handleWorkClick = (work: RatingWork) => {
    onWorkClick(work);
  };

  return (
    <div className="rating-works">
      <div className="rating-works-header">
        <h3 className="rating-works-title">可评分作品列表</h3>
        <p className="rating-works-description">点击下方作品可查看作品详情</p>
      </div>
      
      <div className="rating-works-list">
        {works.map((work) => (
           <div 
              key={work.id}
              className="rating-work-item"
              onClick={() => handleWorkClick(work)}
            >
              <div className="rating-work-icon">
                <FilePdfOutlined className="text-red-500" />
              </div>
              <div className="rating-work-info">
                <div className="rating-work-name">{work.fileName}</div>
                <div className="rating-work-hint">所属作品：{work.projectName}</div>
              </div>
              <div className="rating-work-arrow">
                →
              </div>
            </div>
        ))}
      </div>
    </div>
  );
}
