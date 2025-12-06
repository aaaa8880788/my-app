import adminApi from './adminApi';

// 管理员认证API
export const authAPI = {
  // 管理员登录
  login: (username: string, password: string) => adminApi.post('/auth', { username, password }),
  
  // 管理员退出登录
  logout: () => adminApi.get('/auth'),
};

export default authAPI;