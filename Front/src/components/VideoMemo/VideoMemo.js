// src/components/VideoMemo/VideoMemo.js
import React, { useState, useRef, useEffect } from 'react';
import { IoTime, IoSave, IoTrash } from 'react-icons/io5';
import './VideoMemo.css';

/**
 * Mentions 토큰 포맷:
 * - 저장 문자열에 @[이름](playerId) 형태로 삽입
 * - 예: "수비 정렬 좋아보임 @[오지영](DG1) 컷"
 */
const MENTION_TOKEN_REGEX = /@\[([^\]]+)\]\(([^)]+)\)/g;

// 안전한 문자열 trim 함수
const safeTrim = (str) => {
  if (typeof str === 'string') {
    return str.trim();
  }
  return '';
};

// 안전한 문자열 변환 함수
const safeString = (value) => {
  if (typeof value === 'string') {
    return value;
  }
  return '';
};

const VideoMemo = ({
  isVisible,
  onClose,
  clipId,
  memos,
  onSaveMemo,
  clipInfo,
  teamPlayers = [], // 팀 선수 목록
  currentUser = null, // 현재 사용자 정보를 props로 받기
  teamId = null, // 팀 ID 추가
}) => {
  const [isPrivate, setIsPrivate] = useState(false); // 나만 보기 상태

  // 메모 입력 관련 state (하나로 통합)
  const [memoContent, setMemoContent] = useState('');

  // 멘션 관련 state
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionList, setMentionList] = useState([]);
  const [mentionIndex, setMentionIndex] = useState(0);

  // 선수 데이터 관련 state
  const [players, setPlayers] = useState([]);

  // 메모 관련 state
  const [savedMemos, setSavedMemos] = useState([]);

  const textareaRef = useRef(null);

  useEffect(() => {
    // 저장된 메모 불러오기
    const storedMemos = JSON.parse(
      localStorage.getItem(`memo_${clipId}`) || '[]',
    );
    setSavedMemos(storedMemos);

    // 현재 클립의 메모 불러오기
    if (memos[clipId]) {
      const memoValue = memos[clipId];
      setMemoContent(safeString(memoValue));
    } else {
      setMemoContent('');
    }
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

  // mentionQuery에 따라 선수 필터링
  useEffect(() => {
    if (!mentionOpen) return;
    const q = safeTrim(safeString(mentionQuery)).toLowerCase();

    // teamPlayers와 players 모두에서 검색
    const allPlayers = [...(teamPlayers || []), ...(players || [])];

    const filtered = allPlayers
      .filter(
        (p, index, self) =>
          // 중복 제거 (playerID 기준)
          self.findIndex((player) => player.playerID === p.playerID) === index,
      )
      .filter((p) => {
        const name = String(p.name || '').toLowerCase();
        const playerID = String(p.playerID || '').toLowerCase();
        const jersey = String(p.jerseyNumber || '');
        const pos = String(p.position || '').toLowerCase();
        return (
          name.includes(q) ||
          playerID.includes(q) ||
          (q && jersey && jersey.startsWith(q)) ||
          pos.includes(q)
        );
      })
      .slice(0, 8); // 상단 8명 제한
    setMentionList(filtered);
    setMentionIndex(0);
  }, [mentionQuery, players, mentionOpen, teamPlayers]);

  /* ───────────────────────── 멘션: 입력/키보드 ───────────────────────── */
  const extractMentionQueryFromText = (text, caretPos) => {
    const textStr = safeString(text);
    let i = caretPos - 1;
    while (i >= 0) {
      const ch = textStr[i];
      if (ch === '@') {
        if (i > 0 && /[\w\]\)]/.test(textStr[i - 1])) return null;
        const fragment = textStr.slice(i + 1, caretPos);
        if (fragment.startsWith(' ')) return null;
        return { start: i, end: caretPos, fragment };
      }
      if (/\s|[.,;:!?()[\]{}]/.test(ch)) break;
      i--;
    }
    return null;
  };

  const onChangeText = (e) => {
    const next = e.target.value;
    setMemoContent(next);

    // @ 멘션 트리거 감지
    const hit = extractMentionQueryFromText(next, e.target.selectionStart);
    if (hit) {
      setMentionOpen(true);
      setMentionQuery(hit.fragment);
    } else {
      setMentionOpen(false);
      setMentionQuery('');
    }
  };

  const insertMentionToken = (player) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart } = el;
    const currentContent = safeString(memoContent);
    const hit = extractMentionQueryFromText(currentContent, selectionStart);
    if (!hit) return;

    const before = currentContent.slice(0, hit.start);
    const after = currentContent.slice(hit.end);

    // @[이름](playerId) 토큰 삽입
    const token = `@[${player.name}](${
      player.playerID || player._id || player.playerId || player.id
    }) `;
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
      setMentionIndex((i) =>
        Math.min(i + 1, Math.max(mentionList.length - 1, 0)),
      );
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

  /* ───────────────────────── 저장/삭제 ───────────────────────── */
  const parseMentions = (text) => {
    const textStr = safeString(text);
    const mentions = [];
    for (const m of textStr.matchAll(MENTION_TOKEN_REGEX)) {
      mentions.push({ name: m[1], playerId: m[2] });
    }
    return mentions;
  };

  const saveMentionsToDB = async (mentions, clipId, memoId) => {
    if (!mentions.length) return;
    try {
      await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clipId,
          memoId,
          mentions, // [{playerId, name}]
          content: safeString(memoContent),
          createdAt: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error('Failed to save mentions:', e);
    }
  };

  // 작성자 정보 표시 함수
  const getAuthorDisplay = (user) => {
    if (!user) return '익명';

    // Admin 체크
    if (user.role === 'admin' || user.isAdmin) {
      return '관리자';
    }

    // PlayerID 우선 표시, 없으면 이름, 없으면 username
    return (
      user.profile?.playerID ||
      user.profile?.realName ||
      user.username ||
      '익명'
    );
  };

  const saveMemo = async () => {
    const memoContentStr = safeString(memoContent);
    if (!safeTrim(memoContentStr)) return;

    const newMemo = {
      id: Date.now(),
      content: memoContentStr,
      timestamp: new Date().toISOString(),
      clipInfo,
      isPrivate,
      authorId:
        currentUser?.profile?.playerID || currentUser?.username || 'unknown',
      authorName: getAuthorDisplay(currentUser),
    };

    const updatedMemos = [...savedMemos, newMemo];
    setSavedMemos(updatedMemos);
    localStorage.setItem(`memo_${clipId}`, JSON.stringify(updatedMemos));

    // 기존 상위 콜백 유지
    onSaveMemo(clipId, newMemo);

    // 멘션 DB 저장
    const mentions = parseMentions(memoContentStr);
    await saveMentionsToDB(mentions, clipId, newMemo.id);

    // 입력창 비우기
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

  if (!isVisible) return null;

  /* ───────────────────────── 렌더: 멘션 하이라이트 ───────────────────────── */
  const renderWithMentions = (text) => {
    const textStr = safeString(text);
    if (!textStr) return [<span key="empty"></span>];

    const parts = [];
    let lastIdx = 0;
    textStr.replace(MENTION_TOKEN_REGEX, (match, name, playerId, offset) => {
      if (lastIdx < offset) {
        parts.push(
          <span key={`t-${offset}`}>{textStr.slice(lastIdx, offset)}</span>,
        );
      }
      parts.push(
        <span
          key={`m-${offset}`}
          className="memoMention"
          title={`playerId: ${playerId}`}
        >
          @{name}
        </span>,
      );
      lastIdx = offset + match.length;
      return match;
    });
    if (lastIdx < textStr.length)
      parts.push(<span key={`t-end`}>{textStr.slice(lastIdx)}</span>);
    return parts;
  };

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

          {/* 나만 보기 옵션 */}
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

          {/* 메모 입력 (통합된 하나의 textarea) */}
          <div className="memoInput">
            <textarea
              ref={textareaRef}
              value={safeString(memoContent)}
              onChange={onChangeText}
              onKeyDown={onKeyDown}
              placeholder="이 플레이에 대한 메모를 작성하세요... (@playerID로 선수 멘션 가능)"
              rows={6}
            />

            {/* 멘션 드롭다운 */}
            {mentionOpen && mentionList.length > 0 && (
              <div className="mentionDropdown">
                {mentionList.map((p, idx) => (
                  <div
                    key={p.playerID || p._id || p.id || `${p.name}-${idx}`}
                    className={`mentionItem ${
                      idx === mentionIndex ? 'active' : ''
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      insertMentionToken(p);
                    }}
                  >
                    <div className="mentionName">@{p.name}</div>
                    <div className="mentionMeta">
                      {p.playerID && `ID: ${p.playerID}`}
                      {p.position && ` • ${p.position}`}
                      {p.jerseyNumber && ` • #${p.jerseyNumber}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="memoActions">
              <button
                className="memoSaveBtn"
                onClick={saveMemo}
                disabled={!safeTrim(safeString(memoContent))}
              >
                <IoSave /> {isPrivate ? '개인 메모 저장' : '팀 메모 저장'}
              </button>
            </div>
          </div>

          {/* 저장된 메모 목록 */}
          {savedMemos.length > 0 && (
            <div className="memoList">
              <div className="memoListHeader">
                <h4>저장된 메모 ({savedMemos.length})</h4>
              </div>
              {savedMemos.map((memo) => (
                <div key={memo.id} className="memoItem">
                  <div className="memoItemHeader">
                    <div className="memoAuthorInfo">
                      <span className="memoAuthor">{memo.authorName}</span>
                      {memo.isPrivate && (
                        <span className="memoType">🔒 개인</span>
                      )}
                      {!memo.isPrivate && (
                        <span className="memoType">💬 팀</span>
                      )}
                    </div>
                    <div className="memoActions">
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
                  </div>
                  <div className="memoItemContent">
                    {renderWithMentions(memo.content)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 하단 액션 버튼 */}
          <div className="memo-actions">
            <button onClick={onClose} className="cancel-btn">
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoMemo;
