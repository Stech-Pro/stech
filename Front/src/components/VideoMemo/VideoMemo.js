// src/components/VideoMemo/VideoMemo.js
import React, { useState, useEffect } from 'react';
import { IoTime, IoSave, IoTrash } from 'react-icons/io5';
import './VideoMemo.css';
import {
  createMemo as apiCreateMemo,
  listMemos as apiListMemos,
  deleteMemo as apiDeleteMemo,
} from '../../api/memoAPI';
import { useAuth } from '../../context/AuthContext';

// 안전 유틸
const safeTrim = (str) => (typeof str === 'string' ? str.trim() : '');
const safeString = (v) => (typeof v === 'string' ? v : '');

export default function VideoMemo({
  isVisible,
  onClose,
  gameKey,   
  clipKey,   
  clipInfo = {}, 
}) {
  const { token } = useAuth(); // 🔐 토큰만 사용
  const [isPrivate, setIsPrivate] = useState(false);
  const [memoContent, setMemoContent] = useState('');
  const [serverMemos, setServerMemos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [removingIds, setRemovingIds] = useState(new Set());

  /* 메모 목록 가져오기 */
  useEffect(() => {
    if (!isVisible || !gameKey || !clipKey || !token) return;
    let aborted = false;

    (async () => {
      try {
        const res = await apiListMemos({ gameKey, clipKey }, token);
        const list = Array.isArray(res?.memos) ? res.memos : [];
        if (!aborted) {
          setServerMemos(
            [...list].sort(
              (a, b) =>
                new Date(b.updatedAt || b.createdAt || 0) -
                new Date(a.updatedAt || a.createdAt || 0),
            ),
          );
        }
      } catch (e) {
        console.error('메모 목록 조회 실패:', e);
      }
    })();

    return () => {
      aborted = true;
    };
  }, [isVisible, gameKey, clipKey, token]);

  /* 저장 */
  const saveMemo = async () => {
    const content = safeString(memoContent);
    if (!safeTrim(content) || !gameKey || !clipKey || !token || saving) return;

    try {
      setSaving(true);
      const payload = { gameKey, clipKey, content, isPrivate };
      const res = await apiCreateMemo(payload, token);
      const created = res?.memo;

      setServerMemos((prev) => {
        const next = [...prev, created ?? {
          _id: `tmp-${Date.now()}`,
          gameKey,
          clipKey,
          content,
          isPrivate,
          createdAt: new Date().toISOString(),
        }];
        next.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt || 0) -
            new Date(a.updatedAt || a.createdAt || 0),
        );
        return next;
      });

      setMemoContent('');
    } catch (e) {
      console.error('메모 저장 실패:', e);
      alert(e?.message || '메모 저장 실패');
    } finally {
      setSaving(false);
    }
  };

  /* 삭제 */
  const removeMemo = async (memoId) => {
    if (!memoId || !token) return;
    try {
      setRemovingIds((s) => new Set([...s, memoId]));
      await apiDeleteMemo(memoId, token);
      setServerMemos((prev) => prev.filter((m) => m._id !== memoId));
    } catch (e) {
      console.error('메모 삭제 실패:', e);
      alert(e?.message || '메모 삭제 실패');
    } finally {
      setRemovingIds((s) => {
        const n = new Set(s);
        n.delete(memoId);
        return n;
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="video-memo-overlay">
      <div className="video-memo-modal">
        <div className="video-memo-header">
          <h3>메모 작성</h3>
          <button onClick={onClose}>×</button>
        </div>

        <div className="memoContent">
          {/* 클립 정보 */}
          <div className="memoClipInfo">
            <span>Q{clipInfo.quarter}</span>
            {clipInfo.down && <span>{clipInfo.down}번째 다운</span>}
            {clipInfo.playType && <span>{clipInfo.playType}</span>}
            <span className="memoTime">
              <IoTime size={14} /> {clipInfo.time}
            </span>
          </div>

          {/* 나만 보기 */}
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

          {/* 입력 */}
          <div className="memoInput">
            <textarea
              value={safeString(memoContent)}
              onChange={(e) => setMemoContent(e.target.value)}
              placeholder="이 플레이에 대한 메모를 작성하세요..."
              rows={6}
            />

            <div className="memoActions">
              <button
                className="memoSaveBtn"
                onClick={saveMemo}
                disabled={saving || !safeTrim(safeString(memoContent)) || !token}
              >
                <IoSave /> {isPrivate ? '개인 메모 저장' : '팀 메모 저장'}
              </button>
            </div>
          </div>

          {/* 서버 메모 목록 */}
          {serverMemos.length > 0 && (
            <div className="memoList">
              <div className="memoListHeader">
                <h4>저장된 메모 ({serverMemos.length})</h4>
              </div>
              {serverMemos.map((memo) => (
                <div key={memo._id} className="memoItem">
                  <div className="memoItemHeader">
                    <div className="memoAuthorInfo">
                      <span className="memoAuthor">
                        {memo.userName || memo.user?.name || '사용자'}
                      </span>
                      {memo.isPrivate ? (
                        <span className="memoType">🔒 개인</span>
                      ) : (
                        <span className="memoType">💬 팀</span>
                      )}
                    </div>
                    <div className="memoActions">
                      <span className="memoDate">
                        {new Date(memo.createdAt || memo.updatedAt || Date.now()).toLocaleString('ko-KR')}
                      </span>
                      <button
                        className="memoDeleteBtn"
                        onClick={() => removeMemo(memo._id)}
                        disabled={removingIds.has(memo._id)}
                        title="메모 삭제"
                      >
                        <IoTrash size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="memoItemContent">{safeString(memo.content)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="memo-actions">
            <button onClick={onClose} className="cancel-btn">닫기</button>
          </div>
        </div>
      </div>
    </div>
  );
}
