// 인터셉션 협회 데이터 분류 결과

import { TEAM_DIVISIONS } from './TEAM_DIVISIONS.js';

const interceptionData = [
  { rank: 1, name: '양병욱', number: '82번', team: '서울시립대학교', int: 5, intTD: 1, intYards: 106, longest: 54 },
  { rank: 2, name: '이재혁', number: '38번', team: '서강대학교', int: 4, intTD: 0, intYards: 4, longest: 2 },
  { rank: 2, name: '김정헌', number: '34번', team: '서울대학교', int: 4, intTD: 0, intYards: 27, longest: 18 },
  { rank: 4, name: '정재연', number: '35번', team: '국민대학교', int: 3, intTD: 0, intYards: 89, longest: 43 },
  { rank: 4, name: '황희재', number: '08번', team: '경북대학교', int: 3, intTD: 0, intYards: 31, longest: 16 },
  { rank: 4, name: '엄홍재', number: '31번', team: '서강대학교', int: 3, intTD: 1, intYards: 38, longest: 25 },
  { rank: 4, name: '옥기주', number: '07번', team: '경성대학교', int: 3, intTD: 0, intYards: 28, longest: 16 },
  { rank: 4, name: '윤상준', number: '10번', team: '고려대학교', int: 3, intTD: 0, intYards: 20, longest: 20 },
  { rank: 9, name: '오승욱', number: '14번', team: '숭실대학교', int: 2, intTD: 0, intYards: 32, longest: 32 },
  { rank: 9, name: '김태우', number: '08번', team: '동국대학교', int: 2, intTD: 0, intYards: 13, longest: 13 },
  { rank: 9, name: '곽효석', number: '87번', team: '중앙대학교', int: 2, intTD: 0, intYards: 2, longest: 2 },
  { rank: 9, name: '김무성', number: '13번', team: '단국대학교', int: 2, intTD: 0, intYards: 72, longest: 62 },
  { rank: 9, name: '서동주', number: '00번', team: '서울대학교', int: 2, intTD: 0, intYards: 10, longest: 9 },
  { rank: 9, name: '박현우', number: '09번', team: '경북대학교', int: 2, intTD: 0, intYards: 0, longest: 0 },
  { rank: 9, name: '김민재', number: '74번', team: '금오공과대학교', int: 2, intTD: 0, intYards: 13, longest: 8 },
  { rank: 9, name: '윤석진', number: '27번', team: '서울시립대학교', int: 2, intTD: 0, intYards: 6, longest: 6 },
  { rank: 9, name: '박서준', number: '45번', team: '서강대학교', int: 2, intTD: 0, intYards: 5, longest: 5 },
  { rank: 9, name: '김성민', number: '15번', team: '서울대학교', int: 2, intTD: 0, intYards: 44, longest: 25 },
  { rank: 9, name: '정재성', number: '22번', team: '성균관대학교', int: 2, intTD: 0, intYards: 24, longest: 20 },
  { rank: 9, name: '박재형', number: '03번', team: '강원대학교', int: 2, intTD: 0, intYards: 62, longest: 39 },
  { rank: 9, name: '최승종', number: '26번', team: '연세대학교', int: 2, intTD: 0, intYards: 3, longest: 3 },
  { rank: 9, name: '변지욱', number: '32번', team: '경일대학교', int: 2, intTD: 0, intYards: 32, longest: 27 },
  { rank: 9, name: '박승원', number: '87번', team: '성균관대학교', int: 2, intTD: 0, intYards: 5, longest: 5 },
  { rank: 9, name: '박병민', number: '11번', team: '경일대학교', int: 2, intTD: 0, intYards: 30, longest: 18 },
  { rank: 9, name: '이승호', number: '06번', team: '강원대학교', int: 2, intTD: 0, intYards: 16, longest: 16 },
  { rank: 9, name: '이민준', number: '05번', team: '영남대학교', int: 2, intTD: 1, intYards: 65, longest: 50 },
  { rank: 9, name: '황성현', number: '99번', team: '고려대학교', int: 2, intTD: 1, intYards: 58, longest: 32 },
  { rank: 9, name: '노건호', number: '23번', team: '한양대학교', int: 2, intTD: 0, intYards: 3, longest: 3 },
  { rank: 9, name: '정창균', number: '35번', team: '영남대학교', int: 2, intTD: 0, intYards: 0, longest: 0 },
  { rank: 9, name: '김민겸', number: '26번', team: '한양대학교', int: 2, intTD: 0, intYards: 26, longest: 22 },
  { rank: 9, name: '조다빈', number: '80번', team: '성균관대학교', int: 2, intTD: 0, intYards: 13, longest: 13 },
  { rank: 9, name: '박종후', number: '93번', team: '경성대학교', int: 2, intTD: 0, intYards: 96, longest: 71 },
  { rank: 33, name: '권지훈', number: '03번', team: '영남대학교', int: 1, intTD: 0, intYards: 0, longest: 0 },
  { rank: 33, name: '이주헌', number: '22번', team: '동국대학교', int: 1, intTD: 0, intYards: 0, longest: 0 },
  { rank: 33, name: '박재현', number: '08번', team: '한양대학교', int: 1, intTD: 0, intYards: 45, longest: 45 },
  { rank: 33, name: '박온', number: '18번', team: '성균관대학교', int: 1, intTD: 0, intYards: 4, longest: 4 },
  { rank: 33, name: '문의찬', number: '45번', team: '서울시립대학교', int: 1, intTD: 0, intYards: 35, longest: 35 },
  { rank: 33, name: '이예승', number: '09번', team: '부산외국어대학교', int: 1, intTD: 0, intYards: 5, longest: 5 },
  { rank: 33, name: '송호진', number: '19번', team: '대구대학교', int: 1, intTD: 0, intYards: 3, longest: 3 },
  { rank: 33, name: '김준영', number: '47번', team: '강원대학교', int: 1, intTD: 0, intYards: 7, longest: 7 },
  { rank: 33, name: '김동현', number: '01번', team: '경성대학교', int: 1, intTD: 0, intYards: 0, longest: 0 },
  { rank: 33, name: '박은민', number: '10번', team: '홍익대학교', int: 1, intTD: 0, intYards: 0, longest: 0 },
  { rank: 33, name: '강경서', number: '21번', team: '금오공과대학교', int: 1, intTD: 0, intYards: 0, longest: 0 },
  { rank: 33, name: '김건원', number: '21번', team: '서울시립대학교', int: 1, intTD: 0, intYards: 40, longest: 40 },
  { rank: 33, name: '장준영', number: '10번', team: '카이스트', int: 1, intTD: 0, intYards: 0, longest: 0 },
  { rank: 33, name: '신재윤', number: '08번', team: '인하대학교', int: 1, intTD: 0, intYards: 4, longest: 4 },
  { rank: 33, name: '이재욱', number: '28번', team: '한양대학교', int: 1, intTD: 0, intYards: 13, longest: 13 },
  { rank: 33, name: '임윤서', number: '21번', team: '대구한의대학교', int: 1, intTD: 0, intYards: 0, longest: 0 },
  { rank: 33, name: '강채민', number: '81번', team: '부산외국어대학교', int: 1, intTD: 0, intYards: 10, longest: 10 },
  { rank: 33, name: '최성원', number: '20번', team: '한국해양대학교', int: 1, intTD: 0, intYards: 0, longest: 0 }
];

// 분류 결과
export const interceptionClassification = {
  'Seoul': {
    '1부': [
      { name: '양병욱', team: '서울시립대학교', interceptions: 5, interceptionTouchdowns: 1, interceptionYards: 106, longestInterception: 54 },
      { name: '김정헌', team: '서울대학교', interceptions: 4, interceptionTouchdowns: 0, interceptionYards: 27, longestInterception: 18 },
      { name: '정재연', team: '국민대학교', interceptions: 3, interceptionTouchdowns: 0, interceptionYards: 89, longestInterception: 43 },
      { name: '서동주', team: '서울대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 10, longestInterception: 9 },
      { name: '윤석진', team: '서울시립대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 6, longestInterception: 6 },
      { name: '김성민', team: '서울대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 44, longestInterception: 25 },
      { name: '최승종', team: '연세대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 3, longestInterception: 3 },
      { name: '노건호', team: '한양대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 3, longestInterception: 3 },
      { name: '김민겸', team: '한양대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 26, longestInterception: 22 },
      { name: '박재현', team: '한양대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 45, longestInterception: 45 },
      { name: '문의찬', team: '서울시립대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 35, longestInterception: 35 },
      { name: '박은민', team: '홍익대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 0, longestInterception: 0 },
      { name: '김건원', team: '서울시립대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 40, longestInterception: 40 },
      { name: '이재욱', team: '한양대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 13, longestInterception: 13 }
    ],
    '2부': [
      { name: '이재혁', team: '서강대학교', interceptions: 4, interceptionTouchdowns: 0, interceptionYards: 4, longestInterception: 2 },
      { name: '엄홍재', team: '서강대학교', interceptions: 3, interceptionTouchdowns: 1, interceptionYards: 38, longestInterception: 25 },
      { name: '윤상준', team: '고려대학교', interceptions: 3, interceptionTouchdowns: 0, interceptionYards: 20, longestInterception: 20 },
      { name: '오승욱', team: '숭실대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 32, longestInterception: 32 },
      { name: '김태우', team: '동국대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 13, longestInterception: 13 },
      { name: '곽효석', team: '중앙대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 2, longestInterception: 2 },
      { name: '박서준', team: '서강대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 5, longestInterception: 5 },
      { name: '황성현', team: '고려대학교', interceptions: 2, interceptionTouchdowns: 1, interceptionYards: 58, longestInterception: 32 },
      { name: '이주헌', team: '동국대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 0, longestInterception: 0 }
    ]
  },
  'Gyeonggi-Gangwon': {
    '1부': [
      { name: '김무성', team: '단국대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 72, longestInterception: 62 },
      { name: '정재성', team: '성균관대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 24, longestInterception: 20 },
      { name: '박재형', team: '강원대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 62, longestInterception: 39 },
      { name: '박승원', team: '성균관대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 5, longestInterception: 5 },
      { name: '이승호', team: '강원대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 16, longestInterception: 16 },
      { name: '조다빈', team: '성균관대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 13, longestInterception: 13 },
      { name: '박온', team: '성균관대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 4, longestInterception: 4 },
      { name: '김준영', team: '강원대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 7, longestInterception: 7 },
      { name: '신재윤', team: '인하대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 4, longestInterception: 4 }
    ],
    '2부': [
      { name: '장준영', team: '카이스트', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 0, longestInterception: 0 }
    ]
  },
  'Daegu-Gyeongbuk': {
    '1부': [
      { name: '황희재', team: '경북대학교', interceptions: 3, interceptionTouchdowns: 0, interceptionYards: 31, longestInterception: 16 },
      { name: '박현우', team: '경북대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 0, longestInterception: 0 },
      { name: '변지욱', team: '경일대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 32, longestInterception: 27 },
      { name: '박병민', team: '경일대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 30, longestInterception: 18 },
      { name: '임윤서', team: '대구한의대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 0, longestInterception: 0 }
    ],
    '2부': [
      { name: '김민재', team: '금오공과대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 13, longestInterception: 8 },
      { name: '이민준', team: '영남대학교', interceptions: 2, interceptionTouchdowns: 1, interceptionYards: 65, longestInterception: 50 },
      { name: '정창균', team: '영남대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 0, longestInterception: 0 },
      { name: '권지훈', team: '영남대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 0, longestInterception: 0 },
      { name: '송호진', team: '대구대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 3, longestInterception: 3 },
      { name: '강경서', team: '금오공과대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 0, longestInterception: 0 }
    ]
  },
  'Busan-Gyeongnam': {
    '1부': [
      { name: '옥기주', team: '경성대학교', interceptions: 3, interceptionTouchdowns: 0, interceptionYards: 28, longestInterception: 16 },
      { name: '박종후', team: '경성대학교', interceptions: 2, interceptionTouchdowns: 0, interceptionYards: 96, longestInterception: 71 },
      { name: '김동현', team: '경성대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 0, longestInterception: 0 }
    ],
    '2부': [
      { name: '이예승', team: '부산외국어대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 5, longestInterception: 5 },
      { name: '강채민', team: '부산외국어대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 10, longestInterception: 10 },
      { name: '최성원', team: '한국해양대학교', interceptions: 1, interceptionTouchdowns: 0, interceptionYards: 0, longestInterception: 0 }
    ]
  }
};

// 리그별 인터셉션 통계 요약
export const interceptionStats = {
  'Seoul 1부': interceptionClassification.Seoul['1부'].length,
  'Seoul 2부': interceptionClassification.Seoul['2부'].length,
  'Gyeonggi-Gangwon 1부': interceptionClassification['Gyeonggi-Gangwon']['1부'].length,
  'Gyeonggi-Gangwon 2부': interceptionClassification['Gyeonggi-Gangwon']['2부'].length,
  'Daegu-Gyeongbuk 1부': interceptionClassification['Daegu-Gyeongbuk']['1부'].length,
  'Daegu-Gyeongbuk 2부': interceptionClassification['Daegu-Gyeongbuk']['2부'].length,
  'Busan-Gyeongnam 1부': interceptionClassification['Busan-Gyeongnam']['1부'].length,
  'Busan-Gyeongnam 2부': interceptionClassification['Busan-Gyeongnam']['2부'].length
};

console.log('인터셉션 협회 데이터 분류 결과:');
console.log('서울리그 1부:', interceptionStats['Seoul 1부'] + '명');
console.log('서울리그 2부:', interceptionStats['Seoul 2부'] + '명');
console.log('경기강원 1부:', interceptionStats['Gyeonggi-Gangwon 1부'] + '명');
console.log('경기강원 2부:', interceptionStats['Gyeonggi-Gangwon 2부'] + '명');
console.log('대구경북 1부:', interceptionStats['Daegu-Gyeongbuk 1부'] + '명');
console.log('대구경북 2부:', interceptionStats['Daegu-Gyeongbuk 2부'] + '명');
console.log('부산경남 1부:', interceptionStats['Busan-Gyeongnam 1부'] + '명');
console.log('부산경남 2부:', interceptionStats['Busan-Gyeongnam 2부'] + '명');