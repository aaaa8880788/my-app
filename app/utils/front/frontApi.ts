import axios from 'axios';

// 创建front专用的axios实例
const frontApi = axios.create({
  baseURL: '/api/front',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// front请求拦截器
frontApi.interceptors.request.use(
  (config) => {
    // front端API可能不需要token认证，或使用不同的认证方式
    // 如果需要，可以在这里添加相应的认证逻辑
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// front响应拦截器
frontApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('Front API Error:', error);
    // 处理错误响应
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      switch (status) {
        case 400:
          console.error('请求参数错误:', data.message || '参数错误');
          break;
        case 401:
          console.error('身份认证失败');
          // front端可能需要不同的处理方式，比如重定向到登录页
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

// 定义评分维度类型
export interface RatingDimension {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

// 定义作品类型
export interface Work {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

// 定义评分类型
export interface Rating {
  id: number;
  userId: number;
  workId: number;
  ratingDimensionId: number;
  content: string;
  score: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

// 定义用户类型
export interface User {
  id: number;
  username: string;
  createdAt: string;
  updatedAt?: string;
}

// 定义评分统计类型
export interface RatingStatistics {
  workId: number;
  totalRatings: number;
  averageScore: number;
  dimensionScores: Array<{
    dimensionId: number;
    dimensionName: string;
    averageScore: number;
  }>;
}

// 评分API模块
export const ratingsApi = {
  // 获取评分维度
  getRatingDimensions: async () => {
    try {
      const response = await frontApi.get('/rating-dimensions');
      return response;
    } catch (error) {
      console.error('获取评分维度失败:', error);
      throw error;
    }
  },

  // 获取待评分的作品
  getWorksToRate: async () => {
    try {
      const response = await frontApi.get('/works');
      return response;
    } catch (error) {
      console.error('获取待评分作品失败:', error);
      throw error;
    }
  },

  // 提交评分
  submitRating: async (ratingData: Omit<Rating, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await frontApi.post('/ratings', ratingData);
      return response;
    } catch (error) {
      console.error('提交评分失败:', error);
      throw error;
    }
  },

  // 更新评分
  updateRating: async (ratingData: Rating) => {
    try {
      const response = await frontApi.put('/ratings', ratingData);
      return response;
    } catch (error) {
      console.error('更新评分失败:', error);
      throw error;
    }
  },

  // 获取评分统计
  getRatingStatistics: async (workId: number) => {
    try {
      const response = await frontApi.get(`/ratings?type=stats&workId=${workId}`);
      return response;
    } catch (error) {
      console.error('获取评分统计失败:', error);
      throw error;
    }
  },

  // 获取用户列表
  getUsers: async () => {
    try {
      const response = await frontApi.get('/users');
      return response;
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw error;
    }
  },
  
  // 获取当前用户的所有评分数据
  getUserRatings: async (userId?: number) => {
    try {
      const response = await frontApi.get(`/ratings?userId=${userId}`);
      return response;
    } catch (error) {
      console.error('获取用户评分数据失败:', error);
      throw error;
    }
  }
};

export default frontApi;
