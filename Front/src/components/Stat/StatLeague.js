// StatLeague.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import './StatLeague.css';
import NoGroupImg from '../../assets/images/png/NoGroup.png';
import Trophy from '../../assets/images/png/trophy.png';
import { useStatInitial } from '../../hooks/useStatInitial';

const Dropdown = ({
  options = [],
  value = '',
  onChange = () => {},
  placeholder = '',
  className = '',
  disabled = false,
  hideValueUntilChange = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) setIsOpen((o) => !o);
  };

  const handleSelect = (option) => {
    setDirty(true);
    onChange(option);
    setIsOpen(false);
  };

  const selectedOption = options.find((o) => o.value === value);
  const displayText =
    hideValueUntilChange && !dirty
      ? placeholder || ''
      : selectedOption
      ? selectedOption.label
      : placeholder;

  return (
    <div className={`dropdown-container ${className}`} ref={dropdownRef}>
      <button
        className={`dropdown-trigger ${isOpen ? 'open' : ''} ${
          disabled ? 'disabled' : ''
        }`}
        onClick={handleToggle}
        disabled={disabled}
        type="button"
      >
        <span className="dropdown-text">{displayText}</span>
        <FaChevronDown
          size={16}
          className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <ul className="dropdown-list">
            {options.map((option) => (
              <li key={option.value} className="dropdown-item">
                <button
                  className={`dropdown-option ${
                    value === option.value ? 'selected' : ''
                  }`}
                  onClick={() => handleSelect(option)}
                  type="button"
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

function calculateGroupStandings(group) {
  const standings = {};
  group.teams.forEach((team) => {
    standings[team] = {
      name: team,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      games: 0,
    };
  });

  group.matches.forEach((match) => {
    if (match.homeScore !== null && match.awayScore !== null) {
      standings[match.home].pointsFor += match.homeScore;
      standings[match.home].pointsAgainst += match.awayScore;
      standings[match.home].games++;

      standings[match.away].pointsFor += match.awayScore;
      standings[match.away].pointsAgainst += match.homeScore;
      standings[match.away].games++;

      if (match.homeScore > match.awayScore) {
        standings[match.home].wins++;
        standings[match.home].points += 3;
        standings[match.away].losses++;
      } else if (match.homeScore < match.awayScore) {
        standings[match.away].wins++;
        standings[match.away].points += 3;
        standings[match.home].losses++;
      } else {
        standings[match.home].draws++;
        standings[match.home].points += 1;
        standings[match.away].draws++;
        standings[match.away].points += 1;
      }
    }
  });

  function getHeadToHeadRecord(teamA, teamB) {
    const h2h = {
      [teamA]: { points: 0, pointsFor: 0, pointsAgainst: 0 },
      [teamB]: { points: 0, pointsFor: 0, pointsAgainst: 0 },
    };

    group.matches.forEach((match) => {
      if (
        (match.home === teamA && match.away === teamB) ||
        (match.home === teamB && match.away === teamA)
      ) {
        if (match.homeScore !== null && match.awayScore !== null) {
          h2h[match.home].pointsFor += match.homeScore;
          h2h[match.home].pointsAgainst += match.awayScore;
          h2h[match.away].pointsFor += match.awayScore;
          h2h[match.away].pointsAgainst += match.homeScore;

          if (match.homeScore > match.awayScore) h2h[match.home].points += 3;
          else if (match.homeScore < match.awayScore)
            h2h[match.away].points += 3;
          else {
            h2h[match.home].points += 1;
            h2h[match.away].points += 1;
          }
        }
      }
    });

    return h2h;
  }

  const sortedStandings = Object.values(standings)
    .map((team) => ({
      ...team,
      winRate: team.games > 0 ? ((team.wins / team.games) * 100).toFixed(1) : 0,
      pointsDiff: team.pointsFor - team.pointsAgainst,
    }))
    .sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;

      const h2h = getHeadToHeadRecord(a.name, b.name);
      if (h2h[a.name].points !== h2h[b.name].points) {
        return h2h[b.name].points - h2h[a.name].points;
      }

      const h2hDiffA = h2h[a.name].pointsFor - h2h[a.name].pointsAgainst;
      const h2hDiffB = h2h[b.name].pointsFor - h2h[b.name].pointsAgainst;
      if (h2hDiffA !== h2hDiffB) return h2hDiffB - h2hDiffA;

      if (a.pointsDiff !== b.pointsDiff) return b.pointsDiff - a.pointsDiff;
      if (a.pointsFor !== b.pointsFor) return b.pointsFor - a.pointsFor;
      return a.pointsAgainst - b.pointsAgainst;
    });

  return sortedStandings;
}

export function GroupStandings({ currentDivision, group, teams = [] }) {
  const standings = calculateGroupStandings(group);

  const getRankClass = (index) => {
    switch (index) {
      case 0:
        return 'rank-1st';
      case 1:
        return 'rank-2nd';
      case 2:
        return 'rank-3rd';
      case 3:
        return 'rank-4th';
      default:
        return '';
    }
  };

  return (
    <div className="group-standings-container">
      <div className="group-standings">
        <div className="standings-header">
          <div className="standings-cell">순위</div>
          <div className="standings-cell team-cell title">팀 이름</div>
          <div className="standings-cell">승</div>
          <div className="standings-cell">무</div>
          <div className="standings-cell">패</div>
          <div className="standings-cell">승률</div>
          <div className="standings-cell">득점</div>
          <div className="standings-cell">실점</div>
        </div>
        {standings.map((team, index) => {
          const teamInfo = teams.find((t) => t.name === team.name);
          return (
            <div
              key={team.name}
              className={`standings-row ${
                currentDivision.name === '2부' ? 'minor' : ''
              } ${getRankClass(index)}`}
            >
              <div className="standings-cell rank-cell">{index + 1}</div>
              <div className="standings-cell logo-cell">
                {teamInfo?.logo && (
                  <div className="team-logo">
                    <img
                      src={teamInfo.logo}
                      alt={`${team.name} 로고`}
                      className={`team-logo-img ${
                        teamInfo.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                      }`}
                    />
                  </div>
                )}
              </div>
              <div
                className="standings-cell team-cell"
                style={{ fontSize: '14px' }}
              >
                {team.name}
              </div>
              <div className="standings-cell stat-cell">{team.wins}</div>
              <div className="standings-cell stat-cell">{team.draws}</div>
              <div className="standings-cell stat-cell">{team.losses}</div>
              <div className="standings-cell stat-cell">{team.winRate}%</div>
              <div className="standings-cell stat-cell">{team.pointsFor}</div>
              <div className="standings-cell stat-cell">
                {team.pointsAgainst}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------------
 * 경기/섹션
 * ---------------------------------- */
function MatchRow({
  currentDivision,
  group,
  index,
  match,
  teams = [],
  hasMultipleGroups,
}) {
  const homeTeam = teams.find((t) => t.name === match.home) || {
    name: match.home,
    logo: '',
  };
  const awayTeam = teams.find((t) => t.name === match.away) || {
    name: match.away,
    logo: '',
  };

  const getScore = () => {
    if (match.homeScore == null || match.awayScore == null)
      return match.status || '-';
    return `${match.homeScore} : ${match.awayScore}`;
  };

  return (
    <div
      className={`match-row ${currentDivision.name === '2부' ? 'minor' : ''}`}
    >
      {group ? (
        <div className="match-round">
          {hasMultipleGroups ? `${group} ` : ''}
          {index + 1} 경기
        </div>
      ) : (
        <div className="match-round">
          {currentDivision.name} {match.stage}
        </div>
      )}

      <div className="match-teams">
        <div className="team-vs">
          <div className="home-team">
            <div className="team-logo">
              <img
                src={homeTeam.logo}
                alt={`${homeTeam.name} 로고`}
                className={`team-logo-img ${
                  homeTeam.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                }`}
              />
            </div>
            <div className="team-name" style={{ fontSize: '14px' }}>
              {homeTeam.name}
            </div>
          </div>
          <div className="match-score">{getScore()}</div>
          <div className="away-team">
            <div className="team-logo">
              <img
                src={awayTeam.logo}
                alt={`${awayTeam.name} 로고`}
                className={`team-logo-img ${
                  awayTeam.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                }`}
              />
            </div>
            <div className="team-name" style={{ fontSize: '14px' }}>
              {awayTeam.name}
            </div>
          </div>
        </div>
      </div>
      <div className="match-location">{match.location || '-'}</div>
      <div className="match-date">{match.date || '-'}</div>
    </div>
  );
}

function MatchList({
  currentDivision,
  group,
  matches = [],
  teams = [],
  hasMultipleGroups,
}) {
  return (
    <div className="match-section">
      <div className="match-list">
        <div className="match-header">
          <div className="header-stage">경기 유형</div>
          <div className="header-summary">경기 요약</div>
          <div className="header-detail">경기 세부 내용</div>
          <div className="header-date">경기 날짜</div>
        </div>
        {matches.map((match, index) => (
          <MatchRow
            key={`${match.stage}-${index}-${match.home}-${match.away}`}
            currentDivision={currentDivision}
            group={group}
            index={index}
            match={match}
            teams={teams}
            hasMultipleGroups={hasMultipleGroups}
          />
        ))}
      </div>
    </div>
  );
}

function FinalMatch({ currentDivision, teams = [] }) {
  return (
    <div className="matches-container">
      <div className="final-header">
        <div className="final-title">결승전</div>
      </div>
      <MatchList
        currentDivision={currentDivision}
        matches={currentDivision.final}
        teams={teams}
      />
    </div>
  );
}

function SemiFinalMatches({ currentDivision, teams = [] }) {
  return (
    <div className="matches-container">
      <div className="final-header">
        <div className="final-title">4강전</div>
      </div>
      <MatchList
        currentDivision={currentDivision}
        matches={currentDivision.semiFinals}
        teams={teams}
      />
    </div>
  );
}

function QuarterFinalMatches({ currentDivision, teams = [] }) {
  return (
    <div className="matches-container">
      <div className="final-header">
        <div className="final-title">8강전</div>
      </div>
      <MatchList
        currentDivision={currentDivision}
        matches={currentDivision.quarterFinals}
        teams={teams}
      />
    </div>
  );
}
function PlayoffsMatches({ currentDivision, teams = [] }) {
  return (
    <div className="matches-container">
      <div className="playoffs-header">
        <div className="playoffs-title">순위결정전</div>
      </div>
      <MatchList
        currentDivision={currentDivision}
        matches={currentDivision.playoffs}
        teams={teams}
      />
    </div>
  );
}

function PromotionMatch({ currentDivision, teams = [] }) {
  return (
    <div className="promotion-matches-container">
      <div className="promotion-header">
        <div className="promotion-title">승강전</div>
      </div>
      <MatchList
        currentDivision={currentDivision}
        matches={currentDivision.promotion}
        teams={teams}
      />
    </div>
  );
}

function GroupMatches({
  currentDivision,
  group,
  teams = [],
  hasMultipleGroups,
}) {
  return (
    <div className="matches-container">
      <div className="group-header">
        <div className="group-title">
          {currentDivision.name} 리그{' '}
          {hasMultipleGroups ? `- ${group.name}` : ''}
        </div>
      </div>
      <MatchList
        currentDivision={currentDivision}
        group={group.name}
        matches={group.matches}
        teams={teams}
        hasMultipleGroups={hasMultipleGroups}
      />
    </div>
  );
}

const KnockoutCard = ({
  match,
  teams = [],
  index = 0,
  className = '',
  isFinal = false,
  isPlfs = false,
}) => {
  if (!match) return null;
  const home = teams.find((t) => t.name === match.home) || {
    name: match.home,
    logo: '',
  };
  const away = teams.find((t) => t.name == match.away) || {
    name: match.away,
    logo: '',
  };

  return (
    <div className={`knockout-team-container ${className}`}>
      <div className="knockout-team-header">
        {match.stage} {!index == 0 && `${index}경기`} {match.date}
      </div>
      <div className="knockout-team">
        <div
          className={`knockout-team-name-section 
          ${isFinal ? (match.winner === home?.name ? 's1st' : 's2nd') : ''}
          ${isPlfs ? (match.winner === home?.name ? 's3rd' : '') : ''}`}
        >
          {home.logo && (
            <div className="team-logo">
              <img
                src={home.logo}
                alt="로고"
                className={`team-logo-img ${
                  home.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                }`}
              />
            </div>
          )}
          <div className="team-name">{home.name}</div>
        </div>
        <div className="knockout-team-score">{match.homeScore}</div>
      </div>
      <div className="knockout-team">
        <div
          className={`knockout-team-name-section 
          ${isFinal ? (match.winner === away?.name ? 's1st' : 's2nd') : ''}
          ${isPlfs ? (match.winner === away?.name ? 's3rd' : '') : ''}`}
        >
          {away?.logo && (
            <div className="team-logo">
              <img
                src={away.logo}
                alt="로고"
                className={`team-logo-img ${
                  away.logo.endsWith('.svg') ? 'svg-logo' : 'png-logo'
                }`}
              />
            </div>
          )}
          <div className="team-name">{away.name}</div>
        </div>
        <div className="knockout-team-score">{match.awayScore}</div>
      </div>
    </div>
  );
};

function KnockoutBracket({ currentDivision, teams = [] }) {
  const qf = currentDivision?.quarterFinals || [];
  const sf = currentDivision?.semiFinals || [];
  const fin = (currentDivision?.final || [])[0];
  const plfs = (currentDivision?.playoffs || [])[0];

  return (
    <div className="bracket-container">
      <div className="QF-container">
        <KnockoutCard match={qf[0]} teams={teams} index={1} />
        <div className="line">
          <div className="padding-section"></div>
          <div className="right-section">
            <div className="up-section"></div>
            <div className="down-section"></div>
          </div>
        </div>
        <KnockoutCard match={qf[1]} teams={teams} index={2} />
      </div>
      <div className="SF-container">
        <KnockoutCard match={sf[0]} teams={teams} index={1} />
      </div>
      <div className="line-container">
        <div className="up-section"></div>
        <div className="down-section"></div>
      </div>
      <div className="F-container">
        <div className="trophy-img-box">
          <img src={Trophy} alt="trophy Img" className="trophyImg" />
        </div>

        <div className="final-row">
          <KnockoutCard match={fin} teams={teams} isFinal={true} />

          <KnockoutCard
            match={plfs}
            teams={teams}
            className="plfs"
            isPlfs={true}
          />
        </div>
      </div>

      <div className="line-container">
        <div className="up-section"></div>
        <div className="down-section"></div>
      </div>
      <div className="SF-container">
        <KnockoutCard match={sf[1]} teams={teams} index={2} />
      </div>
      <div className="QF-container">
        <KnockoutCard match={qf[2]} teams={teams} index={3} />
        <div className="line">
          <div className="left-section">
            <div className="up-section"></div>
            <div className="down-section"></div>
          </div>
          <div className="padding-section"></div>
        </div>
        <KnockoutCard match={qf[3]} teams={teams} index={4} />
      </div>
    </div>
  );
}

function KnockoutBracket2({ currentDivision, teams = [] }) {
  const sf = currentDivision?.semiFinals || [];
  const fin = (currentDivision?.final || [])[0];
  const plfs = (currentDivision?.playoffs || [])[0];

  return (
    <div className="bracket-container2">
      <div className="row1">
        <div className="trophy-img-box2">
          <img src={Trophy} alt="trophy Img" className="trophyImg" />
        </div>
      </div>
      <div className="row2">
        <KnockoutCard match={fin} teams={teams} />
        <div className="empty-space"></div>
        <KnockoutCard match={plfs} teams={teams} />
      </div>
      <div className="row3">
        <KnockoutCard match={sf[0]} teams={teams} index={1} />
        <div className="line-container">
          <div className="upper">
            <div className="upper-left"></div>
            <div className="upper-right"></div>
          </div>
          <div className="down"></div>
        </div>
        <KnockoutCard match={sf[1]} teams={teams} index={2} />
      </div>
    </div>
  );
}

/* ----------------------------------
 * Empty(예외) 페이지
 * ---------------------------------- */
function EmptyState({ message, onReset }) {
  return (
    <div
      style={{
        padding: '40px 24px',
        background: '#0b0b0e',
        borderRadius: 12,
        border: '1px solid #2b2b32',
        color: '#e7e7ea',
        textAlign: 'center',
        marginTop: 16,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
        데이터가 없습니다
      </div>
      <div style={{ opacity: 0.8, marginBottom: 16 }}>{message}</div>
      <button
        type="button"
        onClick={onReset}
        style={{
          padding: '8px 14px',
          borderRadius: 8,
          border: '1px solid #8a8a8f',
          background: 'transparent',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 700,
        }}
      >
        필터 초기화
      </button>
    </div>
  );
}

export default function StatLeague({ data, teams = [] }) {
  const exceptionLeague = ['타이거볼', '챌린지볼'];
  const [isExcepted, setIsExcepted] = useState(false);

  // 🔹 유저 초기 리그/부 + 로딩 상태
  const { initialValues, loaded } = useStatInitial();

  // 🔹 연도는 2025 고정
  const [selectedYear] = useState('2025');

  // 🔹 리그/부는 처음 한 번만 유저 정보 기준으로 세팅
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [showDivisionFilter, setShowDivisionFilter] = useState(false);
  const [initializedFromUser, setInitializedFromUser] = useState(false);

  const yearOptions = useMemo(
    () =>
      Object.keys(data ?? {}).map((y) => ({
        value: y,
        label: y,
      })),
    [data],
  );

  const leagueOptions = useMemo(() => {
    if (!selectedYear || !data?.[selectedYear]) return [];
    return Object.keys(data[selectedYear]).map((lg) => ({
      value: lg,
      label: lg,
    }));
  }, [data, selectedYear]);

  const leagueNode = useMemo(() => {
    if (!selectedYear || !selectedLeague) return null;
    return data?.[selectedYear]?.[selectedLeague] ?? null;
  }, [data, selectedYear, selectedLeague]);

  const divisionList = useMemo(
    () =>
      Array.isArray(leagueNode?.divisions) ? leagueNode.divisions : [],
    [leagueNode],
  );

  const hasDivisions = useMemo(
    () => divisionList.length > 1,
    [divisionList],
  );

  const divisionOptions = useMemo(
    () => divisionList.map((d) => ({ value: d.name, label: d.name })),
    [divisionList],
  );

  // 🔹 처음 마운트 + useStatInitial 로딩 끝난 후, 유저 기준 초기값 세팅
  useEffect(() => {
    if (!loaded || initializedFromUser || !data) return;
    const year = '2025';
    const leagues = Object.keys(data[year] ?? {});

    // 1) 유저 초기 리그가 존재하면 그대로, 아니면 첫 번째 리그
    let league = initialValues.league;
    if (!leagues.includes(league)) {
      league = leagues[0] || '';
    }

    const node = data?.[year]?.[league];
    const divs = Array.isArray(node?.divisions) ? node.divisions : [];

    // 2) 유저 초기 division이 있으면 그걸, 없으면 1부 → 없으면 첫 번째
    let division = '';
    if (divs.length > 0) {
      division =
        divs.find((d) => d.name === initialValues.division)?.name ||
        divs.find((d) => d.name === '1부')?.name ||
        divs[0].name;
    }

    setSelectedLeague(league);
    setSelectedDivision(division);
    setShowDivisionFilter(divs.length > 1);
    setInitializedFromUser(true);
  }, [loaded, initializedFromUser, data, initialValues.league, initialValues.division]);

  // 🔹 리그 변경 시
  const handleLeagueChange = (opt) => {
    const newLeague = opt.value;
    setSelectedLeague(newLeague);

    const node = data?.[selectedYear]?.[newLeague];
    const divs = Array.isArray(node?.divisions) ? node.divisions : [];
    const nextDiv =
      divs.find((d) => d.name === '1부')?.name || divs[0]?.name || '';
    setSelectedDivision(nextDiv);
    setShowDivisionFilter(divs.length > 1);
  };

  // 예외 리그(Tournament-only) 체크
  useEffect(() => {
    setIsExcepted(exceptionLeague.includes(selectedLeague));
  }, [selectedLeague]);

  const currentDivision = useMemo(() => {
    if (!divisionList.length) return null;
    if (!hasDivisions) return divisionList[0];
    return (
      divisionList.find((d) => d.name === selectedDivision) ||
      divisionList.find((d) => d.name === '1부') ||
      divisionList.find((d) => d.name === '정규') ||
      divisionList[0]
    );
  }, [divisionList, selectedDivision, hasDivisions]);

  const hasGroups = currentDivision?.groups?.length > 0;
  const hasMultipleGroups = currentDivision?.groups?.length > 1;

  const selectionReady = Boolean(
    selectedYear && selectedLeague && (hasDivisions ? selectedDivision : true),
  );

  const hasAnyContent = (div) => {
    if (!div) return false;
    const groupsOK = Array.isArray(div.groups) && div.groups.length > 0;
    const finalsOK = Array.isArray(div.final) && div.final.length > 0;
    const playoffsOK = Array.isArray(div.playoffs) && div.playoffs.length > 0;
    const promoOK = Array.isArray(div.promotion) && div.promotion.length > 0;
    return groupsOK || finalsOK || playoffsOK || promoOK;
  };

  const noDataForSelection =
    selectionReady && (!currentDivision || !hasAnyContent(currentDivision));

  if (!data) {
    return <div className="tournament-status">데이터가 없습니다</div>;
  }

  // 🔹 필터 초기화 → 다시 유저 값 기준으로 세팅
  const resetFilters = () => {
    setInitializedFromUser(false);
  };

  return (
    <div className="statTeamContainer">
      <div className="tournament-header">
        <div className="dropdown-group">
          {/* 연도: 2025 고정, 비활성화 */}
          <Dropdown
            options={yearOptions}
            value={selectedYear}
            onChange={() => {}}
            className="year-dropdown"
            placeholder="연도"
            hideValueUntilChange={false}
            disabled={true}
          />
          {/* 리그 */}
          <Dropdown
            options={leagueOptions}
            value={selectedLeague}
            onChange={handleLeagueChange}
            className="league-dropdown"
            placeholder="리그"
            hideValueUntilChange={true}
            disabled={!selectedYear}
          />
          {/* 부 필터 */}
          {showDivisionFilter && hasDivisions && (
            <Dropdown
              options={divisionOptions}
              value={selectedDivision}
              onChange={(o) => setSelectedDivision(o.value)}
              className="division-dropdown"
              placeholder="부"
            />
          )}
        </div>
      </div>

      {/* 선택 완료 + 해당 조합 데이터 없음 → 예외 페이지 */}
      {noDataForSelection && (
        <EmptyState
          message={
            hasDivisions
              ? `선택한 조합(${selectedYear} · ${selectedLeague} · ${selectedDivision})의 기록이 없습니다.`
              : `선택한 조합(${selectedYear} · ${selectedLeague})의 기록이 없습니다.`
          }
          onReset={resetFilters}
        />
      )}

      {/* 정상 렌더 */}
      {!noDataForSelection && currentDivision && (
        <div className="division-content">
          <div className="tournament-section">
            {isExcepted && (
              <div className="excepted-league-containers">
                {currentDivision?.quarterFinals?.length > 0 ? (
                  <KnockoutBracket
                    currentDivision={currentDivision}
                    teams={teams}
                  />
                ) : (
                  <KnockoutBracket2
                    currentDivision={currentDivision}
                    teams={teams}
                  />
                )}
              </div>
            )}

            {!isExcepted && currentDivision?.groups?.length > 0 && (
              <div className="flex  items-stretch justify-between gap-5 pt-12 max-[1600px]:flex-col">
                {hasMultipleGroups ? (
                  currentDivision.groups.map((group) => (
                    <div key={group.name} className="w-full rounded-lg">
                      <div className="group-header">
                        {currentDivision.name} {group.name} 순위
                      </div>
                      <div className="standings-section">
                        <GroupStandings
                          currentDivision={currentDivision}
                          group={group}
                          teams={teams}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {currentDivision.groups.map((group) => (
                      <div key={group.name} className="w-full rounded-lg">
                        <div className="group-header">
                          {currentDivision.name} 순위
                        </div>
                        <div className="standings-section">
                          <GroupStandings
                            currentDivision={currentDivision}
                            group={group}
                            teams={teams}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="w-full flex justify-center items-center overflow-hidden rounded-lg  max-[1600px]:hidden ">
                      <img
                        src={NoGroupImg}
                        alt={'no-group-section'}
                        className="no-group-img"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {currentDivision.final && currentDivision.final.length > 0 && (
            <FinalMatch currentDivision={currentDivision} teams={teams} />
          )}
          {currentDivision.playoffs && currentDivision.playoffs.length > 0 && (
            <PlayoffsMatches currentDivision={currentDivision} teams={teams} />
          )}
          {currentDivision.semiFinals &&
            currentDivision.semiFinals.length > 0 && (
              <SemiFinalMatches
                currentDivision={currentDivision}
                teams={teams}
              />
            )}
          {currentDivision.quarterFinals &&
            currentDivision.quarterFinals.length > 0 && (
              <QuarterFinalMatches
                currentDivision={currentDivision}
                teams={teams}
              />
            )}
          {currentDivision.groups && currentDivision.groups.length > 0 && (
            <div className="group-container">
              {currentDivision.groups.map((group) => (
                <div key={group.name} className="">
                  <div className="matches-section">
                    <GroupMatches
                      currentDivision={currentDivision}
                      group={group}
                      teams={teams}
                      hasMultipleGroups={hasMultipleGroups}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {currentDivision.promotion &&
            currentDivision.promotion.length > 0 && (
              <PromotionMatch currentDivision={currentDivision} teams={teams} />
            )}
        </div>
      )}
    </div>
  );
}
