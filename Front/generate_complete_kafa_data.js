const http = require('http');
const fs = require('fs');

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
  '국민대학교 Razorbacks': '국민대 레이저백스',
  
  '고려대학교 TIGERS': '고려대 타이거스',
  '동국대학교 TUSKERS': '동국대 터스커스',
  '숭실대학교 CRUSADERS': '숭실대 크루세이더스',
  '중앙대학교 BLUE DRAGONS': '중앙대 블루드래곤스',
  '경희대학교 COMMANDERS': '경희대 커맨더스',
  '경희대학교 Commanders': '경희대 커맨더스',
  '서강대학교 ALBATROSS': '서강대 알바트로스',
  
  '성균관대학교 ROYALS': '성균관대 로얄스',
  '강원대학교 CAPRA': '강원대 카프라',
  '단국대학교 KODIAK BEARS': '단국대 코디악베어스',
  '인하대학교 TEAL DRAGONS': '인하대 틸 드래곤스',
  '인하대학교 Teal Dragons': '인하대 틸 드래곤스',
  '용인대학교 WHITE TIGERS': '용인대 화이트타이거스',
  '한림대학교 PHOENIX': '한림대 피닉스',
  '한신대학교 KILLER WHALES': '한신대 킬러웨일스',
  '한신대학교 Killer Whales': '한신대 킬러웨일스',
  'KAIST MAVERICKS': '카이스트 매버릭스',
  '카이스트 Mavericks': '카이스트 매버릭스',
  
  '경북대학교 ORANGE FIGHTERS': '경북대 오렌지파이터스',
  '경일대학교 BLACK BEARS': '경일대 블랙베어스',
  '대구가톨릭대학교 SCUD ANGELS': '대구가톨릭대 스커드엔젤스',
  '대구가톨릭대학교 Scud Angels': '대구가톨릭대 스커드엔젤스',
  '대구한의대학교 RHINOS': '대구한의대 라이노스',
  '대구한의대학교 Rhinos': '대구한의대 라이노스',
  '한동대학교 HOLY RAMS': '한동대 홀리램스',
  '한동대학교 Holy Rams': '한동대 홀리램스',
  '계명대학교 SUPER LIONS': '계명대 슈퍼라이온스',
  '금오공과대학교 RAVENS': '금오공과대 레이븐스',
  '대구대학교 FLYING TIGERS': '대구대 플라잉타이거스',
  '대구대학교 Flying Tigers': '대구대 플라잉타이거스',
  '동국대학교(경주) WHITE ELEPHANTS': '동국대 화이트엘리펀츠',
  '동국대학교 White Elephants': '동국대 화이트엘리펀츠',
  '영남대학교 PEGASUS': '영남대 페가수스',
  
  '경성대학교 DRAGONS': '경성대 드래곤스',
  '경성대학교 Dragons': '경성대 드래곤스',
  '동의대학교 TURTLE FIGHTERS': '동의대 터틀파이터스',
  '동의대학교 Turtle Fighters': '동의대 터틀파이터스',
  '동아대학교 LEOPARDS': '동아대 레오파즈',
  '동아대학교 LEOPARD': '동아대 레오파즈',
  '울산대학교 UNICORNS': '울산대 유니콘스',
  '울산대학교 Unicorns': '울산대 유니콘스',
  '부산대학교 EAGLES': '부산대 이글스',
  '부산대학교 Eagles': '부산대 이글스',
  '한국해양대학교 VIKINGS': '한국해양대 바이킹스',
  '한국해양대학교 Vikings': '한국해양대 바이킹스',
  '신라대학교 DEVILS': '신라대 데빌스',
  '신라대학교 Devils': '신라대 데빌스',
  '부경대학교 MAD MOBY DICKS': '부경대 매드모비딕스',
  '동서대학교 BLUE DOLPHINS': '동서대 블루돌핀스',
  '동서대학교 Blue Dolphins': '동서대 블루돌핀스',
  '부산외국어대학교 TORNADO': '부산외국어대 토네이도'
};

// Regional team mapping
const regionalMapping = {
  // Seoul 1부
  '연세대 이글스': { region: 'Seoul', division: '1부' },
  '서울대 그린테러스': { region: 'Seoul', division: '1부' },
  '한양대 라이온스': { region: 'Seoul', division: '1부' },
  '국민대 레이저백스': { region: 'Seoul', division: '1부' },
  '서울시립대 시티혹스': { region: 'Seoul', division: '1부' },
  '한국외대 블랙나이츠': { region: 'Seoul', division: '1부' },
  '건국대 레이징불스': { region: 'Seoul', division: '1부' },
  '홍익대 카우보이스': { region: 'Seoul', division: '1부' },
  
  // Seoul 2부
  '고려대 타이거스': { region: 'Seoul', division: '2부' },
  '동국대 터스커스': { region: 'Seoul', division: '2부' },
  '숭실대 크루세이더스': { region: 'Seoul', division: '2부' },
  '중앙대 블루드래곤스': { region: 'Seoul', division: '2부' },
  '경희대 커맨더스': { region: 'Seoul', division: '2부' },
  '서강대 알바트로스': { region: 'Seoul', division: '2부' },
  
  // Gyeonggi-Gangwon 1부
  '성균관대 로얄스': { region: 'Gyeonggi-Gangwon', division: '1부' },
  '강원대 카프라': { region: 'Gyeonggi-Gangwon', division: '1부' },
  '단국대 코디악베어스': { region: 'Gyeonggi-Gangwon', division: '1부' },
  '인하대 틸 드래곤스': { region: 'Gyeonggi-Gangwon', division: '1부' },
  
  // Gyeonggi-Gangwon 2부
  '용인대 화이트타이거스': { region: 'Gyeonggi-Gangwon', division: '2부' },
  '한림대 피닉스': { region: 'Gyeonggi-Gangwon', division: '2부' },
  '한신대 킬러웨일스': { region: 'Gyeonggi-Gangwon', division: '2부' },
  '카이스트 매버릭스': { region: 'Gyeonggi-Gangwon', division: '2부' },

  // Daegu-Gyeongbuk 1부
  '경북대 오렌지파이터스': { region: 'Daegu-Gyeongbuk', division: '1부' },
  '경일대 블랙베어스': { region: 'Daegu-Gyeongbuk', division: '1부' },
  '대구가톨릭대 스커드엔젤스': { region: 'Daegu-Gyeongbuk', division: '1부' },
  '대구한의대 라이노스': { region: 'Daegu-Gyeongbuk', division: '1부' },
  '한동대 홀리램스': { region: 'Daegu-Gyeongbuk', division: '1부' },
  
  // Daegu-Gyeongbuk 2부
  '계명대 슈퍼라이온스': { region: 'Daegu-Gyeongbuk', division: '2부' },
  '금오공과대 레이븐스': { region: 'Daegu-Gyeongbuk', division: '2부' },
  '대구대 플라잉타이거스': { region: 'Daegu-Gyeongbuk', division: '2부' },
  '동국대 화이트엘리펀츠': { region: 'Daegu-Gyeongbuk', division: '2부' },
  '영남대 페가수스': { region: 'Daegu-Gyeongbuk', division: '2부' },

  // Busan-Gyeongnam 1부
  '경성대 드래곤스': { region: 'Busan-Gyeongnam', division: '1부' },
  '동의대 터틀파이터스': { region: 'Busan-Gyeongnam', division: '1부' },
  '동아대 레오파즈': { region: 'Busan-Gyeongnam', division: '1부' },
  '울산대 유니콘스': { region: 'Busan-Gyeongnam', division: '1부' },
  
  // Busan-Gyeongnam 2부  
  '부산대 이글스': { region: 'Busan-Gyeongnam', division: '2부' },
  '한국해양대 바이킹스': { region: 'Busan-Gyeongnam', division: '2부' },
  '신라대 데빌스': { region: 'Busan-Gyeongnam', division: '2부' },
  '부경대 매드모비딕스': { region: 'Busan-Gyeongnam', division: '2부' },
  '동서대 블루돌핀스': { region: 'Busan-Gyeongnam', division: '2부' },
  '부산외국어대 토네이도': { region: 'Busan-Gyeongnam', division: '2부' }
};

function normalizeTeamName(apiTeamName) {
  return teamNameMapping[apiTeamName] || apiTeamName;
}

function findStatsForTeam(teamName, statsData) {
  if (!statsData || !Array.isArray(statsData)) {
    return null;
  }
  const normalizedName = normalizeTeamName(teamName);
  return statsData.find(team => normalizeTeamName(team.teamName) === normalizedName) || null;
}

function generateKafaStyleData(apiData) {
  const result = {
    Seoul: { 
      '1부': { offense: { rushing: [], passing: [], receiving: [] }, defense: [], special: { kicking: [], kickoff: [], kickoffReturn: [], punt: [], puntReturn: [] } },
      '2부': { offense: { rushing: [], passing: [], receiving: [] }, defense: [], special: { kicking: [], kickoff: [], kickoffReturn: [], punt: [], puntReturn: [] } }
    },
    'Gyeonggi-Gangwon': { 
      '1부': { offense: { rushing: [], passing: [], receiving: [] }, defense: [], special: { kicking: [], kickoff: [], kickoffReturn: [], punt: [], puntReturn: [] } },
      '2부': { offense: { rushing: [], passing: [], receiving: [] }, defense: [], special: { kicking: [], kickoff: [], kickoffReturn: [], punt: [], puntReturn: [] } }
    },
    'Daegu-Gyeongbuk': { 
      '1부': { offense: { rushing: [], passing: [], receiving: [] }, defense: [], special: { kicking: [], kickoff: [], kickoffReturn: [], punt: [], puntReturn: [] } },
      '2부': { offense: { rushing: [], passing: [], receiving: [] }, defense: [], special: { kicking: [], kickoff: [], kickoffReturn: [], punt: [], puntReturn: [] } }
    },
    'Busan-Gyeongnam': { 
      '1부': { offense: { rushing: [], passing: [], receiving: [] }, defense: [], special: { kicking: [], kickoff: [], kickoffReturn: [], punt: [], puntReturn: [] } },
      '2부': { offense: { rushing: [], passing: [], receiving: [] }, defense: [], special: { kicking: [], kickoff: [], kickoffReturn: [], punt: [], puntReturn: [] } }
    },
    Amateur: { offense: { rushing: [], passing: [], receiving: [] }, defense: [], special: { kicking: [], kickoff: [], kickoffReturn: [], punt: [], puntReturn: [] } }
  };
  
  const universityData = apiData.data.university.team;
  const socialData = apiData.data.social.team;
  
  // Process university teams
  const processedTeams = new Set();
  
  // Process offense stats
  universityData.offense.rushing.forEach(team => {
    const normalizedName = normalizeTeamName(team.teamName);
    const mapping = regionalMapping[normalizedName];
    
    if (mapping && !processedTeams.has(normalizedName)) {
      processedTeams.add(normalizedName);
      
      // Find all stats for this team
      const rushingStats = team;
      const passingStats = findStatsForTeam(team.teamName, universityData.offense.passing);
      const receivingStats = findStatsForTeam(team.teamName, universityData.offense.receiving);
      const defenseStats = findStatsForTeam(team.teamName, universityData.defense.tackles);
      const kickingStats = findStatsForTeam(team.teamName, universityData.special.kicking);
      const kickoffStats = findStatsForTeam(team.teamName, universityData.special.kickoff);
      const kickoffReturnStats = findStatsForTeam(team.teamName, universityData.special.kickoffReturn);
      const puntStats = findStatsForTeam(team.teamName, universityData.special.punting);
      const puntReturnStats = findStatsForTeam(team.teamName, universityData.special.puntReturn);
      
      const targetRegion = result[mapping.region][mapping.division];
      
      if (rushingStats) {
        targetRegion.offense.rushing.push({
          ...rushingStats,
          teamName: normalizedName
        });
      }
      
      if (passingStats) {
        targetRegion.offense.passing.push({
          ...passingStats,
          teamName: normalizedName
        });
      }
      
      if (receivingStats) {
        targetRegion.offense.receiving.push({
          ...receivingStats,
          teamName: normalizedName
        });
      }
      
      if (defenseStats) {
        targetRegion.defense.push({
          ...defenseStats,
          teamName: normalizedName
        });
      }
      
      if (kickingStats) {
        targetRegion.special.kicking.push({
          ...kickingStats,
          teamName: normalizedName
        });
      }
      
      if (kickoffStats) {
        targetRegion.special.kickoff.push({
          ...kickoffStats,
          teamName: normalizedName
        });
      }
      
      if (kickoffReturnStats) {
        targetRegion.special.kickoffReturn.push({
          ...kickoffReturnStats,
          teamName: normalizedName
        });
      }
      
      if (puntStats) {
        targetRegion.special.punt.push({
          ...puntStats,
          teamName: normalizedName
        });
      }
      
      if (puntReturnStats) {
        targetRegion.special.puntReturn.push({
          ...puntReturnStats,
          teamName: normalizedName
        });
      }
    }
  });
  
  // Process social teams
  if (socialData) {
    socialData.offense.rushing.forEach(team => {
      const rushingStats = team;
      const passingStats = findStatsForTeam(team.teamName, socialData.offense.passing);
      const receivingStats = findStatsForTeam(team.teamName, socialData.offense.receiving);
      const defenseStats = findStatsForTeam(team.teamName, socialData.defense.tackles);
      const kickingStats = findStatsForTeam(team.teamName, socialData.special.kicking);
      const kickoffStats = findStatsForTeam(team.teamName, socialData.special.kickoff);
      const kickoffReturnStats = findStatsForTeam(team.teamName, socialData.special.kickoffReturn);
      const puntStats = findStatsForTeam(team.teamName, socialData.special.punting);
      const puntReturnStats = findStatsForTeam(team.teamName, socialData.special.puntReturn);
      
      if (rushingStats) {
        result.Amateur.offense.rushing.push(rushingStats);
      }
      
      if (passingStats) {
        result.Amateur.offense.passing.push(passingStats);
      }
      
      if (receivingStats) {
        result.Amateur.offense.receiving.push(receivingStats);
      }
      
      if (defenseStats) {
        result.Amateur.defense.push(defenseStats);
      }
      
      if (kickingStats) {
        result.Amateur.special.kicking.push(kickingStats);
      }
      
      if (kickoffStats) {
        result.Amateur.special.kickoff.push(kickoffStats);
      }
      
      if (kickoffReturnStats) {
        result.Amateur.special.kickoffReturn.push(kickoffReturnStats);
      }
      
      if (puntStats) {
        result.Amateur.special.punt.push(puntStats);
      }
      
      if (puntReturnStats) {
        result.Amateur.special.puntReturn.push(puntReturnStats);
      }
    });
  }
  
  return result;
}

// Fetch API data and generate complete kafaStyleData
const url = 'http://localhost:4000/api/kafa-stats/all-stats';

const req = http.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const apiResult = JSON.parse(data);
      const kafaStyleData = generateKafaStyleData(apiResult);
      
      console.log('=== Generated KAFA Style Data Structure ===');
      
      Object.entries(kafaStyleData).forEach(([league, divisions]) => {
        console.log(`\n${league}:`);
        if (league === 'Amateur') {
          console.log(`  오펜스 러싱: ${divisions.offense.rushing.length}개 팀`);
          console.log(`  디펜스: ${divisions.defense.length}개 팀`);
          console.log(`  스페셜팀 킥킹: ${divisions.special.kicking.length}개 팀`);
        } else {
          Object.entries(divisions).forEach(([division, stats]) => {
            console.log(`  ${division}:`);
            console.log(`    오펜스 러싱: ${stats.offense.rushing.length}개 팀`);
            console.log(`    디펜스: ${stats.defense.length}개 팀`);  
            console.log(`    스페셜팀 킥킹: ${stats.special.kicking.length}개 팀`);
          });
        }
      });
      
      // Generate the exact format for StatTeam_fixed.js
      const formattedOutput = `export const kafaStyleData = ${JSON.stringify(kafaStyleData, null, 2)};`;
      
      // Save to file
      fs.writeFileSync('/Users/kenlee/Projects/stech_fresh4/Front/new_kafa_style_data.js', formattedOutput);
      
      console.log('\n✅ Complete kafaStyleData generated and saved to new_kafa_style_data.js');
      console.log('📋 Ready to replace the data in StatTeam_fixed.js');
      
    } catch (error) {
      console.error('Error parsing API response:', error);
    }
  });
});

req.on('error', (error) => {
  console.error('Error fetching data:', error);
});