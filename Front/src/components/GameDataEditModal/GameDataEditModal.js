// src/components/GameDataEditModal/GameDataEditModal.jsx
import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import './GameDataEditModal.css';
import { useAuth } from '../../context/AuthContext';
import { requestGameEdit } from '../../api/gameAPI';

const GameDataEditModal = ({ isVisible, onClose, clipKey, gameKey }) => {
  const { user } = useAuth(); // ✅ 그냥 호출
  const [gameData, setGameData] = useState({ gameKey: '', clipKey: '' });
  const [requestContent, setRequestContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    setGameData({
      gameKey: gameKey || '',
      clipKey: clipKey || '',
    });
  }, [isVisible, gameKey, clipKey]);

  const handleSubmit = async () => {
    const reason = requestContent.trim();
    if (!reason) {
      alert('수정 요청 사항을 입력해주세요.');
      return;
    }

    const requesterName =
      user?.realName || user?.playerID || user?.username || user?.email || 'Unknown User';
    const requesterRole =
      user?.role || (user?.isAdmin ? 'admin' : 'player');

    try {
      setIsSubmitting(true);
      await requestGameEdit({
        gameKey: gameData.gameKey,
        clipKey: gameData.clipKey,
        requesterName,
        requesterRole,
        reason,
      });
      alert('수정 요청이 전송되었습니다.');
      setRequestContent('');
      onClose();
    } catch (err) {
      console.error('수정 요청 전송 실패:', err);
      alert(err?.message || '수정 요청 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRequestContent('');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="gameDataEditOverlay" onClick={handleClose} />
      <div className="gameDataEditModal">
        <div className="gameDataEditHeader">
          <h3>경기 데이터 수정 요청</h3>
          <button className="gameDataEditCloseBtn" onClick={handleClose} aria-label="닫기">
            <IoClose size={24} />
          </button>
        </div>

        <div className="gameDataEditContent">
          <div className="gameDataEditRow">
            <label className="gameDataEditLabel">경기 ID</label>
            <input type="text" className="gameDataEditInput" value={gameData.gameKey} readOnly />
          </div>

          <div className="gameDataEditRow">
            <label className="gameDataEditLabel">클립 ID</label>
            <input type="text" className="gameDataEditInput" value={gameData.clipKey} readOnly />
          </div>

          <div className="gameDataEditRow">
            <label className="gameDataEditLabel">수정 요청 사항</label>
            <textarea
              className="gameDataEditTextarea"
              value={requestContent}
              onChange={(e) => setRequestContent(e.target.value)}
              placeholder="수정이 필요한 내용을 상세히 작성해주세요."
              rows={6}
            />
          </div>
        </div>

        <div className="gameDataEditActions">
          <button
            className="gameDataEditSubmitBtn"
            onClick={handleSubmit}
            disabled={isSubmitting || !requestContent.trim()}
          >
            {isSubmitting ? '전송 중...' : '수정 요청'}
          </button>
        </div>
      </div>
    </>
  );
};

export default GameDataEditModal;
