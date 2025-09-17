import React, { useState, useEffect } from 'react';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { API_CONFIG } from '../config/api';
import { getToken } from '../utils/tokenUtils';
import './VideoUploadModal.css';

const VideoUploadModal = ({ isOpen, onClose, onUploaded }) => {
  const [gameKey, setGameKey] = useState('');
  const [videoFiles, setVideoFiles] = useState([]);
  const [existingVideos, setExistingVideos] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, completed, error
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState('');

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setGameKey('');
      setVideoFiles([]);
      setExistingVideos(null);
      setUploadStatus('idle');
      setUploadProgress({});
      setError('');
    }
  }, [isOpen]);

  // GameKey 변경 시 기존 비디오 확인
  useEffect(() => {
    const checkExistingVideos = async () => {
      if (!gameKey || !/^[A-Z]{4}[0-9]{8}$/.test(gameKey)) {
        setExistingVideos(null);
        return;
      }

      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/videoupload/check/${gameKey}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });

        const data = await response.json();
        
        if (data.success) {
          setExistingVideos(data);
        } else {
          setExistingVideos(null);
        }
      } catch (error) {
        console.error('기존 비디오 확인 실패:', error);
        setExistingVideos(null);
      }
    };

    const timeoutId = setTimeout(checkExistingVideos, 500); // 0.5초 딜레이
    return () => clearTimeout(timeoutId);
  }, [gameKey]);

  const handleGameKeyChange = (e) => {
    const value = e.target.value.toUpperCase();
    setGameKey(value);
    setError('');
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setVideoFiles(files);
    setError('');
  };

  const generateClipFileName = (index) => {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[-:T]/g, '')
      .substring(0, 14); // YYYYMMDDHHMMSS
    
    return `clip_${index}_${timestamp}.mp4`;
  };

  const uploadSingleFile = async (file, index, fileName) => {
    try {
      // 1. Presigned URL 요청
      const urlResponse = await fetch(`${API_CONFIG.BASE_URL}/videoupload/presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          gameKey,
          fileName
        })
      });

      const urlData = await urlResponse.json();
      
      if (!urlData.success) {
        throw new Error(urlData.message || 'Presigned URL 생성 실패');
      }

      // 2. S3에 파일 업로드
      const uploadResponse = await fetch(urlData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': 'video/mp4'
        }
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 업로드 실패: ${uploadResponse.status}`);
      }

      // 업로드 성공
      setUploadProgress(prev => ({
        ...prev,
        [index]: { status: 'completed', fileName }
      }));

      return true;
    } catch (error) {
      console.error(`파일 ${index} 업로드 실패:`, error);
      
      setUploadProgress(prev => ({
        ...prev,
        [index]: { status: 'error', error: error.message, fileName }
      }));

      return false;
    }
  };

  const handleUpload = async () => {
    if (!gameKey || videoFiles.length === 0) {
      setError('경기 코드와 비디오 파일을 모두 선택해주세요');
      return;
    }

    setUploadStatus('uploading');
    setError('');

    // 진행률 초기화
    const initialProgress = {};
    videoFiles.forEach((_, index) => {
      initialProgress[index] = { status: 'waiting', fileName: generateClipFileName(index) };
    });
    setUploadProgress(initialProgress);

    let successCount = 0;

    // 각 파일을 순차적으로 업로드
    for (let i = 0; i < videoFiles.length; i++) {
      const file = videoFiles[i];
      const fileName = generateClipFileName(i);

      // 현재 파일을 업로드 중으로 표시
      setUploadProgress(prev => ({
        ...prev,
        [i]: { status: 'uploading', fileName }
      }));

      const success = await uploadSingleFile(file, i, fileName);
      if (success) {
        successCount++;
      }
    }

    // 업로드 완료
    if (successCount === videoFiles.length) {
      setUploadStatus('completed');
      setTimeout(() => {
        onUploaded?.();
        onClose();
      }, 2000);
    } else {
      setUploadStatus('error');
      setError(`${videoFiles.length}개 중 ${successCount}개만 업로드되었습니다`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUploadStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        const completed = Object.values(uploadProgress).filter(p => p.status === 'completed').length;
        return `업로드 중... (${completed}/${videoFiles.length})`;
      case 'completed':
        return '업로드 완료!';
      case 'error':
        return '업로드 실패';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="video-upload-modal-overlay">
      <div className="video-upload-modal">
        {/* 헤더 */}
        <div className="video-upload-header">
          <h2>클립 비디오 업로드</h2>
          <button className="close-button" onClick={onClose}>
            <IoCloseCircleOutline size={24} />
          </button>
        </div>

        {/* 내용 */}
        <div className="video-upload-content">
          {/* 1단계: GameKey 입력 */}
          <div className="upload-section">
            <label className="section-label">
              경기 코드 <span className="required">*</span>
            </label>
            <input
              type="text"
              value={gameKey}
              onChange={handleGameKeyChange}
              placeholder="예: HFHY20240907"
              className="gamekey-input"
              maxLength={12}
              disabled={uploadStatus === 'uploading'}
            />
            <small className="input-help">
              형식: 4글자(팀코드) + 8자리 숫자(날짜)
            </small>

            {/* 기존 비디오 정보 */}
            {existingVideos && (
              <div className={`existing-videos ${existingVideos.hasVideos ? 'warning' : 'info'}`}>
                {existingVideos.hasVideos ? (
                  <div>
                    <p><strong>⚠️ 기존 비디오 발견!</strong></p>
                    <p>{existingVideos.fileCount}개 파일 ({existingVideos.totalSize})</p>
                    <details>
                      <summary>파일 목록 보기</summary>
                      <ul>
                        {existingVideos.fileList.map((file, idx) => (
                          <li key={idx}>{file}</li>
                        ))}
                      </ul>
                    </details>
                    <p><small>같은 인덱스 파일은 덮어쓰기됩니다</small></p>
                  </div>
                ) : (
                  <p>✅ 새로운 경기입니다</p>
                )}
              </div>
            )}
          </div>

          {/* 2단계: 비디오 파일 선택 */}
          {gameKey && /^[A-Z]{4}[0-9]{8}$/.test(gameKey) && (
            <div className="upload-section">
              <label className="section-label">
                클립 비디오 파일들 <span className="required">*</span>
              </label>
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={handleFileSelect}
                className="file-input"
                disabled={uploadStatus === 'uploading'}
              />
              <small className="input-help">
                순서대로 선택하세요 (첫 번째 파일 = clip_0, 두 번째 파일 = clip_1...)
              </small>

              {/* 선택된 파일 목록 */}
              {videoFiles.length > 0 && (
                <div className="selected-files">
                  <h4>선택된 파일 ({videoFiles.length}개)</h4>
                  <div className="file-list">
                    {videoFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <span className="file-index">clip_{index}</span>
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 업로드 진행률 */}
          {uploadStatus === 'uploading' && (
            <div className="upload-section">
              <label className="section-label">업로드 진행률</label>
              <div className="progress-list">
                {Object.entries(uploadProgress).map(([index, progress]) => (
                  <div key={index} className={`progress-item ${progress.status}`}>
                    <span className="progress-label">
                      clip_{index}: {progress.fileName}
                    </span>
                    <span className={`progress-status ${progress.status}`}>
                      {progress.status === 'waiting' && '대기중'}
                      {progress.status === 'uploading' && '업로드중...'}
                      {progress.status === 'completed' && '✅ 완료'}
                      {progress.status === 'error' && '❌ 실패'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="video-upload-footer">
          <div className="upload-status">
            {getUploadStatusText()}
          </div>
          
          <div className="button-group">
            <button
              className="cancel-button"
              onClick={onClose}
              disabled={uploadStatus === 'uploading'}
            >
              취소
            </button>
            
            <button
              className="upload-button"
              onClick={handleUpload}
              disabled={
                !gameKey || 
                !/^[A-Z]{4}[0-9]{8}$/.test(gameKey) || 
                videoFiles.length === 0 || 
                uploadStatus === 'uploading'
              }
            >
              {uploadStatus === 'uploading' ? '업로드 중...' : `업로드 (${videoFiles.length}개)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;