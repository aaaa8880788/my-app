import adminApi from './adminApi';

// 用户管理API
export const userApi = {
  // 获取用户列表（支持分页和搜索）
  getUsers: (username?: string, page: number = 1, pageSize: number = 10) => {
    const params = { username, page, pageSize };
    return adminApi.get('/users', { params });
  },
  
  // 创建用户
  createUser: (username: string) => adminApi.post('/users', { username }),
  
  // 更新用户
  updateUser: (id: number, username: string) => adminApi.put('/users', { id, username }),
  
  // 删除用户
  deleteUser: (id: number) => adminApi.delete('/users', { data: { id } }),
};

// 保持与原有接口兼容的命名导出
export const adminUserAPI = userApi;

export default userApi;