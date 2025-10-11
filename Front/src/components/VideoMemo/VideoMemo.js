// src/components/VideoMemo/VideoMemo.js - 2 Column Layout

import React, { useState, useEffect } from 'react';
import { IoTime, IoSave, IoTrash } from 'react-icons/io5';
import { FaStickyNote } from 'react-icons/fa';
import './VideoMemo.css';
import {
  createMemo as apiCreateMemo,
  listMemos as apiListMemos,
  deleteMemo as apiDeleteMemo,
  updateMemo as apiUpdateMemo,
} from '../../api/memoAPI';
import { useAuth } from '../../context/AuthContext';

const safeTrim = (str) => (typeof str === 'string' ? str.trim() : '');
const safeString = (v) => (typeof v === 'string' ? v : '');

export default function VideoMemo({
  isVisible,
  onClose,
  gameKey,
  clipKey,
  clipInfo = {},
  onMemoCountChange,
}) {
  const { token } = useAuth();
  const [isPrivate, setIsPrivate] = useState(false);
  const [memoContent, setMemoContent] = useState('');
  const [serverMemos, setServerMemos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [removingIds, setRemovingIds] = useState(new Set());

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50); // 퍼센트
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = React.useRef(null);

  // 리사이저 드래그 핸들러
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  React.useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      // 최소 25%, 최대 75%로 제한
      const clampedWidth = Math.min(Math.max(newWidth, 25), 75);
      setLeftWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (clipKey) {
      onMemoCountChange?.(clipKey, serverMemos.length);
    }
  }, [serverMemos, clipKey, onMemoCountChange]);

  // 모달 열릴 때 배경 스크롤 방지
  useEffect(() => {
    if (isVisible) {
      // 현재 스크롤 위치 저장
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // 모달 닫힐 때 원래대로 복구
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isVisible]);

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

  const startEdit = (memo) => {
    setEditingId(memo._id);
    setEditValue(safeString(memo.content));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const submitEdit = async (memo) => {
    if (!editingId || !token || editSaving) return;
    const nextContent = safeTrim(editValue);
    if (!nextContent) {
      alert('내용을 입력하세요.');
      return;
    }

    try {
      setEditSaving(true);
      const res = await apiUpdateMemo(memo._id, { content: nextContent, isPrivate: memo.isPrivate }, token);
      const updated = res?.memo ?? { ...memo, content: nextContent, updatedAt: new Date().toISOString() };

      setServerMemos((prev) =>
        prev
          .map((m) => (m._id === memo._id ? updated : m))
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt || 0) -
              new Date(a.updatedAt || a.createdAt || 0),
          ),
      );
      cancelEdit();
    } catch (e) {
      console.error('메모 수정 실패:', e);
      alert(e?.message || '메모 수정 실패');
    } finally {
      setEditSaving(false);
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

        <div className="memoContent" ref={containerRef}>
          {/* 왼쪽 컬럼 - 메모 작성 */}
          <div className="memo-write-column" style={{ width: `${leftWidth}%` }}>
            {/* 클립 정보 */}
            <div className="memoClipInfo">
              <span>Q{clipInfo.quarter}</span>
              {clipInfo.down && <span>{clipInfo.down}</span>}
              {clipInfo.playType && <span>{clipInfo.playType}</span>}
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

          </div>

          {/* 리사이저 핸들 */}
          <div
            className="memo-resize-handle"
            onMouseDown={handleMouseDown}
            style={{ cursor: isResizing ? 'col-resize' : 'col-resize' }}
          />

          {/* 오른쪽 컬럼 - 저장된 메모 */}
          <div className="memo-list-column">{/* ... 나머지 동일 ... */}
            {serverMemos.length > 0 ? (
              <div className="memoList">
                <div className="memoListHeader">
                  <h4>저장된 메모 ({serverMemos.length})</h4>
                </div>
                <div className="memo-list-scroll">
                  {serverMemos.map((memo) => {
                    const isEditing = editingId === memo._id;
                    return (
                      <div key={memo._id} className="memoItem">
                        <div className="memoItemTop">
                          <div className="memoAuthorRow">
                            <div className="memoAuthorDetails">
                              <span className="memoAuthor">
                                {memo.userName || memo.user?.name || '사용자'}
                              </span>
                              <span className="memoDate">
                                {new Date(memo.createdAt || memo.updatedAt || Date.now()).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="memoItemActions">
                            {memo.isPrivate ? (
                              <span className="memoTypeBadge private">🔒</span>
                            ) : (
                              <span className="memoTypeBadge team">👥</span>
                            )}
                            
                            {!isEditing ? (
                              <>
                                <button
                                  className="memoActionBtn edit"
                                  onClick={() => startEdit(memo)}
                                  title="메모 수정"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="memoActionBtn delete"
                                  onClick={() => removeMemo(memo._id)}
                                  disabled={removingIds.has(memo._id)}
                                  title="메모 삭제"
                                >
                                  <IoTrash size={14} />
                                </button>
                              </>
                            ) : (
                              <div className="memoEditActions">
                                <button
                                  className="memoActionBtn save"
                                  onClick={() => submitEdit(memo)}
                                  disabled={editSaving}
                                  title="수정 저장"
                                >
                                  저장
                                </button>
                                <button
                                  className="memoActionBtn cancel"
                                  onClick={cancelEdit}
                                  disabled={editSaving}
                                  title="수정 취소"
                                >
                                  취소
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {!isEditing ? (
                          <div className="memoItemContent">{safeString(memo.content)}</div>
                        ) : (
                          <textarea
                            className="memoEditTextarea"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="메모 내용을 수정하세요..."
                            disabled={editSaving}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="memo-empty-state">
                <FaStickyNote />
                <p>아직 저장된 메모가 없습니다.<br />왼쪽에서 메모를 작성해보세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}