import React from 'react';
import { Button } from 'antd';

interface RatingButtonsProps {
  isEditStatus: boolean;
  handleModify: () => void;
  handleSubmit: () => void;
  handleSave: () => void;
  saving?: boolean;
}

const RatingButtons: React.FC<RatingButtonsProps> = ({
  isEditStatus,
  handleModify,
  handleSubmit,
  handleSave,
  saving = false
}) => {
  return (
    <div className="rating-buttons">
      <div className="buttons-group">
        {
          isEditStatus ? (
            <Button
              type="primary"
              className="rating-button save-button"
              onClick={handleSave}
              loading={saving}
              disabled={saving}
              style={{
                height: '40px',
                padding: '0 20px',
                fontSize: '14px',
                background: '#1890ff',
                border: 'none',
                boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
                color: '#fff'
              }}
            >
              {saving ? '保存中...' : '保存评分'}
            </Button>
          ) : (
            <>
              <Button
                type="primary"
                className="rating-button modify-button"
                onClick={handleModify}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  fontSize: '14px',
                  background: '#ff7875',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(255, 120, 117, 0.3)',
                  color: '#fff'
                }}
              >
                修改评分
              </Button>
              <Button
                type="primary"
                className="rating-button submit-button"
                onClick={handleSubmit}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  fontSize: '14px',
                  background: '#52c41a',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)',
                  color: '#fff'
                }}
              >
                提交评分
              </Button>
            </>
          )
        }
      </div>
    </div>
  );
};

export default RatingButtons;