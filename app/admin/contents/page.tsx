'use client';
import { useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

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
      ellipsis: {
        rows: 2,
        expandable: true,
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            className="mr-2"
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">内容管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddModal}
        >
          新增内容
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={contents}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={isEditMode ? '编辑内容' : '新增内容'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={handleCancel}
        width={600}
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
            <Input placeholder="请输入内容标题" />
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
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}