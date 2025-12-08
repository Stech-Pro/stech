// 협회 스탯 데이터를 리그/부별로 분류하는 유틸리티

import { TEAM_DIVISIONS } from '../data/TEAM_DIVISIONS.js';

/**
 * 협회 스탯 데이터를 리그/부별로 분류
 * @param {Array} playerData - 협회에서 받은 선수 데이터 배열
 * @param {function} extractTeamName - 팀명을 추출하는 함수 (데이터 형식에 따라 다름)
 * @returns {Object} 리그/부별로 분류된 데이터
 */
export function classifyPlayersByLeague(playerData, extractTeamName) {
  const result = {
    'Seoul': { '1부': [], '2부': [] },
    'Gyeonggi-Gangwon': { '1부': [], '2부': [] },
    'Daegu-Gyeongbuk': { '1부': [], '2부': [] },
    'Busan-Gyeongnam': { '1부': [], '2부': [] },
    'Unknown': [] // 팀을 찾을 수 없는 경우
  };

  playerData.forEach(player => {
    const teamName = extractTeamName(player);
    const teamInfo = TEAM_DIVISIONS[teamName];
    
    if (teamInfo) {
      const { region, division } = teamInfo;
      result[region][division].push({
        ...player,
        teamName,
        region,
        division
      });
    } else {
      result.Unknown.push({
        ...player,
        teamName,
        error: 'Team not found in TEAM_DIVISIONS'
      });
    }
  });

  return result;
}

/**
 * 분류된 결과를 보기 좋게 출력하는 함수
 * @param {Object} classifiedData - classifyPlayersByLeague의 결과
 * @returns {string} 포맷된 문자열
 */
export function formatClassificationResult(classifiedData) {
  let output = '';
  
  const regionNames = {
    'Seoul': '서울리그',
    'Gyeonggi-Gangwon': '경기강원리그', 
    'Daegu-Gyeongbuk': '대구경북리그',
    'Busan-Gyeongnam': '부산경남리그'
  };

  let totalCount = 0;

  Object.entries(regionNames).forEach(([regionKey, regionName]) => {
    const regionData = classifiedData[regionKey];
    const firstDivision = regionData['1부'] || [];
    const secondDivision = regionData['2부'] || [];
    
    if (firstDivision.length > 0 || secondDivision.length > 0) {
      output += `\n## ${regionName}\n`;
      
      if (firstDivision.length > 0) {
        output += `### 1부 (${firstDivision.length}명)\n`;
        firstDivision.forEach((player, index) => {
          output += `${index + 1}. ${player.name || player.playerName || '이름미상'} (${player.teamName})\n`;
          totalCount++;
        });
      }
      
      if (secondDivision.length > 0) {
        output += `### 2부 (${secondDivision.length}명)\n`;
        secondDivision.forEach((player, index) => {
          output += `${index + 1}. ${player.name || player.playerName || '이름미상'} (${player.teamName})\n`;
          totalCount++;
        });
      }
    }
  });

  if (classifiedData.Unknown && classifiedData.Unknown.length > 0) {
    output += `\n## ⚠️ 분류 실패 (${classifiedData.Unknown.length}명)\n`;
    classifiedData.Unknown.forEach((player, index) => {
      output += `${index + 1}. ${player.name || player.playerName || '이름미상'} (${player.teamName}) - 팀 정보 없음\n`;
    });
  }

  output = `# 협회 데이터 분류 결과\n총 ${totalCount}명\n${output}`;
  
  return output;
}

/**
 * 필드골 데이터 전용 팀명 추출 함수
 * @param {Object} player - 필드골 선수 데이터
 * @returns {string} 팀명
 */
export function extractTeamNameFromFieldGoal(player) {
  // "한신대학교 01번 이찬유" 같은 형식에서 팀명만 추출
  if (player.fullName) {
    const match = player.fullName.match(/^(.+?)\s+\d+번/);
    return match ? match[1] : player.fullName.split(' ')[0];
  }
  return player.team || player.teamName || '';
}