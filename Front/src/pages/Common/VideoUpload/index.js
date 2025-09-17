import React, { useState, useRef, useCallback } from 'react';
import { API_CONFIG } from '../../../config/api';
import { getToken } from '../../../utils/tokenUtils';
import './index.css';

/**
 * 비디오 업로드 전용 페이지 (/videoupload)
 * - JSON 페이지와 유사한 단순한 UI
 * - GameKey 입력 + 파일 선택 + 업로드
 * - 드래그앤드롭 지원
 * - 업로드 진행률 표시
 */
export default function VideoUpload() {
  const [gameKey, setGameKey] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | success | error
  const [uploadProgress, setUploadProgress] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [existingVideos, setExistingVideos] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fileInputRef = useRef(null);

  // ──────────────────────────────
  // 파일 검증
  // ──────────────────────────────
  const validateFiles = useCallback((files) => {
    const validFiles = [];
    
    for (const file of files) {
      // 비디오 파일인지 확인
      if (!file.type.startsWith('video/')) {
        alert(`${file.name}은(는) 비디오 파일이 아닙니다.`);
        continue;
      }
      
      // 500MB 이하 확인
      if (file.size > 500 * 1024 * 1024) {
        alert(`${file.name}의 크기가 너무 큽니다 (최대 500MB)`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    return validFiles;
  }, []);

  // ──────────────────────────────
  // GameKey 변경 시 기존 비디오 확인
  // ──────────────────────────────
  const checkExistingVideos = useCallback(async (key) => {
    if (!key || !/^[A-Z]{4}[0-9]{8}$/.test(key)) {
      setExistingVideos(null);
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/videoupload/check/${key}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExistingVideos(data);
      } else {
        setExistingVideos(null);
      }
    } catch (error) {
      console.error('기존 비디오 확인 실패:', error);
      setExistingVideos(null);
    }
  }, []);

  // ──────────────────────────────
  // GameKey 입력 처리
  // ──────────────────────────────
  const handleGameKeyChange = useCallback((e) => {
    const value = e.target.value.toUpperCase();
    setGameKey(value);
    setErrorMessage('');
    
    // 디바운스로 기존 비디오 확인
    const timeoutId = setTimeout(() => checkExistingVideos(value), 500);
    return () => clearTimeout(timeoutId);
  }, [checkExistingVideos]);

  // ──────────────────────────────
  // 드래그앤드롭 처리
  // ──────────────────────────────
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);
    setSelectedFiles(validFiles);
  }, [validateFiles]);

  // ──────────────────────────────
  // 파일 선택 처리
  // ──────────────────────────────
  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    const validFiles = validateFiles(files);
    setSelectedFiles(validFiles);
  }, [validateFiles]);

  // ──────────────────────────────
  // 파일명 생성
  // ──────────────────────────────
  const generateClipFileName = useCallback((index) => {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[-:T]/g, '')
      .substring(0, 14); // YYYYMMDDHHMMSS
    
    return `clip_${index}_${timestamp}.mp4`;
  }, []);

  // ──────────────────────────────
  // 단일 파일 업로드
  // ──────────────────────────────
  const uploadSingleFile = useCallback(async (file, index) => {
    const fileName = generateClipFileName(index);
    
    try {
      // 1. Presigned URL 요청
      const urlResponse = await fetch(`${API_CONFIG.BASE_URL}/videoupload/presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ gameKey, fileName })
      });

      const urlData = await urlResponse.json();
      
      if (!urlData.success) {
        throw new Error(urlData.message || 'URL 생성 실패');
      }

      // 2. S3에 파일 업로드
      setUploadProgress(prev => ({
        ...prev,
        [index]: { status: 'uploading', fileName }
      }));

      const uploadResponse = await fetch(urlData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': 'video/mp4'
        }
      });

      if (!uploadResponse.ok) {
        throw new Error(`업로드 실패: ${uploadResponse.status}`);
      }

      // 성공
      setUploadProgress(prev => ({
        ...prev,
        [index]: { status: 'completed', fileName }
      }));

      return true;
    } catch (error) {
      setUploadProgress(prev => ({
        ...prev,
        [index]: { status: 'error', fileName: fileName, error: error.message }
      }));
      return false;
    }
  }, [gameKey, generateClipFileName]);

  // ──────────────────────────────
  // 업로드 실행
  // ──────────────────────────────
  const handleUpload = useCallback(async () => {
    if (!gameKey || !/^[A-Z]{4}[0-9]{8}$/.test(gameKey)) {
      setErrorMessage('올바른 GameKey를 입력해주세요 (예: HFHY20240907)');
      return;
    }

    if (selectedFiles.length === 0) {
      setErrorMessage('업로드할 비디오 파일을 선택해주세요');
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');
    setSuccessMessage('');

    // 진행률 초기화
    const initialProgress = {};
    selectedFiles.forEach((_, index) => {
      initialProgress[index] = { status: 'waiting', fileName: generateClipFileName(index) };
    });
    setUploadProgress(initialProgress);

    let successCount = 0;

    // 순차적으로 업로드
    for (let i = 0; i < selectedFiles.length; i++) {
      const success = await uploadSingleFile(selectedFiles[i], i);
      if (success) successCount++;
    }

    // 결과 처리
    if (successCount === selectedFiles.length) {
      setUploadStatus('success');
      setSuccessMessage(`${successCount}개 파일이 성공적으로 업로드되었습니다!`);
      
      // 성공 후 초기화
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadProgress({});
        setGameKey('');
        setExistingVideos(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 3000);
    } else {
      setUploadStatus('error');
      setErrorMessage(`${selectedFiles.length}개 중 ${successCount}개만 업로드되었습니다`);
    }
  }, [gameKey, selectedFiles, uploadSingleFile, generateClipFileName]);

  // ──────────────────────────────
  // 비디오 삭제
  // ──────────────────────────────
  const handleDeleteVideos = useCallback(async () => {
    if (!gameKey || !/^[A-Z]{4}[0-9]{8}$/.test(gameKey)) {
      setErrorMessage('올바른 GameKey를 입력해주세요');
      return;
    }

    if (!existingVideos?.hasVideos) {
      setErrorMessage('삭제할 비디오가 없습니다');
      return;
    }

    const confirmDelete = window.confirm(
      `정말로 ${gameKey} 경기의 모든 비디오 ${existingVideos.fileCount}개를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmDelete) return;

    try {
      setDeleteLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await fetch(`${API_CONFIG.BASE_URL}/videoupload/${gameKey}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || '비디오 삭제 실패');
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccessMessage(`성공적으로 ${result.deletedCount}개의 비디오 파일을 삭제했습니다!`);
        // 기존 비디오 정보 새로고침
        setTimeout(() => checkExistingVideos(gameKey), 1000);
      } else {
        throw new Error(result.message || '비디오 삭제 실패');
      }
    } catch (error) {
      console.error('비디오 삭제 오류:', error);
      setErrorMessage(error?.message || '비디오 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  }, [gameKey, existingVideos, checkExistingVideos]);

  // ──────────────────────────────
  // 파일 크기 포맷
  // ──────────────────────────────
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return (
    <div className="video-upload-page">
      <div className="container">
        {/* 헤더 */}
        <div className="header">
          <h1>클립 비디오 업로드</h1>
          <p>경기별 클립 비디오를 S3에 업로드합니다</p>
        </div>

        {/* GameKey 입력 */}
        <div className="section">
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
            <div className={`existing-info ${existingVideos.hasVideos ? 'warning' : 'success'}`}>
              {existingVideos.hasVideos ? (
                <div>
                  <strong>⚠️ 기존 비디오 {existingVideos.fileCount}개 발견!</strong>
                  <p>같은 인덱스 파일은 덮어쓰기됩니다</p>
                  <div style={{ marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={handleDeleteVideos}
                      disabled={deleteLoading || uploadStatus === 'uploading'}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: deleteLoading ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {deleteLoading ? '삭제 중...' : `기존 비디오 ${existingVideos.fileCount}개 삭제`}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <strong>✅ 새로운 경기</strong>
                  <p>비디오를 업로드할 수 있습니다</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 파일 업로드 영역 */}
        {gameKey && /^[A-Z]{4}[0-9]{8}$/.test(gameKey) && (
          <div className="section">
            <label className="section-label">
              비디오 파일들 <span className="required">*</span>
            </label>
            
            {/* 드래그앤드롭 영역 */}
            <div 
              className={`upload-zone ${dragOver ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-zone-content">
                <div className="upload-icon">📹</div>
                <p>클릭하거나 파일을 드래그해서 업로드</p>
                <small>여러 비디오 파일 선택 가능 (최대 500MB/개)</small>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={uploadStatus === 'uploading'}
            />
          </div>
        )}

        {/* 선택된 파일 목록 */}
        {selectedFiles.length > 0 && (
          <div className="section">
            <h3>선택된 파일 ({selectedFiles.length}개)</h3>
            <div className="file-list">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-index">clip_{index}</span>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 업로드 진행률 */}
        {uploadStatus === 'uploading' && (
          <div className="section">
            <h3>업로드 진행률</h3>
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

        {/* 결과 메시지 */}
        {successMessage && (
          <div className="section">
            <div className="success-message">{successMessage}</div>
          </div>
        )}

        {errorMessage && (
          <div className="section">
            <div className="error-message">{errorMessage}</div>
          </div>
        )}

        {/* 업로드 버튼 */}
        <div className="section">
          <button
            className={`upload-button ${uploadStatus}`}
            onClick={handleUpload}
            disabled={
              !gameKey || 
              !/^[A-Z]{4}[0-9]{8}$/.test(gameKey) || 
              selectedFiles.length === 0 || 
              uploadStatus === 'uploading'
            }
          >
            {uploadStatus === 'uploading' ? 
              `업로드 중... (${Object.values(uploadProgress).filter(p => p.status === 'completed').length}/${selectedFiles.length})` :
              `업로드 시작 (${selectedFiles.length}개 파일)`
            }
          </button>
        </div>
      </div>
    </div>
  );
}