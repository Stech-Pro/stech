// 패싱 협회 데이터 분류 결과

const passingData = [
  { rank: 1, name: '윤여진', number: '13번', team: '연세대학교', passingYards: 886, avgYardsPerAttempt: 6.5, completionPercentage: 47.8, passingAttempts: 136, passingCompletions: 65, passingTouchdowns: 17, interceptions: 8, longestPass: 80 },
  { rank: 2, name: '고승주', number: '15번', team: '경북대학교', passingYards: 738, avgYardsPerAttempt: 5.2, completionPercentage: 53.8, passingAttempts: 143, passingCompletions: 77, passingTouchdowns: 12, interceptions: 5, longestPass: 90 },
  { rank: 3, name: '문찬호', number: '09번', team: '고려대학교', passingYards: 527, avgYardsPerAttempt: 5.4, completionPercentage: 59.2, passingAttempts: 98, passingCompletions: 58, passingTouchdowns: 6, interceptions: 2, longestPass: 37 },
  { rank: 4, name: '이찬희', number: '12번', team: '한양대학교', passingYards: 481, avgYardsPerAttempt: 4.7, completionPercentage: 43.1, passingAttempts: 102, passingCompletions: 44, passingTouchdowns: 7, interceptions: 9, longestPass: 57 },
  { rank: 5, name: '장혜성', number: '09번', team: '성균관대학교', passingYards: 366, avgYardsPerAttempt: 4.5, completionPercentage: 29.3, passingAttempts: 82, passingCompletions: 24, passingTouchdowns: 5, interceptions: 3, longestPass: 59 },
  { rank: 6, name: '이수민', number: '16번', team: '용인대학교', passingYards: 330, avgYardsPerAttempt: 7.9, completionPercentage: 47.6, passingAttempts: 42, passingCompletions: 20, passingTouchdowns: 7, interceptions: 3, longestPass: 72 },
  { rank: 7, name: '백운성', number: '07번', team: '서강대학교', passingYards: 292, avgYardsPerAttempt: 5.1, completionPercentage: 31.6, passingAttempts: 57, passingCompletions: 18, passingTouchdowns: 2, interceptions: 4, longestPass: 72 },
  { rank: 8, name: '이민서', number: '01번', team: '부산외국어대학교', passingYards: 290, avgYardsPerAttempt: 2.9, completionPercentage: 46.0, passingAttempts: 100, passingCompletions: 46, passingTouchdowns: 10, interceptions: 2, longestPass: 53 },
  { rank: 9, name: '윤정근', number: '08번', team: '금오공과대학교', passingYards: 270, avgYardsPerAttempt: 5.5, completionPercentage: 44.9, passingAttempts: 49, passingCompletions: 22, passingTouchdowns: 1, interceptions: 3, longestPass: 35 },
  { rank: 10, name: '천은수', number: '17번', team: '울산대학교', passingYards: 254, avgYardsPerAttempt: 5.2, completionPercentage: 63.3, passingAttempts: 49, passingCompletions: 31, passingTouchdowns: 4, interceptions: 3, longestPass: 37 },
  { rank: 11, name: '박병민', number: '11번', team: '경일대학교', passingYards: 246, avgYardsPerAttempt: 4.4, completionPercentage: 39.3, passingAttempts: 56, passingCompletions: 22, passingTouchdowns: 4, interceptions: 6, longestPass: 47 },
  { rank: 12, name: '김동현', number: '01번', team: '경성대학교', passingYards: 245, avgYardsPerAttempt: 5.8, completionPercentage: 52.4, passingAttempts: 42, passingCompletions: 22, passingTouchdowns: 5, interceptions: 2, longestPass: 41 },
  { rank: 13, name: '신재윤', number: '08번', team: '인하대학교', passingYards: 229, avgYardsPerAttempt: 4.3, completionPercentage: 43.4, passingAttempts: 53, passingCompletions: 23, passingTouchdowns: 1, interceptions: 6, longestPass: 37 },
  { rank: 14, name: '장지훈', number: '01번', team: '신라대학교', passingYards: 222, avgYardsPerAttempt: 6.2, completionPercentage: 55.6, passingAttempts: 36, passingCompletions: 20, passingTouchdowns: 4, interceptions: 0, longestPass: 79 },
  { rank: 15, name: '최은찬', number: '10번', team: '동국대학교', passingYards: 215, avgYardsPerAttempt: 2.6, completionPercentage: 43.9, passingAttempts: 82, passingCompletions: 36, passingTouchdowns: 0, interceptions: 6, longestPass: 38 },
  { rank: 16, name: '한상천', number: '17번', team: '서울시립대학교', passingYards: 204, avgYardsPerAttempt: 3.0, completionPercentage: 29.0, passingAttempts: 69, passingCompletions: 20, passingTouchdowns: 1, interceptions: 4, longestPass: 38 },
  { rank: 17, name: '변지성', number: '01번', team: '성균관대학교', passingYards: 176, avgYardsPerAttempt: 3.2, completionPercentage: 27.3, passingAttempts: 55, passingCompletions: 15, passingTouchdowns: 0, interceptions: 6, longestPass: 38 },
  { rank: 17, name: '김민우', number: '19번', team: '대구한의대학교', passingYards: 176, avgYardsPerAttempt: 2.7, completionPercentage: 36.9, passingAttempts: 65, passingCompletions: 24, passingTouchdowns: 1, interceptions: 1, longestPass: 17 },
  { rank: 19, name: '이주람', number: '01번', team: '한동대학교', passingYards: 171, avgYardsPerAttempt: 4.8, completionPercentage: 36.1, passingAttempts: 36, passingCompletions: 13, passingTouchdowns: 1, interceptions: 6, longestPass: 30 },
  { rank: 20, name: '신민호', number: '87번', team: '동의대학교', passingYards: 155, avgYardsPerAttempt: 4.1, completionPercentage: 31.6, passingAttempts: 38, passingCompletions: 12, passingTouchdowns: 2, interceptions: 4, longestPass: 27 },
  { rank: 21, name: '김도윤', number: '01번', team: '숭실대학교', passingYards: 148, avgYardsPerAttempt: 2.4, completionPercentage: 52.5, passingAttempts: 61, passingCompletions: 32, passingTouchdowns: 5, interceptions: 3, longestPass: 33 },
  { rank: 22, name: '이민석', number: '13번', team: '강원대학교', passingYards: 147, avgYardsPerAttempt: 7.0, completionPercentage: 47.6, passingAttempts: 21, passingCompletions: 10, passingTouchdowns: 0, interceptions: 1, longestPass: 33 },
  { rank: 23, name: '최준', number: '09번', team: '서울대학교', passingYards: 127, avgYardsPerAttempt: 3.1, completionPercentage: 34.1, passingAttempts: 41, passingCompletions: 14, passingTouchdowns: 1, interceptions: 6, longestPass: 18 },
  { rank: 24, name: '장현성', number: '07번', team: '동서대학교', passingYards: 121, avgYardsPerAttempt: 2.9, completionPercentage: 28.6, passingAttempts: 42, passingCompletions: 12, passingTouchdowns: 3, interceptions: 4, longestPass: 43 },
  { rank: 25, name: '박기석', number: '10번', team: '한국외국어대학교', passingYards: 108, avgYardsPerAttempt: 4.7, completionPercentage: 39.1, passingAttempts: 23, passingCompletions: 9, passingTouchdowns: 0, interceptions: 0, longestPass: 32 },
  { rank: 26, name: '이종혁', number: '08번', team: '서울대학교', passingYards: 99, avgYardsPerAttempt: 5.0, completionPercentage: 55.0, passingAttempts: 20, passingCompletions: 11, passingTouchdowns: 0, interceptions: 1, longestPass: 33 },
  { rank: 27, name: '우재윤', number: '11번', team: '국민대학교', passingYards: 92, avgYardsPerAttempt: 1.7, completionPercentage: 21.8, passingAttempts: 55, passingCompletions: 12, passingTouchdowns: 2, interceptions: 5, longestPass: 18 },
  { rank: 28, name: '김서진', number: '20번', team: '건국대학교', passingYards: 85, avgYardsPerAttempt: 2.7, completionPercentage: 54.8, passingAttempts: 31, passingCompletions: 17, passingTouchdowns: 0, interceptions: 3, longestPass: 24 },
  { rank: 29, name: '정택훈', number: '12번', team: '연세대학교', passingYards: 82, avgYardsPerAttempt: 5.5, completionPercentage: 40.0, passingAttempts: 15, passingCompletions: 6, passingTouchdowns: 1, interceptions: 0, longestPass: 32 },
  { rank: 30, name: '송지헌', number: '09번', team: '단국대학교', passingYards: 80, avgYardsPerAttempt: 4.0, completionPercentage: 30.0, passingAttempts: 20, passingCompletions: 6, passingTouchdowns: 1, interceptions: 3, longestPass: 80 },
  { rank: 31, name: '한시훈', number: '10번', team: '단국대학교', passingYards: 74, avgYardsPerAttempt: 5.7, completionPercentage: 23.1, passingAttempts: 13, passingCompletions: 3, passingTouchdowns: 2, interceptions: 3, longestPass: 28 },
  { rank: 32, name: '이무진', number: '35번', team: '대구가톨릭대학교', passingYards: 66, avgYardsPerAttempt: 4.1, completionPercentage: 56.3, passingAttempts: 16, passingCompletions: 9, passingTouchdowns: 0, interceptions: 1, longestPass: 16 },
  { rank: 33, name: '유동윤', number: '18번', team: '경일대학교', passingYards: 58, avgYardsPerAttempt: 19.3, completionPercentage: 33.3, passingAttempts: 3, passingCompletions: 1, passingTouchdowns: 1, interceptions: 2, longestPass: 58 },
  { rank: 34, name: '손혁빈', number: '25번', team: '경희대학교', passingYards: 56, avgYardsPerAttempt: 2.7, completionPercentage: 23.8, passingAttempts: 21, passingCompletions: 5, passingTouchdowns: 2, interceptions: 4, longestPass: 31 },
  { rank: 34, name: '김혁', number: '01번', team: '동의대학교', passingYards: 56, avgYardsPerAttempt: 4.0, completionPercentage: 28.6, passingAttempts: 14, passingCompletions: 4, passingTouchdowns: 1, interceptions: 1, longestPass: 23 },
  { rank: 36, name: '이기쁨', number: '07번', team: '강원대학교', passingYards: 50, avgYardsPerAttempt: 2.4, completionPercentage: 38.1, passingAttempts: 21, passingCompletions: 8, passingTouchdowns: 0, interceptions: 1, longestPass: 21 },
  { rank: 37, name: '원재훈', number: '08번', team: '국민대학교', passingYards: 47, avgYardsPerAttempt: 3.1, completionPercentage: 26.7, passingAttempts: 15, passingCompletions: 4, passingTouchdowns: 0, interceptions: 0, longestPass: 22 },
  { rank: 38, name: '배수환', number: '01번', team: '중앙대학교', passingYards: 41, avgYardsPerAttempt: 2.4, completionPercentage: 29.4, passingAttempts: 17, passingCompletions: 5, passingTouchdowns: 0, interceptions: 4, longestPass: 10 },
  { rank: 39, name: '이재원', number: '10번', team: '계명대학교', passingYards: 36, avgYardsPerAttempt: 1.7, completionPercentage: 23.8, passingAttempts: 21, passingCompletions: 5, passingTouchdowns: 1, interceptions: 3, longestPass: 11 },
  { rank: 40, name: '임규성', number: '01번', team: '카이스트', passingYards: 31, avgYardsPerAttempt: 2.8, completionPercentage: 36.4, passingAttempts: 11, passingCompletions: 4, passingTouchdowns: 1, interceptions: 1, longestPass: 22 },
  { rank: 41, name: '김민서', number: '01번', team: '동아대학교', passingYards: 28, avgYardsPerAttempt: 1.2, completionPercentage: 20.8, passingAttempts: 24, passingCompletions: 5, passingTouchdowns: 0, interceptions: 2, longestPass: 14 },
  { rank: 42, name: '강승구', number: '19번', team: '서울시립대학교', passingYards: 26, avgYardsPerAttempt: 2.9, completionPercentage: 11.1, passingAttempts: 9, passingCompletions: 1, passingTouchdowns: 0, interceptions: 2, longestPass: 26 },
  { rank: 43, name: '김제민', number: '10번', team: '중앙대학교', passingYards: 20, avgYardsPerAttempt: 3.3, completionPercentage: 33.3, passingAttempts: 6, passingCompletions: 2, passingTouchdowns: 0, interceptions: 0, longestPass: 12 },
  { rank: 44, name: '강경서', number: '21번', team: '금오공과대학교', passingYards: 18, avgYardsPerAttempt: 18.0, completionPercentage: 100.0, passingAttempts: 1, passingCompletions: 1, passingTouchdowns: 1, interceptions: 0, longestPass: 18 },
  { rank: 45, name: '권용욱', number: '09번', team: '홍익대학교', passingYards: 17, avgYardsPerAttempt: 0.7, completionPercentage: 46.2, passingAttempts: 26, passingCompletions: 12, passingTouchdowns: 1, interceptions: 1, longestPass: 15 },
  { rank: 46, name: '서한솔', number: '04번', team: '부산외국어대학교', passingYards: 10, avgYardsPerAttempt: 10.0, completionPercentage: 100.0, passingAttempts: 1, passingCompletions: 1, passingTouchdowns: 0, interceptions: 0, longestPass: 10 },
  { rank: 46, name: '이재호', number: '07번', team: '동국대학교', passingYards: 10, avgYardsPerAttempt: 0.9, completionPercentage: 27.3, passingAttempts: 11, passingCompletions: 3, passingTouchdowns: 0, interceptions: 2, longestPass: 15 },
  { rank: 46, name: '김민석', number: '91번', team: '경일대학교', passingYards: 10, avgYardsPerAttempt: 10.0, completionPercentage: 100.0, passingAttempts: 1, passingCompletions: 1, passingTouchdowns: 0, interceptions: 0, longestPass: 10 },
  { rank: 49, name: '신재웅', number: '04번', team: '영남대학교', passingYards: 8, avgYardsPerAttempt: 0.8, completionPercentage: 30.0, passingAttempts: 10, passingCompletions: 3, passingTouchdowns: 0, interceptions: 1, longestPass: 8 },
  { rank: 50, name: '조윤수', number: '15번', team: '한림대학교', passingYards: 7, avgYardsPerAttempt: 0.6, completionPercentage: 16.7, passingAttempts: 12, passingCompletions: 2, passingTouchdowns: 0, interceptions: 1, longestPass: 7 }
];

// 분류 결과
export const passingClassification = {
  'Seoul': {
    '1부': [
      { name: '윤여진', team: '연세대학교', passingYards: 886, avgYardsPerAttempt: 6.5, completionPercentage: 47.8, passingAttempts: 136, passingCompletions: 65, passingTouchdowns: 17, interceptions: 8, longestPass: 80 },
      { name: '이찬희', team: '한양대학교', passingYards: 481, avgYardsPerAttempt: 4.7, completionPercentage: 43.1, passingAttempts: 102, passingCompletions: 44, passingTouchdowns: 7, interceptions: 9, longestPass: 57 },
      { name: '한상천', team: '서울시립대학교', passingYards: 204, avgYardsPerAttempt: 3.0, completionPercentage: 29.0, passingAttempts: 69, passingCompletions: 20, passingTouchdowns: 1, interceptions: 4, longestPass: 38 },
      { name: '최준', team: '서울대학교', passingYards: 127, avgYardsPerAttempt: 3.1, completionPercentage: 34.1, passingAttempts: 41, passingCompletions: 14, passingTouchdowns: 1, interceptions: 6, longestPass: 18 },
      { name: '박기석', team: '한국외국어대학교', passingYards: 108, avgYardsPerAttempt: 4.7, completionPercentage: 39.1, passingAttempts: 23, passingCompletions: 9, passingTouchdowns: 0, interceptions: 0, longestPass: 32 },
      { name: '이종혁', team: '서울대학교', passingYards: 99, avgYardsPerAttempt: 5.0, completionPercentage: 55.0, passingAttempts: 20, passingCompletions: 11, passingTouchdowns: 0, interceptions: 1, longestPass: 33 },
      { name: '우재윤', team: '국민대학교', passingYards: 92, avgYardsPerAttempt: 1.7, completionPercentage: 21.8, passingAttempts: 55, passingCompletions: 12, passingTouchdowns: 2, interceptions: 5, longestPass: 18 },
      { name: '김서진', team: '건국대학교', passingYards: 85, avgYardsPerAttempt: 2.7, completionPercentage: 54.8, passingAttempts: 31, passingCompletions: 17, passingTouchdowns: 0, interceptions: 3, longestPass: 24 },
      { name: '정택훈', team: '연세대학교', passingYards: 82, avgYardsPerAttempt: 5.5, completionPercentage: 40.0, passingAttempts: 15, passingCompletions: 6, passingTouchdowns: 1, interceptions: 0, longestPass: 32 },
      { name: '원재훈', team: '국민대학교', passingYards: 47, avgYardsPerAttempt: 3.1, completionPercentage: 26.7, passingAttempts: 15, passingCompletions: 4, passingTouchdowns: 0, interceptions: 0, longestPass: 22 },
      { name: '강승구', team: '서울시립대학교', passingYards: 26, avgYardsPerAttempt: 2.9, completionPercentage: 11.1, passingAttempts: 9, passingCompletions: 1, passingTouchdowns: 0, interceptions: 2, longestPass: 26 },
      { name: '권용욱', team: '홍익대학교', passingYards: 17, avgYardsPerAttempt: 0.7, completionPercentage: 46.2, passingAttempts: 26, passingCompletions: 12, passingTouchdowns: 1, interceptions: 1, longestPass: 15 }
    ],
    '2부': [
      { name: '문찬호', team: '고려대학교', passingYards: 527, avgYardsPerAttempt: 5.4, completionPercentage: 59.2, passingAttempts: 98, passingCompletions: 58, passingTouchdowns: 6, interceptions: 2, longestPass: 37 },
      { name: '백운성', team: '서강대학교', passingYards: 292, avgYardsPerAttempt: 5.1, completionPercentage: 31.6, passingAttempts: 57, passingCompletions: 18, passingTouchdowns: 2, interceptions: 4, longestPass: 72 },
      { name: '최은찬', team: '동국대학교', passingYards: 215, avgYardsPerAttempt: 2.6, completionPercentage: 43.9, passingAttempts: 82, passingCompletions: 36, passingTouchdowns: 0, interceptions: 6, longestPass: 38 },
      { name: '김도윤', team: '숭실대학교', passingYards: 148, avgYardsPerAttempt: 2.4, completionPercentage: 52.5, passingAttempts: 61, passingCompletions: 32, passingTouchdowns: 5, interceptions: 3, longestPass: 33 },
      { name: '손혁빈', team: '경희대학교', passingYards: 56, avgYardsPerAttempt: 2.7, completionPercentage: 23.8, passingAttempts: 21, passingCompletions: 5, passingTouchdowns: 2, interceptions: 4, longestPass: 31 },
      { name: '배수환', team: '중앙대학교', passingYards: 41, avgYardsPerAttempt: 2.4, completionPercentage: 29.4, passingAttempts: 17, passingCompletions: 5, passingTouchdowns: 0, interceptions: 4, longestPass: 10 },
      { name: '김제민', team: '중앙대학교', passingYards: 20, avgYardsPerAttempt: 3.3, completionPercentage: 33.3, passingAttempts: 6, passingCompletions: 2, passingTouchdowns: 0, interceptions: 0, longestPass: 12 },
      { name: '이재호', team: '동국대학교', passingYards: 10, avgYardsPerAttempt: 0.9, completionPercentage: 27.3, passingAttempts: 11, passingCompletions: 3, passingTouchdowns: 0, interceptions: 2, longestPass: 15 }
    ]
  },
  'Gyeonggi-Gangwon': {
    '1부': [
      { name: '장혜성', team: '성균관대학교', passingYards: 366, avgYardsPerAttempt: 4.5, completionPercentage: 29.3, passingAttempts: 82, passingCompletions: 24, passingTouchdowns: 5, interceptions: 3, longestPass: 59 },
      { name: '신재윤', team: '인하대학교', passingYards: 229, avgYardsPerAttempt: 4.3, completionPercentage: 43.4, passingAttempts: 53, passingCompletions: 23, passingTouchdowns: 1, interceptions: 6, longestPass: 37 },
      { name: '변지성', team: '성균관대학교', passingYards: 176, avgYardsPerAttempt: 3.2, completionPercentage: 27.3, passingAttempts: 55, passingCompletions: 15, passingTouchdowns: 0, interceptions: 6, longestPass: 38 },
      { name: '이민석', team: '강원대학교', passingYards: 147, avgYardsPerAttempt: 7.0, completionPercentage: 47.6, passingAttempts: 21, passingCompletions: 10, passingTouchdowns: 0, interceptions: 1, longestPass: 33 },
      { name: '송지헌', team: '단국대학교', passingYards: 80, avgYardsPerAttempt: 4.0, completionPercentage: 30.0, passingAttempts: 20, passingCompletions: 6, passingTouchdowns: 1, interceptions: 3, longestPass: 80 },
      { name: '한시훈', team: '단국대학교', passingYards: 74, avgYardsPerAttempt: 5.7, completionPercentage: 23.1, passingAttempts: 13, passingCompletions: 3, passingTouchdowns: 2, interceptions: 3, longestPass: 28 },
      { name: '이기쁨', team: '강원대학교', passingYards: 50, avgYardsPerAttempt: 2.4, completionPercentage: 38.1, passingAttempts: 21, passingCompletions: 8, passingTouchdowns: 0, interceptions: 1, longestPass: 21 }
    ],
    '2부': [
      { name: '이수민', team: '용인대학교', passingYards: 330, avgYardsPerAttempt: 7.9, completionPercentage: 47.6, passingAttempts: 42, passingCompletions: 20, passingTouchdowns: 7, interceptions: 3, longestPass: 72 },
      { name: '임규성', team: '카이스트', passingYards: 31, avgYardsPerAttempt: 2.8, completionPercentage: 36.4, passingAttempts: 11, passingCompletions: 4, passingTouchdowns: 1, interceptions: 1, longestPass: 22 },
      { name: '조윤수', team: '한림대학교', passingYards: 7, avgYardsPerAttempt: 0.6, completionPercentage: 16.7, passingAttempts: 12, passingCompletions: 2, passingTouchdowns: 0, interceptions: 1, longestPass: 7 }
    ]
  },
  'Daegu-Gyeongbuk': {
    '1부': [
      { name: '고승주', team: '경북대학교', passingYards: 738, avgYardsPerAttempt: 5.2, completionPercentage: 53.8, passingAttempts: 143, passingCompletions: 77, passingTouchdowns: 12, interceptions: 5, longestPass: 90 },
      { name: '박병민', team: '경일대학교', passingYards: 246, avgYardsPerAttempt: 4.4, completionPercentage: 39.3, passingAttempts: 56, passingCompletions: 22, passingTouchdowns: 4, interceptions: 6, longestPass: 47 },
      { name: '김민우', team: '대구한의대학교', passingYards: 176, avgYardsPerAttempt: 2.7, completionPercentage: 36.9, passingAttempts: 65, passingCompletions: 24, passingTouchdowns: 1, interceptions: 1, longestPass: 17 },
      { name: '이주람', team: '한동대학교', passingYards: 171, avgYardsPerAttempt: 4.8, completionPercentage: 36.1, passingAttempts: 36, passingCompletions: 13, passingTouchdowns: 1, interceptions: 6, longestPass: 30 },
      { name: '이무진', team: '대구가톨릭대학교', passingYards: 66, avgYardsPerAttempt: 4.1, completionPercentage: 56.3, passingAttempts: 16, passingCompletions: 9, passingTouchdowns: 0, interceptions: 1, longestPass: 16 },
      { name: '유동윤', team: '경일대학교', passingYards: 58, avgYardsPerAttempt: 19.3, completionPercentage: 33.3, passingAttempts: 3, passingCompletions: 1, passingTouchdowns: 1, interceptions: 2, longestPass: 58 },
      { name: '김민석', team: '경일대학교', passingYards: 10, avgYardsPerAttempt: 10.0, completionPercentage: 100.0, passingAttempts: 1, passingCompletions: 1, passingTouchdowns: 0, interceptions: 0, longestPass: 10 }
    ],
    '2부': [
      { name: '윤정근', team: '금오공과대학교', passingYards: 270, avgYardsPerAttempt: 5.5, completionPercentage: 44.9, passingAttempts: 49, passingCompletions: 22, passingTouchdowns: 1, interceptions: 3, longestPass: 35 },
      { name: '이재원', team: '계명대학교', passingYards: 36, avgYardsPerAttempt: 1.7, completionPercentage: 23.8, passingAttempts: 21, passingCompletions: 5, passingTouchdowns: 1, interceptions: 3, longestPass: 11 },
      { name: '강경서', team: '금오공과대학교', passingYards: 18, avgYardsPerAttempt: 18.0, completionPercentage: 100.0, passingAttempts: 1, passingCompletions: 1, passingTouchdowns: 1, interceptions: 0, longestPass: 18 },
      { name: '신재웅', team: '영남대학교', passingYards: 8, avgYardsPerAttempt: 0.8, completionPercentage: 30.0, passingAttempts: 10, passingCompletions: 3, passingTouchdowns: 0, interceptions: 1, longestPass: 8 }
    ]
  },
  'Busan-Gyeongnam': {
    '1부': [
      { name: '천은수', team: '울산대학교', passingYards: 254, avgYardsPerAttempt: 5.2, completionPercentage: 63.3, passingAttempts: 49, passingCompletions: 31, passingTouchdowns: 4, interceptions: 3, longestPass: 37 },
      { name: '김동현', team: '경성대학교', passingYards: 245, avgYardsPerAttempt: 5.8, completionPercentage: 52.4, passingAttempts: 42, passingCompletions: 22, passingTouchdowns: 5, interceptions: 2, longestPass: 41 },
      { name: '신민호', team: '동의대학교', passingYards: 155, avgYardsPerAttempt: 4.1, completionPercentage: 31.6, passingAttempts: 38, passingCompletions: 12, passingTouchdowns: 2, interceptions: 4, longestPass: 27 },
      { name: '김혁', team: '동의대학교', passingYards: 56, avgYardsPerAttempt: 4.0, completionPercentage: 28.6, passingAttempts: 14, passingCompletions: 4, passingTouchdowns: 1, interceptions: 1, longestPass: 23 },
      { name: '김민서', team: '동아대학교', passingYards: 28, avgYardsPerAttempt: 1.2, completionPercentage: 20.8, passingAttempts: 24, passingCompletions: 5, passingTouchdowns: 0, interceptions: 2, longestPass: 14 }
    ],
    '2부': [
      { name: '이민서', team: '부산외국어대학교', passingYards: 290, avgYardsPerAttempt: 2.9, completionPercentage: 46.0, passingAttempts: 100, passingCompletions: 46, passingTouchdowns: 10, interceptions: 2, longestPass: 53 },
      { name: '장지훈', team: '신라대학교', passingYards: 222, avgYardsPerAttempt: 6.2, completionPercentage: 55.6, passingAttempts: 36, passingCompletions: 20, passingTouchdowns: 4, interceptions: 0, longestPass: 79 },
      { name: '장현성', team: '동서대학교', passingYards: 121, avgYardsPerAttempt: 2.9, completionPercentage: 28.6, passingAttempts: 42, passingCompletions: 12, passingTouchdowns: 3, interceptions: 4, longestPass: 43 },
      { name: '서한솔', team: '부산외국어대학교', passingYards: 10, avgYardsPerAttempt: 10.0, completionPercentage: 100.0, passingAttempts: 1, passingCompletions: 1, passingTouchdowns: 0, interceptions: 0, longestPass: 10 }
    ]
  }
};

// 리그별 패싱 통계 요약
export const passingStats = {
  'Seoul 1부': passingClassification.Seoul['1부'].length,
  'Seoul 2부': passingClassification.Seoul['2부'].length,
  'Gyeonggi-Gangwon 1부': passingClassification['Gyeonggi-Gangwon']['1부'].length,
  'Gyeonggi-Gangwon 2부': passingClassification['Gyeonggi-Gangwon']['2부'].length,
  'Daegu-Gyeongbuk 1부': passingClassification['Daegu-Gyeongbuk']['1부'].length,
  'Daegu-Gyeongbuk 2부': passingClassification['Daegu-Gyeongbuk']['2부'].length,
  'Busan-Gyeongnam 1부': passingClassification['Busan-Gyeongnam']['1부'].length,
  'Busan-Gyeongnam 2부': passingClassification['Busan-Gyeongnam']['2부'].length
};

console.log('패싱 협회 데이터 분류 결과:');
console.log('서울리그 1부:', passingStats['Seoul 1부'] + '명');
console.log('서울리그 2부:', passingStats['Seoul 2부'] + '명');
console.log('경기강원 1부:', passingStats['Gyeonggi-Gangwon 1부'] + '명');
console.log('경기강원 2부:', passingStats['Gyeonggi-Gangwon 2부'] + '명');
console.log('대구경북 1부:', passingStats['Daegu-Gyeongbuk 1부'] + '명');
console.log('대구경북 2부:', passingStats['Daegu-Gyeongbuk 2부'] + '명');
console.log('부산경남 1부:', passingStats['Busan-Gyeongnam 1부'] + '명');
console.log('부산경남 2부:', passingStats['Busan-Gyeongnam 2부'] + '명');