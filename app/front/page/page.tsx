'use client';
import { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { BarChartOutlined, FileTextOutlined } from '@ant-design/icons';
import RatingCard from './components/RatingCard';
import RateForm from './components/RateForm';
import RatingWorks from './components/RatingWorks';

export default function FrontHomePage() {
  const [activeTab, setActiveTab] = useState('1');
  const [mounted, setMounted] = useState(false);
  const [isShowRateForm, setIsShowRateForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedWork, setSelectedWork] = useState<any>(null);
  const handleButtonClick = (buttonText: string) => {
    if (buttonText === '开始评分') {
      setIsShowRateForm(true);
    }
  }

  const handleRateFormBack = () => {
    setIsShowRateForm(false);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleWorkClick = (work: any) => {
    console.log('Work clicked:', work);
    setSelectedWork(work);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedWork(null);
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '开始评分',
      icon: <BarChartOutlined />,
      children: (
        <>
          {
            isShowRateForm ? 
              <RateForm backButtonClick={handleRateFormBack} /> 
              : 
              <RatingCard
                icon={<BarChartOutlined className="text-3xl md:text-4xl" />}
                title="开始您的评分"
                description="我们重视您的反馈，请花费几分钟时间完成评分，帮助我们持续改进服务质量"
                buttonText="开始评分"
                buttonClick={handleButtonClick}
              />
          }
        </>   
      ),
    },
    {
      key: '2',
      label: '评分作品',
      icon: <FileTextOutlined />, 
      children: (
        <RatingWorks onWorkClick={handleWorkClick} />
      ),
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="front-home">
      <div className="front-home-container">
        <div className="front-home-container-wrapper">
          <Tabs
            centered
            activeKey={activeTab}
            onChange={setActiveTab}
            items={items}
            className="w-full"
            tabBarStyle={{
              padding: '0 16px',
              borderBottom: '1px solid var(--border)',
            }}
            size="large"
          />
        </div>
        <div className="front-home-container-footer">
          <p>© {new Date().getFullYear()} 评分系统 - 让反馈更有价值</p>
        </div>
      </div>
      {showPreview && (
        <div className="front-home-file">
          <div className="front-home-file-wrapper">
            <div className="preview-header">
              <div className="preview-title">文件预览</div>
              <button className="close-button" onClick={handleClosePreview}>
                关闭预览
              </button>
            </div>
            <div className="preview-container">
              <iframe 
                src="/test.pdf" 
                title="作品预览"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}