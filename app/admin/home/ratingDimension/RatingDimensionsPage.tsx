'use client';
import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ratingDimensionApi } from '@/app/utils/admin/ratingDimensionsApi';
import type { RatingDimension } from '@/app/utils/admin/ratingDimensionsApi';
import { ColumnsType } from 'antd/es/table';

export default function RatingDimensionsManagementPage() {
  const [dimensions, setDimensions] = useState<RatingDimension[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDimension, setCurrentDimension] = useState<RatingDimension | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 获取评分维度列表
  const fetchRatingDimensions = async (name?: string, page: number = 1, size: number = 10) => {
    setLoading(true);
    try {
      const response: any = await ratingDimensionApi.getRatingDimensions({ name, page, pageSize: size });
      console.log('获取评分维度列表响应:', response);
      
      if (response.success) {
        setDimensions(response.data.list);
        setTotal(response.data.total);
        setCurrentPage(response.data.page);
        setPageSize(response.data.pageSize);
      } else {
        message.error(response.message || '获取评分维度失败');
      }
    } catch (error) {
      message.error('获取评分维度列表失败');
      console.error('获取评分维度列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取评分维度列表
  useEffect(() => {
    fetchRatingDimensions();
  }, []);

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  // 执行搜索
  const handleSearch = () => {
    setCurrentPage(1); // 搜索时回到第一页
    fetchRatingDimensions(searchKeyword, 1, pageSize);
  };

  // 清空搜索
  const handleClearSearch = () => {
    setSearchKeyword('');
    setCurrentPage(1);
    fetchRatingDimensions('', 1, pageSize); // 重新获取所有评分维度
  };

  // 打开新增评分维度模态框
  const showAddModal = () => {
    setIsEditMode(false);
    form.resetFields();
    setIsModalOpen(true);
  };

  // 打开编辑评分维度模态框
  const showEditModal = (dimension: RatingDimension) => {
    setIsEditMode(true);
    setCurrentDimension(dimension);
    form.setFieldsValue({ name: dimension.name, description: dimension.description });
    setIsModalOpen(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setCurrentDimension(null);
  };

  // 保存评分维度（新增或编辑）
  const handleSave = async () => {
    form.validateFields()
      .then(async (values) => {
        if (isEditMode && currentDimension) {
          // 编辑现有评分维度
          try {
            const response: any = await ratingDimensionApi.updateRatingDimension({
              id: currentDimension.id,
              name: values.name,
              description: values.description
            });
            if (response.success) {
                message.success('评分维度更新成功');
                fetchRatingDimensions(searchKeyword, currentPage, pageSize);
                handleCancel();
              } else {
                message.error(response.message || '评分维度更新失败');
              }
          } catch (error) {
            message.error('评分维度更新失败');
            console.error('更新评分维度错误:', error);
          }
        } else {
          // 新增评分维度
          try {
            const response: any = await ratingDimensionApi.createRatingDimension({
              name: values.name,
              description: values.description
            });
            if (response.success) {
                message.success('评分维度添加成功');
                fetchRatingDimensions(searchKeyword, currentPage, pageSize);
                handleCancel();
              } else {
                message.error(response.message || '评分维度添加失败');
              }
          } catch (error) {
            message.error('评分维度添加失败');
            console.error('添加评分维度错误:', error);
          }
        }
      })
      .catch(info => {
        console.error('表单验证失败:', info);
      });
  };

  // 删除评分维度
  const handleDelete = async (dimensionId: number) => {
    try {
      const response: any = await ratingDimensionApi.deleteRatingDimension(dimensionId);
      if (response.success) {
                message.success('评分维度删除成功');
                fetchRatingDimensions(searchKeyword, currentPage, pageSize);
              } else {
                message.error(response.message || '评分维度删除失败');
              }
    } catch (error) {
      message.error('评分维度删除失败');
      console.error('删除评分维度错误:', error);
    }
  };

  // 处理分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
    fetchRatingDimensions(searchKeyword, page, pageSize);
  };

  // 表格列定义
  const columns: ColumnsType<RatingDimension> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '维度名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      align: 'center',
    },
    {
      title: '维度描述',
      dataIndex: 'description',
      key: 'description',
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
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center',
      render: (_: any, record: RatingDimension) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            className="mr-2"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个评分维度吗？"
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
        </>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1 className="page-title">评分维度管理</h1>
        <div className="action-button">
          <div style={{ marginRight: '16px', display: 'flex', gap: '8px' }}>
            <Input
              placeholder="搜索维度名称"
              value={searchKeyword}
              onChange={handleSearchChange}
              style={{ width: '200px' }}
              onPressEnter={handleSearch}
            />
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            {searchKeyword && (
              <Button type="default" onClick={handleClearSearch}>
                清空
              </Button>
            )}
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            size="middle"
          >
            新增维度
          </Button>
        </div>
      </div>
      
      <div className="table-container">
        <Table
        columns={columns}
        dataSource={dimensions}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
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

      <Modal className="modal"
        title={isEditMode ? '编辑评分维度' : '新增评分维度'}
        open={isModalOpen}
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
            label="维度名称"
            name="name"
            rules={[{ required: true, message: '请输入维度名称' }]}
          >
            <Input placeholder="请输入维度名称" size="large" />
          </Form.Item>
          <Form.Item
            label="维度描述"
            name="description"
          >
            <Input.TextArea placeholder="请输入维度描述" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}