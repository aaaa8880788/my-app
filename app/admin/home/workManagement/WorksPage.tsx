'use client';
import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Upload, Tooltip, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, FilePdfOutlined, DownloadOutlined } from '@ant-design/icons';
import { workApi, fileApi, ratingDimensionApi } from '@/app/utils/admin/adminApi';
import type { RatingDimension } from '@/app/utils/admin/ratingDimensionsApi';
import { ColumnsType } from 'antd/es/table';

// 定义文件类型
interface FileItem {
  id: number;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  createdAt: string;
}

// 定义作品类型
interface Work {
  id: number;
  title: string;
  description: string;
  files?: number[];
  ratingDimensionIds?: number[];
  createdAt: string;
}

export default function ContentManagementPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalWorks, setTotalWorks] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentWork, setCurrentWork] = useState<Work | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tempFiles, setTempFiles] = useState<File[]>([]);
  // 评分维度相关状态
  const [ratingDimensions, setRatingDimensions] = useState<RatingDimension[]>([]);
  const [ratingDimensionsLoading, setRatingDimensionsLoading] = useState(false);

  // 从API获取作品列表（支持搜索和分页）
  const fetchWorks = async (title?: string, page: number = 1, size: number = 10) => {
    try {
      setLoading(true);
      const response: any = await workApi.getWorks(title, page, size);
      if (response.success) {
        setWorks(response.data.list);
        setTotalWorks(response.data.total);
        setCurrentPage(response.data.page);
        setPageSize(response.data.pageSize);
      } else {
        message.error(response.message || '获取作品列表失败');
      }
    } catch (error) {
      console.error('获取作品列表错误:', error);
      message.error('获取作品列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 文件信息缓存
  const [fileInfoMap, setFileInfoMap] = useState<Map<number, {filename: string}>>(new Map());

  // 获取文件详细信息并缓存
  const getFileInfo = async (fileId: number) => {
    if (fileInfoMap.has(fileId)) {
      return fileInfoMap.get(fileId);
    }

    try {
      const result = await fileApi.getFileById(fileId);
      if (result.success && result.data) {
        setFileInfoMap(prev => new Map(prev).set(fileId, {filename: result.data.originalName}));
        return {filename: result.data.originalName};
      }
    } catch (error) {
      console.error('获取文件信息错误:', error);
    }
    return {filename: `文件${fileId}`};
  };

  // 获取作品文件列表
  const fetchWorkFiles = async (workId: number) => {
    try {
      const response: any = await fileApi.getFilesByWorkId(workId);
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('获取作品文件错误:', error);
      return [];
    }
  };

  // 处理文件上传
  const handleFileUpload = async (file: any) => {
    // 验证文件类型
    if (!file.type.startsWith('application/pdf')) {
      message.error('仅支持PDF文件上传');
      return false; // 阻止自动上传
    }

    // 统一新增和编辑模式的文件上传交互：先保存在临时状态，只有保存作品时才真正上传
    setTempFiles(prev => [...prev, file]);
    message.success('文件已添加到待上传列表');
    return false; // 阻止自动上传
  };

  // 处理文件点击事件（预览）
  const handleFileClick = async (fileId: number) => {
    try {
      const response: any = await fileApi.getFileUrl(fileId);
      if (response.success && response.data?.previewUrl) {
        // 打开文件预览
        window.open(response.data.previewUrl, '_blank');
      } else {
        message.error(response.message || '获取文件路径失败');
      }
    } catch (error) {
      console.error('获取文件路径错误:', error);
      message.error('文件路径获取失败');
    }
  };

  // 处理文件下载事件
  const handleFileDownload = async (fileId: number) => {
    try {
      const response: any = await fileApi.getFileUrl(fileId);
      if (response.success && response.data?.downloadUrl) {
        // 下载文件
        window.open(response.data.downloadUrl, '_blank');
      } else {
        message.error(response.message || '获取文件下载路径失败');
      }
    } catch (error) {
      console.error('文件下载错误:', error);
      message.error('文件下载失败');
    }
  };

  // 删除文件
  const handleDeleteFile = async (fileId: number) => {
    try {
      const response: any = await fileApi.deleteFile(fileId);
      if (response.success) {
        message.success('文件删除成功');
        // 更新currentWork状态，移除已删除的文件ID
        if (isEditMode && currentWork) {
          setCurrentWork(prev => {
            if (!prev || !prev.files) return prev;
            return {
              ...prev,
              files: prev.files.filter(id => id !== fileId)
            };
          });
        }
        // 刷新作品列表
        fetchWorks();
      } else {
        message.error(response.message || '文件删除失败');
      }
    } catch (error) {
      console.error('文件删除错误:', error);
      message.error('文件删除失败');
    }
  };

  // 获取所有评分维度
  const fetchRatingDimensions = async () => {
    try {
      setRatingDimensionsLoading(true);
      const response: any = await ratingDimensionApi.getRatingDimensions();
      if (response.success) {
        setRatingDimensions(response.data.list);
      } else {
        message.error(response.message || '获取评分维度失败');
      }
    } catch (error) {
      console.error('获取评分维度错误:', error);
      message.error('获取评分维度失败');
    } finally {
      setRatingDimensionsLoading(false);
    }
  };

  // 初始化时获取作品列表、评分维度并预加载文件信息
  useEffect(() => {
    Promise.all([fetchWorks(), fetchRatingDimensions()]).then(() => {
      // 预加载所有文件的信息
      if (works.length > 0) {
        const allFileIds = works
          .filter(work => work.files && work.files.length > 0)
          .flatMap(work => work.files || []);
        
        // 去重并获取文件信息
        const uniqueFileIds = [...new Set(allFileIds)];
        uniqueFileIds.forEach(fileId => {
          getFileInfo(fileId);
        });
      }
    });
  }, []);

  // 当作品列表更新时，预加载新的文件信息
  useEffect(() => {
    if (works.length > 0) {
      const allFileIds = works
        .filter(work => work.files && work.files.length > 0)
        .flatMap(work => work.files || []);
      
      const uniqueFileIds = [...new Set(allFileIds)];
      uniqueFileIds.forEach(fileId => {
        if (!fileInfoMap.has(fileId)) {
          getFileInfo(fileId);
        }
      });
    }
  }, [works, fileInfoMap.size]);

  // 打开新增作品模态框
  const showAddModal = () => {
    setIsEditMode(false);
    form.resetFields();
    setIsModalOpen(true);
  };

  // 打开编辑作品模态框
  const showEditModal = (work: Work) => {
    setIsEditMode(true);
    setCurrentWork(work);
    form.setFieldsValue({
      title: work.title,
      description: work.description,
      ratingDimensionIds: work.ratingDimensionIds
    });

    // 获取作品文件
    if (work.files && work.files.length > 0) {
      fetchWorkFiles(work.id).then(files => {
        setFileList(files);
      });
    } else {
      setFileList([]);
    }

    setIsModalOpen(true);
  };

  // 删除临时文件
  const handleRemoveTempFile = (index: number) => {
    setTempFiles(prev => prev.filter((_, i) => i !== index));
    message.success('文件已从待上传列表中移除');
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setCurrentWork(null);
    setFileList([]);
    setTempFiles([]);
  };

  // 保存作品（新增或编辑）
  const handleSave = () => {
    form.validateFields()
      .then(values => {
        if (isEditMode && currentWork) {
          // 编辑现有作品
          workApi.updateWork(currentWork.id, values.title, values.description, values.ratingDimensionIds)
            .then((response: any) => {
              if (response.success) {
                const updatedWorks = works.map(work =>
                  work.id === currentWork.id
                    ? response.data
                    : work
                );
                setWorks(updatedWorks);
                message.success(response.message || '作品更新成功');

                // 如果有临时文件，上传并关联到编辑的作品
                if (tempFiles.length > 0) {
                  message.info('正在上传文件...');
                  setUploading(true);

                  const uploadPromises = tempFiles.map(file =>
                    fileApi.uploadFile(file, currentWork.id)
                  );

                  Promise.all(uploadPromises)
                    .then(results => {
                      console.log('results', results);

                      const successCount = results.filter(r => r.success).length;
                      if (successCount > 0) {
                        message.success(`成功上传 ${successCount}/${tempFiles.length} 个文件`);
                      }
                      if (successCount < tempFiles.length) {
                        message.error(`部分文件上传失败，成功 ${successCount} 个，失败 ${tempFiles.length - successCount} 个`);
                      }
                      // 刷新作品列表以获取最新的文件关联信息
                      fetchWorks();
                    })
                    .catch(error => {
                      console.error('文件批量上传错误:', error);
                      message.error('文件上传失败');
                      // 即使文件上传失败，也要刷新作品列表
                      fetchWorks();
                    })
                    .finally(() => {
                      // 清空临时文件
                      setTempFiles([]);
                      setUploading(false);
                      // 关闭模态框
                      handleCancel();
                    });
                } else {
                  // 没有文件，直接关闭模态框
                  handleCancel();
                }
              } else {
                message.error(response.message || '作品更新失败');
                // 清空临时文件
                setTempFiles([]);
              }
            })
            .catch(error => {
              console.error('更新作品错误:', error);
              message.error('作品更新失败');
              // 清空临时文件
              setTempFiles([]);
            })
        } else {
          // 新增作品
          workApi.createWork(values.title, values.description, values.ratingDimensionIds)
            .then((response: any) => {
              if (response.success) {
                const newWork = response.data;
                // 先更新本地状态以提高用户体验
                setWorks(prev => [...prev, newWork]);
                message.success(response.message || '作品添加成功');

                // 如果有临时文件，上传并关联到新作品
                if (tempFiles.length > 0) {
                  message.info('正在上传文件...');
                  setUploading(true);

                  const uploadPromises = tempFiles.map(file =>
                    fileApi.uploadFile(file, newWork.id)
                  );

                  Promise.all(uploadPromises)
                    .then(results => {
                      console.log('results', results);

                      const successCount = results.filter(r => r.success).length;
                      if (successCount > 0) {
                        message.success(`成功上传 ${successCount}/${tempFiles.length} 个文件`);
                      }
                      if (successCount < tempFiles.length) {
                        message.error(`部分文件上传失败，成功 ${successCount} 个，失败 ${tempFiles.length - successCount} 个`);
                      }
                      // 刷新作品列表以获取最新的文件关联信息
                      fetchWorks();
                    })
                    .catch(error => {
                      console.error('文件批量上传错误:', error);
                      message.error('文件上传失败');
                      // 即使文件上传失败，也要刷新作品列表
                      fetchWorks();
                    })
                    .finally(() => {
                      // 清空临时文件
                      setTempFiles([]);
                      setUploading(false);
                      // 关闭模态框
                      handleCancel();
                    });
                } else {
                  // 没有文件，直接关闭模态框
                  handleCancel();
                }
              } else {
                message.error(response.message || '作品添加失败');
                // 清空临时文件
                setTempFiles([]);
              }
            })
            .catch(error => {
              console.error('创建作品错误:', error);
              message.error('作品添加失败');
              // 清空临时文件
              setTempFiles([]);
            })
        }
      })
      .catch(info => {
        console.error('表单验证失败:', info);
        // 清空临时文件
        setTempFiles([]);
      });
  };

  // 删除作品
  const handleDelete = (workId: number) => {
    workApi.deleteWork(workId)
      .then((response: any) => {
        if (response.success) {
          setWorks(works.filter(work => work.id !== workId));
          message.success(response.message || '作品删除成功');
        } else {
          message.error(response.message || '作品删除失败');
        }
      })
      .catch(error => {
        console.error('删除作品错误:', error);
        message.error('作品删除失败');
      }).finally(() => {
        fetchWorks(searchKeyword); // 刷新作品列表
      });
  };

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  // 执行搜索
  const handleSearch = () => {
    setCurrentPage(1); // 搜索时回到第一页
    fetchWorks(searchKeyword, 1, pageSize);
  };

  // 清空搜索
  const handleClearSearch = () => {
    setSearchKeyword('');
    setCurrentPage(1);
    fetchWorks('', 1, pageSize); // 重新获取所有作品
  };

  // 处理分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
    fetchWorks(searchKeyword, page, pageSize);
  };

  // 表格列定义
  const columns: ColumnsType<Work> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '作品名称',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      align: 'center',
    },
    {
      title: '作品描述',
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
      title: '评分维度',
      dataIndex: 'ratingDimensionIds',
      key: 'ratingDimensionIds',
      width: 200,
      align: 'center',
      render: (ids: number[]) => {
        if (!ids || ids.length === 0) {
          return '无';
        }
        
        const dimensionNames = ids
          .map(id => ratingDimensions.find(d => d.id === id)?.name)
          .filter(Boolean);
        
        if (dimensionNames.length === 0) {
          return '无';
        }
        
        return (
          <Tooltip title={dimensionNames.join(', ')}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              flexWrap: 'wrap', 
              gap: '4px',
              maxWidth: '200px'
            }}>
              {dimensionNames.map((name, index) => (
                <span 
                  key={index} 
                  className="dimension-tag"
                  style={{ 
                    backgroundColor: '#f0f0f0', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%'
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </Tooltip>
        );
      },
    },
    {      title: '作品文件',
      key: 'files',
      ellipsis: true,
      align: 'center',
      render: (_: any, record: Work) => (
        <div>
          {record.files && record.files.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '300px' }}>
              {record.files.slice(0, 3).map((fileId: number) => (
                <div key={fileId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', borderRadius: '4px', border: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
                  <Tooltip title="点击查看PDF文件">
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#1890ff', maxWidth: '180px' }}
                      onClick={() => handleFileClick(fileId)}
                    >
                      <FilePdfOutlined style={{ fontSize: '16px' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {fileInfoMap.get(fileId)?.filename || `文件${fileId}`}
                      </span>
                    </div>
                  </Tooltip>
                  <Tooltip title="下载PDF文件">
                    <Button
                      type="link"
                      icon={<DownloadOutlined />}
                      onClick={() => handleFileDownload(fileId)}
                      style={{ padding: 0, color: '#52c41a' }}
                    >
                      下载
                    </Button>
                  </Tooltip>
                </div>
              ))}
              {record.files.length > 3 && (
                <Tooltip title="还有更多文件">
                  <Button type="link" style={{ padding: 0, marginBottom: 4, color: '#1890ff' }}>
                    +{record.files.length - 3}
                  </Button>
                </Tooltip>
              )}
            </div>
          ) : (
            '无文件'
          )}
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: any, record: Work) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}

          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个作品吗？"
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
        <h1 className="page-title">作品管理</h1>
        <div className="action-button">
          <div style={{ marginRight: '16px', display: 'flex', gap: '8px' }}>
            <Input
              placeholder="搜索作品标题"
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
          <div className="flex gap-2">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
              size="middle"
            >
              新增作品
            </Button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={works}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalWorks,
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
        title={isEditMode ? '编辑作品' : '新增作品'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={handleCancel}
        width={{ xs: '90%', sm: 600 }}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{}}
        >
          <Form.Item
            label="作品名称"
            name="title"
            rules={[{ required: true, message: '请输入作品标题' }]}
          >
            <Input placeholder="请输入作品标题" size="large" />
          </Form.Item>
          <Form.Item
            label="作品描述"
            name="description"
            rules={[{ required: true, message: '请输入作品描述' }]}
          >
            <Input.TextArea
              placeholder="请输入作品描述"
              rows={4}
              showCount
              maxLength={500}
              size="large"
            />
          </Form.Item>
          <Form.Item
            label="评分维度"
            name="ratingDimensionIds"
            rules={[{ required: true, message: '请选择评分维度' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择评分维度"
              loading={ratingDimensionsLoading}
              style={{ width: '100%' }}
              size="large"
            >
              {ratingDimensions.map(dimension => (
                <Select.Option key={dimension.id} value={dimension.id}>
                  {dimension.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="作品文件" required={false}>
            <Upload
              beforeUpload={handleFileUpload}
              fileList={[]}
              accept=".pdf"
              multiple
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} type="primary" loading={uploading}>
                上传PDF文件
              </Button>
            </Upload>

            {/* 显示临时文件列表 - 新增和编辑模式都显示 */}
            {tempFiles.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>待上传文件：</h4>
                {tempFiles.map((file, index) => (
                  <div key={index} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                    <FilePdfOutlined style={{ marginRight: 8 }} />
                    <span>{file.name}</span>
                    <Button
                      type="link"
                      danger
                      style={{ marginLeft: 'auto', padding: 0 }}
                      onClick={() => handleRemoveTempFile(index)}
                    >
                      删除
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* 显示已上传文件列表 */}
            {(isEditMode && currentWork && currentWork.files && currentWork.files.length > 0) && (
              <div style={{ marginTop: 16 }}>
                <h4>已上传文件：</h4>
                {currentWork.files.map((fileId: number) => (
                  <div key={fileId} style={{ marginBottom: 8 }}>
                    <Tooltip title="点击查看PDF文件">
                      <Button
                        type="link"
                        icon={<FilePdfOutlined />}
                        onClick={() => handleFileClick(fileId)}
                        style={{ padding: 0, marginRight: 16 }}
                      >
                        {fileInfoMap.get(fileId)?.filename || `文件${fileId}`}
                      </Button>
                    </Tooltip>
                    <Popconfirm
                      title="确定要删除这个文件吗？"
                      onConfirm={() => handleDeleteFile(fileId)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="link"
                        danger
                        style={{ padding: 0 }}
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  </div>
                ))}
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}