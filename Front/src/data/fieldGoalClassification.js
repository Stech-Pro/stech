// 필드골 협회 데이터 분류 결과

import { TEAM_DIVISIONS } from './TEAM_DIVISIONS.js';

const fieldGoalData = [
  { name: '이찬유', team: '한신대학교', percentage: 100.0 },
  { name: '윤석진', team: '서울시립대학교', percentage: 100.0 },
  { name: '김진혁', team: '서울대학교', percentage: 100.0 },
  { name: '김대웅', team: '홍익대학교', percentage: 100.0 },
  { name: '강지민', team: '서강대학교', percentage: 100.0 },
  { name: '공성욱', team: '건국대학교', percentage: 100.0 },
  { name: '이재성', team: '연세대학교', percentage: 100.0 },
  { name: '이준섭', team: '부산외국어대학교', percentage: 75.0 },
  { name: '소진규', team: '한양대학교', percentage: 75.0 },
  { name: '최윤수', team: '연세대학교', percentage: 66.7 },
  { name: '이종혁', team: '서울대학교', percentage: 50.0 },
  { name: '배민재', team: '경일대학교', percentage: 50.0 },
  { name: '박지훈', team: '강원대학교', percentage: 50.0 },
  { name: '오성민', team: '한국외국어대학교', percentage: 50.0 },
  { name: '최수종', team: '고려대학교', percentage: 20.0 },
  { name: '조다빈', team: '성균관대학교', percentage: 0.0 },
  { name: '권준호', team: '경희대학교', percentage: 0.0 },
  { name: '황희재', team: '경북대학교', percentage: 0.0 },
  { name: '김민우', team: '대구한의대학교', percentage: 0.0 },
  { name: '김동혁', team: '동아대학교', percentage: 0.0 },
  { name: '이상현', team: '단국대학교', percentage: 0.0 },
  { name: '박재우', team: '중앙대학교', percentage: 0.0 }
];

// 분류 결과
export const fieldGoalClassification = {
  'Seoul': {
    '1부': [
      { name: '윤석진', team: '서울시립대학교', percentage: 100.0 },
      { name: '김진혁', team: '서울대학교', percentage: 100.0 },
      { name: '김대웅', team: '홍익대학교', percentage: 100.0 },
      { name: '공성욱', team: '건국대학교', percentage: 100.0 },
      { name: '이재성', team: '연세대학교', percentage: 100.0 },
      { name: '소진규', team: '한양대학교', percentage: 75.0 },
      { name: '최윤수', team: '연세대학교', percentage: 66.7 },
      { name: '이종혁', team: '서울대학교', percentage: 50.0 },
      { name: '오성민', team: '한국외국어대학교', percentage: 50.0 }
    ],
    '2부': [
      { name: '강지민', team: '서강대학교', percentage: 100.0 },
      { name: '최수종', team: '고려대학교', percentage: 20.0 },
      { name: '권준호', team: '경희대학교', percentage: 0.0 },
      { name: '박재우', team: '중앙대학교', percentage: 0.0 }
    ]
  },
  'Gyeonggi-Gangwon': {
    '1부': [
      { name: '박지훈', team: '강원대학교', percentage: 50.0 },
      { name: '조다빈', team: '성균관대학교', percentage: 0.0 }
    ],
    '2부': [
      { name: '이찬유', team: '한신대학교', percentage: 100.0 },
      { name: '이상현', team: '단국대학교', percentage: 0.0 }
    ]
  },
  'Daegu-Gyeongbuk': {
    '1부': [
      { name: '배민재', team: '경일대학교', percentage: 50.0 },
      { name: '황희재', team: '경북대학교', percentage: 0.0 }
    ],
    '2부': [
      { name: '김민우', team: '대구한의대학교', percentage: 0.0 }
    ]
  },
  'Busan-Gyeongnam': {
    '1부': [
      { name: '김동혁', team: '동아대학교', percentage: 0.0 }
    ],
    '2부': [
      { name: '이준섭', team: '부산외국어대학교', percentage: 75.0 }
    ]
  }
};

console.log('필드골 협회 데이터 분류 결과:');
console.log('서울리그 1부:', fieldGoalClassification.Seoul['1부'].length + '명');
console.log('서울리그 2부:', fieldGoalClassification.Seoul['2부'].length + '명');
console.log('경기강원 1부:', fieldGoalClassification['Gyeonggi-Gangwon']['1부'].length + '명');
console.log('경기강원 2부:', fieldGoalClassification['Gyeonggi-Gangwon']['2부'].length + '명');
console.log('대구경북 1부:', fieldGoalClassification['Daegu-Gyeongbuk']['1부'].length + '명');
console.log('대구경북 2부:', fieldGoalClassification['Daegu-Gyeongbuk']['2부'].length + '명');
console.log('부산경남 1부:', fieldGoalClassification['Busan-Gyeongnam']['1부'].length + '명');
console.log('부산경남 2부:', fieldGoalClassification['Busan-Gyeongnam']['2부'].length + '명');