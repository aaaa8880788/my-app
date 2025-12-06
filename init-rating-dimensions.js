// 初始化评分维度数据

const fs = require('fs');
const path = require('path');

// 确保数据目录存在（正确的路径应该是app/api/database）
const dataDir = path.join(__dirname, 'app', 'api', 'database');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化评分维度数据
const ratingDimensions = [
  {
    id: '1',
    ratingDimensionName: '创新性',
    createdAt: new Date().toLocaleString('zh-CN')
  },
  {
    id: '2',
    ratingDimensionName: '专业性',
    createdAt: new Date().toLocaleString('zh-CN')
  },
  {
    id: '3',
    ratingDimensionName: '实用性',
    createdAt: new Date().toLocaleString('zh-CN')
  }
];

// 写入评分维度数据到文件
fs.writeFileSync(
  path.join(dataDir, 'ratingDimensions.json'),
  JSON.stringify(ratingDimensions, null, 2),
  'utf8'
);

console.log('评分维度数据初始化成功:', ratingDimensions);

// 初始化评分数据文件（如果不存在）
const ratingsPath = path.join(dataDir, 'ratings.json');
if (!fs.existsSync(ratingsPath)) {
  fs.writeFileSync(ratingsPath, JSON.stringify([], null, 2), 'utf8');
  console.log('评分数据文件创建成功');
}