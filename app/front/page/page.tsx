'use client';
import { useState, useEffect, Suspense } from 'react';

import { ConfigProvider, Tabs } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { TabsProps } from 'antd';
import { BarChartOutlined, FileTextOutlined } from '@ant-design/icons';
import RatingCard from './components/RatingCard';
import RateForm from './components/RateForm';
import RatingWorks from './components/RatingWorks';
import UserSelectModal from './components/UserSelectModal';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';



export default function FrontHomePage() {
  const [activeTab, setActiveTab] = useState('1');
  const [mounted, setMounted] = useState(false);
  const [isShowRateForm, setIsShowRateForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showUserSelectModal, setShowUserSelectModal] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleButtonClick = (buttonText: string) => {
    if (buttonText === '开始评分') {
      setIsShowRateForm(true);
    }
  }

  const handleRateFormBack = () => {
    setIsShowRateForm(false);
  }

  // 检查URL中的userId参数并存储
  useEffect(() => {
    setMounted(true);
    const urlUserId = searchParams.get('userId');
    if (urlUserId) {
      setUserId(urlUserId);
    } else {
      // 显示用户选择Modal
        setShowUserSelectModal(true);
    }
  }, [mounted, searchParams]);

  // 处理用户选择
  const handleUserSelect = (selectedUserId: number, username: string) => {
    const userIdStr = selectedUserId.toString();
    // 存储userId到localStorage
    localStorage.setItem('userId', userIdStr);
    setUserId(userIdStr);
    // 添加到URL参数
    const params = new URLSearchParams(searchParams.toString());
    params.set('userId', userIdStr);
    router.replace(`?${params.toString()}`);
    // 关闭Modal
    setShowUserSelectModal(false);
  };

  // 处理Modal取消
  const handleUserSelectCancel = () => {
    // 用户必须选择身份才能继续，所以不允许取消
    // 如果需要允许取消，可以添加相应逻辑
  };

  const handleWorkClick = (file: any) => {
    console.log('点击作品:', file);
    
    setSelectedFile(file);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setIsFullScreen(false);
    setShowPreview(false);
    setSelectedFile(null);
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '开始评分',
      icon: <BarChartOutlined />,
      children: (
        <>
          {            isShowRateForm ? 
              <RateForm backButtonClick={handleRateFormBack} onFileClick={handleWorkClick} userId={Number(userId)} /> 
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

  // 导入PDFPreview组件
  const PDFPreview = React.lazy(() => import('./components/PDFPreview'));

  return (
    <ConfigProvider locale={zhCN}>
    <div className="front-home">
      <div className="front-home-container" style={{ display: isFullScreen ? 'none' : 'block' }}>
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
              <button className="screen-button" onClick={() => setIsFullScreen(!isFullScreen)}>{ isFullScreen ? '退出全屏' : '全屏预览' }</button>
              <button className="close-button" onClick={handleClosePreview}>
                关闭预览
              </button>
            </div>
            <div className="preview-container">
              {selectedFile?.fileUrl && (
                <Suspense fallback={<div>加载中...</div>}>
                  <PDFPreview fileUrl={selectedFile.fileUrl} downloadFileUrl={selectedFile.downloadFileUrl} />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 用户选择Modal */}
      <UserSelectModal
        visible={showUserSelectModal}
        onCancel={handleUserSelectCancel}
        onUserSelect={handleUserSelect}
      />
    </div>
    </ConfigProvider>
  );
}