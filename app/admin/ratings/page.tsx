'use client';
import { useState, useEffect } from 'react';
import { Table, Typography, Tag, Popconfirm, Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

// 定义用户类型
interface User {
  id: number;
  username: string;
}

// 定义内容类型
interface Content {
  id: number;
  title: string;
  description: string;
}

// 定义评分类型
interface Rating {
  id: number;
  userId: number;
  contentId: number;
  score: number;
  createdAt: string;
  status: 'draft' | 'submitted';
}

// 模拟用户数据
const mockUsers: User[] = [
  { id: 1, username: '用户一' },
  { id: 2, username: '用户二' },
  { id: 3, username: '用户三' },
];

// 模拟内容数据
const mockContents: Content[] = [
  { id: 1, title: '内容一', description: '这是第一条评分内容' },
  { id: 2, title: '内容二', description: '这是第二条评分内容' },
  { id: 3, title: '内容三', description: '这是第三条评分内容' },
];

// 模拟评分数据
const mockRatings: Rating[] = [
  { id: 1, userId: 1, contentId: 1, score: 85, createdAt: '2024-01-01 10:00:00', status: 'submitted' },
  { id: 2, userId: 1, contentId: 2, score: 90, createdAt: '2024-01-01 10:05:00', status: 'submitted' },
  { id: 3, userId: 1, contentId: 3, score: 75, createdAt: '2024-01-01 10:10:00', status: 'submitted' },
  { id: 4, userId: 2, contentId: 1, score: 92, createdAt: '2024-01-02 14:20:00', status: 'submitted' },
  { id: 5, userId: 2, contentId: 2, score: 88, createdAt: '2024-01-02 14:25:00', status: 'submitted' },
  { id: 6, userId: 3, contentId: 1, score: 78, createdAt: '2024-01-03 09:15:00', status: 'submitted' },
  { id: 7, userId: 3, contentId: 3, score: 83, createdAt: '2024-01-03 09:20:00', status: 'draft' },
];

// 定义增强的评分数据类型，包含关联信息
interface EnhancedRating extends Rating {
  user?: User;
  content?: Content;
}

export default function RatingManagementPage() {
  const [ratings, setRatings] = useState<Rating[]>(mockRatings);
  const [users] = useState<User[]>(mockUsers);
  const [contents] = useState<Content[]>(mockContents);
  const [enhancedRatings, setEnhancedRatings] = useState<EnhancedRating[]>([]);

  // 关联评分数据
  useEffect(() => {
    const enhanced = ratings.map(rating => ({
      ...rating,
      user: users.find(u => u.id === rating.userId),
      content: contents.find(c => c.id === rating.contentId),
    }));
    setEnhancedRatings(enhanced);
  }, [ratings, users, contents]);

  // 删除评分
  const handleDelete = (ratingId: number) => {
    setRatings(ratings.filter(rating => rating.id !== ratingId));
    message.success('评分删除成功');
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    return status === 'submitted' ? 'green' : 'orange';
  };

  // 获取状态显示文本
  const getStatusText = (status: string) => {
    return status === 'submitted' ? '已提交' : '草稿';
  };

  // 表格列定义
  const columns: ColumnsType<EnhancedRating> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {      title: '用户信息',
      key: 'user',
      render: (_: any, record: EnhancedRating) => (
        <div className="text-sm">
          <div><strong>用户ID:</strong> {record.user?.id || '-'}</div>
          <div><strong>用户名:</strong> {record.user?.username || '-'}</div>
        </div>
      ),
    },
    {      title: '评分内容',
      key: 'content',
      render: (_: any, record: EnhancedRating) => (
        <div className="text-sm">
          <div><strong>内容ID:</strong> {record.content?.id || '-'}</div>
          <div><strong>标题:</strong> {record.content?.title || '-'}</div>
          <div><Text type="secondary" ellipsis style={{ maxWidth: 300 }}>
            <strong>描述:</strong> {record.content?.description || '-'}
          </Text></div>
        </div>
      ),
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      render: (score) => (
        <span className="text-lg font-semibold">{score}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: EnhancedRating) => (
        <Popconfirm
          title="确定要删除这个评分记录吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button
            type="link"
            icon={<DeleteOutlined />}
            danger
          >
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">评分管理</h1>
      </div>
      
      <div className="table-container">
        <Table
        columns={columns}
        dataSource={enhancedRatings}
        rowKey="id"
        pagination={{ 
          pageSize: 10, 
          size: 'small',
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20']
        }}
        scroll={{ x: 'max-content' }}
        size="middle"
        expandable={{
          expandedRowRender: (record) => (
            <div className="p-3 sm:p-4 bg-gray-50">
              <h3 className="font-semibold mb-2 text-base">评分详情</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-sm"><strong>用户信息:</strong></p>
                  <p className="text-sm">ID: {record.user?.id || '-'}</p>
                  <p className="text-sm">用户名: {record.user?.username || '-'}</p>
                </div>
                <div>
                  <p className="text-sm"><strong>评分内容:</strong></p>
                  <p className="text-sm">ID: {record.content?.id || '-'}</p>
                  <p className="text-sm">标题: {record.content?.title || '-'}</p>
                  <p className="text-sm">描述: {record.content?.description || '-'}</p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <p className="text-sm"><strong>评分值:</strong> {record.score}</p>
                <p className="text-sm"><strong>状态:</strong> {getStatusText(record.status)}</p>
                <p className="text-sm"><strong>创建时间:</strong> {record.createdAt}</p>
              </div>
            </div>
          ),
        }}
      />
      </div>
    </div>
  );
}