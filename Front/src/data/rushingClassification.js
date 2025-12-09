// 러싱 협회 데이터 분류 결과

const rushingData = [
  { rank: 1, name: '김태현', number: '25번', team: '고려대학교', rushingYards: 427, yardsPerCarry: 7.0, rushingAttempts: 61, rushingTouchdowns: 4, longestRush: 59 },
  { rank: 2, name: '이효원', number: '31번', team: '경북대학교', rushingYards: 383, yardsPerCarry: 6.7, rushingAttempts: 57, rushingTouchdowns: 1, longestRush: 85 },
  { rank: 3, name: '변지욱', number: '32번', team: '경일대학교', rushingYards: 382, yardsPerCarry: 6.1, rushingAttempts: 63, rushingTouchdowns: 3, longestRush: 32 },
  { rank: 4, name: '김민겸', number: '26번', team: '한양대학교', rushingYards: 319, yardsPerCarry: 5.1, rushingAttempts: 62, rushingTouchdowns: 4, longestRush: 42 },
  { rank: 5, name: '이재성', number: '21번', team: '연세대학교', rushingYards: 299, yardsPerCarry: 6.1, rushingAttempts: 49, rushingTouchdowns: 3, longestRush: 35 },
  { rank: 6, name: '이준상', number: '07번', team: '연세대학교', rushingYards: 286, yardsPerCarry: 6.0, rushingAttempts: 48, rushingTouchdowns: 3, longestRush: 32 },
  { rank: 7, name: '허준영', number: '19번', team: '부산외국어대학교', rushingYards: 256, yardsPerCarry: 6.9, rushingAttempts: 37, rushingTouchdowns: 3, longestRush: 24 },
  { rank: 8, name: '이민서', number: '01번', team: '부산외국어대학교', rushingYards: 255, yardsPerCarry: 6.9, rushingAttempts: 37, rushingTouchdowns: 0, longestRush: 34 },
  { rank: 9, name: '차경훈', number: '30번', team: '한양대학교', rushingYards: 253, yardsPerCarry: 3.8, rushingAttempts: 67, rushingTouchdowns: 2, longestRush: 30 },
  { rank: 10, name: '김도훈', number: '89번', team: '고려대학교', rushingYards: 248, yardsPerCarry: 7.3, rushingAttempts: 34, rushingTouchdowns: 2, longestRush: 35 },
  { rank: 11, name: '이기쁨', number: '07번', team: '강원대학교', rushingYards: 232, yardsPerCarry: 7.7, rushingAttempts: 30, rushingTouchdowns: 2, longestRush: 41 },
  { rank: 11, name: '서한솔', number: '04번', team: '부산외국어대학교', rushingYards: 232, yardsPerCarry: 5.4, rushingAttempts: 43, rushingTouchdowns: 2, longestRush: 16 },
  { rank: 13, name: '김재민', number: '13번', team: '동의대학교', rushingYards: 191, yardsPerCarry: 8.3, rushingAttempts: 23, rushingTouchdowns: 1, longestRush: 35 },
  { rank: 14, name: '박건', number: '33번', team: '한국해양대학교', rushingYards: 190, yardsPerCarry: 8.3, rushingAttempts: 23, rushingTouchdowns: 3, longestRush: 26 },
  { rank: 15, name: '정재민', number: '33번', team: '경성대학교', rushingYards: 188, yardsPerCarry: 5.7, rushingAttempts: 33, rushingTouchdowns: 2, longestRush: 39 },
  { rank: 16, name: '이명환', number: '35번', team: '서울대학교', rushingYards: 169, yardsPerCarry: 6.8, rushingAttempts: 25, rushingTouchdowns: 1, longestRush: 39 },
  { rank: 16, name: '이찬희', number: '12번', team: '한양대학교', rushingYards: 169, yardsPerCarry: 4.0, rushingAttempts: 42, rushingTouchdowns: 0, longestRush: 17 },
  { rank: 16, name: '장우영', number: '26번', team: '숭실대학교', rushingYards: 169, yardsPerCarry: 3.7, rushingAttempts: 46, rushingTouchdowns: 1, longestRush: 28 },
  { rank: 19, name: '신민호', number: '87번', team: '동의대학교', rushingYards: 162, yardsPerCarry: 8.1, rushingAttempts: 20, rushingTouchdowns: 0, longestRush: 41 },
  { rank: 20, name: '강경서', number: '21번', team: '금오공과대학교', rushingYards: 159, yardsPerCarry: 4.8, rushingAttempts: 33, rushingTouchdowns: 4, longestRush: 33 },
  { rank: 21, name: '황승연', number: '34번', team: '연세대학교', rushingYards: 153, yardsPerCarry: 3.7, rushingAttempts: 41, rushingTouchdowns: 3, longestRush: 68 },
  { rank: 22, name: '김범진', number: '98번', team: '대구대학교', rushingYards: 151, yardsPerCarry: 6.9, rushingAttempts: 22, rushingTouchdowns: 2, longestRush: 65 },
  { rank: 23, name: '이주헌', number: '22번', team: '동국대학교', rushingYards: 148, yardsPerCarry: 18.5, rushingAttempts: 8, rushingTouchdowns: 1, longestRush: 96 },
  { rank: 24, name: '이동규', number: '07번', team: '서울대학교', rushingYards: 145, yardsPerCarry: 4.5, rushingAttempts: 32, rushingTouchdowns: 0, longestRush: 18 },
  { rank: 25, name: '권순웅', number: '26번', team: '홍익대학교', rushingYards: 144, yardsPerCarry: 6.9, rushingAttempts: 21, rushingTouchdowns: 0, longestRush: 54 },
  { rank: 26, name: '김동현', number: '01번', team: '경성대학교', rushingYards: 140, yardsPerCarry: 6.1, rushingAttempts: 23, rushingTouchdowns: 3, longestRush: 37 },
  { rank: 27, name: '이정우', number: '22번', team: '동의대학교', rushingYards: 136, yardsPerCarry: 2.8, rushingAttempts: 49, rushingTouchdowns: 4, longestRush: 16 },
  { rank: 27, name: '이민석', number: '13번', team: '강원대학교', rushingYards: 136, yardsPerCarry: 5.0, rushingAttempts: 27, rushingTouchdowns: 2, longestRush: 22 },
  { rank: 29, name: '고승주', number: '15번', team: '경북대학교', rushingYards: 134, yardsPerCarry: 5.4, rushingAttempts: 25, rushingTouchdowns: 3, longestRush: 37 },
  { rank: 30, name: '김준호', number: '25번', team: '홍익대학교', rushingYards: 127, yardsPerCarry: 4.4, rushingAttempts: 29, rushingTouchdowns: 1, longestRush: 20 },
  { rank: 30, name: '김상구', number: '39번', team: '용인대학교', rushingYards: 127, yardsPerCarry: 21.2, rushingAttempts: 6, rushingTouchdowns: 1, longestRush: 63 },
  { rank: 32, name: '박종후', number: '93번', team: '경성대학교', rushingYards: 125, yardsPerCarry: 4.8, rushingAttempts: 26, rushingTouchdowns: 1, longestRush: 30 },
  { rank: 33, name: '김민준', number: '12번', team: '경성대학교', rushingYards: 122, yardsPerCarry: 5.3, rushingAttempts: 23, rushingTouchdowns: 1, longestRush: 27 },
  { rank: 34, name: '허유현', number: '33번', team: '한동대학교', rushingYards: 116, yardsPerCarry: 5.3, rushingAttempts: 22, rushingTouchdowns: 2, longestRush: 38 },
  { rank: 35, name: '김건원', number: '21번', team: '서울시립대학교', rushingYards: 107, yardsPerCarry: 5.4, rushingAttempts: 20, rushingTouchdowns: 1, longestRush: 65 },
  { rank: 36, name: '전민재', number: '29번', team: '영남대학교', rushingYards: 106, yardsPerCarry: 4.1, rushingAttempts: 26, rushingTouchdowns: 1, longestRush: 17 },
  { rank: 37, name: '배수환', number: '01번', team: '중앙대학교', rushingYards: 105, yardsPerCarry: 4.6, rushingAttempts: 23, rushingTouchdowns: 1, longestRush: 21 },
  { rank: 38, name: '장민규', number: '22번', team: '울산대학교', rushingYards: 103, yardsPerCarry: 5.4, rushingAttempts: 19, rushingTouchdowns: 1, longestRush: 34 },
  { rank: 38, name: '김승현', number: '15번', team: '경성대학교', rushingYards: 103, yardsPerCarry: 6.1, rushingAttempts: 17, rushingTouchdowns: 0, longestRush: 37 },
  { rank: 40, name: '이재승', number: '99번', team: '중앙대학교', rushingYards: 100, yardsPerCarry: 8.3, rushingAttempts: 12, rushingTouchdowns: 0, longestRush: 47 },
  { rank: 41, name: '김하은', number: '88번', team: '성균관대학교', rushingYards: 99, yardsPerCarry: 3.1, rushingAttempts: 32, rushingTouchdowns: 3, longestRush: 38 },
  { rank: 42, name: '유현석', number: '02번', team: '강원대학교', rushingYards: 95, yardsPerCarry: 3.0, rushingAttempts: 32, rushingTouchdowns: 0, longestRush: 16 },
  { rank: 42, name: '김형준', number: '14번', team: '대구대학교', rushingYards: 95, yardsPerCarry: 10.6, rushingAttempts: 9, rushingTouchdowns: 1, longestRush: 67 },
  { rank: 44, name: '안태현', number: '13번', team: '용인대학교', rushingYards: 94, yardsPerCarry: 4.9, rushingAttempts: 19, rushingTouchdowns: 0, longestRush: 16 },
  { rank: 44, name: '이준서', number: '25번', team: '동서대학교', rushingYards: 94, yardsPerCarry: 4.1, rushingAttempts: 23, rushingTouchdowns: 0, longestRush: 15 },
  { rank: 46, name: '장우혁', number: '28번', team: '인하대학교', rushingYards: 93, yardsPerCarry: 15.5, rushingAttempts: 6, rushingTouchdowns: 0, longestRush: 80 },
  { rank: 46, name: '허우인', number: '22번', team: '건국대학교', rushingYards: 93, yardsPerCarry: 6.6, rushingAttempts: 14, rushingTouchdowns: 1, longestRush: 32 },
  { rank: 48, name: '손승우', number: '99번', team: '동아대학교', rushingYards: 92, yardsPerCarry: 3.7, rushingAttempts: 25, rushingTouchdowns: 2, longestRush: 19 },
  { rank: 49, name: '구도현', number: '23번', team: '경북대학교', rushingYards: 90, yardsPerCarry: 3.6, rushingAttempts: 25, rushingTouchdowns: 0, longestRush: 17 },
  { rank: 49, name: '정운호', number: '48번', team: '한국해양대학교', rushingYards: 90, yardsPerCarry: 10.0, rushingAttempts: 9, rushingTouchdowns: 1, longestRush: 26 }
];

// 분류 결과
export const rushingClassification = {
  'Seoul': {
    '1부': [
      { name: '김민겸', team: '한양대학교', rushingYards: 319, yardsPerCarry: 5.1, rushingAttempts: 62, rushingTouchdowns: 4, longestRush: 42 },
      { name: '이재성', team: '연세대학교', rushingYards: 299, yardsPerCarry: 6.1, rushingAttempts: 49, rushingTouchdowns: 3, longestRush: 35 },
      { name: '이준상', team: '연세대학교', rushingYards: 286, yardsPerCarry: 6.0, rushingAttempts: 48, rushingTouchdowns: 3, longestRush: 32 },
      { name: '차경훈', team: '한양대학교', rushingYards: 253, yardsPerCarry: 3.8, rushingAttempts: 67, rushingTouchdowns: 2, longestRush: 30 },
      { name: '이명환', team: '서울대학교', rushingYards: 169, yardsPerCarry: 6.8, rushingAttempts: 25, rushingTouchdowns: 1, longestRush: 39 },
      { name: '이찬희', team: '한양대학교', rushingYards: 169, yardsPerCarry: 4.0, rushingAttempts: 42, rushingTouchdowns: 0, longestRush: 17 },
      { name: '황승연', team: '연세대학교', rushingYards: 153, yardsPerCarry: 3.7, rushingAttempts: 41, rushingTouchdowns: 3, longestRush: 68 },
      { name: '이동규', team: '서울대학교', rushingYards: 145, yardsPerCarry: 4.5, rushingAttempts: 32, rushingTouchdowns: 0, longestRush: 18 },
      { name: '권순웅', team: '홍익대학교', rushingYards: 144, yardsPerCarry: 6.9, rushingAttempts: 21, rushingTouchdowns: 0, longestRush: 54 },
      { name: '김준호', team: '홍익대학교', rushingYards: 127, yardsPerCarry: 4.4, rushingAttempts: 29, rushingTouchdowns: 1, longestRush: 20 },
      { name: '김건원', team: '서울시립대학교', rushingYards: 107, yardsPerCarry: 5.4, rushingAttempts: 20, rushingTouchdowns: 1, longestRush: 65 },
      { name: '허우인', team: '건국대학교', rushingYards: 93, yardsPerCarry: 6.6, rushingAttempts: 14, rushingTouchdowns: 1, longestRush: 32 }
    ],
    '2부': [
      { name: '김태현', team: '고려대학교', rushingYards: 427, yardsPerCarry: 7.0, rushingAttempts: 61, rushingTouchdowns: 4, longestRush: 59 },
      { name: '김도훈', team: '고려대학교', rushingYards: 248, yardsPerCarry: 7.3, rushingAttempts: 34, rushingTouchdowns: 2, longestRush: 35 },
      { name: '장우영', team: '숭실대학교', rushingYards: 169, yardsPerCarry: 3.7, rushingAttempts: 46, rushingTouchdowns: 1, longestRush: 28 },
      { name: '이주헌', team: '동국대학교', rushingYards: 148, yardsPerCarry: 18.5, rushingAttempts: 8, rushingTouchdowns: 1, longestRush: 96 },
      { name: '배수환', team: '중앙대학교', rushingYards: 105, yardsPerCarry: 4.6, rushingAttempts: 23, rushingTouchdowns: 1, longestRush: 21 },
      { name: '이재승', team: '중앙대학교', rushingYards: 100, yardsPerCarry: 8.3, rushingAttempts: 12, rushingTouchdowns: 0, longestRush: 47 }
    ]
  },
  'Gyeonggi-Gangwon': {
    '1부': [
      { name: '이기쁨', team: '강원대학교', rushingYards: 232, yardsPerCarry: 7.7, rushingAttempts: 30, rushingTouchdowns: 2, longestRush: 41 },
      { name: '이민석', team: '강원대학교', rushingYards: 136, yardsPerCarry: 5.0, rushingAttempts: 27, rushingTouchdowns: 2, longestRush: 22 },
      { name: '김하은', team: '성균관대학교', rushingYards: 99, yardsPerCarry: 3.1, rushingAttempts: 32, rushingTouchdowns: 3, longestRush: 38 },
      { name: '유현석', team: '강원대학교', rushingYards: 95, yardsPerCarry: 3.0, rushingAttempts: 32, rushingTouchdowns: 0, longestRush: 16 },
      { name: '장우혁', team: '인하대학교', rushingYards: 93, yardsPerCarry: 15.5, rushingAttempts: 6, rushingTouchdowns: 0, longestRush: 80 }
    ],
    '2부': [
      { name: '김상구', team: '용인대학교', rushingYards: 127, yardsPerCarry: 21.2, rushingAttempts: 6, rushingTouchdowns: 1, longestRush: 63 },
      { name: '안태현', team: '용인대학교', rushingYards: 94, yardsPerCarry: 4.9, rushingAttempts: 19, rushingTouchdowns: 0, longestRush: 16 }
    ]
  },
  'Daegu-Gyeongbuk': {
    '1부': [
      { name: '이효원', team: '경북대학교', rushingYards: 383, yardsPerCarry: 6.7, rushingAttempts: 57, rushingTouchdowns: 1, longestRush: 85 },
      { name: '변지욱', team: '경일대학교', rushingYards: 382, yardsPerCarry: 6.1, rushingAttempts: 63, rushingTouchdowns: 3, longestRush: 32 },
      { name: '고승주', team: '경북대학교', rushingYards: 134, yardsPerCarry: 5.4, rushingAttempts: 25, rushingTouchdowns: 3, longestRush: 37 },
      { name: '허유현', team: '한동대학교', rushingYards: 116, yardsPerCarry: 5.3, rushingAttempts: 22, rushingTouchdowns: 2, longestRush: 38 },
      { name: '구도현', team: '경북대학교', rushingYards: 90, yardsPerCarry: 3.6, rushingAttempts: 25, rushingTouchdowns: 0, longestRush: 17 }
    ],
    '2부': [
      { name: '강경서', team: '금오공과대학교', rushingYards: 159, yardsPerCarry: 4.8, rushingAttempts: 33, rushingTouchdowns: 4, longestRush: 33 },
      { name: '김범진', team: '대구대학교', rushingYards: 151, yardsPerCarry: 6.9, rushingAttempts: 22, rushingTouchdowns: 2, longestRush: 65 },
      { name: '김형준', team: '대구대학교', rushingYards: 95, yardsPerCarry: 10.6, rushingAttempts: 9, rushingTouchdowns: 1, longestRush: 67 },
      { name: '전민재', team: '영남대학교', rushingYards: 106, yardsPerCarry: 4.1, rushingAttempts: 26, rushingTouchdowns: 1, longestRush: 17 }
    ]
  },
  'Busan-Gyeongnam': {
    '1부': [
      { name: '김재민', team: '동의대학교', rushingYards: 191, yardsPerCarry: 8.3, rushingAttempts: 23, rushingTouchdowns: 1, longestRush: 35 },
      { name: '박건', team: '한국해양대학교', rushingYards: 190, yardsPerCarry: 8.3, rushingAttempts: 23, rushingTouchdowns: 3, longestRush: 26 },
      { name: '정재민', team: '경성대학교', rushingYards: 188, yardsPerCarry: 5.7, rushingAttempts: 33, rushingTouchdowns: 2, longestRush: 39 },
      { name: '신민호', team: '동의대학교', rushingYards: 162, yardsPerCarry: 8.1, rushingAttempts: 20, rushingTouchdowns: 0, longestRush: 41 },
      { name: '김동현', team: '경성대학교', rushingYards: 140, yardsPerCarry: 6.1, rushingAttempts: 23, rushingTouchdowns: 3, longestRush: 37 },
      { name: '이정우', team: '동의대학교', rushingYards: 136, yardsPerCarry: 2.8, rushingAttempts: 49, rushingTouchdowns: 4, longestRush: 16 },
      { name: '박종후', team: '경성대학교', rushingYards: 125, yardsPerCarry: 4.8, rushingAttempts: 26, rushingTouchdowns: 1, longestRush: 30 },
      { name: '김민준', team: '경성대학교', rushingYards: 122, yardsPerCarry: 5.3, rushingAttempts: 23, rushingTouchdowns: 1, longestRush: 27 },
      { name: '장민규', team: '울산대학교', rushingYards: 103, yardsPerCarry: 5.4, rushingAttempts: 19, rushingTouchdowns: 1, longestRush: 34 },
      { name: '김승현', team: '경성대학교', rushingYards: 103, yardsPerCarry: 6.1, rushingAttempts: 17, rushingTouchdowns: 0, longestRush: 37 },
      { name: '정운호', team: '한국해양대학교', rushingYards: 90, yardsPerCarry: 10.0, rushingAttempts: 9, rushingTouchdowns: 1, longestRush: 26 }
    ],
    '2부': [
      { name: '허준영', team: '부산외국어대학교', rushingYards: 256, yardsPerCarry: 6.9, rushingAttempts: 37, rushingTouchdowns: 3, longestRush: 24 },
      { name: '이민서', team: '부산외국어대학교', rushingYards: 255, yardsPerCarry: 6.9, rushingAttempts: 37, rushingTouchdowns: 0, longestRush: 34 },
      { name: '서한솔', team: '부산외국어대학교', rushingYards: 232, yardsPerCarry: 5.4, rushingAttempts: 43, rushingTouchdowns: 2, longestRush: 16 },
      { name: '이준서', team: '동서대학교', rushingYards: 94, yardsPerCarry: 4.1, rushingAttempts: 23, rushingTouchdowns: 0, longestRush: 15 },
      { name: '손승우', team: '동아대학교', rushingYards: 92, yardsPerCarry: 3.7, rushingAttempts: 25, rushingTouchdowns: 2, longestRush: 19 }
    ]
  }
};

// 리그별 러싱 통계 요약
export const rushingStats = {
  'Seoul 1부': rushingClassification.Seoul['1부'].length,
  'Seoul 2부': rushingClassification.Seoul['2부'].length,
  'Gyeonggi-Gangwon 1부': rushingClassification['Gyeonggi-Gangwon']['1부'].length,
  'Gyeonggi-Gangwon 2부': rushingClassification['Gyeonggi-Gangwon']['2부'].length,
  'Daegu-Gyeongbuk 1부': rushingClassification['Daegu-Gyeongbuk']['1부'].length,
  'Daegu-Gyeongbuk 2부': rushingClassification['Daegu-Gyeongbuk']['2부'].length,
  'Busan-Gyeongnam 1부': rushingClassification['Busan-Gyeongnam']['1부'].length,
  'Busan-Gyeongnam 2부': rushingClassification['Busan-Gyeongnam']['2부'].length
};

console.log('러싱 협회 데이터 분류 결과:');
console.log('서울리그 1부:', rushingStats['Seoul 1부'] + '명');
console.log('서울리그 2부:', rushingStats['Seoul 2부'] + '명');
console.log('경기강원 1부:', rushingStats['Gyeonggi-Gangwon 1부'] + '명');
console.log('경기강원 2부:', rushingStats['Gyeonggi-Gangwon 2부'] + '명');
console.log('대구경북 1부:', rushingStats['Daegu-Gyeongbuk 1부'] + '명');
console.log('대구경북 2부:', rushingStats['Daegu-Gyeongbuk 2부'] + '명');
console.log('부산경남 1부:', rushingStats['Busan-Gyeongnam 1부'] + '명');
console.log('부산경남 2부:', rushingStats['Busan-Gyeongnam 2부'] + '명');