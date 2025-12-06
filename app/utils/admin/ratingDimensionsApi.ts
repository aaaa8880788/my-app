import adminApi from './adminApi';

// 定义评分维度类型
export interface RatingDimension {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

// 获取所有评分维度
export const getRatingDimensions = async (params?: {
  name?: string;
  page?: number;
  pageSize?: number;
}) => {
  try {
    const response = await adminApi.get('/rating-dimensions', { params });
    return response;
  } catch (error) {
    console.error('获取评分维度列表失败:', error);
    throw error;
  }
};

// 根据ID获取单个评分维度
export const getRatingDimensionById = async (id: number) => {
  try {
    const response = await adminApi.get(`/rating-dimensions?id=${id}`);
    return response;
  } catch (error) {
    console.error('获取评分维度失败:', error);
    throw error;
  }
};

// 创建评分维度
export const createRatingDimension = async (data: { name: string; description?: string }) => {
  try {
    const response = await adminApi.post('/rating-dimensions', data);
    return response;
  } catch (error) {
    console.error('创建评分维度失败:', error);
    throw error;
  }
};

// 更新评分维度
export const updateRatingDimension = async (data: { id: number; name: string; description?: string }) => {
  try {
    const response = await adminApi.put('/rating-dimensions', data);
    return response;
  } catch (error) {
    console.error('更新评分维度失败:', error);
    throw error;
  }
};

// 删除评分维度
export const deleteRatingDimension = async (id: number) => {
  try {
    const response = await adminApi.delete('/rating-dimensions', { data: { id } });
    return response;
  } catch (error) {
    console.error('删除评分维度失败:', error);
    throw error;
  }
};

// 导出评分维度API
export const ratingDimensionApi = {
  getRatingDimensions,
  getRatingDimensionById,
  createRatingDimension,
  updateRatingDimension,
  deleteRatingDimension
};

// 保持与原有接口兼容的命名导出
export const adminRatingDimensionAPI = ratingDimensionApi;

export default ratingDimensionApi;