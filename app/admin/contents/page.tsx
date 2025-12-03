'use client';
import { useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';

// 定义评分内容类型
interface Content {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

// 模拟评分内容数据
const mockContents: Content[] = [
  { 
    id: 1, 
    title: '内容一', 
    description: '这是第一条评分内容的详细描述', 
    createdAt: '2024-01-01 10:00:00' 
  },
  { 
    id: 2, 
    title: '内容二', 
    description: '这是第二条评分内容的详细描述', 
    createdAt: '2024-01-02 11:30:00' 
  },
  { 
    id: 3, 
    title: '内容三', 
    description: '这是第三条评分内容的详细描述', 
    createdAt: '2024-01-03 14:20:00' 
  },
];

export default function ContentManagementPage() {
  const [contents, setContents] = useState<Content[]>(mockContents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const [form] = Form.useForm();

  // 打开新增内容模态框
  const showAddModal = () => {
    setIsEditMode(false);
    form.resetFields();
    setIsModalOpen(true);
  };

  // 打开编辑内容模态框
  const showEditModal = (content: Content) => {
    setIsEditMode(true);
    setCurrentContent(content);
    form.setFieldsValue({ 
      title: content.title, 
      description: content.description 
    });
    setIsModalOpen(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setCurrentContent(null);
  };

  // 保存内容（新增或编辑）
  const handleSave = () => {
    form.validateFields()
      .then(values => {
        if (isEditMode && currentContent) {
          // 编辑现有内容
          const updatedContents = contents.map(content => 
            content.id === currentContent.id 
              ? { 
                  ...content, 
                  title: values.title, 
                  description: values.description 
                }
              : content
          );
          setContents(updatedContents);
          message.success('内容更新成功');
        } else {
          // 新增内容
          const newContent: Content = {
            id: Math.max(...contents.map(c => c.id), 0) + 1,
            title: values.title,
            description: values.description,
            createdAt: new Date().toLocaleString('zh-CN'),
          };
          setContents([...contents, newContent]);
          message.success('内容添加成功');
        }
        handleCancel();
      })
      .catch(info => {
        console.error('表单验证失败:', info);
      });
  };

  // 删除内容
  const handleDelete = (contentId: number) => {
    setContents(contents.filter(content => content.id !== contentId));
    message.success('内容删除成功');
  };

  // 批量上传
  const handleUpload = () => {
    // 实现批量上传逻辑
    message.info('批量上传功能待实现');
  };

  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {      title: '操作',      key: 'action',      width: 150,      render: (_: any, record: Content) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}

          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个内容吗？"
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
        </>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">内容管理</h1>
        <div className="action-button">
            <div className="flex gap-2">
            <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            size="middle"
          >
            新增内容
          </Button>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleUpload}
            size="middle"
            style={{ marginLeft: 10 }}
          >
            批量上传
          </Button>
          </div>
        </div>
      </div>
      
      <div className="table-container">
        <Table
        columns={columns}
        dataSource={contents}
        rowKey="id"
        pagination={{ 
          pageSize: 10, 
          size: 'small',
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20']
        }}
        scroll={{ x: 'max-content' }}
        size="middle"
      />
      </div>

      <Modal className="modal"
        title={isEditMode ? '编辑内容' : '新增内容'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={handleCancel}
        width={{ xs: '90%', sm: 600 }}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{}}
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入内容标题' }]}
          >
            <Input placeholder="请输入内容标题" size="large" />
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入内容描述' }]}
          >
            <Input.TextArea
              placeholder="请输入内容描述"
              rows={4}
              showCount
              maxLength={500}
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}