import axios from 'axios';

// 创建文件专用的axios实例 - 不使用拦截器处理响应数据
const filesAxiosInstance = axios.create({
  timeout: 30000, // 文件上传需要更长的超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 文件请求拦截器 - 仅添加认证信息
filesAxiosInstance.interceptors.request.use(
  (config) => {
    // 获取本地存储的token（仅在浏览器环境中执行）
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      // 如果token存在，添加Authorization头部
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 文件API接口定义
const fileApi = {
  // 获取所有文件
  getAllFiles: async () => {
    try {
      const response = await filesAxiosInstance.get('/api/files');
      return response.data;
    } catch (error) {
      console.error('获取所有文件错误:', error);
      throw error;
    }
  },

  // 根据文件ID获取文件信息
  getFileById: async (fileId: number) => {
    try {
      const response = await filesAxiosInstance.get(`/api/files?fileId=${fileId}`);
      return response.data;
    } catch (error) {
      console.error('获取文件信息错误:', error);
      throw error;
    }
  },

  // 根据作品ID获取文件列表
  getFilesByWorkId: async (workId: number) => {
    try {
      const response = await filesAxiosInstance.get(`/api/files?workId=${workId}`);
      return response.data;
    } catch (error) {
      console.error('获取作品文件错误:', error);
      throw error;
    }
  },

  // 上传文件
  uploadFile: async (file: File, workId?: number) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (workId) {
        formData.append('workId', workId.toString());
      }

      const response = await filesAxiosInstance.post('/api/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('上传文件错误:', error);
      throw error;
    }
  },

  // 删除文件
  deleteFile: async (fileId: number) => {
    try {
      const response = await filesAxiosInstance.delete(`/api/files?fileId=${fileId}`);
      return response.data;
    } catch (error) {
      console.error('删除文件错误:', error);
      throw error;
    }
  },

  // 获取文件访问路径
  getFileUrl: async (fileId: number) => {
    try {
      const response = await filesAxiosInstance.get(`/api/files?fileId=${fileId}`);
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: {
            fileId: response.data.data.id,
            filename: response.data.data.originalName,
            url: `/api/files?fileId=${response.data.data.id}`,
            previewUrl: `/api/files?fileId=${response.data.data.id}&preview=1`,
            downloadUrl: `/api/files?fileId=${response.data.data.id}&download=1`,
            mimetype: response.data.data.mimetype,
          },
        };
      }
      return response.data;
    } catch (error) {
      console.error('获取文件访问路径错误:', error);
      throw error;
    }
  },
};

export { fileApi };
export const adminFileAPI = fileApi;

export default fileApi;
