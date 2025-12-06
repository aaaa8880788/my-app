import { promises as fs } from 'fs';
import path from 'path';

// 数据库文件路径
const DB_DIR = path.join(process.cwd(), 'app', 'api', 'database');

// 确保数据库目录存在
async function ensureDirectoryExists() {
  try {
    await fs.access(DB_DIR);
  } catch (error) {
    await fs.mkdir(DB_DIR, { recursive: true });
  }
}

// 读取数据
async function readData(table: string): Promise<any[]> {
  await ensureDirectoryExists();
  const filePath = path.join(DB_DIR, `${table}.json`);
  
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // 如果文件不存在，返回空数组
    return [];
  }
}

// 写入数据
async function writeData(table: string, data: any[]): Promise<void> {
  await ensureDirectoryExists();
  const filePath = path.join(DB_DIR, `${table}.json`);
  
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// 获取单个记录
async function getOne(table: string, id: number): Promise<any | null> {
  const data = await readData(table);
  return data.find(item => item.id === id) || null;
}

// 获取所有记录
async function getAll(table: string): Promise<any[]> {
  return await readData(table);
}

// 创建记录
async function create(table: string, item: any): Promise<any> {
  const data = await readData(table);
  const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
  
  const newItem = {
    id: newId,
    ...item,
    createdAt: new Date().toLocaleString('zh-CN')
  };
  
  data.push(newItem);
  await writeData(table, data);
  return newItem;
}

// 更新记录
async function update(table: string, id: number, item: any): Promise<any | null> {
  const data = await readData(table);
  const index = data.findIndex(item => item.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedItem = {
    ...data[index],
    ...item,
    updatedAt: new Date().toLocaleString('zh-CN')
  };
  
  data[index] = updatedItem;
  await writeData(table, data);
  return updatedItem;
}

// 删除记录
async function remove(table: string, id: number): Promise<boolean> {
  const data = await readData(table);
  const newData = data.filter(item => item.id !== id);
  
  if (newData.length === data.length) {
    return false; // 没有找到记录
  }
  
  await writeData(table, newData);
  return true;
}

export default {
  getOne,
  getAll,
  create,
  update,
  delete: remove
};
