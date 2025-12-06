const http = require('http');
const fs = require('fs');

// TEAMS.js mapping (imported manually for node script)
const TEAMS = [
  // Seoul 1부
  { name: '연세대 이글스', region: 'Seoul', division: '1부' },
  { name: '서울대 그린테러스', region: 'Seoul', division: '1부' },
  { name: '한양대 라이온스', region: 'Seoul', division: '1부' },
  { name: '국민대 레이저백스', region: 'Seoul', division: '1부' },
  { name: '서울시립대 시티혹스', region: 'Seoul', division: '1부' },
  { name: '한국외대 블랙나이츠', region: 'Seoul', division: '1부' },
  { name: '건국대 레이징불스', region: 'Seoul', division: '1부' },
  { name: '홍익대 카우보이스', region: 'Seoul', division: '1부' },
  // Seoul 2부
  { name: '고려대 타이거스', region: 'Seoul', division: '2부' },
  { name: '동국대 터스커스', region: 'Seoul', division: '2부' },
  { name: '숭실대 크루세이더스', region: 'Seoul', division: '2부' },
  { name: '중앙대 블루드래곤스', region: 'Seoul', division: '2부' },
  { name: '경희대 커맨더스', region: 'Seoul', division: '2부' },
  { name: '서강대 알바트로스', region: 'Seoul', division: '2부' },
  
  // Gyeonggi-Gangwon 1부
  { name: '성균관대 로얄스', region: 'Gyeonggi-Gangwon', division: '1부' },
  { name: '강원대 카프라', region: 'Gyeonggi-Gangwon', division: '1부' },
  { name: '단국대 코디악베어스', region: 'Gyeonggi-Gangwon', division: '1부' },
  { name: '인하대 틸 드래곤스', region: 'Gyeonggi-Gangwon', division: '1부' },
  // Gyeonggi-Gangwon 2부
  { name: '용인대 화이트타이거스', region: 'Gyeonggi-Gangwon', division: '2부' },
  { name: '한림대 피닉스', region: 'Gyeonggi-Gangwon', division: '2부' },
  { name: '한신대 킬러웨일스', region: 'Gyeonggi-Gangwon', division: '2부' },
  { name: '카이스트 매버릭스', region: 'Gyeonggi-Gangwon', division: '2부' },

  // Daegu-Gyeongbuk 1부
  { name: '경북대 오렌지파이터스', region: 'Daegu-Gyeongbuk', division: '1부' },
  { name: '경일대 블랙베어스', region: 'Daegu-Gyeongbuk', division: '1부' },
  { name: '대구가톨릭대 스커드엔젤스', region: 'Daegu-Gyeongbuk', division: '1부' },
  { name: '대구한의대 라이노스', region: 'Daegu-Gyeongbuk', division: '1부' },
  { name: '한동대 홀리램스', region: 'Daegu-Gyeongbuk', division: '1부' },
  // Daegu-Gyeongbuk 2부
  { name: '계명대 슈퍼라이온스', region: 'Daegu-Gyeongbuk', division: '2부' },
  { name: '금오공과대 레이븐스', region: 'Daegu-Gyeongbuk', division: '2부' },
  { name: '대구대 플라잉타이거스', region: 'Daegu-Gyeongbuk', division: '2부' },
  { name: '동국대 화이트엘리펀츠', region: 'Daegu-Gyeongbuk', division: '2부' },
  { name: '영남대 페가수스', region: 'Daegu-Gyeongbuk', division: '2부' },

  // Busan-Gyeongnam 1부
  { name: '경성대 드래곤스', region: 'Busan-Gyeongnam', division: '1부' },
  { name: '동의대 터틀파이터스', region: 'Busan-Gyeongnam', division: '1부' },
  { name: '동아대 레오파즈', region: 'Busan-Gyeongnam', division: '1부' },
  { name: '울산대 유니콘스', region: 'Busan-Gyeongnam', division: '1부' },
  // Busan-Gyeongnam 2부
  { name: '부산대 이글스', region: 'Busan-Gyeongnam', division: '2부' },
  { name: '한국해양대 바이킹스', region: 'Busan-Gyeongnam', division: '2부' },
  { name: '신라대 데빌스', region: 'Busan-Gyeongnam', division: '2부' },
  { name: '부경대 매드모비딕스', region: 'Busan-Gyeongnam', division: '2부' },
  { name: '동서대 블루돌핀스', region: 'Busan-Gyeongnam', division: '2부' },
  { name: '부산외국어대 토네이도', region: 'Busan-Gyeongnam', division: '2부' },

  // Amateur
  { name: '군위 피닉스', region: 'Amateur', division: null },
  { name: '부산 그리폰즈', region: 'Amateur', division: null },
  { name: '삼성 블루스톰', region: 'Amateur', division: null },
  { name: '서울 골든이글스', region: 'Amateur', division: null },
  { name: '서울 디펜더스', region: 'Amateur', division: null },
  { name: '서울 바이킹스', region: 'Amateur', division: null },
  { name: '인천 라이노스', region: 'Amateur', division: null }
];

// Team name mapping for API names to our standard names
const teamNameMapping = {
  '연세대학교 EAGLES': '연세대 이글스',
  '서울대학교 GREEN TERRORS': '서울대 그린테러스',
  '한양대학교 LIONS': '한양대 라이온스',
  '건국대학교 RAGING BULLS': '건국대 레이징불스',
  '홍익대학교 COWBOYS': '홍익대 카우보이스',
  '서울시립대학교 CITY HAWKS': '서울시립대 시티혹스',
  '한국외국어대학교 BLACK KNIGHTS': '한국외대 블랙나이츠',
  '국민대학교 RAZORBACKS': '국민대 레이저백스',
  
  '고려대학교 TIGERS': '고려대 타이거스',
  '동국대학교 TUSKERS': '동국대 터스커스',
  '숭실대학교 CRUSADERS': '숭실대 크루세이더스',
  '중앙대학교 BLUE DRAGONS': '중앙대 블루드래곤스',
  '경희대학교 COMMANDERS': '경희대 커맨더스',
  '서강대학교 ALBATROSS': '서강대 알바트로스',
  
  '성균관대학교 ROYALS': '성균관대 로얄스',
  '강원대학교 CAPRA': '강원대 카프라',
  '단국대학교 KODIAK BEARS': '단국대 코디악베어스',
  '인하대학교 TEAL DRAGONS': '인하대 틸 드래곤스',
  '용인대학교 WHITE TIGERS': '용인대 화이트타이거스',
  '한림대학교 PHOENIX': '한림대 피닉스',
  '한신대학교 KILLER WHALES': '한신대 킬러웨일스',
  'KAIST MAVERICKS': '카이스트 매버릭스',
  
  '경북대학교 ORANGE FIGHTERS': '경북대 오렌지파이터스',
  '경일대학교 BLACK BEARS': '경일대 블랙베어스',
  '대구가톨릭대학교 SCUD ANGELS': '대구가톨릭대 스커드엔젤스',
  '대구한의대학교 RHINOS': '대구한의대 라이노스',
  '한동대학교 HOLY RAMS': '한동대 홀리램스',
  '계명대학교 SUPER LIONS': '계명대 슈퍼라이온스',
  '금오공과대학교 RAVENS': '금오공과대 레이븐스',
  '대구대학교 FLYING TIGERS': '대구대 플라잉타이거스',
  '동국대학교(경주) WHITE ELEPHANTS': '동국대 화이트엘리펀츠',
  '영남대학교 PEGASUS': '영남대 페가수스',
  
  '경성대학교 DRAGONS': '경성대 드래곤스',
  '동의대학교 TURTLE FIGHTERS': '동의대 터틀파이터스',
  '동아대학교 LEOPARDS': '동아대 레오파즈',
  '울산대학교 UNICORNS': '울산대 유니콘스',
  '부산대학교 EAGLES': '부산대 이글스',
  '한국해양대학교 VIKINGS': '한국해양대 바이킹스',
  '신라대학교 DEVILS': '신라대 데빌스',
  '부경대학교 MAD MOBY DICKS': '부경대 매드모비딕스',
  '동서대학교 BLUE DOLPHINS': '동서대 블루돌핀스',
  '부산외국어대학교 TORNADO': '부산외국어대 토네이도'
};

function findTeamMapping(apiTeamName) {
  // Direct mapping first
  if (teamNameMapping[apiTeamName]) {
    const mappedName = teamNameMapping[apiTeamName];
    return TEAMS.find(team => team.name === mappedName);
  }
  
  // Fuzzy matching for teams not in direct mapping
  for (const team of TEAMS) {
    if (apiTeamName.includes(team.name.split(' ')[0])) {
      return team;
    }
  }
  
  return null;
}

function categorizeTeams(apiData) {
  const result = {
    Seoul: { '1부': [], '2부': [] },
    'Gyeonggi-Gangwon': { '1부': [], '2부': [] },
    'Daegu-Gyeongbuk': { '1부': [], '2부': [] },
    'Busan-Gyeongnam': { '1부': [], '2부': [] },
    Amateur: []
  };
  
  // Get team stats from different categories
  const offenseTeams = apiData.data.university.team.offense.rushing || [];
  const defenseTeams = apiData.data.university.team.defense.tackles || [];
  const specialTeams = apiData.data.university.team.special.kicking || [];
  const socialTeams = apiData.data.social?.team?.offense?.rushing || [];
  
  console.log('=== Categorizing University Teams ===');
  
  // Process university teams
  const allUniversityTeams = [...offenseTeams];
  
  for (const apiTeam of allUniversityTeams) {
    const mapping = findTeamMapping(apiTeam.teamName);
    
    if (mapping) {
      const stats = {
        teamName: mapping.name,
        // Will be filled with actual stats later
        offense: {},
        defense: {},
        special: {}
      };
      
      if (mapping.region === 'Amateur') {
        result.Amateur.push(stats);
      } else {
        result[mapping.region][mapping.division].push(stats);
      }
      
      console.log(`✓ ${apiTeam.teamName} → ${mapping.name} (${mapping.region} ${mapping.division || ''})`);
    } else {
      console.log(`✗ 매핑되지 않음: ${apiTeam.teamName}`);
    }
  }
  
  console.log('\n=== Categorizing Social Teams ===');
  
  // Process social teams
  for (const socialTeam of socialTeams) {
    console.log(`Social team: ${socialTeam.teamName}`);
    result.Amateur.push({
      teamName: socialTeam.teamName,
      offense: {},
      defense: {},
      special: {}
    });
  }
  
  return result;
}

// Fetch API data
const url = 'http://localhost:4000/api/kafa-stats/all-stats';

const req = http.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const apiResult = JSON.parse(data);
      const categorizedData = categorizeTeams(apiResult);
      
      console.log('\n=== 분류 결과 ===');
      
      Object.entries(categorizedData).forEach(([league, divisions]) => {
        console.log(`\n${league}:`);
        if (league === 'Amateur') {
          console.log(`  ${divisions.length}개 팀`);
          divisions.forEach(team => console.log(`    - ${team.teamName}`));
        } else {
          Object.entries(divisions).forEach(([division, teams]) => {
            console.log(`  ${division}: ${teams.length}개 팀`);
            teams.forEach(team => console.log(`    - ${team.teamName}`));
          });
        }
      });
      
      // Save categorized structure for reference
      fs.writeFileSync('/Users/kenlee/Projects/stech_fresh4/Front/categorized_teams_structure.json', 
        JSON.stringify(categorizedData, null, 2));
      
      console.log('\n분류된 데이터 구조가 categorized_teams_structure.json에 저장되었습니다.');
      
    } catch (error) {
      console.error('Error parsing API response:', error);
    }
  });
});

req.on('error', (error) => {
  console.error('Error fetching data:', error);
});