// 펌블 협회 데이터 분류 결과

import { TEAM_DIVISIONS } from './TEAM_DIVISIONS.js';

const fumbleData = [
  { rank: 1, name: '윤여진', number: '13번', team: '연세대학교', fumbles: 10, fumblesRecovered: 4, fumbleTouchdowns: 0 },
  { rank: 2, name: '박병민', number: '11번', team: '경일대학교', fumbles: 7, fumblesRecovered: 5, fumbleTouchdowns: 0 },
  { rank: 3, name: '성지훈', number: '26번', team: '단국대학교', fumbles: 6, fumblesRecovered: 3, fumbleTouchdowns: 0 },
  { rank: 4, name: '장혜성', number: '09번', team: '성균관대학교', fumbles: 5, fumblesRecovered: 3, fumbleTouchdowns: 0 },
  { rank: 4, name: '임규성', number: '01번', team: '카이스트', fumbles: 5, fumblesRecovered: 4, fumbleTouchdowns: 0 },
  { rank: 4, name: '우재윤', number: '11번', team: '국민대학교', fumbles: 5, fumblesRecovered: 3, fumbleTouchdowns: 0 },
  { rank: 7, name: '이기쁨', number: '07번', team: '강원대학교', fumbles: 4, fumblesRecovered: 2, fumbleTouchdowns: 0 },
  { rank: 7, name: '송지헌', number: '09번', team: '단국대학교', fumbles: 4, fumblesRecovered: 1, fumbleTouchdowns: 0 },
  { rank: 7, name: '이찬희', number: '12번', team: '한양대학교', fumbles: 4, fumblesRecovered: 1, fumbleTouchdowns: 0 },
  { rank: 7, name: '김도윤', number: '01번', team: '숭실대학교', fumbles: 4, fumblesRecovered: 2, fumbleTouchdowns: 0 },
  { rank: 7, name: '배수환', number: '01번', team: '중앙대학교', fumbles: 4, fumblesRecovered: 0, fumbleTouchdowns: 0 },
  { rank: 7, name: '문찬호', number: '09번', team: '고려대학교', fumbles: 4, fumblesRecovered: 2, fumbleTouchdowns: 0 },
  { rank: 7, name: '구준수', number: '34번', team: '영남대학교', fumbles: 4, fumblesRecovered: 1, fumbleTouchdowns: 1 },
  { rank: 7, name: '최수종', number: '86번', team: '고려대학교', fumbles: 4, fumblesRecovered: 2, fumbleTouchdowns: 0 },
  { rank: 15, name: '정택훈', number: '12번', team: '연세대학교', fumbles: 3, fumblesRecovered: 2, fumbleTouchdowns: 0 },
  { rank: 15, name: '김민서', number: '01번', team: '동아대학교', fumbles: 3, fumblesRecovered: 2, fumbleTouchdowns: 0 },
  { rank: 15, name: '김동현', number: '01번', team: '경성대학교', fumbles: 3, fumblesRecovered: 1, fumbleTouchdowns: 0 },
  { rank: 15, name: '서한솔', number: '04번', team: '부산외국어대학교', fumbles: 3, fumblesRecovered: 0, fumbleTouchdowns: 0 },
  { rank: 15, name: '이창빈', number: '13번', team: '부산대학교', fumbles: 3, fumblesRecovered: 1, fumbleTouchdowns: 0 },
  { rank: 15, name: '신재웅', number: '04번', team: '영남대학교', fumbles: 3, fumblesRecovered: 3, fumbleTouchdowns: 0 },
  { rank: 15, name: '변지성', number: '01번', team: '성균관대학교', fumbles: 3, fumblesRecovered: 3, fumbleTouchdowns: 0 },
  { rank: 15, name: '이주람', number: '01번', team: '한동대학교', fumbles: 3, fumblesRecovered: 0, fumbleTouchdowns: 0 },
  { rank: 15, name: '이준상', number: '07번', team: '연세대학교', fumbles: 3, fumblesRecovered: 2, fumbleTouchdowns: 0 },
  { rank: 15, name: '이재승', number: '99번', team: '중앙대학교', fumbles: 3, fumblesRecovered: 2, fumbleTouchdowns: 0 },
  { rank: 15, name: '구도현', number: '23번', team: '경북대학교', fumbles: 3, fumblesRecovered: 1, fumbleTouchdowns: 1 },
  { rank: 15, name: '장우영', number: '26번', team: '숭실대학교', fumbles: 3, fumblesRecovered: 1, fumbleTouchdowns: 0 },
  { rank: 15, name: '김서진', number: '20번', team: '건국대학교', fumbles: 3, fumblesRecovered: 2, fumbleTouchdowns: 0 },
  { rank: 28, name: '제용현', number: '55번', team: '국민대학교', fumbles: 2, fumblesRecovered: 2, fumbleTouchdowns: 0 },
  { rank: 28, name: '김민겸', number: '26번', team: '한양대학교', fumbles: 2, fumblesRecovered: 4, fumbleTouchdowns: 0 },
  { rank: 28, name: '김하은', number: '88번', team: '성균관대학교', fumbles: 2, fumblesRecovered: 0, fumbleTouchdowns: 0 },
  { rank: 28, name: '이재원', number: '10번', team: '계명대학교', fumbles: 2, fumblesRecovered: 1, fumbleTouchdowns: 0 },
  { rank: 28, name: '원재훈', number: '08번', team: '국민대학교', fumbles: 2, fumblesRecovered: 1, fumbleTouchdowns: 0 },
  { rank: 28, name: '홍세민', number: '95번', team: '경성대학교', fumbles: 2, fumblesRecovered: 1, fumbleTouchdowns: 0 },
  { rank: 28, name: '한시훈', number: '10번', team: '단국대학교', fumbles: 2, fumblesRecovered: 2, fumbleTouchdowns: 0 },
  { rank: 28, name: '배성민', number: '10번', team: '성균관대학교', fumbles: 2, fumblesRecovered: 2, fumbleTouchdowns: 0 },
  { rank: 28, name: '최은찬', number: '10번', team: '동국대학교', fumbles: 2, fumblesRecovered: 2, fumbleTouchdowns: 0 },
  { rank: 28, name: '백운성', number: '07번', team: '서강대학교', fumbles: 2, fumblesRecovered: 1, fumbleTouchdowns: 0 },
  { rank: 28, name: '김민준', number: '18번', team: '울산대학교', fumbles: 2, fumblesRecovered: 1, fumbleTouchdowns: 0 },
  { rank: 28, name: '이민석', number: '13번', team: '강원대학교', fumbles: 2, fumblesRecovered: 1, fumbleTouchdowns: 0 },
  { rank: 28, name: '김민성', number: '04번', team: '홍익대학교', fumbles: 2, fumblesRecovered: 1, fumbleTouchdowns: 0 },
  { rank: 28, name: '박윤서', number: '49번', team: '인하대학교', fumbles: 2, fumblesRecovered: 1, fumbleTouchdowns: 0 },
  { rank: 42, name: '이동규', number: '07번', team: '서울대학교', fumbles: 3, fumblesRecovered: 0, fumbleTouchdowns: 0 },
  { rank: 43, name: '박종후', number: '93번', team: '경성대학교', fumbles: 2, fumblesRecovered: 0, fumbleTouchdowns: 0 },
  { rank: 43, name: '김무성', number: '13번', team: '단국대학교', fumbles: 2, fumblesRecovered: 3, fumbleTouchdowns: 0 },
  { rank: 43, name: '김대웅', number: '15번', team: '홍익대학교', fumbles: 2, fumblesRecovered: 2, fumbleTouchdowns: 0 },
  { rank: 43, name: '권우진', number: '22번', team: '서울시립대학교', fumbles: 2, fumblesRecovered: 0, fumbleTouchdowns: 0 },
  { rank: 43, name: '김두호', number: '17번', team: '경희대학교', fumbles: 2, fumblesRecovered: 1, fumbleTouchdowns: 0 },
  { rank: 43, name: '손혁빈', number: '25번', team: '경희대학교', fumbles: 2, fumblesRecovered: 0, fumbleTouchdowns: 0 },
  { rank: 43, name: '이시욱', number: '36번', team: '부산외국어대학교', fumbles: 2, fumblesRecovered: 1, fumbleTouchdowns: 0 },
  { rank: 43, name: '이상현', number: '17번', team: '단국대학교', fumbles: 2, fumblesRecovered: 2, fumbleTouchdowns: 0 }
];

// 분류 결과
export const fumbleClassification = {
  'Seoul': {
    '1부': [
      { name: '윤여진', team: '연세대학교', fumbles: 10, fumblesLost: 4, fumbleTouchdowns: 0 },
      { name: '우재윤', team: '국민대학교', fumbles: 5, fumblesLost: 3, fumbleTouchdowns: 0 },
      { name: '이찬희', team: '한양대학교', fumbles: 4, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '정택훈', team: '연세대학교', fumbles: 3, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '이준상', team: '연세대학교', fumbles: 3, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '김서진', team: '건국대학교', fumbles: 3, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '제용현', team: '국민대학교', fumbles: 2, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '김민겸', team: '한양대학교', fumbles: 2, fumblesLost: 4, fumbleTouchdowns: 0 },
      { name: '원재훈', team: '국민대학교', fumbles: 2, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '김민성', team: '홍익대학교', fumbles: 2, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '이동규', team: '서울대학교', fumbles: 3, fumblesLost: 0, fumbleTouchdowns: 0 },
      { name: '김대웅', team: '홍익대학교', fumbles: 2, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '권우진', team: '서울시립대학교', fumbles: 2, fumblesLost: 0, fumbleTouchdowns: 0 }
    ],
    '2부': [
      { name: '문찬호', team: '고려대학교', fumbles: 4, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '김도윤', team: '숭실대학교', fumbles: 4, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '배수환', team: '중앙대학교', fumbles: 4, fumblesLost: 0, fumbleTouchdowns: 0 },
      { name: '최수종', team: '고려대학교', fumbles: 4, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '이재승', team: '중앙대학교', fumbles: 3, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '장우영', team: '숭실대학교', fumbles: 3, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '최은찬', team: '동국대학교', fumbles: 2, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '백운성', team: '서강대학교', fumbles: 2, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '김두호', team: '경희대학교', fumbles: 2, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '손혁빈', team: '경희대학교', fumbles: 2, fumblesLost: 0, fumbleTouchdowns: 0 }
    ]
  },
  'Gyeonggi-Gangwon': {
    '1부': [
      { name: '성지훈', team: '단국대학교', fumbles: 6, fumblesLost: 3, fumbleTouchdowns: 0 },
      { name: '장혜성', team: '성균관대학교', fumbles: 5, fumblesLost: 3, fumbleTouchdowns: 0 },
      { name: '이기쁨', team: '강원대학교', fumbles: 4, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '송지헌', team: '단국대학교', fumbles: 4, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '변지성', team: '성균관대학교', fumbles: 3, fumblesLost: 3, fumbleTouchdowns: 0 },
      { name: '김하은', team: '성균관대학교', fumbles: 2, fumblesLost: 0, fumbleTouchdowns: 0 },
      { name: '한시훈', team: '단국대학교', fumbles: 2, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '배성민', team: '성균관대학교', fumbles: 2, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '이민석', team: '강원대학교', fumbles: 2, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '박윤서', team: '인하대학교', fumbles: 2, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '김무성', team: '단국대학교', fumbles: 2, fumblesLost: 3, fumbleTouchdowns: 0 },
      { name: '이상현', team: '단국대학교', fumbles: 2, fumblesLost: 2, fumbleTouchdowns: 0 }
    ],
    '2부': [
      { name: '임규성', team: '카이스트', fumbles: 5, fumblesLost: 4, fumbleTouchdowns: 0 }
    ]
  },
  'Daegu-Gyeongbuk': {
    '1부': [
      { name: '박병민', team: '경일대학교', fumbles: 7, fumblesLost: 5, fumbleTouchdowns: 0 },
      { name: '구도현', team: '경북대학교', fumbles: 3, fumblesLost: 1, fumbleTouchdowns: 1 },
      { name: '이주람', team: '한동대학교', fumbles: 3, fumblesLost: 0, fumbleTouchdowns: 0 }
    ],
    '2부': [
      { name: '구준수', team: '영남대학교', fumbles: 4, fumblesLost: 1, fumbleTouchdowns: 1 },
      { name: '신재웅', team: '영남대학교', fumbles: 3, fumblesLost: 3, fumbleTouchdowns: 0 },
      { name: '이재원', team: '계명대학교', fumbles: 2, fumblesLost: 1, fumbleTouchdowns: 0 }
    ]
  },
  'Busan-Gyeongnam': {
    '1부': [
      { name: '김민서', team: '동아대학교', fumbles: 3, fumblesLost: 2, fumbleTouchdowns: 0 },
      { name: '김동현', team: '경성대학교', fumbles: 3, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '홍세민', team: '경성대학교', fumbles: 2, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '김민준', team: '울산대학교', fumbles: 2, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '박종후', team: '경성대학교', fumbles: 2, fumblesLost: 0, fumbleTouchdowns: 0 }
    ],
    '2부': [
      { name: '서한솔', team: '부산외국어대학교', fumbles: 3, fumblesLost: 0, fumbleTouchdowns: 0 },
      { name: '이창빈', team: '부산대학교', fumbles: 3, fumblesLost: 1, fumbleTouchdowns: 0 },
      { name: '이시욱', team: '부산외국어대학교', fumbles: 2, fumblesLost: 1, fumbleTouchdowns: 0 }
    ]
  }
};

// 리그별 펌블 통계 요약
export const fumbleStats = {
  'Seoul 1부': fumbleClassification.Seoul['1부'].length,
  'Seoul 2부': fumbleClassification.Seoul['2부'].length,
  'Gyeonggi-Gangwon 1부': fumbleClassification['Gyeonggi-Gangwon']['1부'].length,
  'Gyeonggi-Gangwon 2부': fumbleClassification['Gyeonggi-Gangwon']['2부'].length,
  'Daegu-Gyeongbuk 1부': fumbleClassification['Daegu-Gyeongbuk']['1부'].length,
  'Daegu-Gyeongbuk 2부': fumbleClassification['Daegu-Gyeongbuk']['2부'].length,
  'Busan-Gyeongnam 1부': fumbleClassification['Busan-Gyeongnam']['1부'].length,
  'Busan-Gyeongnam 2부': fumbleClassification['Busan-Gyeongnam']['2부'].length
};

console.log('펌블 협회 데이터 분류 결과:');
console.log('서울리그 1부:', fumbleStats['Seoul 1부'] + '명');
console.log('서울리그 2부:', fumbleStats['Seoul 2부'] + '명');
console.log('경기강원 1부:', fumbleStats['Gyeonggi-Gangwon 1부'] + '명');
console.log('경기강원 2부:', fumbleStats['Gyeonggi-Gangwon 2부'] + '명');
console.log('대구경북 1부:', fumbleStats['Daegu-Gyeongbuk 1부'] + '명');
console.log('대구경북 2부:', fumbleStats['Daegu-Gyeongbuk 2부'] + '명');
console.log('부산경남 1부:', fumbleStats['Busan-Gyeongnam 1부'] + '명');
console.log('부산경남 2부:', fumbleStats['Busan-Gyeongnam 2부'] + '명');