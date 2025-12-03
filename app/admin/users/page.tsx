'use client';
import { useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { QRCodeCanvas } from 'qrcode.react';

// 定义用户类型
interface User {
  id: number;
  username: string;
  createdAt: string;
  // 其他用户字段...
}

// 模拟用户数据
const mockUsers: User[] = [
  { id: 1, username: '用户一', createdAt: '2024-01-01 10:00:00' },
  { id: 2, username: '用户二', createdAt: '2024-01-02 11:30:00' },
  { id: 3, username: '用户三', createdAt: '2024-01-03 14:20:00' },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  // 状态变量：控制二维码模态框的显示/隐藏
  const [qrcodeModalVisible, setQrcodeModalVisible] = useState(false);
  // 当前显示二维码的用户
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 打开新增用户模态框
  const showAddModal = () => {
    setIsEditMode(false);
    form.resetFields();
    setIsModalOpen(true);
  };

  // 打开编辑用户模态框
  const showEditModal = (user: User) => {
    setIsEditMode(true);
    setCurrentUser(user);
    form.setFieldsValue({ username: user.username });
    setIsModalOpen(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setCurrentUser(null);
  };

  // 保存用户（新增或编辑）
  const handleSave = () => {
    form.validateFields()
      .then(values => {
        if (isEditMode && currentUser) {
          // 编辑现有用户
          const updatedUsers = users.map(user => 
            user.id === currentUser.id 
              ? { ...user, username: values.username }
              : user
          );
          setUsers(updatedUsers);
          message.success('用户更新成功');
        } else {
          // 新增用户
          const newUser: User = {
            id: Math.max(...users.map(u => u.id), 0) + 1,
            username: values.username,
            createdAt: new Date().toLocaleString('zh-CN'),
          };
          setUsers([...users, newUser]);
          message.success('用户添加成功');
        }
        handleCancel();
      })
      .catch(info => {
        console.error('表单验证失败:', info);
      });
  };

  // 删除用户
  const handleDelete = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
    message.success('用户删除成功');
  };

  // 生成用户登录二维码
  const generateQrCodeUrl = (userId: number) => {
    // 实际项目中，这里应该生成包含用户信息的URL
    return `http://localhost:3000/front/page?userId=${userId}`;
  };

  // 打开二维码模态框
  const showQrCodeModal = (user: User) => {
    setSelectedUser(user);
    setQrcodeModalVisible(true);
  };

  // 关闭二维码模态框
  const closeQrCodeModal = () => {
    setQrcodeModalVisible(false);
    setSelectedUser(null);
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
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {      title: '登录二维码',      key: 'qrcode',      width: 100,      render: (_: any, record: User) => (
        <div>
          <Button 
            type="link" 
            onClick={() => showQrCodeModal(record)}
          >
            <QRCodeCanvas
              value={generateQrCodeUrl(record.id)}
              size={64}
              level="M"
              includeMargin
            />
          </Button>
        </div>
      ),
    },
    {      title: '操作',      key: 'action',      width: 200,      render: (_: any, record: User) => (
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
            title="确定要删除这个用户吗？"
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
        <h1 className="page-title">用户管理</h1>
        <div className="action-button">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            size="middle"
          >
          新增用户
        </Button>
        </div>
      </div>
      
      <div className="table-container">
        <Table
        columns={columns}
        dataSource={users}
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
        title={isEditMode ? '编辑用户' : '新增用户'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={handleCancel}
        width={500}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{}}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 二维码模态框 */}
      <Modal
          title="用户登录二维码"
          open={qrcodeModalVisible}
          onCancel={closeQrCodeModal}
          footer={null}
          width={320}
          centered
          className="qrcode-modal"
        >
        {selectedUser && (
          <div>
            <div className="qrcode-container">
            <QRCodeCanvas
              value={generateQrCodeUrl(selectedUser.id)}
              size={128}
              level="M"
              includeMargin
              className="qrcode-image"
            />
            <div className="qrcode-info">使用手机扫描登录</div>
            <div className="qrcode-user">用户: {selectedUser.username}</div>
            </div>
            <p>扫描二维码登录系统</p>
          </div>
        )}
      </Modal>
    </div>
  );
}