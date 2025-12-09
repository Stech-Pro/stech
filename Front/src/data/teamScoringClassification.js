// 팀별 득점 협회 데이터 분류 결과

// 분류 결과
export const teamScoringClassification = {
  'Seoul': {
    '1부': [
      { rank: 1, team: '연세대학교', rushingTouchdowns: 11, receivingTouchdowns: 19, totalTouchdowns: 32 },
      { rank: 4, team: '한양대학교', rushingTouchdowns: 8, receivingTouchdowns: 5, totalTouchdowns: 14 },
      { rank: 19, team: '서울대학교', rushingTouchdowns: 2, receivingTouchdowns: 1, totalTouchdowns: 5 },
      { rank: 21, team: '서울시립대학교', rushingTouchdowns: 1, receivingTouchdowns: 1, totalTouchdowns: 3 },
      { rank: 18, team: '홍익대학교', rushingTouchdowns: 3, receivingTouchdowns: 1, totalTouchdowns: 4 },
      { rank: 26, team: '국민대학교', rushingTouchdowns: 2, receivingTouchdowns: 0, totalTouchdowns: 2 },
      { rank: 33, team: '건국대학교', rushingTouchdowns: 1, receivingTouchdowns: 0, totalTouchdowns: 2 },
      { rank: 36, team: '한국외국어대학교', rushingTouchdowns: 0, receivingTouchdowns: 0, totalTouchdowns: 0 }
    ],
    '2부': [
      { rank: 5, team: '고려대학교', rushingTouchdowns: 8, receivingTouchdowns: 6, totalTouchdowns: 16 },
      { rank: 24, team: '동국대학교', rushingTouchdowns: 2, receivingTouchdowns: 0, totalTouchdowns: 2 },
      { rank: 13, team: '숭실대학교', rushingTouchdowns: 2, receivingTouchdowns: 5, totalTouchdowns: 7 },
      { rank: 16, team: '중앙대학교', rushingTouchdowns: 3, receivingTouchdowns: 0, totalTouchdowns: 3 },
      { rank: 17, team: '경희대학교', rushingTouchdowns: 2, receivingTouchdowns: 1, totalTouchdowns: 3 },
      { rank: 23, team: '서강대학교', rushingTouchdowns: 1, receivingTouchdowns: 3, totalTouchdowns: 5 }
    ]
  },
  'Gyeonggi-Gangwon': {
    '1부': [
      { rank: 7, team: '강원대학교', rushingTouchdowns: 6, receivingTouchdowns: 0, totalTouchdowns: 7 },
      { rank: 11, team: '성균관대학교', rushingTouchdowns: 5, receivingTouchdowns: 5, totalTouchdowns: 11 },
      { rank: 15, team: '인하대학교', rushingTouchdowns: 3, receivingTouchdowns: 1, totalTouchdowns: 7 },
      { rank: 35, team: '단국대학교', rushingTouchdowns: 0, receivingTouchdowns: 2, totalTouchdowns: 2 }
    ],
    '2부': [
      { rank: 27, team: '용인대학교', rushingTouchdowns: 2, receivingTouchdowns: 7, totalTouchdowns: 9 },
      { rank: 25, team: '한림대학교', rushingTouchdowns: 2, receivingTouchdowns: 1, totalTouchdowns: 3 },
      { rank: 34, team: '한신대학교', rushingTouchdowns: 0, receivingTouchdowns: 1, totalTouchdowns: 1 },
      { rank: 29, team: '카이스트', rushingTouchdowns: 1, receivingTouchdowns: 0, totalTouchdowns: 1 }
    ]
  },
  'Daegu-Gyeongbuk': {
    '1부': [
      { rank: 12, team: '경북대학교', rushingTouchdowns: 5, receivingTouchdowns: 11, totalTouchdowns: 18 },
      { rank: 9, team: '경일대학교', rushingTouchdowns: 4, receivingTouchdowns: 5, totalTouchdowns: 12 },
      { rank: 18, team: '한동대학교', rushingTouchdowns: 3, receivingTouchdowns: 1, totalTouchdowns: 4 },
      { rank: 24, team: '대구가톨릭대학교', rushingTouchdowns: 2, receivingTouchdowns: 0, totalTouchdowns: 2 },
      { rank: 37, team: '대구한의대학교', rushingTouchdowns: 0, receivingTouchdowns: 1, totalTouchdowns: 1 }
    ],
    '2부': [
      { rank: 8, team: '금오공과대학교', rushingTouchdowns: 7, receivingTouchdowns: 2, totalTouchdowns: 9 },
      { rank: 6, team: '대구대학교', rushingTouchdowns: 6, receivingTouchdowns: 1, totalTouchdowns: 7 },
      { rank: 14, team: '영남대학교', rushingTouchdowns: 3, receivingTouchdowns: 0, totalTouchdowns: 5 }
    ]
  },
  'Busan-Gyeongnam': {
    '1부': [
      { rank: 2, team: '경성대학교', rushingTouchdowns: 9, receivingTouchdowns: 5, totalTouchdowns: 15 },
      { rank: 10, team: '동의대학교', rushingTouchdowns: 5, receivingTouchdowns: 3, totalTouchdowns: 8 },
      { rank: 16, team: '동아대학교', rushingTouchdowns: 3, receivingTouchdowns: 0, totalTouchdowns: 3 },
      { rank: 22, team: '울산대학교', rushingTouchdowns: 1, receivingTouchdowns: 3, totalTouchdowns: 4 }
    ],
    '2부': [
      { rank: 12, team: '부산외국어대학교', rushingTouchdowns: 6, receivingTouchdowns: 11, totalTouchdowns: 18 },
      { rank: 3, team: '한국해양대학교', rushingTouchdowns: 8, receivingTouchdowns: 2, totalTouchdowns: 11 },
      { rank: 20, team: '신라대학교', rushingTouchdowns: 2, receivingTouchdowns: 4, totalTouchdowns: 6 },
      { rank: 28, team: '동서대학교', rushingTouchdowns: 1, receivingTouchdowns: 3, totalTouchdowns: 4 },
      { rank: 38, team: '부산대학교', rushingTouchdowns: 0, receivingTouchdowns: 1, totalTouchdowns: 2 }
    ]
  }
};

// 리그별 팀 득점 통계 요약
export const teamScoringStats = {
  'Seoul 1부': teamScoringClassification.Seoul['1부'].length,
  'Seoul 2부': teamScoringClassification.Seoul['2부'].length,
  'Gyeonggi-Gangwon 1부': teamScoringClassification['Gyeonggi-Gangwon']['1부'].length,
  'Gyeonggi-Gangwon 2부': teamScoringClassification['Gyeonggi-Gangwon']['2부'].length,
  'Daegu-Gyeongbuk 1부': teamScoringClassification['Daegu-Gyeongbuk']['1부'].length,
  'Daegu-Gyeongbuk 2부': teamScoringClassification['Daegu-Gyeongbuk']['2부'].length,
  'Busan-Gyeongnam 1부': teamScoringClassification['Busan-Gyeongnam']['1부'].length,
  'Busan-Gyeongnam 2부': teamScoringClassification['Busan-Gyeongnam']['2부'].length
};

console.log('팀별 득점 협회 데이터 분류 결과:');
console.log('서울리그 1부:', teamScoringStats['Seoul 1부'] + '팀');
console.log('서울리그 2부:', teamScoringStats['Seoul 2부'] + '팀');
console.log('경기강원 1부:', teamScoringStats['Gyeonggi-Gangwon 1부'] + '팀');
console.log('경기강원 2부:', teamScoringStats['Gyeonggi-Gangwon 2부'] + '팀');
console.log('대구경북 1부:', teamScoringStats['Daegu-Gyeongbuk 1부'] + '팀');
console.log('대구경북 2부:', teamScoringStats['Daegu-Gyeongbuk 2부'] + '팀');
console.log('부산경남 1부:', teamScoringStats['Busan-Gyeongnam 1부'] + '팀');
console.log('부산경남 2부:', teamScoringStats['Busan-Gyeongnam 2부'] + '팀');