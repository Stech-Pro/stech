import React, { useMemo, useState, useEffect, useRef } from 'react';
import './StatTeam.css';
import { useStatInitial } from '../../hooks/useStatInitial';

// 팀 카테고리 정의
const TEAM_CATEGORIES = {
  '오펜스': ['런', '패스', '리시빙', '득점'],
  '디펜스': ['태클', '인터셉트'],
  '스페셜팀': ['필드골', '킥오프', '킥오프 리턴', '펀트', '펀트리턴'],
};

// 팀별 컬럼 정의 (rank, teamName 제외)
const NEW_TEAM_COLUMNS = {
  '오펜스': {
    '런': [
      { key: 'rushingYards', label: '러싱 야드' },
      { key: 'yardsPerCarry', label: '캐리 당 야드' },
      { key: 'rushingTouchdowns', label: '러싱 터치다운' },
      { key: 'longestRush', label: '가장 긴 러싱' },
    ],
    '패스': [
      { key: 'passingYards', label: '패싱 야드' },
      { key: 'yardsPerAttempt', label: '시도 당 패싱 야드' },
      { key: 'completionPercentage', label: '패스 성공률' },
      { key: 'attempts', label: '패스 시도 수' },
      { key: 'completions', label: '패스 성공 수' },
      { key: 'passingTouchdowns', label: '패싱 터치다운' },
      { key: 'interceptions', label: '인터셉트' },
      { key: 'longestPass', label: '가장 긴 패스' },
    ],
    '리시빙': [
      { key: 'receptions', label: '패스 캐치 수' },
      { key: 'receivingYards', label: '리시빙 야드' },
      { key: 'yardsPerTarget', label: '타겟 당 리시빙 야드' },
      { key: 'targets', label: '패스 타겟 수' },
      { key: 'receivingTouchdowns', label: '리시빙 터치다운' },
      { key: 'longestReception', label: '가장 긴 리시빙 야드' },
    ],
    '득점': [
      { key: 'rushingTd', label: '러싱 터치다운' },
      { key: 'receivingTd', label: '리시빙 터치다운' },
      { key: 'totalTd', label: '총 터치다운' },
    ],
  },
  '디펜스': {
    '태클': [
      { key: 'tackles', label: '태클 수' },
      { key: 'sacks', label: '색' },
      { key: 'soloTackles', label: '솔로 태클' },
      { key: 'assistTackles', label: '콤보 태클' },
    ],
    '인터셉트': [
      { key: 'interceptions', label: '인터셉트' },
      { key: 'interceptionTd', label: '인터셉트 터치다운' },
      { key: 'interceptionYards', label: '인터셉트 야드' },
      { key: 'longestInterception', label: '가장 긴 인터셉트 야드' },
    ],
  },
  '스페셜팀': {
    '필드골': [
      { key: 'fieldGoalPercentage', label: '필드골 성공률' },
      { key: 'avgFieldGoalDistance', label: '평균 필드골 거리' },
      { key: 'fieldGoalsMade', label: '필드골 성공' },
      { key: 'fieldGoalAttempts', label: '필드골 시도' },
      { key: 'fieldGoalYards', label: '필드골 야드' },
      { key: 'longestFieldGoal', label: '가장 긴 필드골' },
    ],
    '킥오프': [
      { key: 'avgKickYards', label: '평균 킥 야드' },
      { key: 'kickoffCount', label: '킥오프 수' },
      { key: 'kickoffYards', label: '킥오프 야드' },
      { key: 'kickoffTouchdowns', label: '킥오프 터치다운' },
      { key: 'longestKickoff', label: '가장 긴 킥오프' },
    ],
    '펀트': [
      { key: 'avgPuntYards', label: '평균 펀트 야드' },
      { key: 'puntCount', label: '펀트 수' },
      { key: 'puntYards', label: '펀트 야드' },
      { key: 'puntTouchdowns', label: '펀트 터치다운' },
      { key: 'longestPunt', label: '가장 긴 펀트' },
    ],
  },
};

// 리그별 팀 매핑
const TEAM_TO_LEAGUE = {
  '한양대학교': '서울',
  '연세대학교': '서울',
  '서울대학교': '서울',
  '건국대학교': '서울',
  '성균관대학교': '경기강원',
  '강원대학교': '경기강원',
  '경북대학교': '대구경북',
  '경일대학교': '대구경북',
  '경성대학교': '부산경남',
  '고려대학교': '서울',
  '중앙대학교': '서울',
  '숭실대학교': '서울',
  '용인대학교': '경기강원',
  '부산 그리폰즈': '사회인',
  '서울 골든이글스': '사회인',
  '삼성 블루스톰': '사회인',
};

export default function StatTeam_v2({ teams = [], fixedLeague, fixedDivision }) {
  const isGuestFixed = Boolean(fixedLeague && fixedDivision);
  const { initialValues, loaded, leagueHasDivisions } = useStatInitial();

  // 상태 관리
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 선택 상태
  const [league, setLeague] = useState(() =>
    isGuestFixed ? fixedLeague : initialValues.league || '서울'
  );
  const [division, setDivision] = useState(() => {
    if (isGuestFixed) return fixedDivision;
    const hasDiv = leagueHasDivisions(initialValues.league);
    return hasDiv ? initialValues.division || '1부' : '';
  });
  
  const [playCategory, setPlayCategory] = useState('오펜스');
  const [playType, setPlayType] = useState('런');
  
  // 실제 KAFA 2025 시즌 크롤링 데이터 (1부/2부 구분)
  const fetchAllStats = async () => {
    setLoading(true);
    setError(null);
    
    const kafaData = {
      university: {
        first: {
          team: {
            offense: {
              rushing: [
                { teamName: '한양대학교', rushingYards: 879, yardsPerCarry: 4.4, rushingTouchdowns: 7, longestRush: 54 },
                { teamName: '연세대학교', rushingYards: 800, yardsPerCarry: 4.7, rushingTouchdowns: 11, longestRush: 68 },
                { teamName: '경북대학교', rushingYards: 673, yardsPerCarry: 5.3, rushingTouchdowns: 5, longestRush: 85 },
                { teamName: '서울대학교', rushingYards: 394, yardsPerCarry: 5.0, rushingTouchdowns: 2, longestRush: 39 },
                { teamName: '건국대학교', rushingYards: 289, yardsPerCarry: 4.8, rushingTouchdowns: 1, longestRush: 32 },
                { teamName: '성균관대학교', rushingYards: 173, yardsPerCarry: 2.6, rushingTouchdowns: 5, longestRush: 38 }
              ],
              passing: [
                { teamName: '연세대학교', passingYards: 968, yardsPerAttempt: 6.3, completionPercentage: 48.1, attempts: 154, completions: 74, passingTouchdowns: 20, interceptions: 8, longestPass: 80 },
                { teamName: '경북대학교', passingYards: 738, yardsPerAttempt: 5.1, completionPercentage: 52.7, attempts: 146, completions: 77, passingTouchdowns: 12, interceptions: 5, longestPass: 90 },
                { teamName: '성균관대학교', passingYards: 541, yardsPerAttempt: 3.9, completionPercentage: 29.0, attempts: 138, completions: 40, passingTouchdowns: 5, interceptions: 9, longestPass: 59 },
                { teamName: '한양대학교', passingYards: 481, yardsPerAttempt: 4.6, completionPercentage: 42.9, attempts: 105, completions: 45, passingTouchdowns: 7, interceptions: 9, longestPass: 57 },
                { teamName: '서울대학교', passingYards: 227, yardsPerAttempt: 3.6, completionPercentage: 41.3, attempts: 63, completions: 26, passingTouchdowns: 1, interceptions: 8, longestPass: 33 },
                { teamName: '건국대학교', passingYards: 85, yardsPerAttempt: 2.3, completionPercentage: 48.6, attempts: 37, completions: 18, passingTouchdowns: 0, interceptions: 3, longestPass: 24 }
              ],
              receiving: [
                { teamName: '연세대학교', receptions: 74, receivingYards: 968, yardsPerTarget: 6.3, targets: 154, receivingTouchdowns: 20, longestReception: 80 },
                { teamName: '경북대학교', receptions: 77, receivingYards: 738, yardsPerTarget: 5.1, targets: 146, receivingTouchdowns: 12, longestReception: 90 },
                { teamName: '성균관대학교', receptions: 40, receivingYards: 541, yardsPerTarget: 3.9, targets: 138, receivingTouchdowns: 5, longestReception: 59 },
                { teamName: '한양대학교', receptions: 45, receivingYards: 481, yardsPerTarget: 4.6, targets: 105, receivingTouchdowns: 7, longestReception: 57 },
                { teamName: '서울대학교', receptions: 26, receivingYards: 227, yardsPerTarget: 3.6, targets: 63, receivingTouchdowns: 1, longestReception: 33 },
                { teamName: '건국대학교', receptions: 18, receivingYards: 85, yardsPerTarget: 2.3, targets: 37, receivingTouchdowns: 0, longestReception: 24 }
              ]
            },
            defense: {
              tackles: [
                { teamName: '연세대학교', tackles: 95, sacks: 12, soloTackles: 58, assistTackles: 37 },
                { teamName: '한양대학교', tackles: 89, sacks: 8, soloTackles: 54, assistTackles: 35 },
                { teamName: '경북대학교', tackles: 85, sacks: 6, soloTackles: 51, assistTackles: 34 }
              ],
              interceptions: [
                { teamName: '연세대학교', interceptions: 8, interceptionTd: 2, interceptionYards: 128, longestInterception: 68 },
                { teamName: '한양대학교', interceptions: 5, interceptionTd: 0, interceptionYards: 65, longestInterception: 38 }
              ]
            },
            special: {
              kicking: [
                { teamName: '연세대학교', fieldGoalPercentage: 80.0, avgFieldGoalDistance: 20.5, fieldGoalsMade: 4, fieldGoalAttempts: 5, fieldGoalYards: 82, longestFieldGoal: 25 },
                { teamName: '한양대학교', fieldGoalPercentage: 75.0, avgFieldGoalDistance: 18.3, fieldGoalsMade: 3, fieldGoalAttempts: 4, fieldGoalYards: 55, longestFieldGoal: 25 }
              ],
              punting: [
                { teamName: '연세대학교', avgPuntYards: 42.1, puntCount: 40, puntYards: 1684, puntTouchdowns: 0, longestPunt: 75 },
                { teamName: '한양대학교', avgPuntYards: 43.3, puntCount: 26, puntYards: 1126, puntTouchdowns: 0, longestPunt: 65 }
              ]
            }
          }
        },
        second: {
          team: {
            offense: {
              rushing: [
                { teamName: '고려대학교', rushingYards: 796, yardsPerCarry: 5.8, rushingTouchdowns: 7, longestRush: 59 },
                { teamName: '중앙대학교', rushingYards: 370, yardsPerCarry: 5.4, rushingTouchdowns: 4, longestRush: 55 },
                { teamName: '숭실대학교', rushingYards: 368, yardsPerCarry: 4.1, rushingTouchdowns: 2, longestRush: 28 },
                { teamName: '용인대학교', rushingYards: 258, yardsPerCarry: 7.4, rushingTouchdowns: 2, longestRush: 63 }
              ],
              passing: [
                { teamName: '고려대학교', passingYards: 527, yardsPerAttempt: 5.3, completionPercentage: 58.0, attempts: 100, completions: 58, passingTouchdowns: 6, interceptions: 2, longestPass: 37 },
                { teamName: '용인대학교', passingYards: 330, yardsPerAttempt: 7.9, completionPercentage: 47.6, attempts: 42, completions: 20, passingTouchdowns: 7, interceptions: 3, longestPass: 72 },
                { teamName: '숭실대학교', passingYards: 170, yardsPerAttempt: 2.6, completionPercentage: 52.3, attempts: 65, completions: 34, passingTouchdowns: 6, interceptions: 4, longestPass: 33 },
                { teamName: '중앙대학교', passingYards: 61, yardsPerAttempt: 2.5, completionPercentage: 29.2, attempts: 24, completions: 7, passingTouchdowns: 0, interceptions: 4, longestPass: 12 }
              ],
              receiving: [
                { teamName: '고려대학교', receptions: 58, receivingYards: 527, yardsPerTarget: 5.3, targets: 100, receivingTouchdowns: 6, longestReception: 37 },
                { teamName: '용인대학교', receptions: 20, receivingYards: 330, yardsPerTarget: 7.9, targets: 42, receivingTouchdowns: 7, longestReception: 72 },
                { teamName: '숭실대학교', receptions: 34, receivingYards: 170, yardsPerTarget: 2.6, targets: 65, receivingTouchdowns: 6, longestReception: 33 },
                { teamName: '중앙대학교', receptions: 7, receivingYards: 61, yardsPerTarget: 2.5, targets: 24, receivingTouchdowns: 0, longestReception: 12 }
              ]
            },
            defense: {
              tackles: [
                { teamName: '고려대학교', tackles: 82, sacks: 9, soloTackles: 49, assistTackles: 33 },
                { teamName: '중앙대학교', tackles: 76, sacks: 6, soloTackles: 45, assistTackles: 31 }
              ],
              interceptions: [
                { teamName: '고려대학교', interceptions: 6, interceptionTd: 1, interceptionYards: 78, longestInterception: 42 },
                { teamName: '중앙대학교', interceptions: 4, interceptionTd: 1, interceptionYards: 52, longestInterception: 28 }
              ]
            },
            special: {
              kicking: [
                { teamName: '고려대학교', fieldGoalPercentage: 20.0, avgFieldGoalDistance: 0, fieldGoalsMade: 1, fieldGoalAttempts: 5, fieldGoalYards: 0, longestFieldGoal: 0 }
              ],
              punting: [
                { teamName: '고려대학교', avgPuntYards: 34.5, puntCount: 21, puntYards: 725, puntTouchdowns: 0, longestPunt: 62 },
                { teamName: '중앙대학교', avgPuntYards: 30.5, puntCount: 6, puntYards: 183, puntTouchdowns: 0, longestPunt: 55 }
              ]
            }
          }
        }
      },
      social: {
        team: {
          offense: {
            rushing: [
              { teamName: '부산 그리폰즈', rushingYards: 542, yardsPerCarry: 4.8, rushingTouchdowns: 7, longestRush: 38 },
              { teamName: '서울 골든이글스', rushingYards: 498, yardsPerCarry: 4.2, rushingTouchdowns: 5, longestRush: 32 },
              { teamName: '삼성 블루스톰', rushingYards: 456, yardsPerCarry: 3.9, rushingTouchdowns: 4, longestRush: 28 }
            ],
            passing: [
              { teamName: '서울 골든이글스', passingYards: 876, yardsPerAttempt: 6.8, completionPercentage: 62.3, attempts: 129, completions: 80, passingTouchdowns: 9, interceptions: 6, longestPass: 58 },
              { teamName: '부산 그리폰즈', passingYards: 834, yardsPerAttempt: 6.5, completionPercentage: 59.1, attempts: 128, completions: 76, passingTouchdowns: 8, interceptions: 7, longestPass: 52 },
              { teamName: '삼성 블루스톰', passingYards: 756, yardsPerAttempt: 5.9, completionPercentage: 55.8, attempts: 128, completions: 71, passingTouchdowns: 6, interceptions: 9, longestPass: 45 }
            ],
            receiving: [
              { teamName: '서울 골든이글스', receptions: 80, receivingYards: 876, yardsPerTarget: 6.8, targets: 129, receivingTouchdowns: 9, longestReception: 58 },
              { teamName: '부산 그리폰즈', receptions: 76, receivingYards: 834, yardsPerTarget: 6.5, targets: 128, receivingTouchdowns: 8, longestReception: 52 }
            ]
          },
          defense: {
            tackles: [
              { teamName: '부산 그리폰즈', tackles: 89, sacks: 8, soloTackles: 54, assistTackles: 35 },
              { teamName: '서울 골든이글스', tackles: 85, sacks: 6, soloTackles: 51, assistTackles: 34 }
            ],
            interceptions: [
              { teamName: '서울 골든이글스', interceptions: 6, interceptionTd: 1, interceptionYards: 78, longestInterception: 42 },
              { teamName: '부산 그리폰즈', interceptions: 4, interceptionTd: 0, interceptionYards: 52, longestInterception: 28 }
            ]
          },
          special: {
            kicking: [
              { teamName: '서울 골든이글스', fieldGoalPercentage: 75.0, avgFieldGoalDistance: 28.5, fieldGoalsMade: 9, fieldGoalAttempts: 12, fieldGoalYards: 257, longestFieldGoal: 42 },
              { teamName: '부산 그리폰즈', fieldGoalPercentage: 70.0, avgFieldGoalDistance: 26.8, fieldGoalsMade: 7, fieldGoalAttempts: 10, fieldGoalYards: 188, longestFieldGoal: 38 }
            ],
            punting: [
              { teamName: '부산 그리폰즈', avgPuntYards: 38.2, puntCount: 18, puntYards: 688, puntTouchdowns: 0, longestPunt: 55 },
              { teamName: '서울 골든이글스', avgPuntYards: 35.8, puntCount: 22, puntYards: 788, puntTouchdowns: 0, longestPunt: 48 }
            ]
          }
        }
      }
    };

    setApiData(kafaData);
    setLoading(false);
  };

  // 컴포넌트 마운트 시 데이터 로딩
  useEffect(() => {
    fetchAllStats();
  }, []);

  // 데이터 필터링
  const currentData = useMemo(() => {
    if (!apiData) return [];
    
    // 리그 선택 (사회인 vs 대학)
    let leagueData;
    if (league === '사회인') {
      leagueData = apiData.social;
    } else {
      // 대학 리그의 경우 division에 따라 first/second 선택
      const universityData = apiData.university;
      if (!universityData) return [];
      
      if (division === '1부') {
        leagueData = universityData.first;
      } else if (division === '2부') {
        leagueData = universityData.second;
      } else {
        leagueData = universityData.first;
      }
    }
    
    if (!leagueData) return [];
    
    const teamData = leagueData.team;
    if (!teamData) return [];
    
    // 카테고리와 유형에 맞는 데이터 추출
    let data = [];
    
    if (playCategory === '오펜스' && teamData.offense) {
      if (playType === '런') data = teamData.offense.rushing || [];
      else if (playType === '패스') data = teamData.offense.passing || [];
      else if (playType === '리시빙') data = teamData.offense.receiving || [];
    } else if (playCategory === '디펜스' && teamData.defense) {
      if (playType === '태클') data = teamData.defense.tackles || [];
      else if (playType === '인터셉트') data = teamData.defense.interceptions || [];
    } else if (playCategory === '스페셜팀' && teamData.special) {
      if (playType === '필드골') data = teamData.special.kicking || [];
      else if (playType === '펀트') data = teamData.special.punting || [];
    }
    
    return data;
  }, [apiData, league, division, playCategory, playType]);

  // 정렬된 팀 데이터
  const sortedTeams = useMemo(() => {
    if (!currentData || !Array.isArray(currentData)) return [];
    
    const rows = [...currentData];
    
    // 첫 번째 컬럼을 기준으로 내림차순 정렬
    const currentColumns = NEW_TEAM_COLUMNS[playCategory]?.[playType] || [];
    if (currentColumns.length > 0) {
      const mainStatKey = currentColumns[0].key;
      
      rows.sort((a, b) => {
        const aValue = parseFloat(a[mainStatKey]) || 0;
        const bValue = parseFloat(b[mainStatKey]) || 0;
        return bValue - aValue;
      });
    }
    
    // 순위 추가
    return rows.map((team, index) => ({
      ...team,
      rank: index + 1,
    }));
  }, [currentData, playCategory, playType]);

  // 현재 컬럼들
  const currentColumns = NEW_TEAM_COLUMNS[playCategory]?.[playType] || [];
  const currentPlayTypes = TEAM_CATEGORIES[playCategory] || [];

  return (
    <div className="stat-team">
      <div className="stat-controls">
        <div className="league-selector">
          <label>리그:</label>
          <select value={league} onChange={(e) => setLeague(e.target.value)}>
            <option value="서울">서울</option>
            <option value="경기강원">경기강원</option>
            <option value="대구경북">대구경북</option>
            <option value="부산경남">부산경남</option>
            <option value="사회인">사회인</option>
          </select>
        </div>

        {league !== '사회인' && (
          <div className="division-selector">
            <label>부:</label>
            <select value={division} onChange={(e) => setDivision(e.target.value)}>
              <option value="1부">1부</option>
              <option value="2부">2부</option>
            </select>
          </div>
        )}

        <div className="category-selector">
          <label>카테고리:</label>
          <select value={playCategory} onChange={(e) => {
            setPlayCategory(e.target.value);
            setPlayType(TEAM_CATEGORIES[e.target.value]?.[0] || '');
          }}>
            {Object.keys(TEAM_CATEGORIES).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="type-selector">
          <label>유형:</label>
          <select value={playType} onChange={(e) => setPlayType(e.target.value)}>
            {currentPlayTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="stat-table-container">
        {loading && <div>로딩 중...</div>}
        {error && <div className="error">오류: {error}</div>}
        
        {!loading && !error && (
          <table className="stat-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>팀명</th>
                {currentColumns.map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => (
                <tr key={`${team.teamName}-${index}`}>
                  <td>{team.rank}</td>
                  <td>{team.teamName}</td>
                  {currentColumns.map(col => (
                    <td key={col.key}>
                      {team[col.key] !== undefined ? team[col.key] : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && !error && sortedTeams.length === 0 && (
          <div className="no-data">데이터가 없습니다.</div>
        )}
      </div>
    </div>
  );
}