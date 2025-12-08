// 킥오프 협회 데이터 분류 결과

import { TEAM_DIVISIONS } from './TEAM_DIVISIONS.js';

const kickoffData = [
  { rank: 1, name: '이종혁', number: '08번', team: '서울대학교', avg: 64.0, count: 1, total: 64, ret: 0, longest: 64 },
  { rank: 2, name: '윤석진', number: '27번', team: '서울시립대학교', avg: 60.0, count: 1, total: 60, ret: 0, longest: 60 },
  { rank: 2, name: '박형우', number: '61번', team: '경일대학교', avg: 60.0, count: 1, total: 60, ret: 0, longest: 60 },
  { rank: 4, name: '김태준', number: '54번', team: '경희대학교', avg: 59.0, count: 1, total: 59, ret: 0, longest: 59 },
  { rank: 5, name: '배민재', number: '89번', team: '경일대학교', avg: 56.7, count: 16, total: 907, ret: 0, longest: 65 },
  { rank: 6, name: '최준근', number: '99번', team: '강원대학교', avg: 55.0, count: 1, total: 55, ret: 0, longest: 55 },
  { rank: 6, name: '김민규', number: '28번', team: '영남대학교', avg: 55.0, count: 1, total: 55, ret: 0, longest: 55 },
  { rank: 8, name: '김진혁', number: '58번', team: '서울대학교', avg: 53.6, count: 9, total: 482, ret: 0, longest: 65 },
  { rank: 9, name: '김진구', number: '56번', team: '대구가톨릭대학교', avg: 53.3, count: 3, total: 160, ret: 0, longest: 58 },
  { rank: 10, name: '엄정훈', number: '87번', team: '카이스트', avg: 52.0, count: 1, total: 52, ret: 0, longest: 52 },
  { rank: 11, name: '권준호', number: '64번', team: '경희대학교', avg: 51.7, count: 3, total: 155, ret: 0, longest: 59 },
  { rank: 12, name: '송영민', number: '63번', team: '카이스트', avg: 51.0, count: 1, total: 51, ret: 0, longest: 51 },
  { rank: 12, name: '이무진', number: '35번', team: '대구가톨릭대학교', avg: 51.0, count: 1, total: 51, ret: 0, longest: 51 },
  { rank: 14, name: '이영준', number: '72번', team: '동국대학교', avg: 50.0, count: 1, total: 50, ret: 0, longest: 50 },
  { rank: 14, name: '이성수', number: '21번', team: '부산대학교', avg: 50.0, count: 1, total: 50, ret: 0, longest: 50 },
  { rank: 16, name: '박기용', number: '08번', team: '신라대학교', avg: 49.9, count: 7, total: 349, ret: 0, longest: 65 },
  { rank: 17, name: '권지훈', number: '03번', team: '영남대학교', avg: 49.6, count: 5, total: 248, ret: 0, longest: 56 },
  { rank: 18, name: '전민우', number: '12번', team: '경북대학교', avg: 48.8, count: 8, total: 390, ret: 1, longest: 65 },
  { rank: 19, name: '조다빈', number: '80번', team: '성균관대학교', avg: 48.6, count: 9, total: 437, ret: 0, longest: 65 },
  { rank: 20, name: '김동혁', number: '43번', team: '동아대학교', avg: 48.5, count: 2, total: 97, ret: 0, longest: 51 },
  { rank: 21, name: '박기성', number: '49번', team: '한동대학교', avg: 48.4, count: 5, total: 242, ret: 0, longest: 55 },
  { rank: 22, name: '장혜인', number: '90번', team: '서울시립대학교', avg: 48.3, count: 4, total: 193, ret: 0, longest: 65 },
  { rank: 23, name: '배민수', number: '64번', team: '중앙대학교', avg: 47.7, count: 3, total: 143, ret: 0, longest: 55 },
  { rank: 24, name: '방정현', number: '91번', team: '한국해양대학교', avg: 47.4, count: 12, total: 569, ret: 0, longest: 54 },
  { rank: 25, name: '배성민', number: '10번', team: '성균관대학교', avg: 47.2, count: 6, total: 283, ret: 0, longest: 50 },
  { rank: 26, name: '강경서', number: '21번', team: '금오공과대학교', avg: 47.0, count: 2, total: 94, ret: 0, longest: 48 },
  { rank: 26, name: '김준영', number: '76번', team: '울산대학교', avg: 47.0, count: 1, total: 47, ret: 0, longest: 47 },
  { rank: 28, name: '유재원', number: '77번', team: '대구대학교', avg: 46.9, count: 9, total: 422, ret: 0, longest: 65 },
  { rank: 29, name: '정혜민', number: '22번', team: '경성대학교', avg: 46.5, count: 13, total: 605, ret: 0, longest: 61 },
  { rank: 30, name: '김현빈', number: '82번', team: '용인대학교', avg: 46.5, count: 2, total: 93, ret: 0, longest: 53 },
  { rank: 31, name: '박지훈', number: '88번', team: '강원대학교', avg: 45.9, count: 11, total: 505, ret: 0, longest: 60 },
  { rank: 32, name: '신민호', number: '87번', team: '동의대학교', avg: 45.8, count: 5, total: 229, ret: 0, longest: 57 },
  { rank: 33, name: '최윤수', number: '88번', team: '연세대학교', avg: 45.5, count: 28, total: 1274, ret: 0, longest: 75 },
  { rank: 34, name: '박현기', number: '69번', team: '카이스트', avg: 45.0, count: 1, total: 45, ret: 0, longest: 45 },
  { rank: 34, name: '김민성', number: '14번', team: '울산대학교', avg: 45.0, count: 3, total: 135, ret: 0, longest: 50 },
  { rank: 36, name: '장용준', number: '11번', team: '인하대학교', avg: 44.6, count: 11, total: 491, ret: 0, longest: 57 },
  { rank: 37, name: '안현태', number: '77번', team: '동서대학교', avg: 44.6, count: 5, total: 223, ret: 0, longest: 62 },
  { rank: 38, name: '황희재', number: '08번', team: '경북대학교', avg: 44.3, count: 11, total: 487, ret: 0, longest: 55 },
  { rank: 39, name: '김혁', number: '01번', team: '동의대학교', avg: 44.2, count: 5, total: 221, ret: 0, longest: 58 },
  { rank: 40, name: '소진규', number: '10번', team: '한양대학교', avg: 44.1, count: 22, total: 971, ret: 1, longest: 65 },
  { rank: 41, name: '윤정근', number: '08번', team: '금오공과대학교', avg: 43.1, count: 10, total: 431, ret: 0, longest: 57 },
  { rank: 42, name: '이찬희', number: '12번', team: '한양대학교', avg: 43.0, count: 1, total: 43, ret: 0, longest: 43 },
  { rank: 43, name: '엄홍재', number: '31번', team: '서강대학교', avg: 41.1, count: 8, total: 329, ret: 0, longest: 65 },
  { rank: 44, name: '김산', number: '80번', team: '한림대학교', avg: 40.8, count: 4, total: 163, ret: 0, longest: 53 },
  { rank: 45, name: '홍세민', number: '95번', team: '경성대학교', avg: 40.5, count: 4, total: 162, ret: 0, longest: 47 },
  { rank: 46, name: '김찬희', number: '55번', team: '용인대학교', avg: 39.5, count: 8, total: 316, ret: 0, longest: 54 },
  { rank: 47, name: '원재훈', number: '08번', team: '국민대학교', avg: 39.3, count: 3, total: 118, ret: 0, longest: 65 },
  { rank: 48, name: '김현수', number: '53번', team: '경일대학교', avg: 38.0, count: 3, total: 114, ret: 0, longest: 45 },
  { rank: 49, name: '최수종', number: '86번', team: '고려대학교', avg: 36.3, count: 20, total: 725, ret: 0, longest: 62 },
  { rank: 50, name: '황현석', number: '25번', team: '건국대학교', avg: 35.7, count: 3, total: 107, ret: 0, longest: 54 }
];

// 분류 결과
export const kickoffClassification = {
  'Seoul': {
    '1부': [
      { name: '이종혁', number: '08번', team: '서울대학교', avg: 64.0, count: 1, longest: 64 },
      { name: '윤석진', number: '27번', team: '서울시립대학교', avg: 60.0, count: 1, longest: 60 },
      { name: '김진혁', number: '58번', team: '서울대학교', avg: 53.6, count: 9, longest: 65 },
      { name: '장혜인', number: '90번', team: '서울시립대학교', avg: 48.3, count: 4, longest: 65 },
      { name: '소진규', number: '10번', team: '한양대학교', avg: 44.1, count: 22, longest: 65 },
      { name: '이찬희', number: '12번', team: '한양대학교', avg: 43.0, count: 1, longest: 43 },
      { name: '원재훈', number: '08번', team: '국민대학교', avg: 39.3, count: 3, longest: 65 },
      { name: '황현석', number: '25번', team: '건국대학교', avg: 35.7, count: 3, longest: 54 }
    ],
    '2부': [
      { name: '김태준', number: '54번', team: '경희대학교', avg: 59.0, count: 1, longest: 59 },
      { name: '권준호', number: '64번', team: '경희대학교', avg: 51.7, count: 3, longest: 59 },
      { name: '이영준', number: '72번', team: '동국대학교', avg: 50.0, count: 1, longest: 50 },
      { name: '배민수', number: '64번', team: '중앙대학교', avg: 47.7, count: 3, longest: 55 },
      { name: '엄홍재', number: '31번', team: '서강대학교', avg: 41.1, count: 8, longest: 65 },
      { name: '최수종', number: '86번', team: '고려대학교', avg: 36.3, count: 20, longest: 62 }
    ]
  },
  'Gyeonggi-Gangwon': {
    '1부': [
      { name: '최준근', number: '99번', team: '강원대학교', avg: 55.0, count: 1, longest: 55 },
      { name: '조다빈', number: '80번', team: '성균관대학교', avg: 48.6, count: 9, longest: 65 },
      { name: '배성민', number: '10번', team: '성균관대학교', avg: 47.2, count: 6, longest: 50 },
      { name: '박지훈', number: '88번', team: '강원대학교', avg: 45.9, count: 11, longest: 60 },
      { name: '장용준', number: '11번', team: '인하대학교', avg: 44.6, count: 11, longest: 57 }
    ],
    '2부': [
      { name: '엄정훈', number: '87번', team: '카이스트', avg: 52.0, count: 1, longest: 52 },
      { name: '송영민', number: '63번', team: '카이스트', avg: 51.0, count: 1, longest: 51 },
      { name: '김현빈', number: '82번', team: '용인대학교', avg: 46.5, count: 2, longest: 53 },
      { name: '박현기', number: '69번', team: '카이스트', avg: 45.0, count: 1, longest: 45 },
      { name: '김산', number: '80번', team: '한림대학교', avg: 40.8, count: 4, longest: 53 },
      { name: '김찬희', number: '55번', team: '용인대학교', avg: 39.5, count: 8, longest: 54 }
    ]
  },
  'Daegu-Gyeongbuk': {
    '1부': [
      { name: '박형우', number: '61번', team: '경일대학교', avg: 60.0, count: 1, longest: 60 },
      { name: '배민재', number: '89번', team: '경일대학교', avg: 56.7, count: 16, longest: 65 },
      { name: '김진구', number: '56번', team: '대구가톨릭대학교', avg: 53.3, count: 3, longest: 58 },
      { name: '이무진', number: '35번', team: '대구가톨릭대학교', avg: 51.0, count: 1, longest: 51 },
      { name: '전민우', number: '12번', team: '경북대학교', avg: 48.8, count: 8, longest: 65 },
      { name: '박기성', number: '49번', team: '한동대학교', avg: 48.4, count: 5, longest: 55 },
      { name: '황희재', number: '08번', team: '경북대학교', avg: 44.3, count: 11, longest: 55 },
      { name: '김현수', number: '53번', team: '경일대학교', avg: 38.0, count: 3, longest: 45 }
    ],
    '2부': [
      { name: '김민규', number: '28번', team: '영남대학교', avg: 55.0, count: 1, longest: 55 },
      { name: '권지훈', number: '03번', team: '영남대학교', avg: 49.6, count: 5, longest: 56 },
      { name: '강경서', number: '21번', team: '금오공과대학교', avg: 47.0, count: 2, longest: 48 },
      { name: '유재원', number: '77번', team: '대구대학교', avg: 46.9, count: 9, longest: 65 },
      { name: '윤정근', number: '08번', team: '금오공과대학교', avg: 43.1, count: 10, longest: 57 }
    ]
  },
  'Busan-Gyeongnam': {
    '1부': [
      { name: '김동혁', number: '43번', team: '동아대학교', avg: 48.5, count: 2, longest: 51 },
      { name: '정혜민', number: '22번', team: '경성대학교', avg: 46.5, count: 13, longest: 61 },
      { name: '김준영', number: '76번', team: '울산대학교', avg: 47.0, count: 1, longest: 47 },
      { name: '신민호', number: '87번', team: '동의대학교', avg: 45.8, count: 5, longest: 57 },
      { name: '김민성', number: '14번', team: '울산대학교', avg: 45.0, count: 3, longest: 50 },
      { name: '김혁', number: '01번', team: '동의대학교', avg: 44.2, count: 5, longest: 58 },
      { name: '홍세민', number: '95번', team: '경성대학교', avg: 40.5, count: 4, longest: 47 }
    ],
    '2부': [
      { name: '이성수', number: '21번', team: '부산대학교', avg: 50.0, count: 1, longest: 50 },
      { name: '박기용', number: '08번', team: '신라대학교', avg: 49.9, count: 7, longest: 65 },
      { name: '방정현', number: '91번', team: '한국해양대학교', avg: 47.4, count: 12, longest: 54 },
      { name: '안현태', number: '77번', team: '동서대학교', avg: 44.6, count: 5, longest: 62 }
    ]
  }
};

// 리그별 킥오프 통계 요약
export const kickoffStats = {
  'Seoul 1부': kickoffClassification.Seoul['1부'].length,
  'Seoul 2부': kickoffClassification.Seoul['2부'].length,
  'Gyeonggi-Gangwon 1부': kickoffClassification['Gyeonggi-Gangwon']['1부'].length,
  'Gyeonggi-Gangwon 2부': kickoffClassification['Gyeonggi-Gangwon']['2부'].length,
  'Daegu-Gyeongbuk 1부': kickoffClassification['Daegu-Gyeongbuk']['1부'].length,
  'Daegu-Gyeongbuk 2부': kickoffClassification['Daegu-Gyeongbuk']['2부'].length,
  'Busan-Gyeongnam 1부': kickoffClassification['Busan-Gyeongnam']['1부'].length,
  'Busan-Gyeongnam 2부': kickoffClassification['Busan-Gyeongnam']['2부'].length
};

console.log('킥오프 협회 데이터 분류 결과:');
console.log('서울리그 1부:', kickoffStats['Seoul 1부'] + '명');
console.log('서울리그 2부:', kickoffStats['Seoul 2부'] + '명');
console.log('경기강원 1부:', kickoffStats['Gyeonggi-Gangwon 1부'] + '명');
console.log('경기강원 2부:', kickoffStats['Gyeonggi-Gangwon 2부'] + '명');
console.log('대구경북 1부:', kickoffStats['Daegu-Gyeongbuk 1부'] + '명');
console.log('대구경북 2부:', kickoffStats['Daegu-Gyeongbuk 2부'] + '명');
console.log('부산경남 1부:', kickoffStats['Busan-Gyeongnam 1부'] + '명');
console.log('부산경남 2부:', kickoffStats['Busan-Gyeongnam 2부'] + '명');