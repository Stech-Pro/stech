// src/components/VideoMemo/VideoMemo.js
import React, { useState, useRef, useEffect } from 'react';
import './VideoMemo.css';

/**
 * Mentions 토큰 포맷:
 * - 저장 문자열에 @[이름](playerId) 형태로 삽입
 * - 예: "수비 정렬 좋아보임 @[오지영](DG1) 컷"
 */
const MENTION_TOKEN_REGEX = /@\[([^\]]+)\]\(([^)]+)\)/g;

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
    // 저장된 메모 불러오기
    const storedMemos = JSON.parse(localStorage.getItem(`memo_${clipId}`) || '[]');
    setSavedMemos(storedMemos);

    // 현재 클립의 메모 불러오기
    if (memos[clipId]) setMemoContent(memos[clipId]);
    else setMemoContent('');
  }, [clipId, memos, isVisible]);

  /* ───────────────────────── 선수 데이터 로드 ───────────────────────── */
  useEffect(() => {
    let cancelled = false;

    async function fetchPlayers() {
      try {
        if (teamPlayers && Array.isArray(teamPlayers)) {
          setPlayers(teamPlayers);
          return;
        }
        if (!teamId) return;
        const res = await fetch(`/api/teams/${teamId}/players`);
        if (!res.ok) throw new Error('Failed to fetch players');
        const data = await res.json();
        if (!cancelled) setPlayers(data || []);
      } catch (e) {
        console.error(e);
        if (!cancelled) setPlayers([]);
      }
    }

    fetchPlayers();
    return () => {
      cancelled = true;
    };
  }, [teamPlayers, teamId]);

  /* ───────────────────────── 멘션: 트리거/필터 ───────────────────────── */
  // 커서 기준 현재 '@'로 시작하는 "단어"를 추출
  const extractMentionQuery = () => {
    const el = textareaRef.current;
    if (!el) return null;
    const { selectionStart } = el;
    const text = memoContent;

    // selectionStart 이전에서 가장 가까운 '@'의 위치를 찾되, 공백/줄바꿈/문장부호로 막히기 전까지만 유효
    let i = selectionStart - 1;
    while (i >= 0) {
      const ch = text[i];
      if (ch === '@') {
        // '@' 직전이 문자/숫자/']'이면(예: 토큰 뒤) 트리거 아님
        if (i > 0 && /[\w\]\)]/.test(text[i - 1])) return null;
        const fragment = text.slice(i + 1, selectionStart);
        // '@' 다음이 공백으로 시작하면 트리거 아님
        if (fragment.startsWith(' ')) return null;
        return { start: i, end: selectionStart, fragment };
      }
      // 멘션은 공백/개행/특수구분자에서 끊긴다
      if (/\s|[.,;:!?()[\]{}]/.test(ch)) break;
      i--;
    }
    return null;
  };

  // mentionQuery에 따라 선수 필터링
  useEffect(() => {
    if (!mentionOpen) return;
    const q = (mentionQuery || '').trim().toLowerCase();
    const filtered = players
      .filter((p) => {
        const name = String(p.name || '').toLowerCase();
        const jersey = String(p.jerseyNumber || '');
        const pos = String(p.position || '').toLowerCase();
        return (
          name.includes(q) ||
          (q && jersey && jersey.startsWith(q)) ||
          pos.includes(q)
        );
      })
      .slice(0, 8); // 상단 8명 제한
    setMentionList(filtered);
    setMentionIndex(0);
  }, [mentionQuery, players, mentionOpen]);

  /* ───────────────────────── 멘션: 입력/키보드 ───────────────────────── */
  const onChangeText = (e) => {
    const next = e.target.value;
    setMemoContent(next);

    const hit = extractMentionQueryFromText(next, e.target.selectionStart);
    if (hit) {
      setMentionOpen(true);
      setMentionQuery(hit.fragment);
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
      setMentionOpen(false);
      setMentionQuery('');
    }
  };

  const extractMentionQueryFromText = (text, caretPos) => {
    let i = caretPos - 1;
    while (i >= 0) {
      const ch = text[i];
      if (ch === '@') {
        if (i > 0 && /[\w\]\)]/.test(text[i - 1])) return null;
        const fragment = text.slice(i + 1, caretPos);
        if (fragment.startsWith(' ')) return null;
        return { start: i, end: caretPos, fragment };
      }
      if (/\s|[.,;:!?()[\]{}]/.test(ch)) break;
      i--;
    }
    return null;
  };

  const insertMentionToken = (player) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart } = el;
    const hit = extractMentionQueryFromText(memoContent, selectionStart);
    if (!hit) return;

    const before = memoContent.slice(0, hit.start);
    const after = memoContent.slice(hit.end);

    // @[이름](playerId) 토큰 삽입
    const token = `@[${player.name}](${player._id || player.playerId || player.id}) `;
    const result = before + token + after;

    setMemoContent(result);
    setMentionOpen(false);
    setMentionQuery('');
    // 커서 위치 갱신
    requestAnimationFrame(() => {
      const pos = (before + token).length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const onKeyDown = (e) => {
    if (!mentionOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMentionIndex((i) => Math.min(i + 1, Math.max(mentionList.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMentionIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      // 엔터로 선택
      if (mentionList.length > 0) {
        e.preventDefault();
        insertMentionToken(mentionList[mentionIndex]);
      }
    } else if (e.key === 'Escape') {
      setMentionOpen(false);
      setMentionQuery('');
    }
  };

  /* ───────────────────────── 저장/삭제/내보내기 ───────────────────────── */
  const parseMentions = (text) => {
    const mentions = [];
    for (const m of text.matchAll(MENTION_TOKEN_REGEX)) {
      mentions.push({ name: m[1], playerId: m[2] });
    }
    return mentions;
  };

  const saveMentionsToDB = async (mentions, clipId, memoId) => {
    if (!mentions.length) return;
    try {
      // 1) 메모 단위 저장 (권장)
      await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipId,
          memoId,
          mentions, // [{playerId, name}]
          content: memoContent,
          createdAt: new Date().toISOString(),
        }),
      });

      // 2) 선택: 선수별로도 집계 저장을 원하면 아래 루프 활성화
      // await Promise.all(
      //   mentions.map((m) =>
      //     fetch(`/api/players/${m.playerId}/mentions`, {
      //       method: 'POST',
      //       headers: { 'Content-Type': 'application/json' },
      //       body: JSON.stringify({
      //         clipId,
      //         memoId,
      //         content: memoContent,
      //         createdAt: new Date().toISOString(),
      //       }),
      //     })
      //   )
      // );
    } catch (e) {
      console.error('Failed to save mentions:', e);
    }
  };

  const saveMemo = async () => {
    if (!memoContent.trim()) return;

    const newMemo = {
      id: Date.now(),
      content: memoContent,
      timestamp: new Date().toISOString(),
      clipInfo,
    };

    const updatedMemos = [...savedMemos, newMemo];
    setSavedMemos(updatedMemos);
    localStorage.setItem(`memo_${clipId}`, JSON.stringify(updatedMemos));

    // 기존 상위 콜백 유지
    onSaveMemo(clipId, memoContent);

    // 멘션 DB 저장
    const mentions = parseMentions(memoContent);
    await saveMentionsToDB(mentions, clipId, newMemo.id);

    // 입력창 비우기(목록은 남김)
    setMemoContent('');
    setMentionOpen(false);
    setMentionQuery('');
  };

  const deleteMemo = (memoId) => {
    const updatedMemos = savedMemos.filter((m) => m.id !== memoId);
    setSavedMemos(updatedMemos);
    localStorage.setItem(`memo_${clipId}`, JSON.stringify(updatedMemos));

    if (updatedMemos.length === 0) {
      onSaveMemo(clipId, null);
    }
  };

  const exportMemos = () => {
    const dataStr = JSON.stringify(savedMemos, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `memos_clip_${clipId}_${Date.now()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!isVisible) return null;

  /* ───────────────────────── 렌더: 멘션 하이라이트 ───────────────────────── */
  const renderWithMentions = (text) => {
    const parts = [];
    let lastIdx = 0;
    text.replace(MENTION_TOKEN_REGEX, (match, name, playerId, offset) => {
      if (lastIdx < offset) {
        parts.push(<span key={`t-${offset}`}>{text.slice(lastIdx, offset)}</span>);
      }
      parts.push(
        <span key={`m-${offset}`} className="memoMention" title={`playerId: ${playerId}`}>
          @{name}
        </span>
      );
      lastIdx = offset + match.length;
      return match;
    });
    if (lastIdx < text.length) parts.push(<span key={`t-end`}>{text.slice(lastIdx)}</span>);
    return parts;
  };

  return (
    <div className="video-memo-overlay">
      <div className="video-memo-modal">
        <div className="video-memo-header">
          <h3>메모 작성</h3>
          <button onClick={onClose}>×</button>
        </div>

        <div className="memoClipInfo">
          <span>Q{clipInfo.quarter}</span>
          {clipInfo.down && <span>{clipInfo.down}번째 다운</span>}
          {clipInfo.playType && <span>{clipInfo.playType}</span>}
          <span className="memoTime">
            <IoTime size={14} /> {clipInfo.time}
          </span>
        </div>

        <div className="memoContent">
          <div className="memoInput">
            <textarea
              ref={textareaRef}
              value={memoContent}
              onChange={onChangeText}
              onKeyDown={onKeyDown}
              placeholder="이 플레이에 대한 메모를 작성하세요... (예: @오지영)"
              rows={4}
            />
            {/* 멘션 드롭다운 */}
            {mentionOpen && mentionList.length > 0 && (
              <div className="mentionDropdown">
                {mentionList.map((p, idx) => (
                  <div
                    key={p._id || p.playerId || p.id || `${p.name}-${idx}`}
                    className={`mentionItem ${idx === mentionIndex ? 'active' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      insertMentionToken(p);
                    }}
                  >
                    <div className="mentionName">@{p.name}</div>
                    <div className="mentionMeta">
                      {p.position ? `${p.position}` : ''}{p.jerseyNumber ? ` • #${p.jerseyNumber}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="memoActions">
              <button
                className="memoSaveBtn"
                onClick={saveMemo}
                disabled={!memoContent.trim()}
              >
                <IoSave /> 저장
              </button>
            </div>
            <div>시간: {clipInfo.time}</div>
          </div>

          {savedMemos.length > 0 && (
            <div className="memoList">
              <div className="memoListHeader">
                <h4>저장된 메모 ({savedMemos.length})</h4>
                <button className="memoExportBtn" onClick={exportMemos}>
                  내보내기
                </button>
              </div>
              {savedMemos.map((memo) => (
                <div key={memo.id} className="memoItem">
                  <div className="memoItemHeader">
                    <span className="memoDate">
                      {new Date(memo.timestamp).toLocaleString('ko-KR')}
                    </span>
                    <button
                      className="memoDeleteBtn"
                      onClick={() => deleteMemo(memo.id)}
                    >
                      <IoTrash size={16} />
                    </button>
                  </div>
                  <div className="memoItemContent">
                    {renderWithMentions(memo.content)}
                  </div>
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
