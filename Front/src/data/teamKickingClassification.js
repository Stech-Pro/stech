// 팀별 필드골 협회 데이터 분류 결과

// 분류 결과
export const teamKickingClassification = {
  'Seoul': {
    '1부': [
      { rank: 1, team: '건국대학교', fieldGoalPercentage: 100.0, avgFieldGoalDistance: 53.0, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 53, longestFieldGoal: 53 },
      { rank: 2, team: '서울시립대학교', fieldGoalPercentage: 100.0, avgFieldGoalDistance: 14.0, fieldGoalsMade: 2, fieldGoalAttempts: 2, fieldGoalYards: 28, longestFieldGoal: 28 },
      { rank: 3, team: '연세대학교', fieldGoalPercentage: 80.0, avgFieldGoalDistance: 20.5, fieldGoalsMade: 4, fieldGoalAttempts: 5, fieldGoalYards: 82, longestFieldGoal: 35 },
      { rank: 4, team: '한양대학교', fieldGoalPercentage: 75.0, avgFieldGoalDistance: 18.3, fieldGoalsMade: 3, fieldGoalAttempts: 4, fieldGoalYards: 55, longestFieldGoal: 30 },
      { rank: 5, team: '서울대학교', fieldGoalPercentage: 75.0, avgFieldGoalDistance: 24.0, fieldGoalsMade: 3, fieldGoalAttempts: 4, fieldGoalYards: 72, longestFieldGoal: 27 },
      { rank: 6, team: '홍익대학교', fieldGoalPercentage: 100.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 },
      { rank: 7, team: '한국외국어대학교', fieldGoalPercentage: 50.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 2, fieldGoalAttempts: 4, fieldGoalYards: 0, longestFieldGoal: 0 },
      { rank: 8, team: '국민대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 }
    ],
    '2부': [
      { rank: 1, team: '서강대학교', fieldGoalPercentage: 100.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 },
      { rank: 2, team: '고려대학교', fieldGoalPercentage: 20.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 1, fieldGoalAttempts: 5, fieldGoalYards: 0, longestFieldGoal: 0 },
      { rank: 3, team: '경희대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 2, fieldGoalYards: 0, longestFieldGoal: 0 },
      { rank: 4, team: '중앙대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 }
    ]
  },
  'Gyeonggi-Gangwon': {
    '1부': [
      { rank: 1, team: '강원대학교', fieldGoalPercentage: 42.9, avgFieldGoalDistance: 20.3, fieldGoalsMade: 3, fieldGoalAttempts: 7, fieldGoalYards: 61, longestFieldGoal: 36 },
      { rank: 2, team: '단국대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 2, fieldGoalYards: 0, longestFieldGoal: 0 },
      { rank: 3, team: '성균관대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 3, fieldGoalYards: 0, longestFieldGoal: 0 }
    ],
    '2부': [
      { rank: 1, team: '한신대학교', fieldGoalPercentage: 100.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 }
    ]
  },
  'Daegu-Gyeongbuk': {
    '1부': [
      { rank: 1, team: '경일대학교', fieldGoalPercentage: 33.3, avgFieldGoalDistance: 30.0, fieldGoalsMade: 1, fieldGoalAttempts: 3, fieldGoalYards: 30, longestFieldGoal: 30 },
      { rank: 2, team: '경북대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 2, fieldGoalYards: 0, longestFieldGoal: 0 },
      { rank: 3, team: '대구한의대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 2, fieldGoalYards: 0, longestFieldGoal: 0 }
    ],
    '2부': []
  },
  'Busan-Gyeongnam': {
    '1부': [
      { rank: 1, team: '울산대학교', fieldGoalPercentage: 100.0, avgFieldGoalDistance: 25.0, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 25, longestFieldGoal: 25 },
      { rank: 2, team: '동아대학교', fieldGoalPercentage: 0.0, avgFieldGoalDistance: 0.0, fieldGoalsMade: 0, fieldGoalAttempts: 1, fieldGoalYards: 0, longestFieldGoal: 0 }
    ],
    '2부': [
      { rank: 1, team: '부산외국어대학교', fieldGoalPercentage: 75.0, avgFieldGoalDistance: 15.0, fieldGoalsMade: 3, fieldGoalAttempts: 4, fieldGoalYards: 45, longestFieldGoal: 25 }
    ]
  }
};

// 리그별 팀 필드골 통계 요약
export const teamKickingStats = {
  'Seoul 1부': teamKickingClassification.Seoul['1부'].length,
  'Seoul 2부': teamKickingClassification.Seoul['2부'].length,
  'Gyeonggi-Gangwon 1부': teamKickingClassification['Gyeonggi-Gangwon']['1부'].length,
  'Gyeonggi-Gangwon 2부': teamKickingClassification['Gyeonggi-Gangwon']['2부'].length,
  'Daegu-Gyeongbuk 1부': teamKickingClassification['Daegu-Gyeongbuk']['1부'].length,
  'Daegu-Gyeongbuk 2부': teamKickingClassification['Daegu-Gyeongbuk']['2부'].length,
  'Busan-Gyeongnam 1부': teamKickingClassification['Busan-Gyeongnam']['1부'].length,
  'Busan-Gyeongnam 2부': teamKickingClassification['Busan-Gyeongnam']['2부'].length
};

console.log('팀별 필드골 협회 데이터 분류 결과:');
console.log('서울리그 1부:', teamKickingStats['Seoul 1부'] + '팀');
console.log('서울리그 2부:', teamKickingStats['Seoul 2부'] + '팀');
console.log('경기강원 1부:', teamKickingStats['Gyeonggi-Gangwon 1부'] + '팀');
console.log('경기강원 2부:', teamKickingStats['Gyeonggi-Gangwon 2부'] + '팀');
console.log('대구경북 1부:', teamKickingStats['Daegu-Gyeongbuk 1부'] + '팀');
console.log('대구경북 2부:', teamKickingStats['Daegu-Gyeongbuk 2부'] + '팀');
console.log('부산경남 1부:', teamKickingStats['Busan-Gyeongnam 1부'] + '팀');
console.log('부산경남 2부:', teamKickingStats['Busan-Gyeongnam 2부'] + '팀');