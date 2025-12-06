// 测试ratings API接口

const baseUrl = 'http://localhost:3000/api/front/ratings';

// 测试1: 获取评分维度
console.log('测试1: 获取评分维度');
fetch(`${baseUrl}?type=dimensions`)
  .then(res => res.json())
  .then(data => {
    console.log('评分维度:', data);
    
    // 测试2: 获取待评分作品
    console.log('\n测试2: 获取待评分作品');
    return fetch(`${baseUrl}?type=works`);
  })
  .then(res => res.json())
  .then(data => {
    console.log('待评分作品:', data);
    
    // 测试3: 提交评分
    console.log('\n测试3: 提交评分');
    return fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 1,
        contentId: 1,
        ratings: [
          { ratingDimensionId: '1', score: 80 },
          { ratingDimensionId: '2', score: 90 },
          { ratingDimensionId: '3', score: 85 }
        ]
      })
    });
  })
  .then(res => res.json())
  .then(data => {
    console.log('提交评分结果:', data);
    
    if (data.success && data.data) {
      const ratingId = data.data.id;
      
      // 测试4: 更新评分
      console.log('\n测试4: 更新评分');
      return fetch(baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: ratingId,
          ratings: [
            { ratingDimensionId: '1', score: 85 },
            { ratingDimensionId: '2', score: 95 },
            { ratingDimensionId: '3', score: 90 }
          ]
        })
      });
    }
  })
  .then(res => res?.json())
  .then(data => {
    if (data) {
      console.log('更新评分结果:', data);
    }
  })
  .catch(err => console.error('测试失败:', err));