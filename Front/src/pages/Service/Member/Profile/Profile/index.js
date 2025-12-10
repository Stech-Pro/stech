// src/pages/Service/Member/Profile/ProfilePage/index.js
import React, { useState, useEffect } from 'react';
import './ProfileMain.css';
import { myProfile } from '../../../../../api/authAPI';
import { TEAM_BY_ID, TEAM_BY_NAME, TEAMS } from '../../../../../data/TEAMS';

// ------------------------------------------------------------------
// 🌎 국가 정보 헬퍼 및 라이브러리 추가
// ------------------------------------------------------------------
import CountryFlag from 'react-country-flag';
import countries from 'i18n-iso-countries';
import koLocale from 'i18n-iso-countries/langs/ko.json';

countries.registerLocale(koLocale);

// ISO3 -> ISO2 헬퍼 (국기 표시용)
const toAlpha2 = (alpha3) => {
  try {
    return countries.alpha3ToAlpha2(alpha3) || '';
  } catch {
    return '';
  }
};
// ISO3 -> 한국어 국가명 헬퍼
const getCountryNameKo = (alpha3) => {
    const alpha2 = toAlpha2(alpha3);
    if (!alpha2) return alpha3 || 'N/A';
    return countries.getName(alpha2, 'ko', { select: 'official' }) || alpha3;
};
// ------------------------------------------------------------------


// 지역 한글 변환 매핑
const REGION_KR = {
  Seoul: '서울',
  'Gyeonggi-Gangwon': '경기강원',
  'Daegu-Gyeongbuk': '대구경북',
  'Busan-Gyeongnam': '부산경남',
  Amateur: '사회인',
  Admin: '관리자',
};

const POSITION_STATS_CONFIG = {
  QB: [
    'games', 'passing_attempts', 'pass_completions',
    'completion_percentage', 'passing_yards', 'passing_td',
    'interceptions', 'sacks', 'rushing_attempts', 'rushing_yards',
  ],
  RB: [
    'games', 'rushing_attempts', 'rushing_yards', 'yards_per_carry',
    'rushing_td', 'longest_rushing', 'receptions', 'receiving_yards',
  ],
  WR: [
    'games', 'targets', 'receptions', 'receiving_yards',
    'yards_per_catch', 'receiving_td', 'longest_reception',
    'rushing_attempts', 'rushing_yards',
  ],
  TE: [
    'games', 'targets', 'receptions', 'receiving_yards',
    'yards_per_catch', 'receiving_td',
  ],
  K: [
    'games', 'field_goal', 'field_goal_percentage',
    'extra_points_made', 'extra_points_attempted', 'longest_field_goal',
  ],
  P: ['games', 'punt_count', 'average_punt_yard', 'longest_punt'],
  OL: ['penalties', 'sacks_allowed'],
  DL: ['games', 'tackles', 'TFL', 'sacks', 'forced_fumbles', 'fumble_recovery'],
  LB: ['games', 'tackles', 'TFL', 'sacks', 'interceptions', 'pass_defended'],
  DB: ['games', 'tackles', 'interceptions', 'pass_defended', 'forced_fumbles'],
};

// ⚙️ teamName(약어/ID/텍스트)을 한글 팀명/로고/리그명으로 변환
function resolveTeamDisplay(teamName) {
  if (!teamName) return { id: null, name: 'N/A', logo: null, region: null, division: null };

  // 1) ID로 매칭 (예: "HYlions")
  const byId = TEAM_BY_ID[teamName];
  if (byId) return byId;

  // 2) 이름(한글명)으로 매칭
  const byName = TEAM_BY_NAME[teamName];
  if (byName) return byName;

  // 3) 느슨 매칭(공백 제거/대소문자 무시)
  const key = String(teamName).toLowerCase().replace(/\s+/g, '');
  const loose = TEAMS.find(
    (t) =>
      t.id?.toLowerCase().replace(/\s+/g, '') === key ||
      t.name?.toLowerCase().replace(/\s+/g, '') === key
  );
  if (loose) return loose;

  // 4) 실패 시 원본 텍스트만 표시
  return { id: null, name: teamName, logo: null, region: null, division: null };
}

// 🔹 region + division을 조합해 "서울 / 1부" 형식으로 변환
function getRegionDisplay(team) {
  if (!team || !team.region) return 'N/A';
  const regionKR = REGION_KR[team.region] ?? team.region;
  return team.division ? `${regionKR} / ${team.division}` : regionKR;
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [careerPosition, setCareerPosition] = useState('');
  const [seasonPosition, setSeasonPosition] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);

        // 1) 토큰 가져오기
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          // mock 데이터 사용 (개발용)
          const mockData = await fetchProfileDataFromBackend();
          setProfileData(mockData);
          setCareerPosition(mockData.position);
          setSeasonPosition(mockData.position);
          setIsLoading(false);
          return;
        }

        // 2) 백엔드에서 프로필 요청
        const response = await myProfile(token);
        console.log("백엔드에서 받은 프로필:", response);
        
        // 3) 응답 데이터 처리
        const data = response.data || response;
        
        // 4) 필수 필드 맵핑
        const profileInfo = {
          profileImage: data.profileImage || data.avatar || 'https://via.placeholder.com/250x300',
          fullName: data.fullName || data.playerID || data.name || '이름 없음',
          email: data.email || 'email@example.com',
          address1: data.address1 || data.address || '',
          address2: data.address2 || '',
          height: data.height || '',
          weight: data.weight || '',
          position: data.position || 'QB',
          age: data.age || '',
          career: data.career || '',
          region: data.region || data.league || '',
          team: data.team || data.teamName || ''
        };

        // 5) 상태 저장
        setProfileData(profileInfo);
        setCareerPosition(profileInfo.position);
        setSeasonPosition(profileInfo.position);

      } catch (error) {
        console.error("프로필 불러오기 오류:", error);
        // 오류 시 mock 데이터 사용
        const mockData = await fetchProfileDataFromBackend();
        setProfileData(mockData);
        setCareerPosition(mockData.position);
        setSeasonPosition(mockData.position);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (isLoading) return <div className="loading-message">프로필 정보를 불러오는 중입니다...</div>;
  if (!profileData) return <div className="error-message">프로필 정보를 찾을 수 없습니다.</div>;

  const selectedTeam = resolveTeamDisplay(profileData.teamName);
  const regionDisplay = getRegionDisplay(selectedTeam);

  const displayName =
    profileData.realName || profileData.playerID || profileData.username || '';

  const displayPositions = Array.isArray(profileData.position)
    ? profileData.position.join(' / ')
    : profileData.position || '';

  const availablePositions = Object.keys(POSITION_STATS_CONFIG);

  // 🚩 국적 정보 변환
  const nationalityAlpha3 = profileData.nationality || 'KOR'; // 기본값 KOR
  const nationalityAlpha2 = toAlpha2(nationalityAlpha3);
  const nationalityNameKo = getCountryNameKo(nationalityAlpha3);

  const renderStatsTable = (pos) => (
    <div className="no-data">스탯 연동 준비 중입니다.</div>
  );

  return (
    <div className="profile-main">
      <div className="profile-container">
        <div className="profile-title-container">
          <h1 className="profile-title">내 프로필</h1>
        </div>

        <div className="profile-content">
          <div className="profile-image-modify">
            <div className="profile-image-section">
              {profileData.profileImage ? (
                <img src={profileData.profileImage} alt="Profile" className="profile-image" />
              ) : (
                <div className="profile-placeholder-text" />
              )}
            </div>
          </div>

          <div className="profile-info-section">
            <div className="profile-info-grid">
              <div className="profile-form-group">
                <label>이름</label>
                <p className="profile-info-text">{displayName}</p>
              </div>
              <div className="profile-form-group">
                <label>이메일</label>
                <p className="profile-info-text">{profileData.email}</p>
              </div>
              <div className="profile-form-group">
                <label>전화</label>
                <p className="profile-info-text">{profileData.phone}</p>
              </div>
              
              {/* 🇰🇷 국적 표시 수정 부분 */}
              <div className="profile-form-group">
                <label>국적</label>
                <p className="profile-info-text">
                  <span className="profile-nationality-display">
                    {nationalityAlpha2 && (
                      <CountryFlag
                        svg
                        countryCode={nationalityAlpha2}
                        style={{ width: '20px', height: '15px' }}
                      />
                    )}
                    <span>{nationalityNameKo}</span>
                  </span>
                </p>
              </div>
              {/* --------------------------- */}

              <div className="profile-form-group full-width">
                <label>주소</label>
                <p className="profile-info-text">{profileData.address}</p>
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
                <p className="profile-info-text">{displayPositions}</p>
              </div>

              {/* ✅ 지역 표시 개선 */}
              <div className="profile-form-group">
                <label>지역 / 리그</label>
                <p className="profile-info-text">{regionDisplay}</p>
              </div>

              <div className="profile-form-group">
                <label>팀</label>
                <div className="profile-team-display">
                  {selectedTeam.logo && (
                    <img src={selectedTeam.logo} alt={selectedTeam.name} className="profile-team-icon" />
                  )}
                  <p>{selectedTeam.name}</p>
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
          <select className="dropdown" value={careerPosition} onChange={(e) => setCareerPosition(e.target.value)}>
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
          <select className="dropdown" value={seasonPosition} onChange={(e) => setSeasonPosition(e.target.value)}>
            {availablePositions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>
        {renderStatsTable(seasonPosition)}
      </div>

      <div className="profile-container">
        <div className="profile-title-container">
          <h1 className="profile-title">경기별 스탯</h1>
        </div>
      </div>
    </div>
  );
}