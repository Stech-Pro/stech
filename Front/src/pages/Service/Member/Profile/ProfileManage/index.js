// ProfileManage.jsx
import React, { useState } from 'react';
import './ProfileManage.css';

const ProfileManage = () => {
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      setUploadStatus('업로드 중…');

      const response = await fetch('/api/upload/excel', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('정상적으로 업로드 됨 ✅');
      } else {
        setUploadStatus('업로드 실패 ❌');
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('서버 오류 ❌');
    } finally {
      setIsUploading(false);
      // 같은 파일 재업로드 가능하도록 input 초기화
      event.target.value = '';
    }
  };

  return (
    <div className="profile-main">
      {/* 상단 버튼 영역 제거됨 */}

      <div className="profile-manage-container">
        <div className="manage-item">
          <div className="manage-label">1. 선수단 명단</div>
          <div className="manage-actions">
            <label
              htmlFor="excel-upload"
              className={`excel-upload-btn ${isUploading ? 'disabled' : ''}`}
              aria-disabled={isUploading}
            >
              {isUploading ? '업로드 중…' : '엑셀 파일 업로드'}
            </label>
            <input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <span className="upload-hint">{uploadStatus}</span>
          </div>
        </div>

        <div className="manage-item">
          <div className="manage-label">2. 플레이북</div>
          <div className="manage-status">출시 예정</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManage;
