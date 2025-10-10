// src/components/GameDataEditModal/GameDataEditModal.jsx
import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import './GameDataEditModal.css';
import { useAuth } from '../../context/AuthContext';
import { requestGameEdit } from '../../api/gameAPI';
import { TEAM_BY_ID } from '../../data/TEAMS';
import toast from 'react-hot-toast';


const toastBase = {
  duration: 2600,
  position: 'top-right',
  className: 'gd-toast',
  style: {
    width: 400,
    height: 100,
    background: '#111827',          // slate-900
    color: '#F9FAFB',               // gray-50
    border: '1px solid #334155',    // slate-700
    padding: '10px 14px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,.22)',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
};
const toastSuccess = {
  ...toastBase,
  iconTheme: { primary: '#10b981', secondary: '#ffffff' }, // emerald
};
const toastError = {
  ...toastBase,
  iconTheme: { primary: '#ef4444', secondary: '#ffffff' }, // red
  style: { ...toastBase.style, border: '1px solid #ef4444' },
};

const GameDataEditModal = ({ isVisible, onClose, clipKey, gameKey }) => {
  const { user } = useAuth(); // ✅ 그냥 호출
  const [gameData, setGameData] = useState({ gameKey: '', clipKey: '' });
  const [requestContent, setRequestContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('Authenticated user:', user);
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

    const requesterName = user?.playerID || 'Unknown User';

    const requesterTeam =
      TEAM_BY_ID?.[user?.teamName]?.name ?? 
      user?.team ?? 
      '';
    const requesterRole = user?.role || (user?.isAdmin ? 'admin' : 'player');

    try {
      setIsSubmitting(true);
            const tid = toast.loading('전송 중...', toastBase);
      await requestGameEdit({
        gameKey: gameData.gameKey,
        clipKey: gameData.clipKey,
        requesterName,
        requesterTeam,
        requesterRole,
        reason,
      });
      toast.success('수정 요청이 전송되었습니다.', { ...toastSuccess, id: tid });
      setRequestContent('');
      onClose();
    } catch (err) {
      console.error('수정 요청 전송 실패:', err);
            toast.error(
        err?.message || '수정 요청 전송에 실패했습니다. 다시 시도해주세요.',
        toastError
      );
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
          <button
            className="gameDataEditCloseBtn"
            onClick={handleClose}
            aria-label="닫기"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="gameDataEditContent">
          <div className="gameDataEditRow">
            <label className="gameDataEditLabel">경기 ID</label>
            <input
              type="text"
              className="gameDataEditInput"
              value={gameData.gameKey}
              readOnly
            />
          </div>

          <div className="gameDataEditRow">
            <label className="gameDataEditLabel">클립 ID</label>
            <input
              type="text"
              className="gameDataEditInput"
              value={gameData.clipKey}
              readOnly
            />
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
