// 팀별 디펜스 인터셉션 협회 데이터 분류 결과

// 분류 결과
export const teamInterceptionClassification = {
  'Seoul': {
    '1부': [
      { rank: 1, team: '연세대학교', interceptions: 13, interceptionTouchdowns: 2, interceptionYards: 83, longest: 25 },
      { rank: 2, team: '서울시립대학교', interceptions: 10, interceptionTouchdowns: 1, interceptionYards: 187, longest: 54 },
      { rank: 5, team: '서울대학교', interceptions: 9, interceptionTouchdowns: 0, interceptionYards: 81, longest: 25 },
      { rank: 11, team: '한양대학교', interceptions: 6, interceptionTouchdowns: 0, interceptionYards: 87, longest: 45 },
      { rank: 13, team: '홍익대학교', interceptions: 5, interceptionTouchdowns: 0, interceptionYards: 15, longest: 10 },
      { rank: 16, team: '국민대학교', interceptions: 4, interceptionTouchdowns: 0, interceptionYards: 89, longest: 43 },
      { rank: 39, team: '건국대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 0, longest: 0 }
    ],
    '2부': [
      { rank: 7, team: '서강대학교', interceptions: 9, interceptionTouchdowns: 1, interceptionYards: 47, longest: 25 },
      { rank: 10, team: '고려대학교', interceptions: 7, interceptionTouchdowns: 1, interceptionYards: 104, longest: 32 },
      { rank: 12, team: '숭실대학교', interceptions: 5, interceptionTouchdowns: 0, interceptionYards: 71, longest: 32 },
      { rank: 15, team: '중앙대학교', interceptions: 4, interceptionTouchdowns: 0, interceptionYards: 2, longest: 2 },
      { rank: 19, team: '동국대학교', interceptions: 3, interceptionTouchdowns: 0, interceptionYards: 21, longest: 20 },
      { rank: 25, team: '경희대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 3, longest: 3 }
    ]
  },
  'Gyeonggi-Gangwon': {
    '1부': [
      { rank: 8, team: '성균관대학교', interceptions: 8, interceptionTouchdowns: 0, interceptionYards: 46, longest: 20 },
      { rank: 6, team: '강원대학교', interceptions: 9, interceptionTouchdowns: 1, interceptionYards: 142, longest: 39 },
      { rank: 22, team: '인하대학교', interceptions: 3, interceptionTouchdowns: 0, interceptionYards: 28, longest: 20 },
      { rank: 23, team: '단국대학교', interceptions: 3, interceptionTouchdowns: 0, interceptionYards: 80, longest: 62 }
    ],
    '2부': [
      { rank: 37, team: '용인대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 3, longest: 3 },
      { rank: 29, team: '한림대학교', interceptions: 2, interceptionTouchdowns: 1, interceptionYards: 3, longest: 3 },
      { rank: 33, team: '한신대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 0, longest: 0 },
      { rank: 27, team: '카이스트', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 12, longest: 12 }
    ]
  },
  'Daegu-Gyeongbuk': {
    '1부': [
      { rank: 9, team: '경북대학교', interceptions: 7, interceptionTouchdowns: 0, interceptionYards: 35, longest: 16 },
      { rank: 3, team: '경일대학교', interceptions: 9, interceptionTouchdowns: 1, interceptionYards: 235, longest: 60 },
      { rank: 31, team: '한동대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 20, longest: 20 },
      { rank: 20, team: '대구한의대학교', interceptions: 3, interceptionTouchdowns: 0, interceptionYards: 13, longest: 13 },
      { rank: 35, team: '대구가톨릭대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 6, longest: 6 }
    ],
    '2부': [
      { rank: 14, team: '금오공과대학교', interceptions: 5, interceptionTouchdowns: 0, interceptionYards: 19, longest: 8 },
      { rank: 18, team: '대구대학교', interceptions: 3, interceptionTouchdowns: 0, interceptionYards: 5, longest: 3 },
      { rank: 13, team: '영남대학교', interceptions: 5, interceptionTouchdowns: 1, interceptionYards: 65, longest: 50 },
      { rank: 38, team: '계명대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 5, longest: 5 }
    ]
  },
  'Busan-Gyeongnam': {
    '1부': [
      { rank: 4, team: '경성대학교', interceptions: 9, interceptionTouchdowns: 1, interceptionYards: 174, longest: 71 },
      { rank: 36, team: '동의대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 35, longest: 35 },
      { rank: 34, team: '동아대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 0, longest: 0 },
      { rank: 26, team: '울산대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 38, longest: 25 }
    ],
    '2부': [
      { rank: 28, team: '부산외국어대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 15, longest: 10 },
      { rank: 17, team: '신라대학교', interceptions: 3, interceptionTouchdowns: 0, interceptionYards: 35, longest: 20 },
      { rank: 30, team: '한국해양대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 3, longest: 3 },
      { rank: 32, team: '동서대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 0, longest: 0 }
    ]
  }
};

// 리그별 팀 인터셉션 통계 요약
export const teamInterceptionStats = {
  'Seoul 1부': teamInterceptionClassification.Seoul['1부'].length,
  'Seoul 2부': teamInterceptionClassification.Seoul['2부'].length,
  'Gyeonggi-Gangwon 1부': teamInterceptionClassification['Gyeonggi-Gangwon']['1부'].length,
  'Gyeonggi-Gangwon 2부': teamInterceptionClassification['Gyeonggi-Gangwon']['2부'].length,
  'Daegu-Gyeongbuk 1부': teamInterceptionClassification['Daegu-Gyeongbuk']['1부'].length,
  'Daegu-Gyeongbuk 2부': teamInterceptionClassification['Daegu-Gyeongbuk']['2부'].length,
  'Busan-Gyeongnam 1부': teamInterceptionClassification['Busan-Gyeongnam']['1부'].length,
  'Busan-Gyeongnam 2부': teamInterceptionClassification['Busan-Gyeongnam']['2부'].length
};

console.log('팀별 인터셉션 협회 데이터 분류 결과:');
console.log('서울리그 1부:', teamInterceptionStats['Seoul 1부'] + '팀');
console.log('서울리그 2부:', teamInterceptionStats['Seoul 2부'] + '팀');
console.log('경기강원 1부:', teamInterceptionStats['Gyeonggi-Gangwon 1부'] + '팀');
console.log('경기강원 2부:', teamInterceptionStats['Gyeonggi-Gangwon 2부'] + '팀');
console.log('대구경북 1부:', teamInterceptionStats['Daegu-Gyeongbuk 1부'] + '팀');
console.log('대구경북 2부:', teamInterceptionStats['Daegu-Gyeongbuk 2부'] + '팀');
console.log('부산경남 1부:', teamInterceptionStats['Busan-Gyeongnam 1부'] + '팀');
console.log('부산경남 2부:', teamInterceptionStats['Busan-Gyeongnam 2부'] + '팀');