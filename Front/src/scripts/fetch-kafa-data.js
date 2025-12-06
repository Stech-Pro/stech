const fs = require('fs');

// API 호출해서 KAFA 데이터 가져오기
async function fetchKafaData() {
  try {
    console.log('🚀 KAFA API 데이터 크롤링 시작...');
    
    const response = await fetch('http://localhost:4000/api/kafa-stats/all-stats');
    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('API 호출 실패');
    }
    
    console.log('✅ API 호출 성공');
    
    // 대학 팀 데이터 구조화
    const universityTeamData = {
      offense: {
        rushing: result.data.university.team.offense.rushing || [],
        passing: result.data.university.team.offense.passing || [],
        receiving: result.data.university.team.offense.receiving || []
      },
      defense: {
        tackles: result.data.university.team.defense.tackles || [],
        interceptions: result.data.university.team.defense.interceptions || []
      },
      special: {
        kicking: result.data.university.team.special.kicking || [],
        kickoff: result.data.university.team.special.kickoff || [],
        kickoffReturn: result.data.university.team.special.kickoffReturn || [],
        punting: result.data.university.team.special.punting || [],
        puntReturn: result.data.university.team.special.puntReturn || []
      }
    };
    
    // 사회인 팀 데이터 구조화
    const socialTeamData = {
      offense: {
        rushing: result.data.social.team.offense.rushing || [],
        passing: result.data.social.team.offense.passing || [],
        receiving: result.data.social.team.offense.receiving || []
      },
      defense: {
        tackles: result.data.social.team.defense.tackles || [],
        interceptions: result.data.social.team.defense.interceptions || []
      },
      special: {
        kicking: result.data.social.team.special.kicking || [],
        kickoff: result.data.social.team.special.kickoff || [],
        kickoffReturn: result.data.social.team.special.kickoffReturn || [],
        punting: result.data.social.team.special.punting || [],
        puntReturn: result.data.social.team.special.puntReturn || []
      }
    };
    
    // 팀 분류 정보 - 수동으로 정의 (TEAMS.js에서 가져온 정보)
    const teamDivisions = {
      // 서울 1부
      '연세대학교': { league: '서울', division: '1부' },
      '서울대학교': { league: '서울', division: '1부' },
      '한양대학교': { league: '서울', division: '1부' },
      '국민대학교': { league: '서울', division: '1부' },
      '서울시립대학교': { league: '서울', division: '1부' },
      '한국외국어대학교': { league: '서울', division: '1부' },
      '건국대학교': { league: '서울', division: '1부' },
      '홍익대학교': { league: '서울', division: '1부' },
      
      // 서울 2부
      '고려대학교': { league: '서울', division: '2부' },
      '동국대학교': { league: '서울', division: '2부' },
      '숭실대학교': { league: '서울', division: '2부' },
      '중앙대학교': { league: '서울', division: '2부' },
      '경희대학교': { league: '서울', division: '2부' },
      '서강대학교': { league: '서울', division: '2부' }
    };
    
    // 리그별/부별로 데이터 재구성
    const kafaStyleData = {
      서울: {
        first: { team: { offense: {}, defense: {}, special: {} } },
        second: { team: { offense: {}, defense: {}, special: {} } }
      },
      사회인: {
        team: { offense: {}, defense: {}, special: {} }
      }
    };
    
    // 데이터 분류 함수
    function classifyTeamData(data, category, type) {
      const seoul1st = [];
      const seoul2nd = [];
      const social = [];
      
      data.forEach(team => {
        const teamName = team.teamName.replace(/\s*(EAGLES|LIONS|TIGERS|RAGING BULLS|GREEN TERRORS|CITYHAWKS|TUSKERS|RAZORBACKS|COMMANDERS|COWBOYS|CRUSADERS|BLACK KNIGHTS|DRAGONS|BLUE DOLPHINS)$/i, '').trim();
        
        if (teamDivisions[teamName]) {
          if (teamDivisions[teamName].division === '1부') {
            seoul1st.push(team);
          } else {
            seoul2nd.push(team);
          }
        } else if (team.teamName.includes('그리폰즈') || team.teamName.includes('골든이글스') || team.teamName.includes('블루스톰')) {
          social.push(team);
        }
      });
      
      // 결과 저장
      if (seoul1st.length > 0) kafaStyleData['서울']['first']['team'][category][type] = seoul1st;
      if (seoul2nd.length > 0) kafaStyleData['서울']['second']['team'][category][type] = seoul2nd;
      if (social.length > 0) kafaStyleData['사회인']['team'][category][type] = social;
    }
    
    // 오펜스 데이터 분류
    classifyTeamData(universityTeamData.offense.rushing, 'offense', 'rushing');
    classifyTeamData(universityTeamData.offense.passing, 'offense', 'passing');
    classifyTeamData(universityTeamData.offense.receiving, 'offense', 'receiving');
    
    // 디펜스 데이터 분류
    classifyTeamData(universityTeamData.defense.tackles, 'defense', 'tackles');
    classifyTeamData(universityTeamData.defense.interceptions, 'defense', 'interceptions');
    
    // 스페셜팀 데이터 분류
    classifyTeamData(universityTeamData.special.kicking, 'special', 'kicking');
    classifyTeamData(universityTeamData.special.kickoff, 'special', 'kickoff');
    classifyTeamData(universityTeamData.special.kickoffReturn, 'special', 'kickoffReturn');
    classifyTeamData(universityTeamData.special.punting, 'special', 'punting');
    classifyTeamData(universityTeamData.special.puntReturn, 'special', 'puntReturn');
    
    // 사회인 데이터는 모두 사회인으로
    Object.entries(socialTeamData).forEach(([category, types]) => {
      Object.entries(types).forEach(([type, data]) => {
        if (data && data.length > 0) {
          kafaStyleData['사회인']['team'][category][type] = data;
        }
      });
    });
    
    // 파일로 저장
    const outputPath = '/Users/kenlee/Projects/stech_fresh4/Front/src/data/kafaHardcodedData.js';
    const fileContent = `// KAFA 크롤링 데이터 (${new Date().toISOString()})
// 이 파일은 자동 생성되었습니다. 수동으로 편집하지 마세요.

export const kafaHardcodedData = ${JSON.stringify(kafaStyleData, null, 2)};
`;
    
    fs.writeFileSync(outputPath, fileContent, 'utf-8');
    console.log(`✅ 데이터가 ${outputPath}에 저장되었습니다.`);
    
    // 데이터 요약 출력
    console.log('\n📊 데이터 요약:');
    console.log(`- 서울 1부 팀 수: ${kafaStyleData['서울']['first']['team']['offense']['rushing']?.length || 0}`);
    console.log(`- 서울 2부 팀 수: ${kafaStyleData['서울']['second']['team']['offense']['rushing']?.length || 0}`);
    console.log(`- 사회인 팀 수: ${kafaStyleData['사회인']['team']['offense']['rushing']?.length || 0}`);
    
    return kafaStyleData;
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    throw error;
  }
}

// 실행
if (require.main === module) {
  fetchKafaData()
    .then(() => {
      console.log('\n✅ 모든 작업이 완료되었습니다!');
      console.log('이제 StatTeam_fixed.js에서 kafaHardcodedData를 import해서 사용하세요.');
    })
    .catch(error => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { fetchKafaData };