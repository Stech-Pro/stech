// src/pages/Service/Member/Profile/ProfilePage/index.js
import React, { useState, useEffect } from 'react';
import './ProfileMain.css';
import { myProfile } from '../../../../../api/authAPI';
// NOTE: 경로는 프로젝트 구조에 맞게 수정
import { mockData } from '../../../../../data/teamplayermock';
import { teamData } from '../../../../../data/teamData';

// --- CONFIG ---
const STAT_LABELS = {
  games: '출전 경기',
  passing_attempts: '패스 시도',
  pass_completions: '패스 성공',
  completion_percentage: '성공률 (%)',
  passing_yards: '패싱 야드',
  passing_td: '패싱 TD',
  interceptions: '인터셉션',
  longest_pass: '최장 패스 (yd)',
  sacks: '被 색',
  rushing_attempts: '러싱 시도',
  rushing_yards: '러싱 야드',
  yards_per_carry: '시도당 야드',
  rushing_td: '러싱 TD',
  longest_rushing: '최장 러싱 (yd)',
  targets: '타겟',
  receptions: '리셉션',
  receiving_yards: '리시빙 야드',
  yards_per_catch: '리셉션당 야드',
  receiving_td: '리시빙 TD',
  longest_reception: '최장 리셉션 (yd)',
  tackles: '태클',
  TFL: 'TFL',
  forced_fumbles: '강제 펌블',
  fumble_recovery: '펌블 회수',
  pass_defended: '패스 방어',
  extra_points_made: '엑스트라 포인트 성공',
  extra_points_attempted: '엑스트라 포인트 시도',
  field_goal: '필드골 (성공/시도)',
  field_goal_percentage: '필드골 성공률 (%)',
  longest_field_goal: '최장 필드골 (yd)',
  punt_count: '펀트 횟수',
  punt_yards: '펀트 야드',
  average_punt_yard: '평균 펀트 (yd)',
  longest_punt: '최장 펀트 (yd)',
  penalties: '패널티',
  sacks_allowed: '허용 색',
};

const POSITION_STATS_CONFIG = {
  QB: [
    'games',
    'passing_attempts',
    'pass_completions',
    'completion_percentage',
    'passing_yards',
    'passing_td',
    'interceptions',
    'sacks',
    'rushing_attempts',
    'rushing_yards',
  ],
  RB: [
    'games',
    'rushing_attempts',
    'rushing_yards',
    'yards_per_carry',
    'rushing_td',
    'longest_rushing',
    'receptions',
    'receiving_yards',
  ],
  WR: [
    'games',
    'targets',
    'receptions',
    'receiving_yards',
    'yards_per_catch',
    'receiving_td',
    'longest_reception',
    'rushing_attempts',
    'rushing_yards',
  ],
  TE: [
    'games',
    'targets',
    'receptions',
    'receiving_yards',
    'yards_per_catch',
    'receiving_td',
  ],
  K: [
    'games',
    'field_goal',
    'field_goal_percentage',
    'extra_points_made',
    'extra_points_attempted',
    'longest_field_goal',
  ],
  P: ['games', 'punt_count', 'average_punt_yard', 'longest_punt'],
  OL: ['penalties', 'sacks_allowed'],
  DL: ['games', 'tackles', 'TFL', 'sacks', 'forced_fumbles', 'fumble_recovery'],
  LB: ['games', 'tackles', 'TFL', 'sacks', 'interceptions', 'pass_defended'],
  DB: ['games', 'tackles', 'interceptions', 'pass_defended', 'forced_fumbles'],
};

// --- 백엔드 연결 (mock) ---
const fetchProfileDataFromBackend = async () => {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    profileImage: 'https://via.placeholder.com/250x300',
    fullName: '김주전',
    email: 'joojeon.kim@example.com',
    address1: '서울시 광진구 능동로 120',
    address2: '건국대학교',
    height: '185cm',
    weight: '90kg',
    position: 'QB',
    age: '23세',
    career: '4년',
    region: '서울1',
    team: '건국대 레이징불스',
  };
};

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 포지션 선택 상태(커리어/시즌). 사용 안 하는 gamePosition은 제거해 경고 방지
  const [careerPosition, setCareerPosition] = useState('');
  const [seasonPosition, setSeasonPosition] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      const data = await fetchProfileDataFromBackend();
      setProfileData(data);
      setCareerPosition(data.position);
      setSeasonPosition(data.position);
      setIsLoading(false);
    };
    loadProfile();
  }, []);

  const getSelectedTeam = () => {
    if (!profileData?.team) return { label: 'N/A', logo: null };
    const selectedRegionTeams = teamData[profileData.region] || [];
    return (
      selectedRegionTeams.find((t) => t.label === profileData.team) || {
        label: profileData.team,
        logo: null,
      }
    );
  };

  const renderStatsTable = (position) => {
    if (!profileData || !position) {
      return <div className="no-data">포지션을 선택해주세요.</div>;
    }
    const playersInPosition = mockData[position] || [];
    const userStats = playersInPosition.find(
      (p) => p.name === profileData.fullName
    );
    if (!userStats) {
      return <div className="no-data">'{position}' 포지션 스탯이 없습니다.</div>;
    }
    const statKeysToShow = POSITION_STATS_CONFIG[position] || [];
    if (!statKeysToShow.length) {
      return <div className="no-data">표시할 스탯이 설정되지 않았습니다.</div>;
    }
    return (
      <div className="stats-table-container">
        <table className="stats-table">
          <thead>
            <tr>
              {statKeysToShow.map((key) => (
                <th key={key}>{STAT_LABELS[key] || key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {statKeysToShow.map((key) => (
                <td key={key}>
                  {userStats[key] !== undefined ? userStats[key] : 'N/A'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  if (isLoading) return <div className="loading-message">프로필 정보를 불러오는 중입니다...</div>;
  if (!profileData) return <div className="error-message">프로필 정보를 찾을 수 없습니다.</div>;

  const selectedTeam = getSelectedTeam();
  const availablePositions = Object.keys(mockData);

  return (
    <div className="profile-main">
      <div className="profile-container">
        <div className="profile-title-container">
          <h1 className="profile-title">선수 프로필</h1>
        </div>

        <div className="profile-content">
          <div className="profile-image-modify">
            <div className="profile-image-section">
              {profileData.profileImage ? (
                <img
                  src={profileData.profileImage}
                  alt="Profile"
                  className="profile-image"
                />
              ) : (
                <div className="profile-placeholder-text" />
              )}
            </div>
          </div>

          <div className="profile-info-section">
            <div className="profile-info-grid">
              <div className="profile-form-group">
                <label>성명</label>
                <p className="profile-info-text">{profileData.fullName}</p>
              </div>
              <div className="profile-form-group">
                <label>이메일</label>
                <p className="profile-info-text">{profileData.email}</p>
              </div>
              <div className="profile-form-group full-width">
                <label>주소</label>
                <p className="profile-info-text">{profileData.address1}</p>
                <p className="profile-info-text">{profileData.address2}</p>
              </div>
            </div>

            <div className="profile-info-four-column">
              <div className="profile-form-group">
                <label>키(cm)</label>
                <p className="profile-info-text">{profileData.height}</p>
              </div>
              <div className="profile-form-group">
                <label>몸무게(kg)</label>
                <p className="profile-info-text">{profileData.weight}</p>
              </div>
              <div className="profile-form-group">
                <label>나이</label>
                <p className="profile-info-text">{profileData.age}</p>
              </div>
              <div className="profile-form-group">
                <label>경력(년)</label>
                <p className="profile-info-text">{profileData.career}</p>
              </div>
            </div>

            <div className="profile-info-three-column">
              <div className="profile-form-group">
                <label>포지션</label>
                <p className="profile-info-text">{profileData.position}</p>
              </div>
              <div className="profile-form-group">
                <label>지역</label>
                <p className="profile-info-text">{profileData.region}</p>
              </div>
              <div className="profile-form-group">
                <label>팀</label>
                <div className="profile-team-display">
                  {selectedTeam.logo && (
                    <img
                      src={selectedTeam.logo}
                      alt={selectedTeam.label}
                      className="profile-team-icon"
                    />
                  )}
                  <p>{selectedTeam.label}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 통산 커리어 스탯 */}
      <div className="profile-container">
        <div className="profile-title-container">
          <h1 className="profile-title">통산 커리어 스탯</h1>
        </div>
        <div className="dropdowns-container">
          <select
            className="dropdown"
            value={careerPosition}
            onChange={(e) => setCareerPosition(e.target.value)}
          >
            {availablePositions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>
        {renderStatsTable(careerPosition)}
      </div>

      {/* 올해 시즌 나의 스탯 */}
      <div className="profile-container">
        <div className="profile-title-container">
          <h1 className="profile-title">올해 시즌 나의 스탯</h1>
        </div>
        <div className="dropdowns-container">
          <select
            className="dropdown"
            value={seasonPosition}
            onChange={(e) => setSeasonPosition(e.target.value)}
          >
            {availablePositions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>
        {renderStatsTable(seasonPosition)}
      </div>

      {/* 경기별 스탯 - 필요 시 이후 구현 */}
      <div className="profile-container">
        <div className="profile-title-container">
          <h1 className="profile-title">경기별 스탯</h1>
        </div>
      </div>
    </div>
  );
}
