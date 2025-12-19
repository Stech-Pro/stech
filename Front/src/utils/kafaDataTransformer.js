// /Users/yves/stech_1.0/Front/src/utils/kafaDataTransformer.js
import { TEAM_DIVISIONS } from '../data/TEAM_DIVISIONS';

// KAFA university 이름을 TEAMS의 팀명으로 매핑
const UNIVERSITY_TO_TEAM_NAME = {
  // 서울
  '연세대학교': '연세대 이글스',
  '서울대학교': '서울대 그린테러스',
  '한양대학교': '한양대 라이온스',
  '국민대학교': '국민대 레이저백스',
  '서울시립대학교': '서울시립대 시티혹스',
  '한국외국어대학교': '한국외대 블랙나이츠',
  '건국대학교': '건국대 레이징불스',
  '홍익대학교': '홍익대 카우보이스',
  '고려대학교': '고려대 타이거스',
  '동국대학교': '동국대 터스커스',
  '숭실대학교': '숭실대 크루세이더스',
  '중앙대학교': '중앙대 블루드래곤스',
  '경희대학교': '경희대 커맨더스',
  '서강대학교': '서강대 알바트로스',

  // 경기강원
  '성균관대학교': '성균관대 로얄스',
  '강원대학교': '강원대 카프라',
  '단국대학교': '단국대 코디악베어스',
  '용인대학교': '용인대 화이트타이거스',
  '인하대학교': '인하대 틸 드래곤스',
  '한림대학교': '한림대 피닉스',
  '한신대학교': '한신대 킬러웨일스',
  '카이스트': '카이스트 매버릭스',

  // 대구경북
  '경북대학교': '경북대 오렌지파이터스',
  '경일대학교': '경일대 블랙베어스',
  '계명대학교': '계명대 슈퍼라이온스',
  '금오공과대학교': '금오공과대 레이븐스',
  '대구가톨릭대학교': '대구가톨릭대 스커드엔젤스',
  '대구대학교': '대구대 플라잉타이거스',
  '대구한의대학교': '대구한의대 라이노스',
  '동국대학교(경주)': '동국대 화이트엘리펀츠',
  '영남대학교': '영남대 페가수스',
  '한동대학교': '한동대 홀리램스',

  // 부산경남
  '경성대학교': '경성대 드래곤스',
  '부산대학교': '부산대 이글스',
  '한국해양대학교': '한국해양대 바이킹스',
  '신라대학교': '신라대 데빌스',
  '부경대학교': '부경대 매드모비딕스',
  '동의대학교': '동의대 터틀파이터스',
  '동아대학교': '동아대 레오파즈',
  '동서대학교': '동서대 블루돌핀스',
  '부산외국어대학교': '부산외국어대 토네이도',
  '울산대학교': '울산대 유니콘스',

  // 사회인
  '군위 피닉스': '군위 피닉스',
  '부산 그리폰즈': '부산 그리폰즈',
  '삼성 블루스톰': '삼성 블루스톰',
  '서울 골든이글스': '서울 골든이글스',
  '서울 디펜더스': '서울 디펜더스',
  '서울 바이킹스': '서울 바이킹스',
  '인천 라이노스': '인천 라이노스',
};

// English region to Korean league mapping
export const REGION_ENGLISH_TO_KOREAN = {
  'Seoul': '서울',
  'Gyeonggi-Gangwon': '경기강원',
  'Daegu-Gyeongbuk': '대구경북',
  'Busan-Gyeongnam': '부산경남',
  'Amateur': '사회인',
};

// KAFA stat type to Korean stat type mapping
const KAFA_STAT_TYPE_TO_KOREAN = {
  'rushing': '런',
  'passing': '패스',
  'receiving': '리시빙',
  'fumbles': '펌블',
  'tackles': '태클',
  'interceptions': '인터셉션',
  'fieldgoals': '필드골',
  'kickoffs': '킥오프',
  'kickoffreturns': '킥 오프 리턴',
  'punting': '펀트',
  'puntreturns': '펀트 리턴',
};

/**
 * Transform KAFA data to StatPlayer format
 * @param {Object} kafaDataByStatType - Object with KAFA stat types as keys
 * @param {string} targetLeague - Korean league name ('서울', '경기강원', etc.)
 * @returns {Object} StatPlayer formatted data with first/second divisions
 */
export function transformKafaToStatPlayer(kafaDataByStatType, targetLeague) {
  // Special handling for 사회인 league (no divisions)
  if (targetLeague === '사회인') {
    return transformSocialLeague(kafaDataByStatType);
  }

  // For university leagues, organize by division
  return transformUniversityLeague(kafaDataByStatType, targetLeague);
}

/**
 * Transform data for university leagues (with divisions)
 */
function transformUniversityLeague(kafaDataByStatType, targetLeague) {
  const result = {
    first: {},
    second: {},
  };

  // For each KAFA stat type
  Object.entries(kafaDataByStatType).forEach(([kafaStatType, players]) => {
    const koreanStatType = KAFA_STAT_TYPE_TO_KOREAN[kafaStatType];

    if (!koreanStatType) {
      console.warn(`Unknown KAFA stat type: ${kafaStatType}`);
      return;
    }

    // Filter and group players by division for this league
    const { first, second } = groupPlayersByDivision(players, targetLeague, kafaStatType);

    // Only add if there are players
    if (first.length > 0) {
      if (!result.first[koreanStatType]) {
        result.first[koreanStatType] = [];
      }
      result.first[koreanStatType].push(...first);
    }
    if (second.length > 0) {
      if (!result.second[koreanStatType]) {
        result.second[koreanStatType] = [];
      }
      result.second[koreanStatType].push(...second);
    }
  });

  return result;
}

/**
 * Transform data for social league (no divisions)
 */
function transformSocialLeague(kafaDataByStatType) {
  const result = {};

  // Map KAFA stat types to Korean stat types
  Object.entries(kafaDataByStatType).forEach(([kafaStatType, players]) => {
    const koreanStatType = KAFA_STAT_TYPE_TO_KOREAN[kafaStatType];

    if (!koreanStatType) {
      console.warn(`Unknown KAFA stat type: ${kafaStatType}`);
      return;
    }

    // Filter players from social league and transform team names
    const socialPlayers = players
      .filter(player => {
        const universityName = player.university || player.team;
        const teamInfo = TEAM_DIVISIONS[universityName];
        return teamInfo?.region === 'Amateur';
      })
      .map(player => {
        const universityName = player.university || player.team;
        const teamName = UNIVERSITY_TO_TEAM_NAME[universityName] || universityName;

        // Map API fields to StatPosition fields
        const mappedFields = mapPlayerFields(player, kafaStatType);

        return {
          ...mappedFields,
          team: teamName,
        };
      });

    if (socialPlayers.length > 0) {
      if (!result[koreanStatType]) {
        result[koreanStatType] = [];
      }
      result[koreanStatType].push(...socialPlayers);
    }
  });

  return result;
}

/**
 * Map KAFA API field names to StatPosition field names
 */
function mapPlayerFields(player, kafaStatType) {
  const baseFields = {
    name: player.name || player.playerName || '이름 없음',
  };

  // Stat-specific field mappings (실제 KAFA JSON 필드에 맞춤)
  const fieldMappings = {
    'rushing': {
      rushingYards: player.rushingYards || 0,
      rushingAttempts: player.attempts || 0,
      yardsPerCarry: player.yardsPerAttempt || 0,
      rushingTouchdowns: player.touchdowns || 0,
      longestRush: player.longest || 0,
    },
    'passing': {
      passingYards: player.passingYards || 0,
      passingCompletions: player.completions || 0,
      passingAttempts: player.attempts || 0,
      avgYardsPerAttempt: player.passingYards && player.attempts
        ? Number((player.passingYards / player.attempts).toFixed(1))
        : 0,
      completionPercentage: player.completions && player.attempts
        ? Number(((player.completions / player.attempts) * 100).toFixed(1))
        : 0,
      passingTouchdowns: player.touchdowns || 0,
      interceptions: player.interceptions || 0,
      longestPass: player.longest || 0,
    },
    'receiving': {
      receptions: player.receptions || 0,
      receivingYards: player.receivingYards || 0,
      yardsPerReception: player.yardsPerReception || 0,
      receivingTouchdowns: player.touchdowns || 0,
      longestReception: player.longest || 0,
    },
    'fumbles': {
      fumbles: player.forcedFumbles || 0,
      fumblesLost: player.fumbleRecoveries || 0,
      fumbleTouchdowns: player.fumbleRecoveryTDs || 0, 
    },
    'tackles': {
      tackles: player.totalTackles || 0,
      sacks: player.sacks || 0,
      soloTackles: player.soloTackles || 0,
      assistTackles: player.assistTackles || 0,
    },
    'interceptions': {
      interceptions: player.interceptions || 0,
      interceptionTouchdowns: player.touchdowns || 0,
      interceptionYards: player.returnYards || 0,
      longestInterception: player.longest || 0,
    },
    'fieldgoals': {
      fieldGoalPercentage: player.percentage || 0,
      averageFieldGoalDistance: player.averageDistance || 0,
      fieldGoalsMade: player.fieldGoalsMade || 0,
      fieldGoalsAttempted: player.fieldGoalsAttempted || 0,
      fieldGoalYards: player.totalYards || 0,
      longestFieldGoal: player.longest || 0,
    },
    'kickoffs': {
      averageKickoffYards: player.averageDistance || 0,
      kickoffCount: player.kickoffs || 0,
      kickoffYards: player.yards || 0,
      kickoffTouchdowns: player.touchdowns || 0,
      longestKickoff: player.longest || 0,
    },
    'kickoffreturns': {
      averageKickReturnYards: player.average || 0,
      kickReturnCount: player.returns || 0,
      kickReturnYards: player.returnYards || 0,
      kickReturnTouchdowns: player.touchdowns || 0,
      longestKickReturn: player.longest || 0,
    },
    'punting': {
      averagePuntYards: player.average || 0,
      puntCount: player.punts || 0,
      puntYards: player.yards || 0,
      puntTouchdowns: player.touchdowns || 0,
      longestPunt: player.longest || 0,
    },
    'puntreturns': {
      averagePuntReturnYards: player.average || 0,
      puntReturnCount: player.returns || 0,
      puntReturnYards: player.returnYards || 0,
      puntReturnTouchdowns: player.touchdowns || 0,
      longestPuntReturn: player.longest || 0,
    },
  };

  const mappedFields = fieldMappings[kafaStatType] || {};
  return { ...baseFields, ...mappedFields };
}

/**
 * Group players by division for a target league
 */
function groupPlayersByDivision(players, targetLeague, kafaStatType) {
  const first = [];
  const second = [];

  players.forEach(player => {
    const universityName = player.university || player.team;
    const teamInfo = TEAM_DIVISIONS[universityName];

    if (!teamInfo) {
      console.warn(`Unknown university/team: ${universityName}`);
      return;
    }

    const koreanLeague = REGION_ENGLISH_TO_KOREAN[teamInfo.region];

    // Only include if matches target league
    if (koreanLeague !== targetLeague) {
      return;
    }

    // Transform university name to team name
    const teamName = UNIVERSITY_TO_TEAM_NAME[universityName] || universityName;

    // Map API fields to StatPosition fields
    const mappedFields = mapPlayerFields(player, kafaStatType);

    const transformedPlayer = {
      ...mappedFields,
      team: teamName,
    };

    // Add to appropriate division
    if (teamInfo.division === '1부') {
      first.push(transformedPlayer);
    } else if (teamInfo.division === '2부') {
      second.push(transformedPlayer);
    }
  });

  console.log(`🔍 groupPlayersByDivision - ${targetLeague} 1부: ${first.length}명, 2부: ${second.length}명`);
  if (first.length > 0) {
    console.log('🔍 샘플 데이터 (1부):', first[0]);
  }

  return { first, second };
}
