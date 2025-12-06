import adminApi from './adminApi';

// 作品管理API
export const workApi = {
  // 获取作品列表（支持分页和标题搜索）
  getWorks: (title?: string, page: number = 1, pageSize: number = 10) => {
    const params = { title, page, pageSize };
    return adminApi.get('/works', { params });
  },
  
  // 获取单个作品
  getWorkById: (id: number) => {
    const params = { id };
    return adminApi.get('/works', { params });
  },
  
  // 创建作品
  createWork: (title: string, description: string, ratingDimensionIds: number[]) => adminApi.post('/works', { title, description, ratingDimensionIds }),
  
  // 更新作品
  updateWork: (id: number, title: string, description: string, ratingDimensionIds: number[]) => adminApi.put('/works', { id, title, description, ratingDimensionIds }),
  
  // 删除作品
  deleteWork: (id: number) => adminApi.delete('/works', { data: { id } }),
};

// 保持与原有接口兼容的命名导出
export const adminWorkAPI = workApi;

export default workApi;