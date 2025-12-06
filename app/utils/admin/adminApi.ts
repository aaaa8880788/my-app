import axios from 'axios';

// 创建admin专用的axios实例
const adminApi = axios.create({
  baseURL: '/api/admin',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// admin请求拦截器
adminApi.interceptors.request.use(
  (config) => {
    // 获取本地存储的token（仅在浏览器环境中执行）
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      // 如果token存在且请求的是需要认证的接口（非登录等），则添加Authorization头部
      if (token && !config.url?.includes('/auth')) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// admin响应拦截器
adminApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('Admin API Error:', error);
    // 处理错误响应
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      switch (status) {
        case 400:
          console.error('请求参数错误:', data.message || '参数错误');
          break;
        case 401:
          // 身份认证失败，清除本地token并跳转到admin登录页
          console.error('身份认证失败，请重新登录');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            
            // 创建全屏loading
            const loadingDiv = document.createElement('div');
            loadingDiv.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(255, 255, 255, 0.8);
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              z-index: 9999;
              font-size: 16px;
              color: #1890ff;
            `;
            loadingDiv.innerHTML = `
              <div style="margin-bottom: 16px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <div>信息认证失效，正在跳转到登录页面...</div>
            `;
            document.body.appendChild(loadingDiv);
            
            // 2秒后跳转
            setTimeout(() => {
              // 移除loading
              if (document.body.contains(loadingDiv)) {
                document.body.removeChild(loadingDiv);
              }
              // 使用window.location.href确保在非React组件环境下也能跳转
              window.location.href = '/admin/login';
            }, 2000);
          }
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
    return Promise.reject(error.response);
  }
);

// 从单独的文件中导入API模块
export { authAPI } from './authApi';
export { userApi, adminUserAPI } from './usersApi';
export { workApi, adminWorkAPI } from './worksApi';
export { fileApi, adminFileAPI } from './filesApi';
export { ratingApi, adminRatingAPI } from './ratingsApi';
export { ratingDimensionApi, adminRatingDimensionAPI } from './ratingDimensionsApi';

// 导出adminApi实例作为默认导出
export default adminApi;
