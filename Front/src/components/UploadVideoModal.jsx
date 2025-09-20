// src/components/UploadVideoModal.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import './UploadVideoModal.css';
import Stechlogo from '../assets/images/logos/stech.png';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { API_CONFIG } from '../config/api';
import { getToken } from '../utils/tokenUtils';
import { TEAMS } from '../data/TEAMS.js';

/* region 라벨 매핑 (TEAMS.region → 한글) */
const REGION_LABEL = {
  Seoul: '서울',
  'Gyeonggi-Gangwon': '경기강원',
  'Daegu-Gyeongbuk': '대구경북',
  'Busan-Gyeongnam': '부산경남',
  Amateur: '사회인',
};

/** 로고+이름 드롭다운 (기본형) */
function TeamSelect({ value, options = [], onChange, placeholder = 'Select' }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="teamSelect" ref={boxRef}>
      <button
        type="button"
        className={`teamSelect-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        {value?.logo && (
          <img
            src={value.logo}
            alt={value.name}
            className={`teamSelect-logo ${
              String(value.logo).endsWith('.svg') ? 'svg-logo' : 'png-logo'
            }`}
          />
        )}
        <span className={`teamSelect-label ${value ? '' : 'placeholder'}`}>
          {value?.name || placeholder}
        </span>
      </button>

      {open && (
        <ul className="teamSelect-menu">
          {options.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className="teamSelect-option"
                onClick={() => {
                  onChange?.(t);
                  setOpen(false);
                }}
              >
                {t.logo && (
                  <img
                    src={t.logo}
                    alt={t.name}
                    className={`teamSelect-logo ${
                      String(t.logo).endsWith('.svg') ? 'svg-logo' : 'png-logo'
                    }`}
                  />
                )}
                <span>{t.name}</span>
              </button>
            </li>
          ))}
          {options.length === 0 && <li className="teamSelect-empty">No teams</li>}
        </ul>
      )}
    </div>
  );
}

/** 리그 → 팀 2단 드롭다운 (원정팀 전용) */
function LeagueTeamSelect({ value, options = [], onChange, placeholder = 'Select' }) {
  const [open, setOpen] = useState(false);
  const [activeLeague, setActiveLeague] = useState(null);
  const boxRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const teamsByLeague = useMemo(() => {
    const m = {};
    options.forEach((t) => {
      const key = REGION_LABEL[t.region] || '기타';
      (m[key] ||= []).push(t);
    });
    return m;
  }, [options]);

  const leaguesList = useMemo(() => {
    const base = ['서울', '경기강원', '대구경북', '부산경남', '사회인'];
    const keys = Object.keys(teamsByLeague);
    const extras = keys.filter((k) => !base.includes(k)).sort();
    return [...base.filter((k) => keys.includes(k)), ...extras];
  }, [teamsByLeague]);

  useEffect(() => {
    if (!open) return;
    setActiveLeague((cur) => (cur && teamsByLeague[cur]?.length ? cur : leaguesList[0]));
  }, [open, leaguesList, teamsByLeague]);

  return (
    <div className="teamSelect" ref={boxRef}>
      <button
        type="button"
        className={`teamSelect-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        {value?.logo && (
          <img
            src={value.logo}
            alt={value.name}
            className={`teamSelect-logo ${
              String(value.logo).endsWith('.svg') ? 'svg-logo' : 'png-logo'
            }`}
          />
        )}
        <span className={`teamSelect-label ${value ? '' : 'placeholder'}`}>
          {value?.name || placeholder}
        </span>
      </button>

      {open && (
        <div className="oppsMega">
          <ul className="oppsLeagues">
            {leaguesList.map((lg) => (
              <li key={lg}>
                <button
                  type="button"
                  className={`leagueItem ${activeLeague === lg ? 'active' : ''}`}
                  onMouseEnter={() => setActiveLeague(lg)}
                  onFocus={() => setActiveLeague(lg)}
                  onClick={() => setActiveLeague(lg)}
                >
                  {lg}
                </button>
              </li>
            ))}
          </ul>

          <ul className="oppsTeams">
            {(teamsByLeague[activeLeague] || []).map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className="oppsItem"
                  onClick={() => {
                    onChange?.(t);
                    setOpen(false);
                  }}
                >
                  {t.logo && (
                    <span className="opps-team-logo-img-box">
                      <img
                        src={t.logo}
                        alt={t.name}
                        className={`opps-team-logo-img ${
                          String(t.logo).endsWith('.svg') ? 'svg-logo' : 'png-logo'
                        }`}
                      />
                    </span>
                  )}
                  {t.name}
                </button>
              </li>
            ))}
            {(!activeLeague || (teamsByLeague[activeLeague] || []).length === 0) && (
              <li className="oppsEmpty">해당 리그 팀이 없습니다</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Q1~Q4 업로드 라인 */
function QuarterRow({ q, files, onPick, onClear }) {
  const inputRef = useRef(null);
  return (
    <div className="quarterRow">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hiddenFile"
        multiple
        onChange={(e) => {
          if (e.target.files) onPick(Array.from(e.target.files));
        }}
      />
      <button className="btn primary" type="button" onClick={() => inputRef.current?.click()}>
        {q} 영상 추가
      </button>
      <button
        className="btn ghost"
        type="button"
        disabled={files.length === 0}
        onClick={onClear}
        title={files.length > 0 ? '선택한 파일 모두 제거' : '파일 없음'}
      >
        초기화
      </button>
      <span className="quarterFilename">{files.length > 0 ? `${files.length}개 파일 선택됨` : '선택된 파일 없음'}</span>
    </div>
  );
}

const UploadVideoModal = ({
  isOpen,
  onClose,
  onUploaded,
  defaultHomeTeam,
  defaultAwayTeam,
}) => {
  const teamsList = TEAMS;

  const [home, setHome] = useState(defaultHomeTeam || teamsList[0] || null);
  const [away, setAway] = useState(defaultAwayTeam || teamsList[1] || null);

  const selectableHomes = useMemo(() => teamsList, [teamsList]);
  const selectableAways = useMemo(
    () => teamsList.filter((t) => t?.id !== home?.id),
    [teamsList, home],
  );

  const [matchDate, setMatchDate] = useState('');
  const [scoreHome, setScoreHome] = useState('');
  const [scoreAway, setScoreAway] = useState('');
  // 옵션과 일치하도록 기본값 정리 (원하는 경우 '리그' 옵션을 추가해도 됨)
  const [gameType, setGameType] = useState('친선전');
  const [leagueName, setLeagueName] = useState('2024 Fall Cup');
  const [week, setWeek] = useState('Week1');
  const [stadium, setStadium] = useState('서울대학교 경기장');

  const [q1, setQ1] = useState([]);
  const [q2, setQ2] = useState([]);
  const [q3, setQ3] = useState([]);
  const [q4, setQ4] = useState([]);

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    if (loading || deleteLoading) return;
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!home || !away) return setError('홈/원정 팀을 선택해 주세요.');
    if (home?.id === away?.id) return setError('홈팀과 원정팀이 동일할 수 없습니다.');
    if (!matchDate) return setError('경기 날짜를 선택해 주세요.');
    if (q1.length + q2.length + q3.length + q4.length === 0)
      return setError('최소 1개 분기 영상을 업로드해 주세요.');

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('home_team', home?.name || '');
      fd.append('away_team', away?.name || '');
      fd.append('match_datetime', matchDate);
      fd.append('score_home', String(scoreHome || 0));
      fd.append('score_away', String(scoreAway || 0));
      fd.append('game_type', gameType);
      fd.append('league_name', leagueName);
      fd.append('week', week);
      fd.append('stadium', stadium);

      q1.forEach((file) => fd.append('q1', file));
      q2.forEach((file) => fd.append('q2', file));
      q3.forEach((file) => fd.append('q3', file));
      q4.forEach((file) => fd.append('q4', file));

      const token = getToken?.();
      const resp = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD_VIDEO}`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: fd,
        },
      );

      if (!resp.ok) throw new Error((await resp.text()) || '업로드 실패');

      onUploaded?.();
      handleClose();
    } catch (err) {
      setError(err?.message || '업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideos = async () => {
    if (!home || !away || !matchDate) {
      setError('홈팀, 원정팀, 경기 날짜를 먼저 선택해주세요.');
      return;
    }

    // gameKey = 홈코드(앞2) + 원정코드(앞2) + YYYYMMDD
    const gameDate = new Date(matchDate);
    const formattedDate = gameDate.toISOString().slice(0, 10).replace(/-/g, '');
    const normCode = (s) => String(s || '').slice(0, 2).toUpperCase();
    const homeCode = normCode(home.id);
    const awayCode = normCode(away.id);
    const gameKey = `${homeCode}${awayCode}${formattedDate}`;

    const confirmDelete = window.confirm(
      `정말로 ${gameKey} 경기의 모든 비디오를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
    );
    if (!confirmDelete) return;

    try {
      setDeleteLoading(true);
      setError('');

      const token = getToken?.();
      const resp = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_VIDEOS}/${gameKey}`,
        {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );

      if (!resp.ok) {
        const errorData = await resp.text();
        throw new Error(errorData || '비디오 삭제 실패');
      }

      const result = await resp.json();
      if (result?.success) {
        alert(`성공적으로 ${result.deletedCount}개의 비디오 파일을 삭제했습니다.`);
        setQ1([]); setQ2([]); setQ3([]); setQ4([]);
      } else {
        throw new Error(result?.message || '비디오 삭제 실패');
      }
    } catch (err) {
      console.error('비디오 삭제 오류:', err);
      setError(err?.message || '비디오 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="uvm-overlay" onClick={handleClose}>
      <div className="uvm-card" onClick={(e) => e.stopPropagation()}>
        {/* 상단: 로고 + 닫기 */}
        <div className="uvm-topbar">
          <img className="uvm-logo" src={Stechlogo} alt="Stech" />
          <button type="button" className="uvm-close" onClick={handleClose} aria-label="닫기">
            <IoCloseCircleOutline />
          </button>
        </div>

        {/* 본문: 좌우 2단 */}
        <form className="uvm-body" onSubmit={handleSubmit}>
          {/* 왼쪽: 경기 정보 입력 */}
          <section className="uvm-col left">
            <h3 className="uvm-section-title">경기 정보 입력</h3>

            <div className="uvm-field two">
              <label>홈팀 (HOME)</label>
              <TeamSelect
                value={home}
                options={selectableHomes}
                onChange={setHome}
                placeholder="홈팀 선택"
              />
            </div>

            <div className="uvm-field two">
              <label>원정팀 (AWAY)</label>
              <LeagueTeamSelect
                value={away}
                options={selectableAways}
                onChange={setAway}
                placeholder="원정팀 선택"
              />
            </div>

            <div className="uvm-field">
              <label>경기 날짜/시간</label>
              <input
                type="datetime-local"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
              />
            </div>

            <div className="uvm-field two">
              <label>스코어 (HOME)</label>
              <input
                type="number"
                min="0"
                value={scoreHome}
                onChange={(e) => setScoreHome(e.target.value)}
                placeholder="예: 24"
              />
            </div>

            <div className="uvm-field two">
              <label>스코어 (AWAY)</label>
              <input
                type="number"
                min="0"
                value={scoreAway}
                onChange={(e) => setScoreAway(e.target.value)}
                placeholder="예: 18"
              />
            </div>

            <div className="uvm-field two">
              <label>경기 유형</label>
              <select value={gameType} onChange={(e) => setGameType(e.target.value)}>
                {/* 필요하면 <option>리그</option> 추가 */}
                <option>친선전</option>
                <option>연습 경기</option>
              </select>
            </div>

            <div className="uvm-field two">
              <label>리그 명칭</label>
              <input value={leagueName} onChange={(e) => setLeagueName(e.target.value)} />
            </div>

            <div className="uvm-field two">
              <label>주차</label>
              <input value={week} onChange={(e) => setWeek(e.target.value)} />
            </div>

            <div className="uvm-field two">
              <label>경기장</label>
              <input value={stadium} onChange={(e) => setStadium(e.target.value)} />
            </div>
          </section>

          {/* 오른쪽: 분기 업로드 */}
          <section className="uvm-col right">
            <h3 className="uvm-section-title">경기 영상 업로드</h3>

            <QuarterRow q="Q1" files={q1} onPick={(f) => setQ1((p) => [...p, ...f])} onClear={() => setQ1([])} />
            <QuarterRow q="Q2" files={q2} onPick={(f) => setQ2((p) => [...p, ...f])} onClear={() => setQ2([])} />
            <QuarterRow q="Q3" files={q3} onPick={(f) => setQ3((p) => [...p, ...f])} onClear={() => setQ3([])} />
            <QuarterRow q="Q4" files={q4} onPick={(f) => setQ4((p) => [...p, ...f])} onClear={() => setQ4([])} />

            {error && <p className="uvm-error">{error}</p>}

            <div className="uvm-actions">
              <button
                type="button"
                className="btn ghost"
                onClick={handleClose}
                disabled={loading || deleteLoading}
              >
                닫기
              </button>
              <button
                type="button"
                className="btn danger"
                onClick={handleDeleteVideos}
                disabled={loading || deleteLoading}
                style={{ backgroundColor: '#dc3545', color: 'white', marginRight: 8 }}
              >
                {deleteLoading ? '삭제 중…' : '비디오 삭제'}
              </button>
              <button type="submit" className="btn primary" disabled={loading || deleteLoading}>
                {loading ? '업로드 중…' : '경기 업로드'}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
};

export default UploadVideoModal;
