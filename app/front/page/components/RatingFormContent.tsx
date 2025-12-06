import React from 'react';
import { Typography, Slider, Tooltip } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
interface RatingFormContentProps {
  workData: Record<string, any>[];
  ratings: Record<number, Record<string, number>>;
  handleRatingChange: (contentId: number, dimensionId: string, value: number | null) => void;
  colors: string[];
  onFileClick: (file: Record<string, any>) => void;
}

const RatingFormContent: React.FC<RatingFormContentProps> = ({
  workData,
  ratings,
  handleRatingChange,
  colors,
  onFileClick,
}) => {

  const handleFileClick = (file: Record<string, any>) => {
    onFileClick(file);
  };
  return (
    <div className="rate-form-content">
      <div className="rate-form-header">
        <Title level={3} className="text-text-primary">请对以下内容进行评分</Title>
        <Text className="text-text-secondary">
          请为每项内容评分（0-100分），所有项目都需要填写
        </Text>
      </div>

      <div className="rating-items">
        {workData.map(item => {
          const score = ratings[item.id];
          // score是一个包含多个维度的对象，不需要在这里计算整体level
          return (
            <div
              key={item.id}
              className="rating-item"
            >
              <div className="rating-item-header">
                <div className="rating-item-icon">
                  <FilePdfOutlined style={{ color: '#eb2f96', fontSize: '20px' }} />
                </div>
                <div className="rating-item-info">
                  <Tooltip title={item.title}>
                    <div className="rating-item-info-title">{item.title}</div>
                  </Tooltip>
                  <Tooltip title={item.description}>
                    <div className="rating-item-info-description">{item.description}</div>
                  </Tooltip>
                </div>
              </div>
              <div className="rating-item-files">
                {item.files.map((file: Record<string, any>, index: number) => (
                  <div key={file.id || index} className="rating-item-file" onClick={() => handleFileClick(file)}>
                    <div className="rating-item-file-info">
                      <FilePdfOutlined className="text-gray-500" style={{ marginRight: '8px' }} />
                      <span>{file.originalName}</span>
                    </div>
                    <div className="rating-item-file-arrow">→</div>
                  </div>
                ))}
              </div>
              <div className="rating-item-score-section">
                {(() => {
                  return item.ratingDimensions.map((dimension: Record<string, any>, index: number) => {
                    const dimScore = score?.[dimension.id];
                    return (
                      <div key={dimension.id} className="rating-dimension">
                        <div className="rating-dimension-header">
                          <div className="rating-dimension-name">
                            {dimension.name || dimension.ratingDimensionName}
                          </div>
                        </div>
                        <div className="rating-dimension-input">
                          <div className="slider-container">
                            <Slider
                              min={0}
                              max={100}
                              value={dimScore || undefined}
                              onChange={(value) => handleRatingChange(item.id, dimension.id, value)}
                              tooltip={{ formatter: (value) => `${value}分` }}
                              style={{
                                marginBottom: '8px',
                                width: '100%'
                              }}
                              styles={{
                                track: {
                                  backgroundColor: dimScore !== undefined ? colors[index] : '#1890ff'
                                },
                                rail: {
                                  backgroundColor: '#f0f0f0'
                                },
                              }}
                            />
                            <div className="slider-value-display">
                              <span className="slider-value-label">当前分数:</span>
                              <span 
                                className="slider-value"
                                style={{ color: dimScore !== undefined ? colors[index] : '#666' }}
                              >
                                {dimScore !== undefined ? `${dimScore}分` : '未评分'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingFormContent;