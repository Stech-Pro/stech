import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../../config/api';
import { useAuth } from '../../../../context/AuthContext';
import './index.css'; // CSS 파일 임포트
import { deleteGameByKey, fetchTeamGames } from '../../../../api/gameAPI';
import { FaTrash } from 'react-icons/fa';
import { TEAM_BY_ID } from '../../../../data/TEAMS';

export default function JsonEx() {
  const { token, isAuthenticated, user } = useAuth();
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState({
    /* ... */
  });
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [resetStatus, setResetStatus] = useState('idle');
  const [resetMessage, setResetMessage] = useState('');

  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [gameError, setGameError] = useState(null);
  const [selectedGames, setSelectedGames] = useState([]);

  const fileInputRef = useRef(null);

  // 데이터 로딩
  const loadGames = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingGames(true);
      setGameError(null);
      const teamIdToFetch = user?.role === 'admin' ? 'admin' : user?.team;
      if (!teamIdToFetch) {
        setGames([]);
        return;
      }
      const gameList = await fetchTeamGames(teamIdToFetch);
      setGames(gameList || []); // API 응답이 없을 경우를 대비해 항상 배열 보장
    } catch (error) {
      setGameError(error.message || '게임 목록을 불러오지 못했습니다.');
    } finally {
      setLoadingGames(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  // 파일 업로드 처리
  const handleFileUpload = useCallback(
    async (file) => {
      // ... (파일 업로드 관련 로직은 여기에 그대로 둡니다)
      // 업로드 성공 후 목록 새로고침을 위해 loadGames() 호출 추가
      await loadGames();
    },
    [token, loadGames],
  ); // loadGames를 의존성 배열에 추가

  // 스탯 초기화
  const handleResetStats = useCallback(async () => {
    /* ... */
  });
  // 드래그앤드롭
  const onDrop = useCallback((e) => {
    /* ... */
  });
  const onDragOver = useCallback((e) => {
    /* ... */
  });
  const onDragLeave = useCallback((e) => {
    /* ... */
  });

  // 게임 선택 및 삭제 핸들러
  const handleSelectGame = useCallback((gameKey) => {
    setSelectedGames((prev) =>
      prev.includes(gameKey)
        ? prev.filter((key) => key !== gameKey)
        : [...prev, gameKey],
    );
  }, []);

  const handleSelectAll = useCallback(
    (e) => {
      if (e.target.checked) {
        setSelectedGames(games.map((g) => g.gameKey));
      } else {
        setSelectedGames([]);
      }
    },
    [games],
  );

  const handleDeleteSelected = useCallback(async () => {
    if (selectedGames.length === 0) return;
    if (
      !window.confirm(
        `정말로 선택된 ${selectedGames.length}개의 게임을 삭제하시겠습니까?`,
      )
    )
      return;

    setLoadingGames(true);
    setGameError(null);

    const results = await Promise.allSettled(
      selectedGames.map((gameKey) => deleteGameByKey(gameKey)),
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const errorCount = selectedGames.length - successCount;

    let resultMessage = `${successCount}개의 게임이 성공적으로 삭제되었습니다.`;
    if (errorCount > 0) {
      resultMessage += `\n${errorCount}개의 게임 삭제에 실패했습니다.`;
      setGameError(`${errorCount}개 게임 삭제 실패`);
    }
    alert(resultMessage);

    setSelectedGames([]);
    await loadGames();
  }, [selectedGames, loadGames]);

  if (!isAuthenticated) {
    /* ... (로그인 체크 UI) ... */
  }

  return (
    <div className="json-ex-container">
      <h1>JSON 파일 업로드 및 데이터 관리</h1>
      <p>
        현재 로그인된 사용자: <strong>{user?.username}</strong> ({user?.team}){' '}
        {user?.role === 'admin' && <strong>(Admin)</strong>}
      </p>

      {/* 스탯 초기화 버튼 */}
      <div className="danger-zone">
        <h3>⚠️ 위험한 작업</h3>
        <p>모든 게임 데이터, 선수 데이터, 팀 스탯을 완전히 삭제합니다.</p>
        <button
          type="button"
          onClick={handleResetStats}
          disabled={resetStatus === 'resetting'}
          className="danger-zone-button"
        >
          {resetStatus === 'resetting'
            ? '🔄 삭제 중...'
            : '🗑️ 모든 데이터 삭제'}
        </button>
        {resetMessage && (
          <div
            className={`status-message ${
              resetStatus === 'success' ? 'success' : 'error'
            }`}
          >
            {resetStatus === 'success' ? '✅' : '❌'} {resetMessage}
          </div>
        )}
      </div>

      {/* 파일 업로드 영역 */}
      <div
        className="upload-zone"
        onClick={() => fileInputRef.current?.click()}
      >
        <div>📤 JSON 파일을 드래그하거나 클릭해서 업로드하세요</div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
            e.target.value = '';
          }}
        />
      </div>

      {/* 업로드 상태 표시 ... */}

      {/* --- 게임 목록 관리 UI --- */}
      <div className="game-list-section">
        <hr className="section-divider" />
        <div className="game-list-controls">
          <h2>전체 게임 목록</h2>
          {user?.role === 'admin' && selectedGames.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={loadingGames}
              className="delete-selected-button"
            >
              <FaTrash size={12} />
              {loadingGames
                ? '삭제 중...'
                : `선택 항목 삭제 (${selectedGames.length})`}
            </button>
          )}
        </div>

        {gameError && <div className="error-result">{gameError}</div>}

        <div className="game-list-wrapper">
          <div className="game-list-header">
            {user?.role === 'admin' && (
              <div className="game-list-cell cell-checkbox">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    games.length > 0 && selectedGames.length === games.length
                  }
                />
              </div>
            )}
            <div className="game-list-cell cell-date">날짜</div>
            <div className="game-list-cell cell-match">경기</div>
            <div className="game-list-cell cell-location">장소</div>
            <div className="game-list-cell cell-type">타입</div>
            <div className="game-list-cell cell-key">Game Key</div>
          </div>

          {loadingGames ? (
            <div className="list-placeholder">🔄 목록을 불러오는 중...</div>
          ) : games.length === 0 ? (
            <div className="list-placeholder">표시할 게임이 없습니다.</div>
          ) : (
            games.map((game) => {
              const homeName = TEAM_BY_ID?.[game.homeId]?.name || game.homeId;
              const awayName = TEAM_BY_ID?.[game.awayId]?.name || game.awayId;

              return (
                <div
                  key={game.gameKey}
                  className={`game-list-item ${
                    selectedGames.includes(game.gameKey) ? 'selected' : ''
                  }`}
                  onClick={() => handleSelectGame(game.gameKey)}
                >
                  {user?.role === 'admin' && (
                    <div className="game-list-cell cell-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedGames.includes(game.gameKey)}
                        onChange={() => handleSelectGame(game.gameKey)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  <div className="game-list-cell cell-date">{game.date}</div>
                  <div className="game-list-cell cell-match">{`${homeName} vs ${awayName}`}</div>
                  <div className="game-list-cell cell-location">
                    {game.location || '-'}
                  </div>

                  <div className="game-list-cell cell-type">{game.type}</div>
                  <div className="game-list-cell cell-key">{game.gameKey}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
