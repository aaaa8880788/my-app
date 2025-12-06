'use client';
import { useState, useEffect } from 'react';
import { FilePdfOutlined } from '@ant-design/icons';

interface RatingWork {
  id: string;
  title: string;
  description: string;
  files: Record<string, any>[];
}

interface RatingWorksProps {
  onWorkClick: (work: Record<string, any>) => void;
}

export default function RatingWorks({ onWorkClick }: RatingWorksProps) {
  const [works, setWorks] = useState<RatingWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从API获取可评分作品列表
  useEffect(() => {
    const fetchWorks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/front/works');
        const data = await response.json();
        
        if (data.success) {
          setWorks(data.data);
        } else {
          setError('获取作品列表失败');
        }
      } catch (err) {
        setError('网络错误，请稍后重试');
        console.error('获取作品列表错误:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, []);

  const handleWorkClick = (file: Record<string, any>) => {
    onWorkClick(file);
  };

  return (
    <div className="rating-works">
      <div className="rating-works-header">
        <h3 className="rating-works-title">可评分作品列表</h3>
        <p className="rating-works-description">点击下方作品可查看作品详情</p>
      </div>
      
      <div className="rating-works-list">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : works.length === 0 ? (
          <div className="empty">暂无可评分作品</div>
        ) : (
          works.map((work) => (
             <div 
                key={work.id}
                className="rating-work-item"
              >
                <div className="rating-work-header">
                  <div className="rating-work-icon">
                    <FilePdfOutlined className="text-red-500" />
                  </div>
                  <div className="rating-work-main-info">
                    <div className="rating-work-title">{work.title}</div>
                    <div className="rating-work-description">{work.description}</div>
                  </div>
                  <div className="rating-work-arrow">
                    →
                  </div>
                </div>
                <div className="rating-work-files">
                  {work.files.map((file, index) => (
                    <div key={file.id || index} className="rating-work-file-item" onClick={() => handleWorkClick(file)}>
                      <FilePdfOutlined className="text-gray-500" style={{ marginRight: '8px' }} />
                      <span>{file.originalName}</span>
                    </div>
                  ))}
                </div>
              </div>
          ))
        )}
      </div>
    </div>
  );
}
