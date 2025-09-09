// src/components/VideoMemo/VideoMemo.js
import React, { useState, useRef, useEffect } from 'react';
import './VideoMemo.css';

const VideoMemo = ({
  isVisible,
  onClose,
  clipId,
  memos,
  onSaveMemo,
  clipInfo,
  teamPlayers = [], // 팀 선수 목록
  currentUser = null, // 현재 사용자 정보를 props로 받기
}) => {
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false); // 나만 보기 상태
  const [showPlayerList, setShowPlayerList] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ x: 0, y: 0 });
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const textareaRef = useRef(null);
  const currentMemo = memos[clipId] || '';

  useEffect(() => {
    if (isVisible) {
      if (typeof currentMemo === 'string') {
        setContent(currentMemo);
        setIsPrivate(false);
      } else if (currentMemo && typeof currentMemo === 'object') {
        setContent(currentMemo.content || '');
        setIsPrivate(currentMemo.isPrivate || false);
      }
    }
  }, [isVisible, currentMemo]);

  // @ 입력 감지 및 플레이어 목록 표시
  const handleContentChange = (e) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;

    // @ 문자 감지
    const beforeCursor = value.substring(0, cursorPosition);
    const atIndex = beforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const searchText = beforeCursor.substring(atIndex + 1);
      if (searchText.length >= 0 && !searchText.includes(' ')) {
        // 플레이어 필터링
        const filtered = teamPlayers.filter(
          (player) =>
            (player.name &&
              player.name.toLowerCase().includes(searchText.toLowerCase())) ||
            (player.playerID &&
              player.playerID.toLowerCase().includes(searchText.toLowerCase())),
        );
        setFilteredPlayers(filtered);
        setShowPlayerList(true);

        // 커서 위치 계산 (간단한 예시)
        const textarea = textareaRef.current;
        if (textarea) {
          const rect = textarea.getBoundingClientRect();
          setMentionPosition({
            x: rect.left,
            y: rect.bottom,
          });
        }
      } else {
        setShowPlayerList(false);
      }
    } else {
      setShowPlayerList(false);
    }

    setContent(value);
  };

  // 플레이어 선택 시 멘션 추가
  const handlePlayerSelect = (player) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);

    // @ 이후 텍스트 제거하고 플레이어 멘션 추가
    const atIndex = beforeCursor.lastIndexOf('@');
    const newContent =
      beforeCursor.substring(0, atIndex) + `@${player.playerID} ` + afterCursor;

    setContent(newContent);
    setShowPlayerList(false);

    // 커서 위치 재설정
    setTimeout(() => {
      const newPosition = atIndex + player.playerID.length + 2;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  const handleSave = () => {
    const memoData = {
      content: content.trim(),
      isPrivate,
      authorId:
        currentUser?.profile?.playerID || currentUser?.username || 'unknown',
      authorName:
        currentUser?.profile?.realName || currentUser?.username || '익명',
      timestamp: new Date().toISOString(),
      clipInfo,
    };

    onSaveMemo(clipId, memoData);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="video-memo-overlay">
      <div className="video-memo-modal">
        <div className="video-memo-header">
          <h3>메모 작성</h3>
          <button onClick={onClose}>×</button>
        </div>

        <div className="video-memo-content">
          <div className="video-memo-info">
            <div>
              Q{clipInfo.quarter} - {clipInfo.down} & {clipInfo.yardsToGo}
            </div>
            <div>시간: {clipInfo.time}</div>
          </div>

          {/* 클립 ID 표시 */}
          <div className="clip-id-display">
            Clip ID: {clipId} | Player:{' '}
            {currentUser?.profile?.playerID ||
              currentUser?.username ||
              'unknown'}
          </div>

          {/* 기존 메모 표시 */}
          {currentMemo && (
            <div className="existing-memo">
              <h4>저장된 메모</h4>
              <div className="memo-item">
                <div className="memo-header">
                  <span className="memo-author">
                    {typeof currentMemo === 'object'
                      ? currentMemo.authorName
                      : '나'}
                  </span>
                  <span className="memo-type">
                    {typeof currentMemo === 'object' && currentMemo.isPrivate
                      ? '🔒 개인'
                      : '💬 팀'}
                  </span>
                  <span className="memo-time">
                    {typeof currentMemo === 'object' && currentMemo.timestamp
                      ? new Date(currentMemo.timestamp).toLocaleString('ko-KR')
                      : ''}
                  </span>
                </div>
                <div className="memo-content">
                  {typeof currentMemo === 'string'
                    ? currentMemo
                    : currentMemo.content}
                </div>
              </div>
            </div>
          )}

          <div className="memo-options">
            <label className="private-memo-toggle">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <span className="private-icon">🔒</span>
              <span>나만 보기</span>
            </label>
          </div>

          <div className="memo-input-container">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="메모를 입력하세요... (@playerID로 선수 멘션 가능)"
              className="memo-textarea"
            />

            {showPlayerList && filteredPlayers.length > 0 && (
              <div className="player-mention-list">
                {filteredPlayers.map((player) => (
                  <div
                    key={player.playerID}
                    className="player-mention-item"
                    onClick={() => handlePlayerSelect(player)}
                  >
                    {player.avatar && (
                      <img src={player.avatar} alt={player.name} />
                    )}
                    <div>
                      <div className="player-name">{player.name}</div>
                      <div className="player-id">@{player.playerID}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="memo-actions">
            <button onClick={onClose} className="cancel-btn">
              취소
            </button>
            <button onClick={handleSave} className="save-btn">
              {isPrivate ? '🔒 개인 메모 저장' : '💬 팀 메모 저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoMemo;
