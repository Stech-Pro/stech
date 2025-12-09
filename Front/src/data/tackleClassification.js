// 태클 협회 데이터 분류 결과

import { TEAM_DIVISIONS } from './TEAM_DIVISIONS.js';

const tackleData = [
  { rank: 1, name: '정재민', number: '33번', team: '경성대학교', tackles: 28, sacks: 0, soloTackles: 15, assistTackles: 13 },
  { rank: 1, name: '김재민', number: '13번', team: '동의대학교', tackles: 28, sacks: 0, soloTackles: 20, assistTackles: 8 },
  { rank: 3, name: '김민겸', number: '26번', team: '한양대학교', tackles: 25, sacks: 0, soloTackles: 19, assistTackles: 6 },
  { rank: 4, name: '김민준', number: '12번', team: '경성대학교', tackles: 24, sacks: 0, soloTackles: 17, assistTackles: 7 },
  { rank: 4, name: '정재성', number: '22번', team: '성균관대학교', tackles: 24, sacks: 0, soloTackles: 19, assistTackles: 5 },
  { rank: 6, name: '여언론', number: '71번', team: '한양대학교', tackles: 21, sacks: 2, soloTackles: 11, assistTackles: 8 },
  { rank: 6, name: '이대희', number: '18번', team: '연세대학교', tackles: 21, sacks: 4, soloTackles: 11, assistTackles: 6 },
  { rank: 6, name: '강미루', number: '01번', team: '연세대학교', tackles: 21, sacks: 2, soloTackles: 12, assistTackles: 7 },
  { rank: 9, name: '심윤범', number: '27번', team: '경북대학교', tackles: 20, sacks: 1, soloTackles: 17, assistTackles: 2 },
  { rank: 9, name: '선민혁', number: '59번', team: '부산외국어대학교', tackles: 20, sacks: 0, soloTackles: 19, assistTackles: 1 },
  { rank: 11, name: '이현민', number: '00번', team: '연세대학교', tackles: 19, sacks: 1, soloTackles: 9, assistTackles: 9 },
  { rank: 11, name: '이재욱', number: '28번', team: '한양대학교', tackles: 19, sacks: 0, soloTackles: 15, assistTackles: 4 },
  { rank: 11, name: '차경훈', number: '30번', team: '한양대학교', tackles: 19, sacks: 0, soloTackles: 13, assistTackles: 6 },
  { rank: 11, name: '조성환', number: '28번', team: '연세대학교', tackles: 19, sacks: 0, soloTackles: 15, assistTackles: 4 },
  { rank: 11, name: '김민석', number: '91번', team: '경일대학교', tackles: 19, sacks: 1, soloTackles: 16, assistTackles: 2 },
  { rank: 16, name: '임지민', number: '10번', team: '동의대학교', tackles: 18, sacks: 1, soloTackles: 15, assistTackles: 2 },
  { rank: 16, name: '유동윤', number: '18번', team: '경일대학교', tackles: 18, sacks: 0, soloTackles: 13, assistTackles: 5 },
  { rank: 16, name: '허민', number: '81번', team: '동의대학교', tackles: 18, sacks: 0, soloTackles: 11, assistTackles: 7 },
  { rank: 19, name: '배민재', number: '89번', team: '경일대학교', tackles: 17, sacks: 2, soloTackles: 11, assistTackles: 4 },
  { rank: 19, name: '이재혁', number: '38번', team: '서강대학교', tackles: 17, sacks: 0, soloTackles: 15, assistTackles: 2 },
  { rank: 19, name: '이정우', number: '22번', team: '동의대학교', tackles: 17, sacks: 0, soloTackles: 10, assistTackles: 7 },
  { rank: 19, name: 'Rintaro', number: '24번', team: '연세대학교', tackles: 17, sacks: 0, soloTackles: 11, assistTackles: 6 },
  { rank: 19, name: '김승현', number: '15번', team: '경성대학교', tackles: 17, sacks: 0, soloTackles: 13, assistTackles: 4 },
  { rank: 19, name: '정현식', number: '77번', team: '경북대학교', tackles: 17, sacks: 2, soloTackles: 13, assistTackles: 2 },
  { rank: 25, name: '김법선', number: '51번', team: '부산외국어대학교', tackles: 16, sacks: 2, soloTackles: 12, assistTackles: 2 },
  { rank: 25, name: '장우인', number: '13번', team: '부산외국어대학교', tackles: 16, sacks: 0, soloTackles: 15, assistTackles: 1 },
  { rank: 25, name: '남상범', number: '97번', team: '연세대학교', tackles: 16, sacks: 0, soloTackles: 11, assistTackles: 5 },
  { rank: 28, name: '김범진', number: '98번', team: '대구대학교', tackles: 15, sacks: 1, soloTackles: 12, assistTackles: 2 },
  { rank: 28, name: '정민수', number: '54번', team: '고려대학교', tackles: 15, sacks: 0, soloTackles: 10, assistTackles: 5 },
  { rank: 28, name: '황희재', number: '08번', team: '경북대학교', tackles: 15, sacks: 0, soloTackles: 14, assistTackles: 1 },
  { rank: 28, name: '최준환', number: '12번', team: '금오공과대학교', tackles: 15, sacks: 0, soloTackles: 12, assistTackles: 3 },
  { rank: 32, name: '조다빈', number: '80번', team: '성균관대학교', tackles: 14, sacks: 0, soloTackles: 11, assistTackles: 3 },
  { rank: 32, name: '이시욱', number: '36번', team: '부산외국어대학교', tackles: 14, sacks: 0, soloTackles: 12, assistTackles: 2 },
  { rank: 32, name: '김진혁', number: '58번', team: '서울대학교', tackles: 14, sacks: 7, soloTackles: 6, assistTackles: 1 },
  { rank: 32, name: '박지민', number: '54번', team: '경북대학교', tackles: 14, sacks: 1, soloTackles: 13, assistTackles: 0 },
  { rank: 32, name: '이기원', number: '11번', team: '한양대학교', tackles: 14, sacks: 1, soloTackles: 9, assistTackles: 4 },
  { rank: 32, name: '문태웅', number: '26번', team: '동국대학교', tackles: 14, sacks: 0, soloTackles: 7, assistTackles: 7 },
  { rank: 32, name: '김록겸', number: '07번', team: '고려대학교', tackles: 14, sacks: 0, soloTackles: 10, assistTackles: 4 },
  { rank: 39, name: '박준서', number: '57번', team: '성균관대학교', tackles: 13, sacks: 0, soloTackles: 12, assistTackles: 1 },
  { rank: 39, name: '김주원', number: '77번', team: '동국대학교', tackles: 13, sacks: 0, soloTackles: 7, assistTackles: 6 },
  { rank: 39, name: '최영환', number: '22번', team: '국민대학교', tackles: 13, sacks: 0, soloTackles: 9, assistTackles: 4 },
  { rank: 39, name: '옥기주', number: '07번', team: '경성대학교', tackles: 13, sacks: 0, soloTackles: 5, assistTackles: 8 },
  { rank: 39, name: '변지욱', number: '32번', team: '경일대학교', tackles: 13, sacks: 0, soloTackles: 9, assistTackles: 4 },
  { rank: 39, name: '노현용', number: '67번', team: '영남대학교', tackles: 13, sacks: 0, soloTackles: 10, assistTackles: 3 },
  { rank: 39, name: '이호준', number: '52번', team: '숭실대학교', tackles: 13, sacks: 1, soloTackles: 7, assistTackles: 5 },
  { rank: 46, name: '이주헌', number: '22번', team: '동국대학교', tackles: 12, sacks: 0, soloTackles: 9, assistTackles: 3 },
  { rank: 46, name: 'Ryan Pham', number: '56번', team: '연세대학교', tackles: 12, sacks: 1, soloTackles: 6, assistTackles: 5 },
  { rank: 46, name: '문영민', number: '82번', team: '동국대학교', tackles: 12, sacks: 0, soloTackles: 9, assistTackles: 3 },
  { rank: 46, name: '김건우', number: '77번', team: '성균관대학교', tackles: 12, sacks: 0, soloTackles: 9, assistTackles: 3 },
  { rank: 46, name: '김준현', number: '02번', team: '대구한의대학교', tackles: 12, sacks: 0, soloTackles: 9, assistTackles: 3 }
];

// 분류 결과
export const tackleClassification = {
  'Seoul': {
    '1부': [
      { name: '김민겸', team: '한양대학교', tackles: 25, sacks: 0, soloTackles: 19, assistTackles: 6 },
      { name: '여언론', team: '한양대학교', tackles: 21, sacks: 2, soloTackles: 11, assistTackles: 8 },
      { name: '이대희', team: '연세대학교', tackles: 21, sacks: 4, soloTackles: 11, assistTackles: 6 },
      { name: '강미루', team: '연세대학교', tackles: 21, sacks: 2, soloTackles: 12, assistTackles: 7 },
      { name: '이현민', team: '연세대학교', tackles: 19, sacks: 1, soloTackles: 9, assistTackles: 9 },
      { name: '이재욱', team: '한양대학교', tackles: 19, sacks: 0, soloTackles: 15, assistTackles: 4 },
      { name: '차경훈', team: '한양대학교', tackles: 19, sacks: 0, soloTackles: 13, assistTackles: 6 },
      { name: '조성환', team: '연세대학교', tackles: 19, sacks: 0, soloTackles: 15, assistTackles: 4 },
      { name: 'Rintaro', team: '연세대학교', tackles: 17, sacks: 0, soloTackles: 11, assistTackles: 6 },
      { name: '남상범', team: '연세대학교', tackles: 16, sacks: 0, soloTackles: 11, assistTackles: 5 },
      { name: '김진혁', team: '서울대학교', tackles: 14, sacks: 7, soloTackles: 6, assistTackles: 1 },
      { name: '이기원', team: '한양대학교', tackles: 14, sacks: 1, soloTackles: 9, assistTackles: 4 },
      { name: '최영환', team: '국민대학교', tackles: 13, sacks: 0, soloTackles: 9, assistTackles: 4 },
      { name: 'Ryan Pham', team: '연세대학교', tackles: 12, sacks: 1, soloTackles: 6, assistTackles: 5 }
    ],
    '2부': [
      { name: '이재혁', team: '서강대학교', tackles: 17, sacks: 0, soloTackles: 15, assistTackles: 2 },
      { name: '정민수', team: '고려대학교', tackles: 15, sacks: 0, soloTackles: 10, assistTackles: 5 },
      { name: '문태웅', team: '동국대학교', tackles: 14, sacks: 0, soloTackles: 7, assistTackles: 7 },
      { name: '김록겸', team: '고려대학교', tackles: 14, sacks: 0, soloTackles: 10, assistTackles: 4 },
      { name: '김주원', team: '동국대학교', tackles: 13, sacks: 0, soloTackles: 7, assistTackles: 6 },
      { name: '이호준', team: '숭실대학교', tackles: 13, sacks: 1, soloTackles: 7, assistTackles: 5 },
      { name: '이주헌', team: '동국대학교', tackles: 12, sacks: 0, soloTackles: 9, assistTackles: 3 },
      { name: '문영민', team: '동국대학교', tackles: 12, sacks: 0, soloTackles: 9, assistTackles: 3 }
    ]
  },
  'Gyeonggi-Gangwon': {
    '1부': [
      { name: '정재성', team: '성균관대학교', tackles: 24, sacks: 0, soloTackles: 19, assistTackles: 5 },
      { name: '조다빈', team: '성균관대학교', tackles: 14, sacks: 0, soloTackles: 11, assistTackles: 3 },
      { name: '박준서', team: '성균관대학교', tackles: 13, sacks: 0, soloTackles: 12, assistTackles: 1 },
      { name: '김건우', team: '성균관대학교', tackles: 12, sacks: 0, soloTackles: 9, assistTackles: 3 }
    ],
    '2부': []
  },
  'Daegu-Gyeongbuk': {
    '1부': [
      { name: '심윤범', team: '경북대학교', tackles: 20, sacks: 1, soloTackles: 17, assistTackles: 2 },
      { name: '김민석', team: '경일대학교', tackles: 19, sacks: 1, soloTackles: 16, assistTackles: 2 },
      { name: '유동윤', team: '경일대학교', tackles: 18, sacks: 0, soloTackles: 13, assistTackles: 5 },
      { name: '배민재', team: '경일대학교', tackles: 17, sacks: 2, soloTackles: 11, assistTackles: 4 },
      { name: '정현식', team: '경북대학교', tackles: 17, sacks: 2, soloTackles: 13, assistTackles: 2 },
      { name: '황희재', team: '경북대학교', tackles: 15, sacks: 0, soloTackles: 14, assistTackles: 1 },
      { name: '박지민', team: '경북대학교', tackles: 14, sacks: 1, soloTackles: 13, assistTackles: 0 },
      { name: '변지욱', team: '경일대학교', tackles: 13, sacks: 0, soloTackles: 9, assistTackles: 4 },
      { name: '김준현', team: '대구한의대학교', tackles: 12, sacks: 0, soloTackles: 9, assistTackles: 3 }
    ],
    '2부': [
      { name: '김범진', team: '대구대학교', tackles: 15, sacks: 1, soloTackles: 12, assistTackles: 2 },
      { name: '최준환', team: '금오공과대학교', tackles: 15, sacks: 0, soloTackles: 12, assistTackles: 3 },
      { name: '노현용', team: '영남대학교', tackles: 13, sacks: 0, soloTackles: 10, assistTackles: 3 }
    ]
  },
  'Busan-Gyeongnam': {
    '1부': [
      { name: '정재민', team: '경성대학교', tackles: 28, sacks: 0, soloTackles: 15, assistTackles: 13 },
      { name: '김재민', team: '동의대학교', tackles: 28, sacks: 0, soloTackles: 20, assistTackles: 8 },
      { name: '김민준', team: '경성대학교', tackles: 24, sacks: 0, soloTackles: 17, assistTackles: 7 },
      { name: '임지민', team: '동의대학교', tackles: 18, sacks: 1, soloTackles: 15, assistTackles: 2 },
      { name: '허민', team: '동의대학교', tackles: 18, sacks: 0, soloTackles: 11, assistTackles: 7 },
      { name: '이정우', team: '동의대학교', tackles: 17, sacks: 0, soloTackles: 10, assistTackles: 7 },
      { name: '김승현', team: '경성대학교', tackles: 17, sacks: 0, soloTackles: 13, assistTackles: 4 },
      { name: '옥기주', team: '경성대학교', tackles: 13, sacks: 0, soloTackles: 5, assistTackles: 8 }
    ],
    '2부': [
      { name: '선민혁', team: '부산외국어대학교', tackles: 20, sacks: 0, soloTackles: 19, assistTackles: 1 },
      { name: '김법선', team: '부산외국어대학교', tackles: 16, sacks: 2, soloTackles: 12, assistTackles: 2 },
      { name: '장우인', team: '부산외국어대학교', tackles: 16, sacks: 0, soloTackles: 15, assistTackles: 1 },
      { name: '이시욱', team: '부산외국어대학교', tackles: 14, sacks: 0, soloTackles: 12, assistTackles: 2 }
    ]
  }
};

// 리그별 태클 통계 요약
export const tackleStats = {
  'Seoul 1부': tackleClassification.Seoul['1부'].length,
  'Seoul 2부': tackleClassification.Seoul['2부'].length,
  'Gyeonggi-Gangwon 1부': tackleClassification['Gyeonggi-Gangwon']['1부'].length,
  'Gyeonggi-Gangwon 2부': tackleClassification['Gyeonggi-Gangwon']['2부'].length,
  'Daegu-Gyeongbuk 1부': tackleClassification['Daegu-Gyeongbuk']['1부'].length,
  'Daegu-Gyeongbuk 2부': tackleClassification['Daegu-Gyeongbuk']['2부'].length,
  'Busan-Gyeongnam 1부': tackleClassification['Busan-Gyeongnam']['1부'].length,
  'Busan-Gyeongnam 2부': tackleClassification['Busan-Gyeongnam']['2부'].length
};

console.log('태클 협회 데이터 분류 결과:');
console.log('서울리그 1부:', tackleStats['Seoul 1부'] + '명');
console.log('서울리그 2부:', tackleStats['Seoul 2부'] + '명');
console.log('경기강원 1부:', tackleStats['Gyeonggi-Gangwon 1부'] + '명');
console.log('경기강원 2부:', tackleStats['Gyeonggi-Gangwon 2부'] + '명');
console.log('대구경북 1부:', tackleStats['Daegu-Gyeongbuk 1부'] + '명');
console.log('대구경북 2부:', tackleStats['Daegu-Gyeongbuk 2부'] + '명');
console.log('부산경남 1부:', tackleStats['Busan-Gyeongnam 1부'] + '명');
console.log('부산경남 2부:', tackleStats['Busan-Gyeongnam 2부'] + '명');