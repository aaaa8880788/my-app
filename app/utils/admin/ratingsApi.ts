import adminApi from './adminApi';

// 定义用户类型
interface User {
  id: number;
  username: string;
  createdAt: string;
}

// 定义作品类型
interface Work {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

// 定义评分维度类型
interface RatingDimension {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

// 定义评分维度分数类型
interface DimensionScore {
  ratingDimensionId: number;
  score: number;
}

// 定义评分类型ZZ
interface Rating {
  id: number;
  userId: number;
  workId: number;
  content: string;
  scores: DimensionScore[];
  status: number;
  createdAt: string;
  updatedAt: string;
}

// 定义增强的评分类型，包含关联信息
interface EnhancedRating extends Rating {
  user?: User;
  work?: Work;
  ratingDimension?: RatingDimension;
}

// 定义评分查询参数类型
interface RatingQueryParams {
  status?: number;
  workId?: number;
  userId?: number;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: string;
}

// 评分API模块
export const ratingApi = {
  // 获取评分列表（支持分页、状态过滤、作品ID过滤、用户ID过滤和评分维度ID过滤）
  getRatings: async (
    status?: number,
    workId?: number,
    userId?: number,
    ratingDimensionId?: number,
    page: number = 1,
    pageSize: number = 10,
    sortField?: string,
    sortOrder?: string
  ) => {
    try {
      const params: Record<string, any> = {
        page,
        pageSize
      };
      
      if (status !== undefined) params.status = status;
      if (workId !== undefined) params.workId = workId;
      if (userId !== undefined) params.userId = userId;
      if (ratingDimensionId !== undefined) params.ratingDimensionId = ratingDimensionId;
      if (sortField !== undefined) params.sortField = sortField;
      if (sortOrder !== undefined) params.sortOrder = sortOrder;
      
      const response = await adminApi.get('/ratings', { params });
      return response;
    } catch (error) {
      console.error('获取评分列表错误:', error);
      throw error;
    }
  },

  // 根据ID获取单个评分
  getRatingById: async (id: number) => {
    try {
      const response = await adminApi.get(`/ratings?id=${id}`);
      return response;
    } catch (error) {
      console.error('获取评分详情错误:', error);
      throw error;
    }
  },

  // 创建评分
  createRating: async (
    userId: number,
    workId: number,
    content: string = '',
    scores: DimensionScore[],
    status: number = 1
  ) => {
    try {
      const response = await adminApi.post('/ratings', { 
        userId, 
        workId, 
        content, 
        scores, 
        status 
      });
      return response;
    } catch (error) {
      console.error('创建评分错误:', error);
      throw error;
    }
  },

  // 更新评分
  updateRating: async (
    id: number,
    userId?: number,
    workId?: number,
    content?: string,
    scores?: DimensionScore[],
    status?: number
  ) => {
    try {
      const data: Partial<Rating> = {};
      if (userId !== undefined) data.userId = userId;
      if (workId !== undefined) data.workId = workId;
      if (content !== undefined) data.content = content;
      if (scores !== undefined) data.scores = scores;
      if (status !== undefined) data.status = status;
      
      const response = await adminApi.put('/ratings', { id, ...data });
      return response;
    } catch (error) {
      console.error('更新评分错误:', error);
      throw error;
    }
  },

  // 删除评分
  deleteRating: async (id: number) => {
    try {
      const response = await adminApi.delete('/ratings', { data: { id } });
      return response;
    } catch (error) {
      console.error('删除评分错误:', error);
      throw error;
    }
  },

  // 获取评分统计数据
  getStatistics: async () => {
    try {
      const response = await adminApi.get('/statistics');
      return response;
    } catch (error) {
      console.error('获取评分统计数据错误:', error);
      throw error;
    }
  }
};

// 导出admin端专用的评分API模块
export const adminRatingAPI = ratingApi;
