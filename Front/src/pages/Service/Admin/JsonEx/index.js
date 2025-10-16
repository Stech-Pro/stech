import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import axios from "axios";
import { API_CONFIG } from '../../../../config/api';
import { useAuth } from '../../../../context/AuthContext';
import './index.css'; // CSS 파일 임포트
import { deleteGameByKey, fetchTeamGames } from '../../../../api/gameAPI';
import { FaTrash } from "react-icons/fa";
import { TEAM_BY_ID } from '../../../../data/TEAMS';

export default function JsonEx() {
  const { token, isAuthenticated, user } = useAuth();
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState({
    totalClips: 0,
    playersFound: 0,
    currentPlayer: "",
    completedPlayers: [],
  });
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [resetStatus, setResetStatus] = useState("idle");
  const [resetMessage, setResetMessage] = useState("");

  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [gameError, setGameError] = useState(null);
  const [selectedGames, setSelectedGames] = useState([]);

  const fileInputRef = useRef(null);
  const simulateTimerRef = useRef(null);
  const abortRef = useRef(null);

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
      setGames(gameList || []);
    } catch (error) {
      setGameError(error.message || "게임 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingGames(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const validateFile = useCallback((file) => {
    if (!file) return false;
    const isJsonMime = file.type === "application/json";
    const isJsonExt = /\.json$/i.test(file.name);
    if (!(isJsonMime || isJsonExt)) {
      alert("JSON 파일만 업로드 가능합니다");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기가 너무 큽니다 (최대 10MB)");
      return false;
    }
    return true;
  }, []);

  const extractStatsFromGameData = useCallback((gameData) => {
    const clips = Array.isArray(gameData?.Clips) ? gameData.Clips : [];
    const playerNumbers = new Set();
    for (const c of clips) {
      if (Array.isArray(c.players)) {
        for (const p of c.players) {
          if (p?.number != null) playerNumbers.add(String(p.number));
        }
      }
    }
    return {
      totalClips: clips.length,
      playersFound: playerNumbers.size,
      uniquePlayers: Array.from(playerNumbers),
    };
  }, []);

  const startSimulateProcessing = useCallback((uniquePlayers) => {
    if (simulateTimerRef.current) clearInterval(simulateTimerRef.current);
    if (!uniquePlayers || uniquePlayers.length === 0) return;
    let idx = 0;
    const completed = [];
    simulateTimerRef.current = setInterval(() => {
      if (idx > 0) {
        const prev = uniquePlayers[idx - 1];
        if (!completed.includes(prev)) completed.push(prev);
      }
      const curr = uniquePlayers[idx] ?? "";
      setUploadProgress((prev) => ({
        ...prev,
        currentPlayer: curr ? `${curr}번` : "",
        completedPlayers: [...completed],
      }));
      idx += 1;
      if (idx > uniquePlayers.length) idx = uniquePlayers.length;
    }, 700);
  }, []);

  const stopSimulateProcessing = useCallback(() => {
    if (simulateTimerRef.current) {
      clearInterval(simulateTimerRef.current);
      simulateTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopSimulateProcessing();
      if (abortRef.current) abortRef.current.abort();
    };
  }, [stopSimulateProcessing]);

  const handleFileUpload = useCallback(async (file) => {
    try {
      if (!validateFile(file)) return;
      setResultData(null);
      setErrorMessage("");
      setUploadStatus("uploading");

      const text = await file.text();
      const gameData = JSON.parse(text);

      const { totalClips, playersFound, uniquePlayers } = extractStatsFromGameData(gameData);
      setUploadProgress({ totalClips, playersFound, currentPlayer: "", completedPlayers: [] });
      startSimulateProcessing(uniquePlayers);

      const payload = {
        gameKey: gameData.gameKey, date: gameData.date, type: gameData.type, region: gameData.region,
        homeTeam: gameData.homeTeam, awayTeam: gameData.awayTeam, location: gameData.location,
        score: gameData.score, Clips: Array.isArray(gameData.Clips) ? gameData.Clips : [],
      };

      abortRef.current = new AbortController();
      await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JSON_EX}`,
        payload,
        {
          timeout: API_CONFIG.TIMEOUT, signal: abortRef.current.signal,
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        }
      );

      stopSimulateProcessing();
      setUploadStatus("success");
      setResultData({ game: payload });
      await loadGames();
    } catch (err) {
      stopSimulateProcessing();
      setUploadStatus("error");
      setErrorMessage(err?.response?.data?.message || err?.message || "업로드 중 오류 발생");
    }
  }, [token, validateFile, extractStatsFromGameData, startSimulateProcessing, stopSimulateProcessing, loadGames]);

  const handleResetStats = useCallback(async () => {
    if (!window.confirm('⚠️ 모든 데이터를 완전히 삭제하시겠습니까? 되돌릴 수 없습니다!')) return;
    try {
      setResetStatus("resetting");
      setResetMessage("");
      await axios.post(
        `${API_CONFIG.BASE_URL}/player/reset-all-data`, {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setResetStatus("success");
      setResetMessage("모든 데이터가 성공적으로 삭제되었습니다.");
      setTimeout(() => setResetStatus("idle"), 3000);
      await loadGames();
    } catch (error) {
      setResetStatus("error");
      setResetMessage(error?.response?.data?.message || "삭제 중 오류 발생");
      setTimeout(() => setResetStatus("idle"), 5000);
    }
  }, [token, loadGames]);

  const onDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);
  const onDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }, []);
  const onDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }, []);

  const handleSelectGame = useCallback((gameKey) => {
    setSelectedGames(prev => prev.includes(gameKey) ? prev.filter(key => key !== gameKey) : [...prev, gameKey]);
  }, []);

  const handleSelectAll = useCallback((e) => {
    setSelectedGames(e.target.checked ? games.map(g => g.gameKey) : []);
  }, [games]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedGames.length === 0 || !window.confirm(`선택된 ${selectedGames.length}개의 게임을 삭제하시겠습니까?`)) return;

    setLoadingGames(true);
    setGameError(null);
    const results = await Promise.allSettled(selectedGames.map(key => deleteGameByKey(key)));
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const errorCount = selectedGames.length - successCount;

    alert(`${successCount}개 삭제 성공${errorCount > 0 ? `, ${errorCount}개 실패` : ''}.`);
    if (errorCount > 0) setGameError(`${errorCount}개 게임 삭제 실패`);

    setSelectedGames([]);
    await loadGames();
  }, [selectedGames, loadGames]);

  if (!isAuthenticated) {
    return (
      <div className="json-ex-container"><h1>🔐 로그인이 필요합니다</h1></div>
    );
  }

  return (
    <div className="json-ex-container">
      <h1>JSON 파일 업로드 및 데이터 관리</h1>
      <p>현재 로그인된 사용자: <strong>{user?.username}</strong> ({user?.team}) {user?.role === 'admin' && <strong>(Admin)</strong>}</p>

      <div className="danger-zone">
        <h3>⚠️ 위험한 작업</h3>
        <p>모든 게임 데이터, 선수 데이터, 팀 스탯을 완전히 삭제합니다.</p>
        <button type="button" onClick={handleResetStats} disabled={resetStatus === "resetting"} className="danger-zone-button">
          {resetStatus === "resetting" ? "🔄 삭제 중..." : "🗑️ 모든 데이터 삭제"}
        </button>
        {resetMessage && <div className={`status-message ${resetStatus}`}>{resetStatus === "success" ? "✅" : "❌"} {resetMessage}</div>}
      </div>

      <div className={`upload-zone ${dragOver ? "dragover" : ""}`} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={() => fileInputRef.current?.click()}>
        <div>📤 JSON 파일을 드래그하거나 클릭해서 업로드하세요</div>
        <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); e.target.value = ""; }} />
      </div>
      
      {uploadStatus === "uploading" && <div className="upload-progress"><h3>🔄 분석 중...</h3></div>}
      {uploadStatus === "success" && <div className="success-result"><h3>✅ 업로드 완료!</h3></div>}
      {uploadStatus === "error" && <div className="error-result"><h3>⚠️ 업로드 실패</h3><p>{errorMessage}</p></div>}

      <div className="game-list-section">
        <hr className="section-divider" />
        <div className="game-list-controls">
          <h2>전체 게임 목록</h2>
          {user?.role === 'admin' && selectedGames.length > 0 && (
            <button onClick={handleDeleteSelected} disabled={loadingGames} className="delete-selected-button">
              <FaTrash size={12} />
              {loadingGames ? '삭제 중...' : `선택 항목 삭제 (${selectedGames.length})`}
            </button>
          )}
        </div>
        
        {gameError && <div className="error-result">{gameError}</div>}

        <div className="game-list-wrapper">
          <div className="game-list-header">
            {user?.role === 'admin' && <div className="game-list-cell cell-checkbox"><input type="checkbox" onChange={handleSelectAll} checked={games.length > 0 && selectedGames.length === games.length} /></div>}
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
            games.map(game => {
              const homeName = TEAM_BY_ID?.[game.homeId]?.name || game.homeId;
              const awayName = TEAM_BY_ID?.[game.awayId]?.name || game.awayId;
              return (
                <div key={game.gameKey} className={`game-list-item ${selectedGames.includes(game.gameKey) ? 'selected' : ''}`} onClick={() => handleSelectGame(game.gameKey)}>
                  {user?.role === 'admin' && (
                    <div className="game-list-cell cell-checkbox">
                      <input type="checkbox" checked={selectedGames.includes(game.gameKey)} onChange={() => handleSelectGame(game.gameKey)} onClick={(e) => e.stopPropagation()} />
                    </div>
                  )}
                  <div className="game-list-cell cell-date">{game.date}</div>
                  <div className="game-list-cell cell-match">{`${homeName} vs ${awayName}`}</div>
                  <div className="game-list-cell cell-location">{game.location}</div>
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