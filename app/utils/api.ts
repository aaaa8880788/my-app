import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    // 处理错误响应
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      switch (status) {
        case 400:
          console.error('请求参数错误:', data.message || '参数错误');
          break;
        case 401:
          console.error('未授权，请登录');
          // 可以在这里处理登录跳转
          break;
        case 403:
          console.error('拒绝访问');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
        default:
          console.error('请求失败:', data.message || '未知错误');
      }
    } else if (error.request) {
      console.error('网络错误，请检查网络连接');
    } else {
      console.error('请求配置错误:', error.message);
    }
    return Promise.reject(error);
  }
);

// 用户相关API
export const userAPI = {
  // 获取所有用户
  getUsers: () => api.get('/users'),
  
  // 创建用户
  createUser: (username: string) => api.post('/users', { username }),
  
  // 更新用户
  updateUser: (id: number, username: string) => api.put('/users', { id, username }),
  
  // 删除用户
  deleteUser: (id: number) => api.delete('/users', { data: { id } }),
};

// 内容相关API
export const contentAPI = {
  // 获取所有评分内容
  getContents: () => api.get('/contents'),
  
  // 创建评分内容
  createContent: (title: string, description: string) => 
    api.post('/contents', { title, description }),
  
  // 更新评分内容
  updateContent: (id: number, title: string, description: string) => 
    api.put('/contents', { id, title, description }),
  
  // 删除评分内容
  deleteContent: (id: number) => api.delete('/contents', { data: { id } }),
};

// 评分相关API
export const ratingAPI = {
  // 获取所有评分
  getRatings: (userId?: number) => 
    api.get('/ratings' + (userId ? `?userId=${userId}` : '')),
  
  // 创建或更新评分
  saveRating: (userId: number, contentId: number, score: number, status: 'draft' | 'submitted' = 'draft') => 
    api.post('/ratings', { userId, contentId, score, status }),
  
  // 提交评分（更新状态）
  submitRating: (id: number) => api.put('/ratings', { id, status: 'submitted' }),
  
  // 删除评分
  deleteRating: (id: number) => api.delete('/ratings', { data: { id } }),
};

// 统计相关API
export const statsAPI = {
  // 获取所有统计数据
  getAllStats: () => api.get('/stats'),
  
  // 获取用户统计数据
  getUserStats: () => api.get('/stats/users'),
  
  // 获取内容统计数据
  getContentStats: () => api.get('/stats/contents'),
};

export default api;