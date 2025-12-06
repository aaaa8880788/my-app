'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Radio, Spin, message, Card } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { ratingsApi, User } from '@/app/utils/front/frontApi';

interface UserSelectModalProps {
  visible: boolean;
  onCancel: () => void;
  onUserSelect: (userId: number, username: string) => void;
}

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response: any = await ratingsApi.getUsers();
    if (response.success) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('获取用户列表错误:', error);
    message.error('获取用户列表失败');
    return [];
  }
};

const UserSelectModal: React.FC<UserSelectModalProps> = ({ visible, onCancel, onUserSelect }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const userList = await fetchUsers();
      setUsers(userList);
      setLoading(false);
    };

    if (visible) {
      loadUsers();
    }
  }, [visible]);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleUserSelect = (e: any) => {
    const userId = e.target.value;
    const selectedUser = users.find(user => user.id === userId);
    if (selectedUser) {
      Modal.confirm({
        title: '确认选择',
        content: `您确定要选择用户 "${selectedUser.username}" 吗？选中后将不可更改`,
        onOk: () => {
          onUserSelect(userId, selectedUser.username);
        },
        onCancel: () => {
          // 取消选择时重置状态
          setSelectedUserId(null);
        }
      });
    }
  };

  return (
    <Modal
      title="选择用户身份"
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={400}
    >
      <div className="user-select-modal">
        <Spin spinning={loading} tip="加载用户列表...">
          <div className="user-select-content">
            <div className="user-list" style={{ marginTop: '16px' }}>
              <Radio.Group
                onChange={handleUserSelect}
                value={selectedUserId}
                style={{ width: '100%' }}
              >
                {users.map(user => (
                  <Card
                    key={user.id}
                    hoverable
                    style={{ marginBottom: '12px', cursor: 'pointer' }}
                    styles={{
                      body: {
                        padding: '16px',
                      }
                    }}
                  >
                    <Radio value={user.id} style={{ width: '100%' }}>
                      <div style={{ fontSize: '16px', fontWeight: 500 }}>
                        <UserOutlined />{user.username}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        创建于: {user.createdAt}
                      </div>
                    </Radio>
                  </Card>
                ))}
              </Radio.Group>
            </div>
          </div>
        </Spin>
      </div>
    </Modal>
  );
};

export default UserSelectModal;