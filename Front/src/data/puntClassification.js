// 펀트 협회 데이터 분류 결과

import { TEAM_DIVISIONS } from './TEAM_DIVISIONS.js';

const puntData = [
  { rank: 1, name: '유동윤', number: '18번', team: '경일대학교', avg: 55.0, count: 1, total: 55, td: 0, longest: 55 },
  { rank: 1, name: '윤제혁', number: '44번', team: '울산대학교', avg: 55.0, count: 1, total: 55, td: 0, longest: 55 },
  { rank: 3, name: '박기용', number: '08번', team: '신라대학교', avg: 53.0, count: 1, total: 53, td: 0, longest: 53 },
  { rank: 4, name: '신재영', number: '42번', team: '연세대학교', avg: 48.7, count: 3, total: 146, td: 0, longest: 57 },
  { rank: 5, name: '성충근', number: '24번', team: '부산대학교', avg: 48.0, count: 4, total: 192, td: 0, longest: 57 },
  { rank: 6, name: '이종혁', number: '08번', team: '서울대학교', avg: 46.5, count: 2, total: 93, td: 0, longest: 47 },
  { rank: 7, name: '김준환', number: '21번', team: '동의대학교', avg: 45.0, count: 1, total: 45, td: 0, longest: 45 },
  { rank: 8, name: '정혜민', number: '22번', team: '경성대학교', avg: 43.7, count: 6, total: 262, td: 0, longest: 55 },
  { rank: 9, name: '이무진', number: '35번', team: '대구가톨릭대학교', avg: 42.6, count: 5, total: 213, td: 0, longest: 54 },
  { rank: 10, name: '배민재', number: '89번', team: '경일대학교', avg: 40.0, count: 24, total: 961, td: 0, longest: 56 },
  { rank: 11, name: '공성욱', number: '87번', team: '건국대학교', avg: 39.8, count: 6, total: 239, td: 0, longest: 64 },
  { rank: 12, name: '이찬유', number: '01번', team: '한신대학교', avg: 39.1, count: 10, total: 391, td: 0, longest: 53 },
  { rank: 13, name: '김동혁', number: '43번', team: '동아대학교', avg: 39.0, count: 2, total: 78, td: 0, longest: 45 },
  { rank: 14, name: '박현기', number: '69번', team: '카이스트', avg: 38.5, count: 4, total: 154, td: 0, longest: 43 },
  { rank: 15, name: '이기쁨', number: '07번', team: '강원대학교', avg: 38.4, count: 5, total: 192, td: 0, longest: 45 },
  { rank: 16, name: '엄홍재', number: '31번', team: '서강대학교', avg: 37.4, count: 13, total: 486, td: 0, longest: 53 },
  { rank: 17, name: '박도현', number: '08번', team: '동국대학교', avg: 37.2, count: 9, total: 335, td: 0, longest: 54 },
  { rank: 18, name: '이성수', number: '21번', team: '부산대학교', avg: 36.0, count: 1, total: 36, td: 0, longest: 36 },
  { rank: 19, name: '권준호', number: '64번', team: '경희대학교', avg: 34.9, count: 7, total: 244, td: 0, longest: 57 },
  { rank: 20, name: '장혜인', number: '90번', team: '서울시립대학교', avg: 34.7, count: 19, total: 659, td: 0, longest: 52 },
  { rank: 21, name: '여언론', number: '71번', team: '한양대학교', avg: 34.5, count: 8, total: 276, td: 0, longest: 54 },
  { rank: 22, name: '원재훈', number: '08번', team: '국민대학교', avg: 34.2, count: 5, total: 171, td: 0, longest: 45 },
  { rank: 23, name: '엄정훈', number: '87번', team: '카이스트', avg: 34.0, count: 1, total: 34, td: 0, longest: 34 },
  { rank: 23, name: '전창목', number: '45번', team: '한동대학교', avg: 34.0, count: 1, total: 34, td: 0, longest: 34 },
  { rank: 25, name: '소진규', number: '10번', team: '한양대학교', avg: 33.7, count: 9, total: 303, td: 0, longest: 52 },
  { rank: 26, name: '이민석', number: '13번', team: '강원대학교', avg: 33.5, count: 8, total: 268, td: 0, longest: 46 },
  { rank: 27, name: '이민서', number: '01번', team: '부산외국어대학교', avg: 33.4, count: 7, total: 234, td: 0, longest: 54 },
  { rank: 28, name: '김민우', number: '19번', team: '대구한의대학교', avg: 33.3, count: 12, total: 400, td: 0, longest: 47 },
  { rank: 29, name: '김찬희', number: '55번', team: '용인대학교', avg: 32.5, count: 6, total: 195, td: 0, longest: 45 },
  { rank: 29, name: '방정현', number: '91번', team: '한국해양대학교', avg: 32.5, count: 2, total: 65, td: 0, longest: 45 },
  { rank: 29, name: '김진혁', number: '58번', team: '서울대학교', avg: 32.5, count: 6, total: 195, td: 0, longest: 45 },
  { rank: 32, name: '송영민', number: '63번', team: '카이스트', avg: 32.0, count: 1, total: 32, td: 0, longest: 32 },
  { rank: 33, name: '신민호', number: '87번', team: '동의대학교', avg: 31.6, count: 8, total: 253, td: 0, longest: 48 },
  { rank: 34, name: '이한규', number: '54번', team: '동아대학교', avg: 31.3, count: 3, total: 94, td: 0, longest: 44 },
  { rank: 35, name: '김산', number: '80번', team: '한림대학교', avg: 31.0, count: 2, total: 62, td: 0, longest: 35 },
  { rank: 36, name: '오성민', number: '03번', team: '한국외국어대학교', avg: 30.8, count: 5, total: 154, td: 0, longest: 40 },
  { rank: 37, name: '김범수', number: '05번', team: '울산대학교', avg: 30.0, count: 1, total: 30, td: 0, longest: 30 },
  { rank: 38, name: '장용준', number: '11번', team: '인하대학교', avg: 29.7, count: 7, total: 208, td: 0, longest: 42 },
  { rank: 39, name: '배민수', number: '64번', team: '중앙대학교', avg: 29.7, count: 6, total: 178, td: 0, longest: 40 },
  { rank: 40, name: '박기성', number: '49번', team: '한동대학교', avg: 29.2, count: 10, total: 292, td: 0, longest: 45 },
  { rank: 40, name: '황희재', number: '08번', team: '경북대학교', avg: 29.2, count: 5, total: 146, td: 0, longest: 53 },
  { rank: 40, name: '장현성', number: '07번', team: '동서대학교', avg: 29.2, count: 5, total: 146, td: 0, longest: 35 },
  { rank: 43, name: '김진구', number: '56번', team: '대구가톨릭대학교', avg: 29.1, count: 7, total: 204, td: 0, longest: 60 },
  { rank: 44, name: '권지훈', number: '03번', team: '영남대학교', avg: 28.5, count: 6, total: 171, td: 0, longest: 45 },
  { rank: 45, name: '김대웅', number: '15번', team: '홍익대학교', avg: 28.4, count: 11, total: 312, td: 0, longest: 48 },
  { rank: 46, name: '이동건', number: '01번', team: '강원대학교', avg: 28.3, count: 3, total: 85, td: 0, longest: 42 },
  { rank: 47, name: '곽도영', number: '88번', team: '대구대학교', avg: 28.3, count: 7, total: 198, td: 0, longest: 42 },
  { rank: 48, name: '김강민', number: '07번', team: '경북대학교', avg: 27.6, count: 11, total: 304, td: 0, longest: 45 },
  { rank: 49, name: '김동현', number: '01번', team: '경성대학교', avg: 27.0, count: 4, total: 108, td: 0, longest: 46 },
  { rank: 50, name: '윤정근', number: '08번', team: '금오공과대학교', avg: 26.4, count: 9, total: 238, td: 0, longest: 43 }
];

// 분류 결과
export const puntClassification = {
  'Seoul': {
    '1부': [
      { name: '신재영', team: '연세대학교', avg: 48.7, count: 3, total: 146, longest: 57 },
      { name: '이종혁', team: '서울대학교', avg: 46.5, count: 2, total: 93, longest: 47 },
      { name: '공성욱', team: '건국대학교', avg: 39.8, count: 6, total: 239, longest: 64 },
      { name: '장혜인', team: '서울시립대학교', avg: 34.7, count: 19, total: 659, longest: 52 },
      { name: '여언론', team: '한양대학교', avg: 34.5, count: 8, total: 276, longest: 54 },
      { name: '원재훈', team: '국민대학교', avg: 34.2, count: 5, total: 171, longest: 45 },
      { name: '소진규', team: '한양대학교', avg: 33.7, count: 9, total: 303, longest: 52 },
      { name: '김진혁', team: '서울대학교', avg: 32.5, count: 6, total: 195, longest: 45 },
      { name: '오성민', team: '한국외국어대학교', avg: 30.8, count: 5, total: 154, longest: 40 },
      { name: '김대웅', team: '홍익대학교', avg: 28.4, count: 11, total: 312, longest: 48 }
    ],
    '2부': [
      { name: '엄홍재', team: '서강대학교', avg: 37.4, count: 13, total: 486, longest: 53 },
      { name: '박도현', team: '동국대학교', avg: 37.2, count: 9, total: 335, longest: 54 },
      { name: '권준호', team: '경희대학교', avg: 34.9, count: 7, total: 244, longest: 57 },
      { name: '배민수', team: '중앙대학교', avg: 29.7, count: 6, total: 178, longest: 40 }
    ]
  },
  'Gyeonggi-Gangwon': {
    '1부': [
      { name: '이기쁨', team: '강원대학교', avg: 38.4, count: 5, total: 192, longest: 45 },
      { name: '이민석', team: '강원대학교', avg: 33.5, count: 8, total: 268, longest: 46 },
      { name: '장용준', team: '인하대학교', avg: 29.7, count: 7, total: 208, longest: 42 },
      { name: '이동건', team: '강원대학교', avg: 28.3, count: 3, total: 85, longest: 42 }
    ],
    '2부': [
      { name: '이찬유', team: '한신대학교', avg: 39.1, count: 10, total: 391, longest: 53 },
      { name: '박현기', team: '카이스트', avg: 38.5, count: 4, total: 154, longest: 43 },
      { name: '엄정훈', team: '카이스트', avg: 34.0, count: 1, total: 34, longest: 34 },
      { name: '김찬희', team: '용인대학교', avg: 32.5, count: 6, total: 195, longest: 45 },
      { name: '송영민', team: '카이스트', avg: 32.0, count: 1, total: 32, longest: 32 },
      { name: '김산', team: '한림대학교', avg: 31.0, count: 2, total: 62, longest: 35 }
    ]
  },
  'Daegu-Gyeongbuk': {
    '1부': [
      { name: '이무진', team: '대구가톨릭대학교', avg: 42.6, count: 5, total: 213, longest: 54 },
      { name: '전창목', team: '한동대학교', avg: 34.0, count: 1, total: 34, longest: 34 },
      { name: '김민우', team: '대구한의대학교', avg: 33.3, count: 12, total: 400, longest: 47 },
      { name: '박기성', team: '한동대학교', avg: 29.2, count: 10, total: 292, longest: 45 },
      { name: '황희재', team: '경북대학교', avg: 29.2, count: 5, total: 146, longest: 53 },
      { name: '김진구', team: '대구가톨릭대학교', avg: 29.1, count: 7, total: 204, longest: 60 },
      { name: '김강민', team: '경북대학교', avg: 27.6, count: 11, total: 304, longest: 45 },
      { name: '유동윤', team: '경일대학교', avg: 55.0, count: 1, total: 55, longest: 55 },
      { name: '배민재', team: '경일대학교', avg: 40.0, count: 24, total: 961, longest: 56 }
    ],
    '2부': [
      { name: '권지훈', team: '영남대학교', avg: 28.5, count: 6, total: 171, longest: 45 },
      { name: '곽도영', team: '대구대학교', avg: 28.3, count: 7, total: 198, longest: 42 },
      { name: '윤정근', team: '금오공과대학교', avg: 26.4, count: 9, total: 238, longest: 43 }
    ]
  },
  'Busan-Gyeongnam': {
    '1부': [
      { name: '윤제혁', team: '울산대학교', avg: 55.0, count: 1, total: 55, longest: 55 },
      { name: '김준환', team: '동의대학교', avg: 45.0, count: 1, total: 45, longest: 45 },
      { name: '정혜민', team: '경성대학교', avg: 43.7, count: 6, total: 262, longest: 55 },
      { name: '김동혁', team: '동아대학교', avg: 39.0, count: 2, total: 78, longest: 45 },
      { name: '신민호', team: '동의대학교', avg: 31.6, count: 8, total: 253, longest: 48 },
      { name: '이한규', team: '동아대학교', avg: 31.3, count: 3, total: 94, longest: 44 },
      { name: '김범수', team: '울산대학교', avg: 30.0, count: 1, total: 30, longest: 30 },
      { name: '김동현', team: '경성대학교', avg: 27.0, count: 4, total: 108, longest: 46 }
    ],
    '2부': [
      { name: '박기용', team: '신라대학교', avg: 53.0, count: 1, total: 53, longest: 53 },
      { name: '성충근', team: '부산대학교', avg: 48.0, count: 4, total: 192, longest: 57 },
      { name: '이성수', team: '부산대학교', avg: 36.0, count: 1, total: 36, longest: 36 },
      { name: '이민서', team: '부산외국어대학교', avg: 33.4, count: 7, total: 234, longest: 54 },
      { name: '방정현', team: '한국해양대학교', avg: 32.5, count: 2, total: 65, longest: 45 },
      { name: '장현성', team: '동서대학교', avg: 29.2, count: 5, total: 146, longest: 35 }
    ]
  }
};

// 리그별 펀트 통계 요약
export const puntStats = {
  'Seoul 1부': puntClassification.Seoul['1부'].length,
  'Seoul 2부': puntClassification.Seoul['2부'].length,
  'Gyeonggi-Gangwon 1부': puntClassification['Gyeonggi-Gangwon']['1부'].length,
  'Gyeonggi-Gangwon 2부': puntClassification['Gyeonggi-Gangwon']['2부'].length,
  'Daegu-Gyeongbuk 1부': puntClassification['Daegu-Gyeongbuk']['1부'].length,
  'Daegu-Gyeongbuk 2부': puntClassification['Daegu-Gyeongbuk']['2부'].length,
  'Busan-Gyeongnam 1부': puntClassification['Busan-Gyeongnam']['1부'].length,
  'Busan-Gyeongnam 2부': puntClassification['Busan-Gyeongnam']['2부'].length
};

console.log('펀트 협회 데이터 분류 결과:');
console.log('서울리그 1부:', puntStats['Seoul 1부'] + '명');
console.log('서울리그 2부:', puntStats['Seoul 2부'] + '명');
console.log('경기강원 1부:', puntStats['Gyeonggi-Gangwon 1부'] + '명');
console.log('경기강원 2부:', puntStats['Gyeonggi-Gangwon 2부'] + '명');
console.log('대구경북 1부:', puntStats['Daegu-Gyeongbuk 1부'] + '명');
console.log('대구경북 2부:', puntStats['Daegu-Gyeongbuk 2부'] + '명');
console.log('부산경남 1부:', puntStats['Busan-Gyeongnam 1부'] + '명');
console.log('부산경남 2부:', puntStats['Busan-Gyeongnam 2부'] + '명');