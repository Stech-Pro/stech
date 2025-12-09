// 킥오프리턴 협회 데이터 분류 결과

import { TEAM_DIVISIONS } from './TEAM_DIVISIONS.js';

const kickoffReturnData = [
  { rank: 1, name: '이선우', number: '10번', team: '서울대학교', avg: 57.5, count: 2, total: 107, ret: 1, longest: 88 },
  { rank: 2, name: '한지섭', number: '24번', team: '한림대학교', avg: 45.0, count: 1, total: 45, ret: 0, longest: 45 },
  { rank: 2, name: '이승재', number: '18번', team: '인하대학교', avg: 45.0, count: 2, total: 110, ret: 1, longest: 90 },
  { rank: 4, name: '장우영', number: '26번', team: '숭실대학교', avg: 43.0, count: 1, total: 44, ret: 0, longest: 43 },
  { rank: 5, name: '임성원', number: '40번', team: '강원대학교', avg: 42.0, count: 1, total: 55, ret: 0, longest: 42 },
  { rank: 6, name: '박윤서', number: '49번', team: '인하대학교', avg: 35.2, count: 5, total: 232, ret: 2, longest: 70 },
  { rank: 7, name: '이성수', number: '21번', team: '부산대학교', avg: 33.7, count: 3, total: 103, ret: 1, longest: 63 },
  { rank: 8, name: '강경서', number: '21번', team: '금오공과대학교', avg: 32.5, count: 2, total: 93, ret: 0, longest: 33 },
  { rank: 9, name: '김두호', number: '17번', team: '경희대학교', avg: 31.3, count: 4, total: 165, ret: 0, longest: 75 },
  { rank: 10, name: '강지민', number: '74번', team: '서강대학교', avg: 29.5, count: 2, total: 105, ret: 0, longest: 32 },
  { rank: 11, name: '권용준', number: '84번', team: '서울시립대학교', avg: 29.0, count: 2, total: 95, ret: 0, longest: 33 },
  { rank: 11, name: '민경훈', number: '14번', team: '동국대학교', avg: 29.0, count: 1, total: 47, ret: 0, longest: 29 },
  { rank: 13, name: '황승연', number: '34번', team: '연세대학교', avg: 28.0, count: 1, total: 30, ret: 0, longest: 28 },
  { rank: 13, name: '조성환', number: '28번', team: '연세대학교', avg: 28.0, count: 3, total: 181, ret: 0, longest: 30 },
  { rank: 13, name: '권동규', number: '18번', team: '신라대학교', avg: 28.0, count: 1, total: 37, ret: 0, longest: 28 },
  { rank: 16, name: '박상원', number: '03번', team: '서울대학교', avg: 26.5, count: 2, total: 110, ret: 0, longest: 31 },
  { rank: 17, name: '임지민', number: '10번', team: '동의대학교', avg: 26.4, count: 5, total: 245, ret: 0, longest: 46 },
  { rank: 18, name: '하태창', number: '23번', team: '울산대학교', avg: 26.0, count: 1, total: 55, ret: 0, longest: 26 },
  { rank: 19, name: '조현영', number: '01번', team: '경북대학교', avg: 25.3, count: 4, total: 221, ret: 0, longest: 29 },
  { rank: 20, name: '이현호', number: '27번', team: '동서대학교', avg: 23.5, count: 2, total: 105, ret: 0, longest: 24 },
  { rank: 21, name: '장준영', number: '10번', team: '카이스트', avg: 23.0, count: 1, total: 47, ret: 0, longest: 23 },
  { rank: 21, name: '안태현', number: '13번', team: '용인대학교', avg: 23.0, count: 1, total: 50, ret: 0, longest: 23 },
  { rank: 21, name: '이서준', number: '81번', team: '경희대학교', avg: 23.0, count: 4, total: 144, ret: 0, longest: 32 },
  { rank: 24, name: '박우진', number: '82번', team: '신라대학교', avg: 22.0, count: 1, total: 0, ret: 0, longest: 22 },
  { rank: 25, name: '소진규', number: '10번', team: '한양대학교', avg: 21.5, count: 8, total: 219, ret: 0, longest: 40 },
  { rank: 25, name: '박경빈', number: '91번', team: '강원대학교', avg: 21.5, count: 2, total: 100, ret: 0, longest: 42 },
  { rank: 27, name: '방정현', number: '91번', team: '한국해양대학교', avg: 21.4, count: 5, total: 263, ret: 0, longest: 25 },
  { rank: 28, name: '황희재', number: '08번', team: '경북대학교', avg: 21.3, count: 3, total: 173, ret: 0, longest: 24 },
  { rank: 29, name: '강채민', number: '81번', team: '부산외국어대학교', avg: 21.0, count: 1, total: 33, ret: 0, longest: 21 },
  { rank: 29, name: '허유현', number: '33번', team: '한동대학교', avg: 21.0, count: 2, total: 115, ret: 0, longest: 22 },
  { rank: 31, name: '김강민', number: '07번', team: '경북대학교', avg: 20.8, count: 4, total: 208, ret: 0, longest: 30 },
  { rank: 32, name: '양선빈', number: '11번', team: '동국대학교', avg: 20.0, count: 1, total: 46, ret: 0, longest: 20 },
  { rank: 32, name: '나승현', number: '13번', team: '한신대학교', avg: 20.0, count: 3, total: 136, ret: 0, longest: 28 },
  { rank: 32, name: '노현용', number: '67번', team: '영남대학교', avg: 20.0, count: 1, total: 37, ret: 0, longest: 20 },
  { rank: 32, name: '이강원', number: '08번', team: '카이스트', avg: 20.0, count: 1, total: 48, ret: 0, longest: 20 },
  { rank: 32, name: '변예준', number: '34번', team: '중앙대학교', avg: 20.0, count: 1, total: 25, ret: 0, longest: 20 },
  { rank: 37, name: '김세윤', number: '81번', team: '홍익대학교', avg: 19.0, count: 1, total: 0, ret: 0, longest: 19 },
  { rank: 37, name: '박종석', number: '06번', team: '대구한의대학교', avg: 19.0, count: 1, total: 27, ret: 0, longest: 19 },
  { rank: 37, name: '조다빈', number: '80번', team: '성균관대학교', avg: 19.0, count: 2, total: 101, ret: 0, longest: 23 },
  { rank: 40, name: '공덕현', number: '21번', team: '중앙대학교', avg: 18.3, count: 3, total: 113, ret: 0, longest: 23 },
  { rank: 40, name: '정재연', number: '35번', team: '국민대학교', avg: 18.3, count: 3, total: 125, ret: 0, longest: 30 },
  { rank: 42, name: '유동윤', number: '18번', team: '경일대학교', avg: 18.1, count: 8, total: 428, ret: 0, longest: 35 },
  { rank: 43, name: '이원호', number: '81번', team: '서울시립대학교', avg: 18.0, count: 2, total: 115, ret: 0, longest: 25 },
  { rank: 43, name: '김동휘', number: '18번', team: '고려대학교', avg: 18.0, count: 1, total: 45, ret: 0, longest: 18 },
  { rank: 43, name: '박종후', number: '93번', team: '경성대학교', avg: 18.0, count: 3, total: 56, ret: 0, longest: 24 },
  { rank: 43, name: '이민준', number: '05번', team: '영남대학교', avg: 18.0, count: 1, total: 50, ret: 0, longest: 18 },
  { rank: 43, name: '이재성', number: '21번', team: '연세대학교', avg: 18.0, count: 1, total: 55, ret: 0, longest: 18 },
  { rank: 43, name: '이준상', number: '07번', team: '연세대학교', avg: 18.0, count: 2, total: 57, ret: 0, longest: 22 },
  { rank: 43, name: '천성우', number: '11번', team: '용인대학교', avg: 18.0, count: 1, total: 34, ret: 0, longest: 18 },
  { rank: 43, name: '성지훈', number: '26번', team: '단국대학교', avg: 18.0, count: 3, total: 144, ret: 0, longest: 32 }
];

// 분류 결과
export const kickoffReturnClassification = {
  'Seoul': {
    '1부': [
      { name: '이선우', team: '서울대학교', avg: 57.5, count: 2, longest: 88, ret: 1 },
      { name: '권용준', team: '서울시립대학교', avg: 29.0, count: 2, longest: 33, ret: 0 },
      { name: '황승연', team: '연세대학교', avg: 28.0, count: 1, longest: 28, ret: 0 },
      { name: '조성환', team: '연세대학교', avg: 28.0, count: 3, longest: 30, ret: 0 },
      { name: '박상원', team: '서울대학교', avg: 26.5, count: 2, longest: 31, ret: 0 },
      { name: '소진규', team: '한양대학교', avg: 21.5, count: 8, longest: 40, ret: 0 },
      { name: '정재연', team: '국민대학교', avg: 18.3, count: 3, longest: 30, ret: 0 },
      { name: '이원호', team: '서울시립대학교', avg: 18.0, count: 2, longest: 25, ret: 0 },
      { name: '이재성', team: '연세대학교', avg: 18.0, count: 1, longest: 18, ret: 0 },
      { name: '이준상', team: '연세대학교', avg: 18.0, count: 2, longest: 22, ret: 0 },
      { name: '김세윤', team: '홍익대학교', avg: 19.0, count: 1, longest: 19, ret: 0 }
    ],
    '2부': [
      { name: '장우영', team: '숭실대학교', avg: 43.0, count: 1, longest: 43, ret: 0 },
      { name: '김두호', team: '경희대학교', avg: 31.3, count: 4, longest: 75, ret: 0 },
      { name: '강지민', team: '서강대학교', avg: 29.5, count: 2, longest: 32, ret: 0 },
      { name: '민경훈', team: '동국대학교', avg: 29.0, count: 1, longest: 29, ret: 0 },
      { name: '이서준', team: '경희대학교', avg: 23.0, count: 4, longest: 32, ret: 0 },
      { name: '양선빈', team: '동국대학교', avg: 20.0, count: 1, longest: 20, ret: 0 },
      { name: '변예준', team: '중앙대학교', avg: 20.0, count: 1, longest: 20, ret: 0 },
      { name: '공덕현', team: '중앙대학교', avg: 18.3, count: 3, longest: 23, ret: 0 },
      { name: '김동휘', team: '고려대학교', avg: 18.0, count: 1, longest: 18, ret: 0 }
    ]
  },
  'Gyeonggi-Gangwon': {
    '1부': [
      { name: '이승재', team: '인하대학교', avg: 45.0, count: 2, longest: 90, ret: 1 },
      { name: '임성원', team: '강원대학교', avg: 42.0, count: 1, longest: 42, ret: 0 },
      { name: '박윤서', team: '인하대학교', avg: 35.2, count: 5, longest: 70, ret: 2 },
      { name: '박경빈', team: '강원대학교', avg: 21.5, count: 2, longest: 42, ret: 0 },
      { name: '조다빈', team: '성균관대학교', avg: 19.0, count: 2, longest: 23, ret: 0 },
      { name: '성지훈', team: '단국대학교', avg: 18.0, count: 3, longest: 32, ret: 0 }
    ],
    '2부': [
      { name: '한지섭', team: '한림대학교', avg: 45.0, count: 1, longest: 45, ret: 0 },
      { name: '장준영', team: '카이스트', avg: 23.0, count: 1, longest: 23, ret: 0 },
      { name: '안태현', team: '용인대학교', avg: 23.0, count: 1, longest: 23, ret: 0 },
      { name: '나승현', team: '한신대학교', avg: 20.0, count: 3, longest: 28, ret: 0 },
      { name: '이강원', team: '카이스트', avg: 20.0, count: 1, longest: 20, ret: 0 },
      { name: '천성우', team: '용인대학교', avg: 18.0, count: 1, longest: 18, ret: 0 }
    ]
  },
  'Daegu-Gyeongbuk': {
    '1부': [
      { name: '조현영', team: '경북대학교', avg: 25.3, count: 4, longest: 29, ret: 0 },
      { name: '황희재', team: '경북대학교', avg: 21.3, count: 3, longest: 24, ret: 0 },
      { name: '허유현', team: '한동대학교', avg: 21.0, count: 2, longest: 22, ret: 0 },
      { name: '김강민', team: '경북대학교', avg: 20.8, count: 4, longest: 30, ret: 0 },
      { name: '박종석', team: '대구한의대학교', avg: 19.0, count: 1, longest: 19, ret: 0 },
      { name: '유동윤', team: '경일대학교', avg: 18.1, count: 8, longest: 35, ret: 0 }
    ],
    '2부': [
      { name: '강경서', team: '금오공과대학교', avg: 32.5, count: 2, longest: 33, ret: 0 },
      { name: '노현용', team: '영남대학교', avg: 20.0, count: 1, longest: 20, ret: 0 },
      { name: '이민준', team: '영남대학교', avg: 18.0, count: 1, longest: 18, ret: 0 }
    ]
  },
  'Busan-Gyeongnam': {
    '1부': [
      { name: '임지민', team: '동의대학교', avg: 26.4, count: 5, longest: 46, ret: 0 },
      { name: '하태창', team: '울산대학교', avg: 26.0, count: 1, longest: 26, ret: 0 },
      { name: '박종후', team: '경성대학교', avg: 18.0, count: 3, longest: 24, ret: 0 }
    ],
    '2부': [
      { name: '이성수', team: '부산대학교', avg: 33.7, count: 3, longest: 63, ret: 1 },
      { name: '권동규', team: '신라대학교', avg: 28.0, count: 1, longest: 28, ret: 0 },
      { name: '이현호', team: '동서대학교', avg: 23.5, count: 2, longest: 24, ret: 0 },
      { name: '박우진', team: '신라대학교', avg: 22.0, count: 1, longest: 22, ret: 0 },
      { name: '방정현', team: '한국해양대학교', avg: 21.4, count: 5, longest: 25, ret: 0 },
      { name: '강채민', team: '부산외국어대학교', avg: 21.0, count: 1, longest: 21, ret: 0 }
    ]
  }
};

// 리그별 킥오프리턴 통계 요약
export const kickoffReturnStats = {
  'Seoul 1부': kickoffReturnClassification.Seoul['1부'].length,
  'Seoul 2부': kickoffReturnClassification.Seoul['2부'].length,
  'Gyeonggi-Gangwon 1부': kickoffReturnClassification['Gyeonggi-Gangwon']['1부'].length,
  'Gyeonggi-Gangwon 2부': kickoffReturnClassification['Gyeonggi-Gangwon']['2부'].length,
  'Daegu-Gyeongbuk 1부': kickoffReturnClassification['Daegu-Gyeongbuk']['1부'].length,
  'Daegu-Gyeongbuk 2부': kickoffReturnClassification['Daegu-Gyeongbuk']['2부'].length,
  'Busan-Gyeongnam 1부': kickoffReturnClassification['Busan-Gyeongnam']['1부'].length,
  'Busan-Gyeongnam 2부': kickoffReturnClassification['Busan-Gyeongnam']['2부'].length
};

console.log('킥오프리턴 협회 데이터 분류 결과:');
console.log('서울리그 1부:', kickoffReturnStats['Seoul 1부'] + '명');
console.log('서울리그 2부:', kickoffReturnStats['Seoul 2부'] + '명');
console.log('경기강원 1부:', kickoffReturnStats['Gyeonggi-Gangwon 1부'] + '명');
console.log('경기강원 2부:', kickoffReturnStats['Gyeonggi-Gangwon 2부'] + '명');
console.log('대구경북 1부:', kickoffReturnStats['Daegu-Gyeongbuk 1부'] + '명');
console.log('대구경북 2부:', kickoffReturnStats['Daegu-Gyeongbuk 2부'] + '명');
console.log('부산경남 1부:', kickoffReturnStats['Busan-Gyeongnam 1부'] + '명');
console.log('부산경남 2부:', kickoffReturnStats['Busan-Gyeongnam 2부'] + '명');