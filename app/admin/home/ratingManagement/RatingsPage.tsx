'use client';
import { useState, useEffect } from 'react';
import { Table, Typography, Tag, Popconfirm, Button, message, Modal, Form, Select, Input, InputNumber, Space, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminUserAPI, adminWorkAPI, adminRatingAPI, adminRatingDimensionAPI } from '@/app/utils/admin/adminApi';

const { Text } = Typography;

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
  ratingDimensionIds: number[];
  createdAt: string;
}

// 定义评分维度类型
interface RatingDimension {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

// 定义维度评分类型
interface DimensionScore {
  ratingDimensionId: number;
  score: number;
}

// 定义评分类型
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

// 定义增强的评分数据类型，包含关联信息
interface EnhancedRating extends Rating {
  user?: User;
  work?: Work;
}

// 定义评分表单类型
interface RatingFormData {
  userId: number;
  workId: number;
  content: string;
  scores: DimensionScore[];
  status: number;
}

export default function RatingsPage() {
  const [ratings, setRatings] = useState<EnhancedRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRatings, setTotalRatings] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [ratingDimensions, setRatingDimensions] = useState<RatingDimension[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRating, setSelectedRating] = useState<EnhancedRating | null>(null);
  const [form] = Form.useForm<RatingFormData>();
  const [searchForm] = Form.useForm();
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string | null>(null);
  const [selectedWorkRatingDimensions, setSelectedWorkRatingDimensions] = useState<RatingDimension[]>([]);

  // 获取用户列表
  const fetchUsers = async (username?: string, page: number = 1, pageSize: number = 100) => {
    try {
      const response: any = await adminUserAPI.getUsers(username, page, pageSize);
      if (response.success) {
        setUsers(response.data.list || []);
      }
    } catch (error) {
      console.error('获取用户列表错误:', error);
    }
  };

  // 获取作品列表
  const fetchWorks = async (title?: string, page: number = 1, pageSize: number = 100) => {
    try {
      const response: any = await adminWorkAPI.getWorks(title, page, pageSize);
      if (response.success) {
        setWorks(response.data.list || []);
      }
    } catch (error) {
      console.error('获取作品列表错误:', error);
    }
  };

  // 获取评分维度列表
  const fetchRatingDimensions = async (name?: string, page: number = 1, pageSize: number = 100) => {
    try {
      const params = { name, page, pageSize };
      const response: any = await adminRatingDimensionAPI.getRatingDimensions(params);
      if (response.success) {
        setRatingDimensions(response.data.list || []);
      }
    } catch (error) {
      console.error('获取评分维度列表错误:', error);
    }
  };

  // 从API获取评分列表（支持分页、过滤和排序）
  const fetchRatings = async (page: number = 1, size: number = 10, filters?: any, sortField?: string, sortOrder?: string) => {
    try {
      setLoading(true);
      const { userId, workId } = filters || {};

      // 根据adminRatingAPI.getRatings的参数顺序传递参数
      const response: any = await adminRatingAPI.getRatings(
        undefined, // status
        workId,    // workId
        userId,    // userId
        undefined, // ratingDimensionId (已移除)
        page,      // page
        size,      // pageSize
        sortField, // 排序字段
        sortOrder  // 排序顺序
      );

      if (response.success) {
        setRatings(response.data.list || []);
        setTotalRatings(response.data.total || 0);
        setCurrentPage(response.data.page);
        setPageSize(response.data.pageSize);
      } else {
        message.error(response.message || '获取评分列表失败');
      }
    } catch (error) {
      console.error('获取评分列表错误:', error);
      message.error('获取评分列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取数据
  useEffect(() => {
    const initData = async () => {
      await Promise.all([fetchUsers(), fetchWorks(), fetchRatingDimensions()]);
      fetchRatings(1, pageSize, {}, sortField || undefined, sortOrder || undefined);
    };
    initData();
  }, []);

  // 删除评分
  const handleDelete = async (id: number) => {
    try {
      const response: any = await adminRatingAPI.deleteRating(id);
      if (response.success) {
        message.success('评分删除成功');
        fetchRatings(currentPage, pageSize, searchForm.getFieldsValue());
      } else {
        message.error(response.message || '评分删除失败');
      }
    } catch (error) {
      console.error('删除评分错误:', error);
      message.error('评分删除失败');
    }
  };

  // 获取状态标签颜色
  const getStatusColor = (status: number) => {
    return status === 2 ? 'green' : 'orange';
  };

  // 获取状态显示文本
  const getStatusText = (status: number) => {
    return status === 2 ? '已提交' : '草稿';
  };

  // 处理分页变化
  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    fetchRatings(page, size, searchForm.getFieldsValue());
  };

  // 处理搜索
  const handleSearch = () => {
    fetchRatings(1, pageSize, searchForm.getFieldsValue());
  };

  // 打开新增模态框
  const showAddModal = () => {
    setIsEditMode(false);
    setSelectedRating(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑模态框
  const showEditModal = (record: EnhancedRating) => {
    setIsEditMode(true);
    setSelectedRating(record);

    // 获取当前作品的评分维度
    const currentWork = works.find(work => work.id === record.workId);
    const workRatingDimensions = currentWork ? ratingDimensions.filter(dim => currentWork.ratingDimensionIds.includes(dim.id)) : [];
    setSelectedWorkRatingDimensions(workRatingDimensions);

    // 设置表单值，确保scores字段与当前作品的评分维度匹配
    const scores: DimensionScore[] = workRatingDimensions.map(dim => {
      const existingScore = record.scores.find(s => s.ratingDimensionId === dim.id) || { ratingDimensionId: dim.id, score: 0 };
      return existingScore;
    });

    form.setFieldsValue({
      userId: record.userId,
      workId: record.workId,
      content: record.content,
      scores,
      status: record.status,
    });
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRating(null);
    setSelectedWorkRatingDimensions([]);
    form.resetFields();
  };

  // 处理作品选择变化
  const handleWorkChange = (workId: number) => {
    // 清空之前的评分维度和评分数据
    setSelectedWorkRatingDimensions([]);

    if (workId) {
      // 获取选择作品的评分维度
      const selectedWork = works.find(work => work.id === workId);
      if (selectedWork && selectedWork.ratingDimensionIds) {
        // 过滤出该作品的评分维度
        const workRatingDimensions = ratingDimensions.filter(dim =>
          selectedWork.ratingDimensionIds.includes(dim.id)
        );
        setSelectedWorkRatingDimensions(workRatingDimensions);

        // 初始化评分数据
        const initialScores: DimensionScore[] = workRatingDimensions.map(dim => ({
          ratingDimensionId: dim.id,
          score: 0
        }));

        // 设置评分数据到表单
        form.setFieldsValue({ scores: initialScores });
      }
    }
  };

  // 保存评分（新增或编辑）
  const handleSave = () => {
    form.validateFields()
      .then((formData: RatingFormData) => {
        if (isEditMode && selectedRating) {
          // 更新评分
          adminRatingAPI.updateRating(
            selectedRating.id,
            formData.userId,
            formData.workId,
            formData.content,
            formData.scores,
            formData.status
          )
            .then((response: any) => {
              if (response.success) {
                // 直接更新本地状态，避免重新请求API
                const updatedRatings = ratings.map(rating =>
                  rating.id === selectedRating.id
                    ? { ...rating, ...formData }
                    : rating
                );
                setRatings(updatedRatings);
                message.success(response.message || '评分更新成功');
                handleCancel();
              } else {
                message.error(response.message || '评分更新失败');
              }
            })
            .catch(error => {
              console.error('更新评分错误:', error);
              message.error('评分更新失败');
            });
        } else {
          // 创建评分
          adminRatingAPI.createRating(
            formData.userId,
            formData.workId,
            formData.content,
            formData.scores,
            formData.status
          )
            .then((response: any) => {
              if (response.success) {
                // 直接添加到本地状态，避免重新请求API
                const newRating = {
                  id: response.data.id,
                  ...formData,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  // 添加关联对象引用
                  user: users.find(user => user.id === formData.userId),
                  work: works.find(work => work.id === formData.workId),
                };
                setRatings([...ratings, newRating]);
                message.success(response.message || '评分创建成功');
                handleCancel();
              } else {
                message.error(response.message || '评分创建失败');
              }
            })
            .catch(error => {
              console.error('创建评分错误:', error);
              message.error(error?.data?.message || '评分创建失败');
            });
        }
      })
      .catch(info => {
        console.error('表单验证失败:', info);
      });
  };

  // 清空搜索条件
  const handleClearSearch = () => {
    searchForm.resetFields();
    fetchRatings(1, pageSize, {}, sortField || undefined, sortOrder || undefined);
  };

  // 表格列定义
  const columns: ColumnsType<EnhancedRating> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '评分',
      key: 'scores',
      sorter: (a: EnhancedRating, b: EnhancedRating) => {
        const totalA = a.scores.reduce((acc, cur) => acc + cur.score, 0);
        const totalB = b.scores.reduce((acc, cur) => acc + cur.score, 0);
        return totalA - totalB;
      },
      render: (_: any, record: EnhancedRating) => {
        return (
          <>
            {
              Array.isArray(record.scores) && record.scores.length > 0 ?
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ marginRight: '12px' }}>
                    {record.scores?.map((scoreItem, index) => {
                      const dimension = ratingDimensions.find(d => d.id === scoreItem.ratingDimensionId);
                      return (
                        <div key={index} style={{ marginBottom: '4px' }}>
                          <span><strong>{dimension?.name || `维度${scoreItem.ratingDimensionId}`}:</strong> </span>
                          <span >{scoreItem.score}分</span>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <span><strong>总评分</strong> </span>
                    <span >{(record.scores.reduce((acc, cur) => acc + cur.score, 0) / record.scores.length).toFixed(0)}分</span>
                  </div>
                </div>
                :
                <div>无评分数据</div>
            }
          </>
        );
      },
      width: 250,
      align: 'center',
    },
    {
      title: '作品信息',
      key: 'work',
      render: (_: any, record: EnhancedRating) => {
        const work = works.find(w => w.id === record.workId);
        return (
          <div>
            <Tooltip title={work?.title || '-'}>
              <div style={{ width: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong>作品名称:</strong> {work?.title || '-'}</div>
            </Tooltip>
            <Tooltip title={work?.description || '-'}>
              <div style={{ width: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong>作品描述:</strong> {work?.description || '-'}</div>
            </Tooltip>
          </div>
        );
      },
      width: 200,
      align: 'center',
    },
    {
      title: '评分维度',
      key: 'ratingDimensions',
      render: (_: any, record: EnhancedRating) => {
        const work = works.find(w => w.id === record.workId);
        if (!work) return <div>-</div>;

        const workRatingDimensions = ratingDimensions.filter(dim => work.ratingDimensionIds.includes(dim.id));
        return (
          <div>
            {workRatingDimensions.map((dim, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                <div>{dim.name}</div>
              </div>
            ))}
            {workRatingDimensions.length === 0 && <div>无评分维度</div>}
          </div>
        );
      },
      width: 200,
      align: 'center',
    },
    {
      title: '用户信息',
      key: 'user',
      render: (_: any, record: EnhancedRating) => {
        const user = users.find(u => u.id === record.userId);
        return (
          <div>
            {/* <div><strong>用户ID:</strong> {user?.id || '-'}</div> */}
            <div><strong>用户名:</strong> {user?.username || '-'}</div>
          </div>
        );
      },
      width: 180,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: number) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '评价内容',
      dataIndex: 'content',
      key: 'content',
      width: 300,
      align: 'center',
      render: (text: string) => {
        return <Tooltip title={text}>
          <div style={{ width: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {text}
          </div>
        </Tooltip>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      align: 'center',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      align: 'center',
      render: (_: any, record: EnhancedRating) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个评分吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              icon={<DeleteOutlined />}
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">评分管理</h1>
        <div className="action-button">
          <div style={{ marginRight: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Form form={searchForm} layout="inline" className="flex items-center gap-2">
              <Form.Item name="userId" label="用户">
                <Select placeholder="选择用户" allowClear style={{ width: 150 }}>
                  {users.map(user => (
                    <Select.Option key={user.id} value={user.id}>
                      {user.username}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="workId" label="作品">
                <Select placeholder="选择作品" allowClear style={{ width: 150 }}>
                  {works.map(work => (
                    <Select.Option key={work.id} value={work.id}>
                      {work.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} size="middle">
                    搜索
                  </Button>
                  <Button onClick={handleClearSearch} size="middle">
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            size="middle"
          >
            新增评分
          </Button>
        </div>
      </div>

      {/* 评分表格 */}
      <div className="table-container">
        <Table
          columns={columns}
          dataSource={ratings}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalRatings,
            size: 'small',
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20'],
            onChange: handlePageChange
          }}
          scroll={{ x: 'max-content' }}
          size="middle"
          loading={loading}
        />
      </div>

      {/* 新增/编辑评分模态框 */}
      <Modal
        title={isEditMode ? '编辑评分' : '新增评分'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        width={500}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{}}
        >
          <Form.Item
            name="userId"
            label="用户"
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <Select placeholder="选择用户">
              {users.map(user => (
                <Select.Option key={user.id} value={user.id}>
                  {user.username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="workId"
            label="作品"
            rules={[{ required: true, message: '请选择作品' }]}
          >
            <Select placeholder="选择作品" onChange={handleWorkChange}>
              {works.map(work => (
                <Select.Option key={work.id} value={work.id}>
                  {work.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {selectedWorkRatingDimensions.length > 0 && (
            <Form.Item label="评分维度评分">
              <div>
                {selectedWorkRatingDimensions.map((dimension, index) => {
                  return (
                    <div key={dimension.id} style={{ marginBottom: '16px' }}>
                      <Form.Item
                        name={['scores', index, 'ratingDimensionId']}
                        hidden
                      >
                        <Input type="hidden" value={dimension.id} />
                      </Form.Item>
                      <Form.Item
                        name={['scores', index, 'score']}
                        rules={[{ required: true, message: `请输入${dimension.name}的评分` }]}
                        label={dimension.name}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber min={0} max={100} placeholder={`请输入${dimension.name}的评分`} style={{ width: '100%' }} />
                      </Form.Item>
                    </div>
                  );
                })}
              </div>
            </Form.Item>
          )}
          {selectedWorkRatingDimensions.length === 0 && (
            <Form.Item>
              <div style={{ color: '#999', textAlign: 'center', padding: '16px' }}>
                请先选择作品以加载评分维度
              </div>
            </Form.Item>
          )}
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="选择状态">
              <Select.Option value={1}>草稿</Select.Option>
              <Select.Option value={2}>已提交</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="content"
            label="评价内容"
          >
            <Input.TextArea rows={4} placeholder="请输入评价内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}