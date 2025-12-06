'use client';
import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { QRCodeCanvas } from 'qrcode.react';
import { userApi } from '@/app/utils/admin/adminApi';
import { ColumnsType } from 'antd/es/table';

// 定义用户类型
interface User {
  id: number;
  username: string;
  createdAt: string;
  accessPath?: string; // 访问路径字段
  // 其他用户字段...
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // 从API获取用户列表（支持搜索和分页）
  const fetchUsers = async (username?: string, page: number = 1, size: number = 10) => {
    try {
      setLoading(true);
      const response: any = await userApi.getUsers(username, page, size);
      if (response.success) {
        // 为每个用户添加accessPath字段
        const usersWithPath = response.data.list.map((user: User) => ({
          ...user,
          accessPath: generateQrCodeUrl(user.id)
        }));
        setUsers(usersWithPath);
        setTotalUsers(response.data.total);
        setCurrentPage(response.data.page);
        setPageSize(response.data.pageSize);
      } else {
        message.error(response.message || '获取用户列表失败');
      }
    } catch (error) {
      console.error('获取用户列表错误:', error);
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取用户列表
  useEffect(() => {
    fetchUsers();
  }, []);
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
          userApi.updateUser(currentUser.id, values.username)
            .then((response: any) => {
              if (response.success) {
                const updatedUsers = users.map(user =>
                  user.id === currentUser.id
                    ? response.data
                    : user
                );
                setUsers(updatedUsers);
                message.success(response.message || '用户更新成功');
                handleCancel();
              } else {
                message.error(response.message || '用户更新失败');
              }
            })
            .catch(error => {
              console.error('更新用户错误:', error);
              message.error('用户更新失败');
            });
        } else {
          // 新增用户
          userApi.createUser(values.username)
            .then((response: any) => {
              if (response.success) {
                // 为新增用户添加accessPath字段
                const newUserWithPath = {
                  ...response.data,
                  accessPath: generateQrCodeUrl(response.data.id)
                };
                setUsers([...users, newUserWithPath]);
                message.success(response.message || '用户添加成功');
                handleCancel();
              } else {
                message.error(response.message || '用户添加失败');
              }
            })
            .catch(error => {
              console.error('添加用户错误:', error);
              message.error('用户添加失败');
            });
        }
      })
      .catch(info => {
        console.error('表单验证失败:', info);
      });
  };

  // 删除用户
  const handleDelete = (userId: number) => {
    userApi.deleteUser(userId)
      .then((response: any) => {
        if (response.success) {
          setUsers(users.filter(user => user.id !== userId));
          message.success(response.message || '用户删除成功');
        } else {
          message.error(response.message || '用户删除失败');
        }
      })
      .catch(error => {
        console.error('删除用户错误:', error);
        message.error('用户删除失败');
      }).finally(() => {
        fetchUsers(searchKeyword); // 刷新用户列表
      });
  };

  // 生成用户登录二维码
  const generateQrCodeUrl = (userId: number) => {
    // 实际项目中，这里应该生成包含用户信息的URL
    // 使用动态域名，避免写死localhost
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/front/page?userId=${userId}`;
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
  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      align: 'center',
    },
    {
      title: '访问路径',
      dataIndex: 'accessPath',
      key: 'accessPath',
      align: 'center',
      render: (_: any, record: User) => (
        <span>{generateQrCodeUrl(record.id)}</span>
      ),
    },
    {
      title: '登录二维码', key: 'qrcode', width: 120, align: 'center', render: (_: any, record: User) => (
        <div className="table-qrcode-button">
          <Button
            type="text"
            onClick={() => showQrCodeModal(record)}
            style={{ padding: 0 }}
          >
            <QRCodeCanvas
              value={generateQrCodeUrl(record.id)}
              level="M"
            />
          </Button>
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
    },
    {
      title: '操作', key: 'action', width: 200, fixed: 'right', align: 'center', render: (_: any, record: User) => (
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

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  // 执行搜索
  const handleSearch = () => {
    setCurrentPage(1); // 搜索时回到第一页
    fetchUsers(searchKeyword, 1, pageSize);
  };

  // 清空搜索
  const handleClearSearch = () => {
    setSearchKeyword('');
    setCurrentPage(1);
    fetchUsers('', 1, pageSize); // 重新获取所有用户
  };

  // 处理分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
    fetchUsers(searchKeyword, page, pageSize);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">用户管理</h1>
        <div className="action-button">
          <div style={{ marginRight: '16px', display: 'flex', gap: '8px' }}>
            <Input
              placeholder="搜索用户名"
              value={searchKeyword}
              onChange={handleSearchChange}
              style={{ width: '200px' }}
              onPressEnter={handleSearch}
            />
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            {searchKeyword && (
              <Button type="default" onClick={handleClearSearch}>
                清空
              </Button>
            )}
          </div>
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
            current: currentPage,
            pageSize: pageSize,
            total: totalUsers,
            size: 'small',
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20'],
            onChange: handlePageChange
          }}
          scroll={{ x: 'max-content' }}
          size="middle"
          loading={loading}
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
        centered
        className="qrcode-modal"
      >
        {selectedUser && (
          <div>
            <div className="qrcode-container">
              <QRCodeCanvas
                value={generateQrCodeUrl(selectedUser.id)}
                level="M"
                className="qrcode-image"
              />
              <div className="qrcode-user">用户: {selectedUser.username}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}