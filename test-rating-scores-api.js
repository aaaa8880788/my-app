// 测试评分API的scores字段处理
const http = require('http');

// API端点
const API_HOST = 'localhost';
const API_PORT = 3000;
const API_PATH = '/api/admin/ratings';

// 模拟JWT令牌（实际测试时需要使用有效的令牌）
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYWRtaW4iLCJpZCI6MSwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// 测试数据
const testRatingData = {
  "userId": 1,
  "workId": 1,
  "content": "测试评分",
  "scores": [
    {
      "ratingDimensionId": 1,
      "score": 70
    },
    {
      "ratingDimensionId": 2,
      "score": 80
    },
    {
      "ratingDimensionId": 3,
      "score": 90
    }
  ],
  "status": 1
};

// 发送HTTP请求的工具函数
function sendHttpRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT_TOKEN}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          resolve({ success: false, message: '响应格式错误', data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 测试创建评分
async function testCreateRating() {
  try {
    console.log('=== 测试创建评分 ===');
    const result = await sendHttpRequest('POST', API_PATH, testRatingData);
    console.log('创建评分结果:', result);
    return result;
  } catch (error) {
    console.error('创建评分错误:', error);
  }
}

// 测试更新评分
async function testUpdateRating(ratingId) {
  try {
    console.log('\n=== 测试更新评分 ===');
    const updatedData = {
      ...testRatingData,
      id: ratingId,
      scores: [
        {
          "ratingDimensionId": 1,
          "score": 75
        },
        {
          "ratingDimensionId": 2,
          "score": 85
        },
        {
          "ratingDimensionId": 3,
          "score": 95
        }
      ]
    };
    
    const result = await sendHttpRequest('PUT', API_PATH, updatedData);
    console.log('更新评分结果:', result);
    return result;
  } catch (error) {
    console.error('更新评分错误:', error);
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试评分API的scores字段处理...\n');
  
  // 测试创建评分
  const createResult = await testCreateRating();
  
  if (createResult && createResult.success && createResult.data) {
    const ratingId = createResult.data.id;
    
    // 测试更新评分
    await testUpdateRating(ratingId);
  }
  
  console.log('\n所有测试完成！');
}

runTests();