// src/components/UploadVideoModal.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import './UploadVideoModal.css';
import Stechlogo from '../assets/images/logos/stech.png';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { TEAMS } from '../data/TEAMS.js';
import {
  prepareMatchUpload,
  completeMatchUpload,
  putToS3,
} from '../api/videoUploadAPI';
import DateTimeDropdown from './DateTimeDropdown.js';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

const KST = 'Asia/Seoul';

/* ───────── 파일 미리보기 유틸 ───────── */
function formatBytes(bytes = 0) {
  if (bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function useObjectURL(file) {
  const [url, setUrl] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const same =
      fileRef.current &&
      fileRef.current.name === file.name &&
      fileRef.current.size === file.size &&
      fileRef.current.lastModified === file.lastModified;
    if (same && url) return;

    fileRef.current = file;
    const u = URL.createObjectURL(file);
    setUrl(u);

    return () => {
      URL.revokeObjectURL(u);
    };
  }, [file]);

  return url;
}

function PreviewListItem({ file, onDelete }) {
  const url = useObjectURL(file);
  const isVid = /^video\//.test(file?.type || '');
  const key = `${file.name}-${file.size}-${file.lastModified || 0}`;

  return (
    <li key={key} className="fpm-item">
      <div className="fpm-meta">
        <div className="fpm-name" title={file.name}>{file.name}</div>
        <div className="fpm-sub">
          <span>{formatBytes(file.size)}</span>
          <span className="sep">•</span>
          <span>{file.type || 'unknown'}</span>
        </div>
      </div>

      <div className="fpm-preview">
        {isVid ? (
          <video
            className="fpm-video"
            src={url || undefined}
            controls
            preload="metadata"
            onError={(e) =>
              console.warn('Video error for', file.name, url, e?.nativeEvent)
            }
          />
        ) : (
          <div className="fpm-nonvideo">미리보기 불가</div>
        )}

        <div className="fpm-actions-inline">
          <a
            className="fpm-download"
            href={url || '#'}
            download={file.name}
            onClick={(e) => {
              if (!url) e.preventDefault();
            }}
          >
            다운로드
          </a>
          <button
            type="button"
            className="fpm-delete"
            onClick={onDelete}
            title="이 파일 삭제"
          >
            삭제
          </button>
        </div>
      </div>
    </li>
  );
}

/* ───────── 상수/라벨 ───────── */
const WEEK_LIMITS = {
  Seoul: 6,
  'Gyeonggi-Gangwon': 3,
  'Daegu-Gyeongbuk': 5,
  'Busan-Gyeongnam': 6,
  Amateur: 12,
};

const VISIBLE_TEAMS = TEAMS.filter(
  (t) => t.id !== 'ADMIN' && t.region !== 'Admin',
);

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
  'Gyeonggi-Gangwon': [
    '한림대학교 대운동장',
    '홍천 서면체육공원',
    '단국대학교 대운동장 (죽전)',
    '용인대학교 종합운동장',
    '천안종합운동장',
  ],
  Amateur: ['군위 종합운동장'],
};

const ALL_STADIUMS = Array.from(new Set(Object.values(STADIUMS).flat()));

const REGION_LABEL = {
  Seoul: '서울',
  'Gyeonggi-Gangwon': '경기강원',
  'Daegu-Gyeongbuk': '대구경북',
  'Busan-Gyeongnam': '부산경남',
  Amateur: '사회인',
};

const REGION_ORDER = [
  'Seoul', 'Gyeonggi-Gangwon', 'Daegu-Gyeongbuk', 'Busan-Gyeongnam', 'Amateur',
];

const REGION_OPTIONS = (() => {
  const uniq = Array.from(new Set(VISIBLE_TEAMS.map((t) => t.region))).filter(Boolean);
  const ordered = uniq.sort((a, b) => REGION_ORDER.indexOf(a) - REGION_ORDER.indexOf(b));
  return ordered.map((key) => ({ key, label: REGION_LABEL[key] || key }));
})();

function getLeagueName(matchDate, regionKey) {
  const year = matchDate
    ? dayjs(matchDate).tz(KST).year()
    : dayjs().tz(KST).year();
  const regionLabel = REGION_LABEL[regionKey] || regionKey || '';
  if (regionKey === 'Amateur') return `${year} 사회인`;
  return `${year} ${regionLabel} 추계`;
}

const GAME_TYPES = ['리그', '친선전', '스크리미지'];
const toBackendGameType = (t) =>
  t === '리그' ? 'League' : t === '친선전' ? 'Friendly' : 'Scrimmage';

/* ───────── 팀 선택 2단 드롭다운 ───────── */
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
    const firstLeague = leaguesList[0];
    if (firstLeague && !activeLeague) setActiveLeague(firstLeague);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

/* ───────── 분기 업로드 라인 ───────── */
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
        className="qbtn primary"
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        {q} 경기 영상 업로드
      </button>
      <button
        className="qbtn ghost"
        type="button"
        disabled={files.length === 0}
        onClick={onClear}
        title={files.length > 0 ? '선택한 파일 모두 제거' : '파일 없음'}
      >
        초기화
      </button>
      <span className="quarterFilename">
        {files.length > 0 ? `${files.length}개 파일 선택됨` : '선택된 파일 없음'}
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
  const teamsList = VISIBLE_TEAMS;

  // View 전환 상태: 'form' | 'preview'
  const [view, setView] = useState('form');
  const [activeTab, setActiveTab] = useState('Q1');

  // 폼 상태
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

  // 파일 상태
  const [q1, setQ1] = useState([]);
  const [q2, setQ2] = useState([]);
  const [q3, setQ3] = useState([]);
  const [q4, setQ4] = useState([]);

  // UI 상태
  const [dtOpen, setDtOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const closePreviewVideos = () => {
    document.querySelectorAll('.fpm-video').forEach((v) => v?.pause?.());
  };

  const handleChangeGameType = (val) => {
    setGameType(val);
    if (val === '리그') {
      setStadium('');
    } else {
      setRegionKey('');
      setWeek('');
      setStadium('');
      setStadiumMode('select');
    }
  };

  const isLeague = gameType === '리그';

  const selectableHomes = useMemo(() => {
    const base = isLeague ? teamsList.filter((t) => t.region === regionKey) : teamsList;
    return base;
  }, [teamsList, isLeague, regionKey]);

  const selectableAways = useMemo(() => {
    const base = isLeague ? teamsList.filter((t) => t.region === regionKey) : teamsList;
    return base.filter((t) => t?.id !== home?.id);
  }, [teamsList, isLeague, regionKey, home]);

  const stadiumOptions = useMemo(() => {
    if (!isLeague) return ALL_STADIUMS;
    if (!regionKey) return [];
    return STADIUMS[regionKey] ?? [];
  }, [isLeague, regionKey]);

  const handleClose = () => {
    if (loading) return;
    onClose?.();
  };

  // 리그 모드 일관성
  useEffect(() => {
    if (!isLeague) return;
    if (home?.region && home.region !== regionKey) setRegionKey(home.region);
  }, [home, isLeague, regionKey]);

  useEffect(() => {
    if (!isLeague) return;
    if (home && home.region !== regionKey) setHome(null);
    if (away && away.region !== regionKey) setAway(null);
  }, [regionKey, isLeague, home, away]);

  // 경기장 입력 모드 전환
  useEffect(() => {
    if (!isLeague) {
      setStadiumMode('select');
      return;
    }
    if (!regionKey) {
      setStadiumMode('select');
      setStadium('');
      return;
    }
    const hasList = (STADIUMS[regionKey] ?? []).length > 0;
    setStadiumMode(hasList ? 'select' : 'custom');
    setStadium('');
  }, [isLeague, regionKey]);

  const weekOptions = useMemo(() => {
    if (!isLeague || !regionKey) return [];
    const max = WEEK_LIMITS[regionKey] ?? 0;
    return Array.from({ length: max }, (_, i) => `Week${i + 1}`);
  }, [isLeague, regionKey]);

  useEffect(() => {
    if (!isLeague || !regionKey) return;
    const max = WEEK_LIMITS[regionKey] ?? 0;
    if (!max) {
      setWeek('');
      return;
    }
    const cur = String(week || '');
    if (!cur || !/^Week\d+$/.test(cur) || Number(cur.replace('Week', '')) > max) {
      setWeek('Week1');
    }
  }, [isLeague, regionKey, week]);

  const handleRemoveFile = (quarter, index) => {
    const updaters = { Q1: setQ1, Q2: setQ2, Q3: setQ3, Q4: setQ4 };
    const setFn = updaters[quarter];
    if (!setFn) return;
    setFn((prev) => prev.filter((_, i) => i !== index));
  };

  const filesByQuarter = useMemo(
    () => ({ Q1: q1, Q2: q2, Q3: q3, Q4: q4 }),
    [q1, q2, q3, q4],
  );

  const canShowStep3 = useMemo(() => {
    if (!gameType) return false;
    if (gameType !== '리그') return true;
    return Boolean(regionKey && week && stadium);
  }, [gameType, regionKey, week, stadium]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!gameType) return setError('경기 유형을 선택해 주세요.');
    if (gameType === '리그' && !regionKey)
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

      // 🔔 업로드 시작 토스트
      toast.loading('영상 업로드를 준비하고 있습니다...', { id: 'upload' });

      const d = dayjs(matchDate).tz(KST);
      const DOW = ['일', '월', '화', '수', '목', '금', '토'];
      const dow = DOW[d.day()];
      const dateWithKoreanDow = `${d.format('YYYY-MM-DD')}(${dow}) ${d.format('HH:mm')}`;

      const leagueNameAuto =
        gameType === '리그' ? getLeagueName(d, regionKey) : undefined;

      const getTeamCode = (teamId) => {
        if (teamId === 'seoulVI') {
          return 'VI';
        }
        // 기본 로직: 앞 두 글자 (예: 'GCF' -> 'GC', 'seoulVI' -> 'SE'였던 것을 위에서 처리)
        return String(teamId).slice(0, 2).toUpperCase();
      };

      const homeCode = getTeamCode(home.id);
      const awayCode = getTeamCode(away.id);

      const gameKey = `${homeCode}${awayCode}${d.format('YYYYMMDD')}`;

      const gameInfo = {
        homeTeam: home.id,
        awayTeam: away.id,
        date: dateWithKoreanDow,
        type: toBackendGameType(gameType),
        score: { home: Number(scoreHome || 0), away: Number(scoreAway || 0) },
        location: stadium,
        region: regionKey,
        ...(gameType === '리그' ? { week, leagueName: leagueNameAuto } : {}),
      };

      const quarterVideoCounts = {
        Q1: q1.length, Q2: q2.length, Q3: q3.length, Q4: q4.length,
      };

      // 1) 업로드 준비
      toast.loading('서버에 업로드 준비 중...', { id: 'upload' });
      const prep = await prepareMatchUpload({
        gameKey,
        gameInfo,
        quarterVideoCounts,
      });
      const { data } = prep; // { uploadUrls: {Q1:[...], Q2:[...]}, ... }

      const fileMap = { Q1: q1, Q2: q2, Q3: q3, Q4: q4 };
      const uploadUrls = data.uploadUrls || {};

      const pairs = [];
      Object.keys(uploadUrls).forEach((quarter) => {
        (uploadUrls[quarter] || []).forEach((u, idx) => {
          const f = fileMap[quarter]?.[idx];
          if (f) {
            pairs.push({ 
              quarter, 
              idx, 
              url: u.uploadUrl, 
              file: f,
              uploadData: {
                gameKey: gameKey,
                fileName: u.fileName,
                s3Path: u.s3Path
              }
            });
          }
        });
      });
      if (pairs.length === 0) throw new Error('업로드할 파일/URL이 없습니다.');

      // 🔔 S3 업로드 시작
      const totalFiles = pairs.length;
      toast.loading('영상 업로드 중... 0%', { id: 'upload' });

      const batchSize = 3;
      let uploadedCount = 0;

      for (let i = 0; i < pairs.length; i += batchSize) {
        const batch = pairs.slice(i, i + batchSize);

        // 1차: 백엔드 프록시 업로드
        const first = await Promise.allSettled(
          batch.map((p) =>
            putToS3(p.uploadData, p.file, {
              contentTypeStrategy: 'omit',
              timeoutMs: 300000,
            }),
          ),
        );

        // 업로드 진행 상황 업데이트
        uploadedCount += batch.filter((_, idx) => first[idx].status === 'fulfilled').length;
        const percentage = Math.round((uploadedCount / totalFiles) * 100);
        toast.loading(`영상 업로드 중... ${percentage}%`, { id: 'upload' });

        // 실패만 2차 재시도
        const retryTargets = batch.filter((_, idx) => first[idx].status === 'rejected');
        if (retryTargets.length) {
          const second = await Promise.allSettled(
            retryTargets.map((p) =>
              putToS3(p.uploadData, p.file, {
                contentTypeStrategy: 'omit',
                timeoutMs: 300000,
              }),
            ),
          );

          // 재시도 후 성공한 파일 카운트 추가
          const retrySuccessCnt = second.filter((r) => r.status === 'fulfilled').length;
          uploadedCount += retrySuccessCnt;
          const percentage = Math.round((uploadedCount / totalFiles) * 100);
          toast.loading(`영상 업로드 중... ${percentage}%`, { id: 'upload' });

          const failCnt = second.filter((r) => r.status === 'rejected').length;
          if (failCnt) {
            console.error('S3 업로드 실패 배치:', { batch, first, second });
            throw new Error(`S3 업로드 실패 ${failCnt}개`);
          }
        }
      }

      // 3) 완료 보고
      toast.loading('업로드 완료 처리 중...', { id: 'upload' });

      const uploadedVideos = {
        Q1: (uploadUrls.Q1 || []).map((u) => u.fileName),
        Q2: (uploadUrls.Q2 || []).map((u) => u.fileName),
        Q3: (uploadUrls.Q3 || []).map((u) => u.fileName),
        Q4: (uploadUrls.Q4 || []).map((u) => u.fileName),
      };

      await completeMatchUpload({ gameKey, uploadedVideos }, { timeoutMs: 120000 });

      // 🎉 업로드 성공
      toast.success('영상 업로드가 완료되었습니다!', { id: 'upload', duration: 3000 });

      onUploaded?.();
      handleClose();
    } catch (err) {
      // ❌ 업로드 실패
      const errorMsg = err?.message || '업로드 중 오류가 발생했습니다.';
      toast.error(errorMsg, { id: 'upload', duration: 5000 });
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="uvm-overlay" onClick={handleClose}>
      <div className="uvm-card" onClick={(e) => e.stopPropagation()}>
        {/* 상단: 로고 + 닫기 */}
        <div className="uvm-topbar">
          <div className="uvm-topbar-col1" />
          <div className="uvm-topbar-col2">
            <img className="uvm-logo" src={Stechlogo} alt="Stech" />
          </div>
          <div className="uvm-topbar-col3">
            <IoCloseCircleOutline className="uvm-close" onClick={handleClose} />
          </div>
        </div>

        {/* 본문: 뷰 전환 (form | preview) */}
        {view === 'form' ? (
          <form className="uvm-body" onSubmit={handleSubmit}>
            {/* 왼쪽: 경기 정보 입력 */}
            <section className="uvm-col left">
              <h3 className="uvm-section-title">경기 정보 입력</h3>

              {/* 1행: 경기 유형 + (리그=지역 / 비리그=경기장 또는 비표시) */}
              <div className="uvm-row">
                <div className="uvm-field two">
                  <label>경기 유형</label>
                  <select
                    value={gameType}
                    onChange={(e) => handleChangeGameType(e.target.value)}
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

                {!gameType ? (
                  <div className="uvm-field two uvm-spacer" />
                ) : gameType === '리그' ? (
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
                  <div className="uvm-field two">
                    <label>경기장</label>
                    {stadiumMode === 'select' && stadiumOptions.length > 0 ? (
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
                    ) : (
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
                )}
              </div>

              {/* 2행: 리그일 때만 주차 + (리그 전용) 경기장 */}
              {gameType === '리그' && regionKey && (
                <div className="uvm-row">
                  <div className="uvm-field two">
                    <label>주차</label>
                    <select
                      value={week}
                      onChange={(e) => setWeek(e.target.value)}
                      disabled={!isLeague || !regionKey || weekOptions.length === 0}
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

                  <div className="uvm-field two">
                    <label>경기장</label>

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

                    {(stadiumMode === 'custom' || stadiumOptions.length === 0) && (
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

              {/* 3행 이후: 팀, 날짜, 스코어 */}
              {canShowStep3 && (
                <>
                  <div className="uvm-row">
                    <div className="uvm-field two">
                      <label>홈팀 (HOME)</label>
                      <LeagueTeamSelect
                        value={home}
                        options={selectableHomes}
                        onChange={setHome}
                        placeholder={
                          gameType === '리그' ? '해당 지역 홈팀 선택' : '홈팀 선택'
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
                          gameType === '리그' ? '해당 지역 원정팀 선택' : '원정팀 선택'
                        }
                      />
                    </div>
                  </div>

                  <div className="uvm-row">
                    <div className="uvm-field two uvm-dtp-wrap">
                      <label>경기 날짜/시간</label>

                      <button
                        type="button"
                        className="dtpButton uvm-dtp"
                        onClick={() => setDtOpen((v) => !v)}
                      >
                        {matchDate
                          ? dayjs(matchDate).tz(KST).format('YYYY-MM-DD HH:mm')
                          : '날짜/시간 선택'}
                      </button>

                      {dtOpen && (
                        <DateTimeDropdown
                          value={matchDate ? dayjs(matchDate).tz(KST) : dayjs().tz(KST)}
                          onChange={(d) => setMatchDate(d.tz(KST).format())}
                          onClose={() => setDtOpen(false)}
                          minuteStep={10}
                        />
                      )}
                    </div>

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
                </>
              )}
            </section>

            {/* 오른쪽: 업로드 */}
            <section className="uvm-col right">
              <h3 className="uvm-section-title">경기 영상 업로드</h3>
              <div className="uvm-quarter-rows">
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
              </div>

              <div className="uvm-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setActiveTab('Q1');
                    setView('preview');
                  }}
                  disabled={
                    loading || (q1.length + q2.length + q3.length + q4.length === 0)
                  }
                  style={{ marginRight: 8 }}
                >
                  영상 확인
                </button>

                <button
                  type="submit"
                  className="btn primary"
                  disabled={loading}
                >
                  {loading ? '업로드 중…' : '경기 업로드'}
                </button>
              </div>
            </section>
          </form>
        ) : (
          /* ===== PREVIEW VIEW ===== */
          <div className="uvm-body uvm-body-preview">
            <section className="uvm-col left" style={{ gridColumn: '1 / -1' }}>
              <div className="uvm-preview-head">
                <h3 className="uvm-section-title">분기별 영상 확인</h3>
                <div className="uvm-tabline">
                  {['Q1', 'Q2', 'Q3', 'Q4'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`fpm-tab inline ${activeTab === t ? 'active' : ''}`}
                      onClick={() => {
                        closePreviewVideos();
                        setActiveTab(t);
                      }}
                    >
                      {t} ({(filesByQuarter?.[t] || []).length})
                    </button>
                  ))}
                  <div className="spacer" />
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => {
                      closePreviewVideos();
                      setView('form');
                    }}
                  >
                    돌아가기
                  </button>
                </div>
              </div>

              <div className="fpm-body inline">
                {(filesByQuarter?.[activeTab] || []).length === 0 ? (
                  <div className="fpm-empty">파일이 없습니다.</div>
                ) : (
                  <ul className="fpm-list inline">
                    {(filesByQuarter?.[activeTab] || []).map((file, idx) => (
                      <PreviewListItem
                        key={`${file.name}-${file.size}-${file.lastModified || 0}`}
                        file={file}
                        onDelete={() => handleRemoveFile(activeTab, idx)}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadVideoModal;
