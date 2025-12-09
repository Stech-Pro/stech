// 펀트리턴 협회 데이터 분류 결과

import { TEAM_DIVISIONS } from './TEAM_DIVISIONS.js';

const puntReturnData = [
  { rank: 1, name: '동방상원', number: '21번', team: '동아대학교', avg: 54.0, count: 1, total: 54, td: 0, longest: 54 },
  { rank: 2, name: '김승원', number: '97번', team: '숭실대학교', avg: 33.0, count: 1, total: 33, td: 0, longest: 33 },
  { rank: 3, name: '문태웅', number: '26번', team: '동국대학교', avg: 31.0, count: 1, total: 31, td: 0, longest: 31 },
  { rank: 4, name: '유동윤', number: '18번', team: '경일대학교', avg: 26.3, count: 7, total: 184, td: 1, longest: 58 },
  { rank: 5, name: '김정헌', number: '34번', team: '서울대학교', avg: 25.0, count: 1, total: 25, td: 0, longest: 25 },
  { rank: 5, name: '전민우', number: '12번', team: '경북대학교', avg: 25.0, count: 1, total: 25, td: 0, longest: 25 },
  { rank: 7, name: '권용준', number: '84번', team: '서울시립대학교', avg: 21.0, count: 2, total: 42, td: 0, longest: 30 },
  { rank: 8, name: '정성준', number: '11번', team: '한국해양대학교', avg: 20.0, count: 1, total: 20, td: 1, longest: 20 },
  { rank: 9, name: '손주익', number: '01번', team: '서울시립대학교', avg: 19.0, count: 1, total: 19, td: 0, longest: 19 },
  { rank: 10, name: '임지민', number: '10번', team: '동의대학교', avg: 18.0, count: 1, total: 18, td: 0, longest: 18 },
  { rank: 10, name: '이우진', number: '61번', team: '홍익대학교', avg: 18.0, count: 1, total: 18, td: 0, longest: 18 },
  { rank: 10, name: '배병찬', number: '79번', team: '성균관대학교', avg: 18.0, count: 1, total: 18, td: 0, longest: 18 },
  { rank: 13, name: '이상현', number: '17번', team: '단국대학교', avg: 17.0, count: 1, total: 17, td: 0, longest: 17 },
  { rank: 14, name: '허우인', number: '22번', team: '건국대학교', avg: 15.0, count: 2, total: 30, td: 0, longest: 30 },
  { rank: 14, name: '이민준', number: '05번', team: '영남대학교', avg: 15.0, count: 1, total: 15, td: 0, longest: 15 },
  { rank: 16, name: '최준환', number: '12번', team: '금오공과대학교', avg: 14.0, count: 1, total: 14, td: 0, longest: 14 },
  { rank: 17, name: '이무진', number: '35번', team: '대구가톨릭대학교', avg: 13.0, count: 1, total: 13, td: 0, longest: 13 },
  { rank: 18, name: '조다빈', number: '80번', team: '성균관대학교', avg: 12.1, count: 7, total: 85, td: 0, longest: 50 },
  { rank: 19, name: '이예승', number: '09번', team: '부산외국어대학교', avg: 12.0, count: 1, total: 12, td: 0, longest: 12 },
  { rank: 20, name: '조현영', number: '01번', team: '경북대학교', avg: 11.8, count: 4, total: 47, td: 0, longest: 38 },
  { rank: 21, name: '오승욱', number: '14번', team: '숭실대학교', avg: 11.5, count: 2, total: 23, td: 0, longest: 15 },
  { rank: 22, name: '정종은', number: '14번', team: '동국대학교', avg: 10.5, count: 2, total: 21, td: 0, longest: 21 },
  { rank: 23, name: '박온', number: '18번', team: '성균관대학교', avg: 10.0, count: 1, total: 10, td: 0, longest: 10 },
  { rank: 23, name: '정재연', number: '35번', team: '국민대학교', avg: 10.0, count: 1, total: 10, td: 0, longest: 10 },
  { rank: 23, name: '김강민', number: '07번', team: '경북대학교', avg: 10.0, count: 3, total: 30, td: 0, longest: 17 },
  { rank: 26, name: '김현성', number: '16번', team: '한동대학교', avg: 8.0, count: 1, total: 8, td: 0, longest: 8 },
  { rank: 26, name: '박종후', number: '93번', team: '경성대학교', avg: 8.0, count: 1, total: 8, td: 0, longest: 8 },
  { rank: 28, name: '김민성', number: '04번', team: '홍익대학교', avg: 7.5, count: 2, total: 15, td: 0, longest: 15 },
  { rank: 29, name: '변예준', number: '34번', team: '중앙대학교', avg: 6.7, count: 3, total: 20, td: 0, longest: 10 },
  { rank: 30, name: '김준호', number: '25번', team: '홍익대학교', avg: 6.0, count: 1, total: 6, td: 0, longest: 6 },
  { rank: 31, name: '이건', number: '07번', team: '한양대학교', avg: 5.0, count: 3, total: 15, td: 0, longest: 10 },
  { rank: 31, name: '이창민', number: '22번', team: '대구대학교', avg: 5.0, count: 1, total: 5, td: 0, longest: 5 },
  { rank: 31, name: '이정환', number: '88번', team: '고려대학교', avg: 5.0, count: 3, total: 15, td: 0, longest: 12 },
  { rank: 34, name: '황희재', number: '08번', team: '경북대학교', avg: 4.0, count: 4, total: 16, td: 0, longest: 13 },
  { rank: 34, name: '정훈민', number: '12번', team: '한동대학교', avg: 4.0, count: 3, total: 12, td: 0, longest: 8 },
  { rank: 36, name: '장우인', number: '13번', team: '부산외국어대학교', avg: 3.0, count: 1, total: 3, td: 0, longest: 3 },
  { rank: 37, name: '임윤서', number: '21번', team: '대구한의대학교', avg: 2.8, count: 5, total: 14, td: 0, longest: 7 },
  { rank: 38, name: '김민서', number: '01번', team: '동아대학교', avg: 2.5, count: 2, total: 5, td: 0, longest: 5 },
  { rank: 39, name: '이시욱', number: '36번', team: '부산외국어대학교', avg: 1.0, count: 1, total: 1, td: 0, longest: 1 },
  { rank: 39, name: '김찬용', number: '17번', team: '홍익대학교', avg: 1.0, count: 3, total: 3, td: 0, longest: 3 },
  { rank: 41, name: '임현성', number: '41번', team: '한양대학교', avg: 0.7, count: 3, total: 2, td: 0, longest: 2 },
  { rank: 42, name: '구준수', number: '34번', team: '영남대학교', avg: 0.5, count: 2, total: 1, td: 0, longest: 1 },
  { rank: 43, name: '김건원', number: '21번', team: '서울시립대학교', avg: 0.0, count: 1, total: 0, td: 0, longest: 0 },
  { rank: 43, name: '김선웅', number: '01번', team: '건국대학교', avg: 0.0, count: 1, total: 0, td: 0, longest: 0 },
  { rank: 43, name: '이동규', number: '07번', team: '서울대학교', avg: 0.0, count: 1, total: 0, td: 0, longest: 0 },
  { rank: 43, name: '정민영', number: '03번', team: '고려대학교', avg: 0.0, count: 1, total: 0, td: 0, longest: 0 },
  { rank: 43, name: '이준상', number: '07번', team: '연세대학교', avg: 0.0, count: 1, total: 0, td: 0, longest: 0 },
  { rank: 43, name: '안태현', number: '13번', team: '용인대학교', avg: 0.0, count: 1, total: 0, td: 0, longest: 0 },
  { rank: 43, name: '김민준', number: '12번', team: '경성대학교', avg: 0.0, count: 1, total: 0, td: 0, longest: 0 },
  { rank: 43, name: '엄홍재', number: '31번', team: '서강대학교', avg: 0.0, count: 1, total: 0, td: 0, longest: 0 }
];

// 분류 결과
export const puntReturnClassification = {
  'Seoul': {
    '1부': [
      { name: '김정헌', team: '서울대학교', avg: 25.0, count: 1, total: 25, longest: 25, td: 0 },
      { name: '권용준', team: '서울시립대학교', avg: 21.0, count: 2, total: 42, longest: 30, td: 0 },
      { name: '손주익', team: '서울시립대학교', avg: 19.0, count: 1, total: 19, longest: 19, td: 0 },
      { name: '이우진', team: '홍익대학교', avg: 18.0, count: 1, total: 18, longest: 18, td: 0 },
      { name: '허우인', team: '건국대학교', avg: 15.0, count: 2, total: 30, longest: 30, td: 0 },
      { name: '정재연', team: '국민대학교', avg: 10.0, count: 1, total: 10, longest: 10, td: 0 },
      { name: '김민성', team: '홍익대학교', avg: 7.5, count: 2, total: 15, longest: 15, td: 0 },
      { name: '김준호', team: '홍익대학교', avg: 6.0, count: 1, total: 6, longest: 6, td: 0 },
      { name: '이건', team: '한양대학교', avg: 5.0, count: 3, total: 15, longest: 10, td: 0 },
      { name: '김찬용', team: '홍익대학교', avg: 1.0, count: 3, total: 3, longest: 3, td: 0 },
      { name: '임현성', team: '한양대학교', avg: 0.7, count: 3, total: 2, longest: 2, td: 0 },
      { name: '김건원', team: '서울시립대학교', avg: 0.0, count: 1, total: 0, longest: 0, td: 0 },
      { name: '김선웅', team: '건국대학교', avg: 0.0, count: 1, total: 0, longest: 0, td: 0 },
      { name: '이동규', team: '서울대학교', avg: 0.0, count: 1, total: 0, longest: 0, td: 0 }
    ],
    '2부': [
      { name: '김승원', team: '숭실대학교', avg: 33.0, count: 1, total: 33, longest: 33, td: 0 },
      { name: '문태웅', team: '동국대학교', avg: 31.0, count: 1, total: 31, longest: 31, td: 0 },
      { name: '오승욱', team: '숭실대학교', avg: 11.5, count: 2, total: 23, longest: 15, td: 0 },
      { name: '정종은', team: '동국대학교', avg: 10.5, count: 2, total: 21, longest: 21, td: 0 },
      { name: '변예준', team: '중앙대학교', avg: 6.7, count: 3, total: 20, longest: 10, td: 0 },
      { name: '이정환', team: '고려대학교', avg: 5.0, count: 3, total: 15, longest: 12, td: 0 },
      { name: '정민영', team: '고려대학교', avg: 0.0, count: 1, total: 0, longest: 0, td: 0 },
      { name: '이준상', team: '연세대학교', avg: 0.0, count: 1, total: 0, longest: 0, td: 0 },
      { name: '엄홍재', team: '서강대학교', avg: 0.0, count: 1, total: 0, longest: 0, td: 0 }
    ]
  },
  'Gyeonggi-Gangwon': {
    '1부': [
      { name: '배병찬', team: '성균관대학교', avg: 18.0, count: 1, total: 18, longest: 18, td: 0 },
      { name: '이상현', team: '단국대학교', avg: 17.0, count: 1, total: 17, longest: 17, td: 0 },
      { name: '조다빈', team: '성균관대학교', avg: 12.1, count: 7, total: 85, longest: 50, td: 0 },
      { name: '박온', team: '성균관대학교', avg: 10.0, count: 1, total: 10, longest: 10, td: 0 }
    ],
    '2부': [
      { name: '안태현', team: '용인대학교', avg: 0.0, count: 1, total: 0, longest: 0, td: 0 }
    ]
  },
  'Daegu-Gyeongbuk': {
    '1부': [
      { name: '유동윤', team: '경일대학교', avg: 26.3, count: 7, total: 184, longest: 58, td: 1 },
      { name: '전민우', team: '경북대학교', avg: 25.0, count: 1, total: 25, longest: 25, td: 0 },
      { name: '이무진', team: '대구가톨릭대학교', avg: 13.0, count: 1, total: 13, longest: 13, td: 0 },
      { name: '조현영', team: '경북대학교', avg: 11.8, count: 4, total: 47, longest: 38, td: 0 },
      { name: '김강민', team: '경북대학교', avg: 10.0, count: 3, total: 30, longest: 17, td: 0 },
      { name: '김현성', team: '한동대학교', avg: 8.0, count: 1, total: 8, longest: 8, td: 0 },
      { name: '황희재', team: '경북대학교', avg: 4.0, count: 4, total: 16, longest: 13, td: 0 },
      { name: '정훈민', team: '한동대학교', avg: 4.0, count: 3, total: 12, longest: 8, td: 0 },
      { name: '임윤서', team: '대구한의대학교', avg: 2.8, count: 5, total: 14, longest: 7, td: 0 }
    ],
    '2부': [
      { name: '이민준', team: '영남대학교', avg: 15.0, count: 1, total: 15, longest: 15, td: 0 },
      { name: '최준환', team: '금오공과대학교', avg: 14.0, count: 1, total: 14, longest: 14, td: 0 },
      { name: '이창민', team: '대구대학교', avg: 5.0, count: 1, total: 5, longest: 5, td: 0 },
      { name: '구준수', team: '영남대학교', avg: 0.5, count: 2, total: 1, longest: 1, td: 0 }
    ]
  },
  'Busan-Gyeongnam': {
    '1부': [
      { name: '동방상원', team: '동아대학교', avg: 54.0, count: 1, total: 54, longest: 54, td: 0 },
      { name: '임지민', team: '동의대학교', avg: 18.0, count: 1, total: 18, longest: 18, td: 0 },
      { name: '박종후', team: '경성대학교', avg: 8.0, count: 1, total: 8, longest: 8, td: 0 },
      { name: '김민서', team: '동아대학교', avg: 2.5, count: 2, total: 5, longest: 5, td: 0 },
      { name: '김민준', team: '경성대학교', avg: 0.0, count: 1, total: 0, longest: 0, td: 0 }
    ],
    '2부': [
      { name: '정성준', team: '한국해양대학교', avg: 20.0, count: 1, total: 20, longest: 20, td: 1 },
      { name: '이예승', team: '부산외국어대학교', avg: 12.0, count: 1, total: 12, longest: 12, td: 0 },
      { name: '장우인', team: '부산외국어대학교', avg: 3.0, count: 1, total: 3, longest: 3, td: 0 },
      { name: '이시욱', team: '부산외국어대학교', avg: 1.0, count: 1, total: 1, longest: 1, td: 0 }
    ]
  }
};

// 리그별 펀트리턴 통계 요약
export const puntReturnStats = {
  'Seoul 1부': puntReturnClassification.Seoul['1부'].length,
  'Seoul 2부': puntReturnClassification.Seoul['2부'].length,
  'Gyeonggi-Gangwon 1부': puntReturnClassification['Gyeonggi-Gangwon']['1부'].length,
  'Gyeonggi-Gangwon 2부': puntReturnClassification['Gyeonggi-Gangwon']['2부'].length,
  'Daegu-Gyeongbuk 1부': puntReturnClassification['Daegu-Gyeongbuk']['1부'].length,
  'Daegu-Gyeongbuk 2부': puntReturnClassification['Daegu-Gyeongbuk']['2부'].length,
  'Busan-Gyeongnam 1부': puntReturnClassification['Busan-Gyeongnam']['1부'].length,
  'Busan-Gyeongnam 2부': puntReturnClassification['Busan-Gyeongnam']['2부'].length
};

console.log('펀트리턴 협회 데이터 분류 결과:');
console.log('서울리그 1부:', puntReturnStats['Seoul 1부'] + '명');
console.log('서울리그 2부:', puntReturnStats['Seoul 2부'] + '명');
console.log('경기강원 1부:', puntReturnStats['Gyeonggi-Gangwon 1부'] + '명');
console.log('경기강원 2부:', puntReturnStats['Gyeonggi-Gangwon 2부'] + '명');
console.log('대구경북 1부:', puntReturnStats['Daegu-Gyeongbuk 1부'] + '명');
console.log('대구경북 2부:', puntReturnStats['Daegu-Gyeongbuk 2부'] + '명');
console.log('부산경남 1부:', puntReturnStats['Busan-Gyeongnam 1부'] + '명');
console.log('부산경남 2부:', puntReturnStats['Busan-Gyeongnam 2부'] + '명');