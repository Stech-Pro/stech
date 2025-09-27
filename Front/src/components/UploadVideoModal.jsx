// src/components/UploadVideoModal.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import './UploadVideoModal.css';
import Stechlogo from '../assets/images/logos/stech.png';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { API_CONFIG } from '../config/api';
import { getToken } from '../utils/tokenUtils';
import { TEAMS } from '../data/TEAMS.js';
import {
  prepareMatchUpload,
  completeMatchUpload,
  putToS3,
} from '../api/videoUploadAPI';
import DateTimeDropdown from './DateTimeDropdown.js';
import dayjs from 'dayjs';

/* ───────── 파일 미리보기 유틸/모달 ───────── */
function formatBytes(bytes = 0) {
  if (bytes === 0) return '0 B';
  const k = 1024,
    sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function isVideo(file) {
  return /^video\//.test(file?.type || '');
}

function useObjectURLs(files = []) {
  const [urls, setUrls] = useState([]);
  useEffect(() => {
    const created = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }));
    setUrls(created);
    return () => created.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [files]);
  return urls;
}

function FilePreviewModal({ open, onClose, filesByQuarter }) {
  const tabs = ['Q1', 'Q2', 'Q3', 'Q4'];
  const [active, setActive] = useState('Q1');

  // 모달 open 상태 변화 추적
  const prevOpen = useRef(open);
  
  useEffect(() => {
    // 모달이 새로 열렸을 때만 Q1으로 리셋
    if (open && !prevOpen.current) {
      setActive('Q1');
    }
    prevOpen.current = open;
  }, [open]);

  // 비디오 제어는 이벤트 핸들러에서 직접 처리
  const handleTabChange = (newTab) => {
    setActive(newTab);
    // 탭 변경 시 기존 비디오들 일시정지
    setTimeout(() => {
      const vids = document.querySelectorAll('.fpm-video');
      vids.forEach((v) => v.pause?.());
    }, 0);
  };

  const files = filesByQuarter?.[active] || [];
  const urls = useObjectURLs(open ? files : []); // 닫혀있으면 빈 배열로 훅 호출 유지

  if (!open) return null;

  return (
    <div className="fpm-overlay" onClick={onClose}>
      <div className="fpm-card" onClick={(e) => e.stopPropagation()}>
        <div className="fpm-top">
          <h3 className="fpm-title">분기별 영상 확인</h3>
          <button
            type="button"
            className="fpm-close"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="fpm-tabs">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              className={`fpm-tab ${active === t ? 'active' : ''}`}
              onClick={() => handleTabChange(t)}
            >
              {t} ({(filesByQuarter?.[t] || []).length})
            </button>
          ))}
        </div>

        <div className="fpm-body">
          {files.length === 0 ? (
            <div className="fpm-empty">파일이 없습니다.</div>
          ) : (
            <ul className="fpm-list">
              {urls.map(({ file, url }, idx) => (
                <li key={`${file.name}-${idx}`} className="fpm-item">
                  <div className="fpm-meta">
                    <div className="fpm-name" title={file.name}>
                      {file.name}
                    </div>
                    <div className="fpm-sub">
                      <span>{formatBytes(file.size)}</span>
                      <span className="sep">•</span>
                      <span>{file.type || 'unknown'}</span>
                    </div>
                  </div>
                  <div className="fpm-preview">
                    {isVideo(file) ? (
                      <video
                        className="fpm-video"
                        src={url}
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <div className="fpm-nonvideo">미리보기 불가</div>
                    )}
                    <a className="fpm-download" href={url} download={file.name}>
                      다운로드
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="fpm-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

const WEEK_LIMITS = {
  Seoul: 6,
  'Gyeonggi-Gangwon': 3,
  'Daegu-Gyeongbuk': 5,
  'Busan-Gyeongnam': 6,
  Amateur: 12,
};

/** 화면 표시용 팀: Admin 제외 */
const VISIBLE_TEAMS = TEAMS.filter(
  (t) => t.id !== 'ADMIN' && t.region !== 'Admin',
);

/** 지역별 기본 경기장 목록 (경기강원은 빈 배열 → 직접 입력) */
const STADIUMS = {
  Seoul: [
    '서울대학교 대운동장',
    '해마루 축구장',
    '국민대학교',
    '살곶이 축구장',
    '화창운동장',
  ],
  'Busan-Gyeongnam': ['웅촌체육공원', '철마체육공원', '울산대학교'],
  'Daegu-Gyeongbuk': [
    '군위 종합운동장',
    '경일대학교',
    '대구과학대학교',
    '대구한의대학교',
    '계명대학교',
    '대구가톨릭대학교',
    '영남대학교',
    '한동대학교',
  ],
  'Gyeonggi-Gangwon': [],
  Amateur: ['군위 종합운동장'],
};

/* region 라벨 매핑 (TEAMS.region → 한글) */
const REGION_LABEL = {
  Seoul: '서울',
  'Gyeonggi-Gangwon': '경기강원',
  'Daegu-Gyeongbuk': '대구경북',
  'Busan-Gyeongnam': '부산경남',
  Amateur: '사회인',
};

const REGION_ORDER = [
  'Seoul',
  'Gyeonggi-Gangwon',
  'Daegu-Gyeongbuk',
  'Busan-Gyeongnam',
  'Amateur',
];

const REGION_OPTIONS = (() => {
  const uniq = Array.from(new Set(VISIBLE_TEAMS.map((t) => t.region))).filter(
    Boolean,
  );
  const ordered = uniq.sort(
    (a, b) => REGION_ORDER.indexOf(a) - REGION_ORDER.indexOf(b),
  );
  return ordered.map((key) => ({ key, label: REGION_LABEL[key] || key }));
})();

function getLeagueName(matchDate, regionKey) {
  const year = matchDate
    ? new Date(matchDate).getFullYear()
    : new Date().getFullYear();
  const regionLabel = REGION_LABEL[regionKey] || regionKey || '';
  if (regionKey === 'Amateur') {
    return `${year} 사회인`;
  }
  return `${year} ${regionLabel} 추계`;
}

/** 게임 유형 + 백엔드 매핑 */
const GAME_TYPES = ['리그', '친선전', '스크리미지'];
const toBackendGameType = (t) =>
  t === '리그' ? 'League' : t === '친선전' ? 'Friendly' : 'Scrimmage';

/** 리그 → 팀 2단 드롭다운 (원정팀 전용) */
function LeagueTeamSelect({
  value,
  options = [],
  onChange,
  placeholder = 'Select',
}) {
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
    (options || []).forEach((t) => {
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
    setActiveLeague((cur) =>
      cur && teamsByLeague[cur]?.length ? cur : leaguesList[0],
    );
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
                  className={`leagueItem ${
                    activeLeague === lg ? 'active' : ''
                  }`}
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
                          String(t.logo).endsWith('.svg')
                            ? 'svg-logo'
                            : 'png-logo'
                        }`}
                      />
                    </span>
                  )}
                  {t.name}
                </button>
              </li>
            ))}
            {(!activeLeague ||
              (teamsByLeague[activeLeague] || []).length === 0) && (
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
      <button
        className="btn primary"
        type="button"
        onClick={() => inputRef.current?.click()}
      >
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
      <span className="quarterFilename">
        {files.length > 0
          ? `${files.length}개 파일 선택됨`
          : '선택된 파일 없음'}
      </span>
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
  // 팀 소스: VISIBLE_TEAMS 사용
  const teamsList = VISIBLE_TEAMS;

  // 기본값
  const [gameType, setGameType] = useState('');
  const [regionKey, setRegionKey] = useState(defaultHomeTeam?.region ?? '');
  const [home, setHome] = useState(defaultHomeTeam ?? null);
  const [away, setAway] = useState(defaultAwayTeam ?? null);

  const [matchDate, setMatchDate] = useState('');
  const [scoreHome, setScoreHome] = useState('');
  const [scoreAway, setScoreAway] = useState('');
  const [week, setWeek] = useState('Week1');
  const [stadium, setStadium] = useState('');
  const [stadiumMode, setStadiumMode] = useState('select'); // 'select' | 'custom'
  const [previewOpen, setPreviewOpen] = useState(false);

  const [q1, setQ1] = useState([]);
  const [q2, setQ2] = useState([]);
  const [q3, setQ3] = useState([]);
  const [q4, setQ4] = useState([]);

  const [dtOpen, setDtOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  
  const closePreview = useCallback(() => setPreviewOpen(false), []);

  const isLeague = gameType === '리그';

  /** 팀 선택지: 리그면 region 필터, 아니면 전체 */
  const selectableHomes = useMemo(() => {
    const base = isLeague
      ? teamsList.filter((t) => t.region === regionKey)
      : teamsList;
    return base;
  }, [teamsList, isLeague, regionKey]);

  const selectableAways = useMemo(() => {
    const base = isLeague
      ? teamsList.filter((t) => t.region === regionKey)
      : teamsList;
    return base.filter((t) => t?.id !== home?.id);
  }, [teamsList, isLeague, regionKey, home]);

  /** 리그에서 선택 가능한 경기장 목록 */
  const stadiumOptions = useMemo(() => {
    if (!isLeague || !regionKey) return [];
    return STADIUMS[regionKey] ?? [];
  }, [isLeague, regionKey]);

  /** 닫기 */
  const handleClose = () => {
    if (loading || deleteLoading) return;
    onClose?.();
  };

  /** 리그 모드에서 지역/팀 일관성 유지 */
  useEffect(() => {
    if (!isLeague) return;
    if (home?.region && home.region !== regionKey) setRegionKey(home.region);
  }, [home, isLeague, regionKey]);

  useEffect(() => {
    if (!isLeague) return;
    if (home && home.region !== regionKey) setHome(null);
    if (away && away.region !== regionKey) setAway(null);
  }, [regionKey, isLeague, home, away]);

  /** 경기장 입력 모드 전환 */
  useEffect(() => {
    if (!isLeague) {
      setStadiumMode('custom'); // 친선전/스크리미지: 바로 직접입력
      return;
    }
    // 리그: 지역 선택 전이면 선택모드 유지, 선택 후엔 옵션 유무로 모드 결정
    if (!regionKey) {
      setStadiumMode('select');
      setStadium('');
      return;
    }
    const hasList = (STADIUMS[regionKey] ?? []).length > 0;
    setStadiumMode(hasList ? 'select' : 'custom');
    setStadium(''); // 지역 바뀌면 초기화
  }, [isLeague, regionKey]);
  
  const weekOptions = useMemo(() => {
    if (!isLeague || !regionKey) return [];
    const max = WEEK_LIMITS[regionKey] ?? 0;
    return Array.from({ length: max }, (_, i) => `Week${i + 1}`);
  }, [isLeague, regionKey]);

  /** 지역 변경 시 현재 week를 상한에 맞춰 보정 */
  useEffect(() => {
    if (!isLeague || !regionKey) return;
    const max = WEEK_LIMITS[regionKey] ?? 0;
    if (!max) {
      setWeek(''); // 상한 없으면 비움
      return;
    }
    // 현재 선택이 범위 밖이면 Week1로 리셋
    const cur = String(week || '');
    if (
      !cur ||
      !/^Week\d+$/.test(cur) ||
      Number(cur.replace('Week', '')) > max
    ) {
      setWeek('Week1');
    }
  }, [isLeague, regionKey, week]);

  /** 제출 */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!gameType) return setError('경기 유형을 선택해 주세요.');
    if (isLeague && !regionKey)
      return setError('리그 경기의 지역을 선택해 주세요.');
    if (!stadium) return setError('경기장을 입력/선택해 주세요.');
    if (!home || !away) return setError('홈/원정 팀을 선택해 주세요.');
    if (home?.id === away?.id)
      return setError('홈팀과 원정팀이 동일할 수 없습니다.');
    if (!matchDate) return setError('경기 날짜를 선택해 주세요.');
    if (q1.length + q2.length + q3.length + q4.length === 0)
      return setError('최소 1개 분기 영상을 업로드해 주세요.');

    try {
      setLoading(true);

      const leagueNameAuto = isLeague
        ? getLeagueName(matchDate, regionKey)
        : undefined;

      const gameKey = `${String(home.id).slice(0, 2).toUpperCase()}${String(
        away.id,
      )
        .slice(0, 2)
        .toUpperCase()}${new Date(matchDate)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '')}`;

      const gameInfo = {
        homeTeam: home.id,
        awayTeam: away.id,
        date: matchDate, // 예: "2025-09-20T15:00"
        type: toBackendGameType(gameType),
        score: { home: Number(scoreHome || 0), away: Number(scoreAway || 0) },
        location: stadium,
        region: regionKey,
        ...(isLeague ? { week, leagueName: leagueNameAuto } : {}),
      };

      const quarterVideoCounts = {
        Q1: q1.length,
        Q2: q2.length,
        Q3: q3.length,
        Q4: q4.length,
      };

      const prep = await prepareMatchUpload({
        gameKey,
        gameInfo,
        quarterVideoCounts,
      });
      const { data } = prep; // { uploadUrls: {Q1:[...], Q2:[...]}, ... }

      // 2) S3 업로드
      const fileMap = { Q1: q1, Q2: q2, Q3: q3, Q4: q4 };
      const uploadPromises = [];
      Object.keys(data.uploadUrls).forEach((quarter) => {
        const urlList = data.uploadUrls[quarter] || [];
        urlList.forEach((u, idx) => {
          const f = fileMap[quarter]?.[idx];
          if (!f) return;
          uploadPromises.push(putToS3(u.uploadUrl, f));
        });
      });
      await Promise.all(uploadPromises);

      // 3) 완료단계
      const uploadedVideos = {
        Q1: (data.uploadUrls.Q1 || []).map((u) => u.fileName),
        Q2: (data.uploadUrls.Q2 || []).map((u) => u.fileName),
        Q3: (data.uploadUrls.Q3 || []).map((u) => u.fileName),
        Q4: (data.uploadUrls.Q4 || []).map((u) => u.fileName),
      };
      await completeMatchUpload({ gameKey, uploadedVideos });

      onUploaded?.();
      handleClose();
    } catch (err) {
      setError(err?.message || '업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /** 삭제 */
  const handleDeleteVideos = async () => {
    if (!home || !away || !matchDate) {
      setError('홈팀, 원정팀, 경기 날짜를 먼저 선택해주세요.');
      return;
    }

    // gameKey = 홈코드(앞2) + 원정코드(앞2) + YYYYMMDD
    const gameDate = new Date(matchDate);
    const formattedDate = gameDate.toISOString().slice(0, 10).replace(/-/g, '');
    const normCode = (s) =>
      String(s || '')
        .slice(0, 2)
        .toUpperCase();
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
        alert(
          `성공적으로 ${result.deletedCount}개의 비디오 파일을 삭제했습니다.`,
        );
        setQ1([]);
        setQ2([]);
        setQ3([]);
        setQ4([]);
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
  
  const canShowStep3 = useMemo(() => {
    if (!gameType) return false;
    if (gameType !== '리그') return true;
    return Boolean(regionKey && week && stadium);
  }, [gameType, regionKey, week, stadium]);

  const filesByQuarter = useMemo(
    () => ({ Q1: q1, Q2: q2, Q3: q3, Q4: q4 }),
    [q1, q2, q3, q4],
  );

  if (!isOpen) return null;

  return (
    <div className="uvm-overlay" onClick={handleClose}>
      <div className="uvm-card" onClick={(e) => e.stopPropagation()}>
        {/* 상단: 로고 + 닫기 */}
        <div className="uvm-topbar">
          <img className="uvm-logo" src={Stechlogo} alt="Stech" />
          <button
            type="button"
            className="uvm-close"
            onClick={handleClose}
            aria-label="닫기"
          >
            <IoCloseCircleOutline />
          </button>
        </div>

        {/* 본문: 좌우 2단 */}
        <form className="uvm-body" onSubmit={handleSubmit}>
          {/* 왼쪽: 경기 정보 입력 */}
          <section className="uvm-col left">
            <h3 className="uvm-section-title">경기 정보 입력</h3>

            {/* ── 1행: 경기 유형 + (리그일 때) 지역 선택 ── */}
            <div className="uvm-row">
              <div className="uvm-field two">
                <label>경기 유형</label>
                <select
                  value={gameType}
                  onChange={(e) => setGameType(e.target.value)}
                >
                  <option value="" disabled hidden>
                    경기 유형 선택
                  </option>
                  {GAME_TYPES.map((gt) => (
                    <option key={gt} value={gt}>
                      {gt}
                    </option>
                  ))}
                </select>
              </div>

              {gameType === '리그' ? (
                <div className="uvm-field two">
                  <label>지역(리그)</label>
                  <select
                    value={regionKey}
                    onChange={(e) => setRegionKey(e.target.value)}
                  >
                    <option value="" disabled hidden>
                      지역 선택
                    </option>
                    {REGION_OPTIONS.map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                // 리그가 아니면 빈 칸(자리 유지용)
                <div className="uvm-spacer" aria-hidden />
              )}
            </div>

            {/* ── 2행: (리그 + 지역 선택 시) 주차 + 경기장 ── */}
            {gameType === '리그' && regionKey && (
              <div className="uvm-row">
                {/* 주차 선택 (Week1 ~ WeekN) */}
                <div className="uvm-field two">
                  <label>주차</label>
                  <select
                    value={week}
                    onChange={(e) => setWeek(e.target.value)}
                    disabled={
                      !isLeague || !regionKey || weekOptions.length === 0
                    }
                  >
                    {!week && (
                      <option value="" disabled>
                        주차 선택
                      </option>
                    )}
                    {weekOptions.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 경기장 선택/입력 (지금 쓰던 로직 그대로) */}
                <div className="uvm-field two">
                  <label>경기장</label>

                  {/* 선택 모드 */}
                  {stadiumMode === 'select' && stadiumOptions.length > 0 && (
                    <div className="stadium-select-line">
                      <select
                        value={stadium || ''}
                        onChange={(e) => setStadium(e.target.value)}
                      >
                        <option value="" disabled hidden>
                          경기장 선택
                        </option>
                        {stadiumOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => {
                          setStadium('');
                          setStadiumMode('custom');
                        }}
                        style={{ marginLeft: 8 }}
                      >
                        직접 입력
                      </button>
                    </div>
                  )}

                  {/* 직접 입력 모드 (경기강원 기본) */}
                  {(stadiumMode === 'custom' ||
                    stadiumOptions.length === 0) && (
                    <div className="stadium-input-line">
                      <input
                        value={stadium}
                        onChange={(e) => setStadium(e.target.value)}
                        placeholder="경기장을 입력하세요"
                      />
                      {stadiumOptions.length > 0 && (
                        <button
                          type="button"
                          className="btn ghost"
                          onClick={() => {
                            setStadium('');
                            setStadiumMode('select');
                          }}
                          style={{ marginLeft: 8 }}
                        >
                          목록에서 선택
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── 3행 이후: 팀, 날짜, 스코어, 리그명 ── */}
            {canShowStep3 && (
              <>
                {/* 팀 선택: HOME : AWAY 한 줄 */}
                <div className="uvm-row">
                  <div className="uvm-field two">
                    <label>홈팀 (HOME)</label>
                    <LeagueTeamSelect
                      value={home}
                      options={selectableHomes}
                      onChange={setHome}
                      placeholder={
                        gameType === '리그'
                          ? '해당 지역 홈팀 선택'
                          : '홈팀 선택'
                      }
                    />
                  </div>

                  <div className="uvm-field two">
                    <label>원정팀 (AWAY)</label>
                    <LeagueTeamSelect
                      value={away}
                      options={selectableAways}
                      onChange={setAway}
                      placeholder={
                        gameType === '리그'
                          ? '해당 지역 원정팀 선택'
                          : '원정팀 선택'
                      }
                    />
                  </div>
                </div>

                {/* 날짜/시간은 한 줄 전체 사용 */}
                <div className="uvm-row">
                  <div className="uvm-field two uvm-dtp-wrap">
                    <label>경기 날짜/시간</label>

                    <button
                      type="button"
                      className="dtpButton uvm-dtp"
                      onClick={() => setDtOpen((v) => !v)}
                    >
                      {matchDate
                        ? dayjs(matchDate).format('YYYY-MM-DD HH:mm')
                        : '날짜/시간 선택'}
                    </button>

                    {dtOpen && (
                      <DateTimeDropdown
                        value={matchDate ? dayjs(matchDate) : dayjs()}
                        onChange={(d) =>
                          setMatchDate(d.format('YYYY-MM-DDTHH:mm'))
                        }
                        onClose={() => setDtOpen(false)}
                        minuteStep={10} // 옵션으로 10분 간격
                      />
                    )}
                  </div>

                  {/* 스코어: HOME : AWAY */}
                  <div className="uvm-field two">
                    <label>스코어 (홈팀 | 어웨이팀)</label>
                    <div className="uvm-row uvm-row-3col">
                      <input
                        type="number"
                        min="0"
                        value={scoreHome}
                        onChange={(e) => setScoreHome(e.target.value)}
                        placeholder="HOME"
                      />
                      <span className="uvm-sep">:</span>
                      <input
                        type="number"
                        min="0"
                        value={scoreAway}
                        onChange={(e) => setScoreAway(e.target.value)}
                        placeholder="AWAY"
                      />
                    </div>
                  </div>
                </div>
                {/* 비리그(친선/스크리미지): 경기장 직접입력 */}
                {gameType !== '리그' && (
                  <div className="uvm-field two">
                    <label>경기장</label>
                    <input
                      value={stadium}
                      onChange={(e) => setStadium(e.target.value)}
                      placeholder="경기장을 입력하세요"
                    />
                  </div>
                )}
              </>
            )}
          </section>

          {/* 오른쪽: 분기 업로드 */}
          <section className="uvm-col right">
            <h3 className="uvm-section-title">경기 영상 업로드</h3>

            <QuarterRow
              q="Q1"
              files={q1}
              onPick={(f) => setQ1((p) => [...p, ...f])}
              onClear={() => setQ1([])}
            />
            <QuarterRow
              q="Q2"
              files={q2}
              onPick={(f) => setQ2((p) => [...p, ...f])}
              onClear={() => setQ2([])}
            />
            <QuarterRow
              q="Q3"
              files={q3}
              onPick={(f) => setQ3((p) => [...p, ...f])}
              onClear={() => setQ3([])}
            />
            <QuarterRow
              q="Q4"
              files={q4}
              onPick={(f) => setQ4((p) => [...p, ...f])}
              onClear={() => setQ4([])}
            />

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
                className="btn"
                onClick={() => setPreviewOpen(true)}
                disabled={
                  loading ||
                  deleteLoading ||
                  q1.length + q2.length + q3.length + q4.length === 0
                }
                style={{ marginRight: 8 }}
              >
                영상 확인
              </button>

              <button
                type="button"
                className="btn danger"
                onClick={handleDeleteVideos}
                disabled={loading || deleteLoading}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  marginRight: 8,
                }}
              >
                {deleteLoading ? '삭제 중…' : '비디오 삭제'}
              </button>
              <button
                type="submit"
                className="btn primary"
                disabled={loading || deleteLoading}
              >
                {loading ? '업로드 중…' : '경기 업로드'}
              </button>
            </div>
          </section>
        </form>
        <FilePreviewModal
          open={previewOpen}
          onClose={closePreview}
          filesByQuarter={filesByQuarter}
        />
      </div>
    </div>
  );
};

export default UploadVideoModal;