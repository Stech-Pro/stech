const https = require('http');
const url = 'http://localhost:4000/api/kafa-stats/all-stats';

const req = https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    
    // 실제 1부팀 정의 (전통 강팀들)
    const firstDivisionTeams = [
      '한양대학교', '연세대학교', '서울대학교', '건국대학교', '홍익대학교', 
      '경성대학교', '서울시립대학교', '경희대학교', '부산외국어대학교',
      '경북대학교', '경일대학교', '동의대학교', '강원대학교', '한국해양대학교'
    ];
    
    // 2부팀 정의
    const secondDivisionTeams = [
      '고려대학교', '중앙대학교', '숭실대학교', '국민대학교', '성균관대학교',
      '서강대학교', '인하대학교', '용인대학교', '동국대학교', '한동대학교'
    ];
    
    const teams = result.data.university.team.offense.rushing;
    
    console.log('=== 1부팀 분류 ===');
    const firstDivTeams = teams.filter(team => 
      firstDivisionTeams.some(name => team.teamName.includes(name))
    );
    firstDivTeams.forEach(team => console.log(team.teamName));
    
    console.log('\n=== 2부팀 분류 ===');
    const secondDivTeams = teams.filter(team => 
      secondDivisionTeams.some(name => team.teamName.includes(name))
    );
    secondDivTeams.forEach(team => console.log(team.teamName));
    
    console.log('\n=== 기타팀 (지방/소속 미분류) ===');
    const otherTeams = teams.filter(team => {
      const isFirst = firstDivisionTeams.some(name => team.teamName.includes(name));
      const isSecond = secondDivisionTeams.some(name => team.teamName.includes(name));
      return !isFirst && !isSecond;
    });
    otherTeams.forEach(team => console.log(team.teamName));
  });
});