// 팀별 리그 및 부 정보
export const TEAM_DIVISIONS = {
  // 서울리그 1부
  '연세대학교': { region: 'Seoul', division: '1부' },
  '서울대학교': { region: 'Seoul', division: '1부' },
  '한양대학교': { region: 'Seoul', division: '1부' },
  '국민대학교': { region: 'Seoul', division: '1부' },
  '서울시립대학교': { region: 'Seoul', division: '1부' },
  '한국외국어대학교': { region: 'Seoul', division: '1부' },
  '건국대학교': { region: 'Seoul', division: '1부' },
  '홍익대학교': { region: 'Seoul', division: '1부' },
  
  // 서울리그 2부
  '고려대학교': { region: 'Seoul', division: '2부' },
  '동국대학교': { region: 'Seoul', division: '2부' },
  '숭실대학교': { region: 'Seoul', division: '2부' },
  '중앙대학교': { region: 'Seoul', division: '2부' },
  '경희대학교': { region: 'Seoul', division: '2부' },
  '서강대학교': { region: 'Seoul', division: '2부' },
  
  // 경기강원리그 1부
  '성균관대학교': { region: 'Gyeonggi-Gangwon', division: '1부' },
  '강원대학교': { region: 'Gyeonggi-Gangwon', division: '1부' },
  '단국대학교': { region: 'Gyeonggi-Gangwon', division: '1부' },
  '인하대학교': { region: 'Gyeonggi-Gangwon', division: '1부' },
  
  // 경기강원리그 2부
  '용인대학교': { region: 'Gyeonggi-Gangwon', division: '2부' },
  '한림대학교': { region: 'Gyeonggi-Gangwon', division: '2부' },
  '한신대학교': { region: 'Gyeonggi-Gangwon', division: '2부' },
  '카이스트': { region: 'Gyeonggi-Gangwon', division: '2부' },
  
  // 대구경북리그 1부
  '경북대학교': { region: 'Daegu-Gyeongbuk', division: '1부' },
  '경일대학교': { region: 'Daegu-Gyeongbuk', division: '1부' },
  '대구가톨릭대학교': { region: 'Daegu-Gyeongbuk', division: '1부' },
  '대구한의대학교': { region: 'Daegu-Gyeongbuk', division: '1부' },
  '한동대학교': { region: 'Daegu-Gyeongbuk', division: '1부' },
  
  // 대구경북리그 2부
  '계명대학교': { region: 'Daegu-Gyeongbuk', division: '2부' },
  '금오공과대학교': { region: 'Daegu-Gyeongbuk', division: '2부' },
  '대구대학교': { region: 'Daegu-Gyeongbuk', division: '2부' },
  '동국대학교(경주)': { region: 'Daegu-Gyeongbuk', division: '2부' },
  '영남대학교': { region: 'Daegu-Gyeongbuk', division: '2부' },
  
  // 부산경남리그 1부
  '경성대학교': { region: 'Busan-Gyeongnam', division: '1부' },
  '동의대학교': { region: 'Busan-Gyeongnam', division: '1부' },
  '동아대학교': { region: 'Busan-Gyeongnam', division: '1부' },
  '울산대학교': { region: 'Busan-Gyeongnam', division: '1부' },
  
  // 부산경남리그 2부
  '부산대학교': { region: 'Busan-Gyeongnam', division: '2부' },
  '한국해양대학교': { region: 'Busan-Gyeongnam', division: '2부' },
  '신라대학교': { region: 'Busan-Gyeongnam', division: '2부' },
  '동서대학교': { region: 'Busan-Gyeongnam', division: '2부' },
  '부산외국어대학교': { region: 'Busan-Gyeongnam', division: '2부' }
};

// 리전별로 팀 목록 조회 함수
export function getTeamsByRegion(region) {
  return Object.entries(TEAM_DIVISIONS)
    .filter(([team, info]) => info.region === region)
    .map(([team, info]) => ({ team, ...info }));
}

// 부별로 팀 목록 조회 함수
export function getTeamsByRegionAndDivision(region, division) {
  return Object.entries(TEAM_DIVISIONS)
    .filter(([team, info]) => info.region === region && info.division === division)
    .map(([team, info]) => team);
}

// 특정 팀의 리그 정보 조회 함수
export function getTeamInfo(teamName) {
  return TEAM_DIVISIONS[teamName] || null;
}