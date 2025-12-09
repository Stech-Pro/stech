// 리시빙 협회 데이터 분류 결과

const receivingData = [
  { rank: 1, name: '최윤수', number: '88번', team: '연세대학교', receptions: 37, receivingYards: 676, yardsPerReception: 18.3, receivingTouchdowns: 13, longestReception: 80 },
  { rank: 2, name: '윤상준', number: '10번', team: '고려대학교', receptions: 19, receivingYards: 180, yardsPerReception: 9.5, receivingTouchdowns: 2, longestReception: 33 },
  { rank: 3, name: '전민우', number: '12번', team: '경북대학교', receptions: 18, receivingYards: 185, yardsPerReception: 10.3, receivingTouchdowns: 2, longestReception: 33 },
  { rank: 3, name: '황희재', number: '08번', team: '경북대학교', receptions: 18, receivingYards: 248, yardsPerReception: 13.8, receivingTouchdowns: 3, longestReception: 50 },
  { rank: 5, name: '조현영', number: '01번', team: '경북대학교', receptions: 16, receivingYards: 160, yardsPerReception: 10.0, receivingTouchdowns: 2, longestReception: 36 },
  { rank: 6, name: '배민재', number: '89번', team: '경일대학교', receptions: 13, receivingYards: 181, yardsPerReception: 13.9, receivingTouchdowns: 4, longestReception: 58 },
  { rank: 6, name: '박온', number: '18번', team: '성균관대학교', receptions: 13, receivingYards: 193, yardsPerReception: 14.8, receivingTouchdowns: 1, longestReception: 38 },
  { rank: 6, name: '이예승', number: '09번', team: '부산외국어대학교', receptions: 13, receivingYards: 159, yardsPerReception: 12.2, receivingTouchdowns: 2, longestReception: 53 },
  { rank: 9, name: '임지민', number: '10번', team: '동의대학교', receptions: 11, receivingYards: 153, yardsPerReception: 13.9, receivingTouchdowns: 2, longestReception: 27 },
  { rank: 9, name: '김강민', number: '07번', team: '경북대학교', receptions: 11, receivingYards: 269, yardsPerReception: 24.5, receivingTouchdowns: 3, longestReception: 90 },
  { rank: 9, name: '이건', number: '07번', team: '한양대학교', receptions: 11, receivingYards: 115, yardsPerReception: 10.5, receivingTouchdowns: 0, longestReception: 24 },
  { rank: 9, name: '박지훈', number: '88번', team: '강원대학교', receptions: 11, receivingYards: 101, yardsPerReception: 9.2, receivingTouchdowns: 0, longestReception: 30 },
  { rank: 9, name: '김태현', number: '25번', team: '고려대학교', receptions: 11, receivingYards: 85, yardsPerReception: 7.7, receivingTouchdowns: 1, longestReception: 33 },
  { rank: 14, name: '권용준', number: '84번', team: '서울시립대학교', receptions: 10, receivingYards: 70, yardsPerReception: 7.0, receivingTouchdowns: 1, longestReception: 17 },
  { rank: 14, name: '이선우', number: '10번', team: '서울대학교', receptions: 10, receivingYards: 106, yardsPerReception: 10.6, receivingTouchdowns: 0, longestReception: 45 },
  { rank: 14, name: '정종은', number: '14번', team: '동국대학교', receptions: 10, receivingYards: 58, yardsPerReception: 5.8, receivingTouchdowns: 0, longestReception: 21 },
  { rank: 14, name: '박종후', number: '93번', team: '경성대학교', receptions: 10, receivingYards: 147, yardsPerReception: 14.7, receivingTouchdowns: 3, longestReception: 41 },
  { rank: 14, name: '이시욱', number: '36번', team: '부산외국어대학교', receptions: 10, receivingYards: 126, yardsPerReception: 12.6, receivingTouchdowns: 2, longestReception: 28 },
  { rank: 19, name: '김승원', number: '97번', team: '숭실대학교', receptions: 9, receivingYards: 70, yardsPerReception: 7.8, receivingTouchdowns: 0, longestReception: 18 },
  { rank: 19, name: '임현성', number: '41번', team: '한양대학교', receptions: 9, receivingYards: 231, yardsPerReception: 25.7, receivingTouchdowns: 3, longestReception: 57 },
  { rank: 19, name: '문영민', number: '82번', team: '동국대학교', receptions: 9, receivingYards: 88, yardsPerReception: 9.8, receivingTouchdowns: 0, longestReception: 21 },
  { rank: 19, name: '정민영', number: '03번', team: '고려대학교', receptions: 9, receivingYards: 89, yardsPerReception: 9.9, receivingTouchdowns: 2, longestReception: 26 },
  { rank: 23, name: '김동혁', number: '07번', team: '대구한의대학교', receptions: 8, receivingYards: 69, yardsPerReception: 8.6, receivingTouchdowns: 0, longestReception: 17 },
  { rank: 23, name: '강채민', number: '81번', team: '부산외국어대학교', receptions: 8, receivingYards: 128, yardsPerReception: 16.0, receivingTouchdowns: 2, longestReception: 45 },
  { rank: 23, name: '김범수', number: '05번', team: '울산대학교', receptions: 8, receivingYards: 82, yardsPerReception: 10.3, receivingTouchdowns: 2, longestReception: 37 },
  { rank: 23, name: '배성민', number: '10번', team: '성균관대학교', receptions: 8, receivingYards: 105, yardsPerReception: 13.1, receivingTouchdowns: 1, longestReception: 46 },
  { rank: 27, name: '김록겸', number: '07번', team: '고려대학교', receptions: 7, receivingYards: 74, yardsPerReception: 10.6, receivingTouchdowns: 0, longestReception: 33 },
  { rank: 27, name: '이승욱', number: '11번', team: '금오공과대학교', receptions: 7, receivingYards: 93, yardsPerReception: 13.3, receivingTouchdowns: 1, longestReception: 31 },
  { rank: 27, name: '남현석', number: '84번', team: '연세대학교', receptions: 7, receivingYards: 72, yardsPerReception: 10.3, receivingTouchdowns: 0, longestReception: 25 },
  { rank: 27, name: '소진규', number: '10번', team: '한양대학교', receptions: 7, receivingYards: 63, yardsPerReception: 9.0, receivingTouchdowns: 1, longestReception: 24 },
  { rank: 27, name: '이승재', number: '18번', team: '인하대학교', receptions: 7, receivingYards: 16, yardsPerReception: 2.3, receivingTouchdowns: 1, longestReception: 12 },
  { rank: 27, name: '이한재', number: '89번', team: '성균관대학교', receptions: 7, receivingYards: 73, yardsPerReception: 10.4, receivingTouchdowns: 0, longestReception: 33 },
  { rank: 27, name: '박기성', number: '49번', team: '한동대학교', receptions: 7, receivingYards: 61, yardsPerReception: 8.7, receivingTouchdowns: 0, longestReception: 21 },
  { rank: 27, name: '이명환', number: '35번', team: '서울대학교', receptions: 7, receivingYards: 42, yardsPerReception: 6.0, receivingTouchdowns: 1, longestReception: 18 },
  { rank: 27, name: '박우진', number: '82번', team: '신라대학교', receptions: 7, receivingYards: 126, yardsPerReception: 18.0, receivingTouchdowns: 1, longestReception: 58 },
  { rank: 36, name: '오성민', number: '03번', team: '한국외국어대학교', receptions: 6, receivingYards: 51, yardsPerReception: 8.5, receivingTouchdowns: 0, longestReception: 19 },
  { rank: 36, name: '김민성', number: '14번', team: '울산대학교', receptions: 6, receivingYards: 64, yardsPerReception: 10.7, receivingTouchdowns: 1, longestReception: 27 },
  { rank: 36, name: '권현수', number: '99번', team: '연세대학교', receptions: 6, receivingYards: 82, yardsPerReception: 13.7, receivingTouchdowns: 1, longestReception: 32 },
  { rank: 36, name: '김민준', number: '18번', team: '울산대학교', receptions: 6, receivingYards: 25, yardsPerReception: 4.2, receivingTouchdowns: 0, longestReception: 13 },
  { rank: 36, name: '정재성', number: '22번', team: '성균관대학교', receptions: 6, receivingYards: 81, yardsPerReception: 13.5, receivingTouchdowns: 1, longestReception: 26 },
  { rank: 36, name: '오승욱', number: '14번', team: '숭실대학교', receptions: 6, receivingYards: 101, yardsPerReception: 16.8, receivingTouchdowns: 2, longestReception: 81 },
  { rank: 36, name: '정명우', number: '16번', team: '숭실대학교', receptions: 6, receivingYards: 51, yardsPerReception: 8.5, receivingTouchdowns: 0, longestReception: 22 },
  { rank: 36, name: '양데이빗', number: '00번', team: '한양대학교', receptions: 6, receivingYards: 114, yardsPerReception: 19.0, receivingTouchdowns: 1, longestReception: 34 },
  { rank: 36, name: '김도훈', number: '89번', team: '고려대학교', receptions: 6, receivingYards: 39, yardsPerReception: 6.5, receivingTouchdowns: 0, longestReception: 14 },
  { rank: 36, name: 'Sol Timothy', number: '80번', team: '연세대학교', receptions: 6, receivingYards: 73, yardsPerReception: 12.2, receivingTouchdowns: 1, longestReception: 20 },
  { rank: 36, name: '유동윤', number: '18번', team: '경일대학교', receptions: 6, receivingYards: 48, yardsPerReception: 8.0, receivingTouchdowns: 0, longestReception: 14 },
  { rank: 36, name: '권용찬', number: '22번', team: '금오공과대학교', receptions: 6, receivingYards: 103, yardsPerReception: 17.2, receivingTouchdowns: 1, longestReception: 33 },
  { rank: 36, name: '허준영', number: '19번', team: '부산외국어대학교', receptions: 6, receivingYards: 40, yardsPerReception: 6.7, receivingTouchdowns: 0, longestReception: 10 },
  { rank: 49, name: '심찬', number: '86번', team: '연세대학교', receptions: 5, receivingYards: 59, yardsPerReception: 11.8, receivingTouchdowns: 2, longestReception: 20 },
  { rank: 49, name: '이도원', number: '19번', team: '건국대학교', receptions: 5, receivingYards: 72, yardsPerReception: 14.4, receivingTouchdowns: 0, longestReception: 24 }
];

// 분류 결과
export const receivingClassification = {
  'Seoul': {
    '1부': [
      { name: '최윤수', team: '연세대학교', receptions: 37, receivingYards: 676, yardsPerReception: 18.3, receivingTouchdowns: 13, longestReception: 80 },
      { name: '이건', team: '한양대학교', receptions: 11, receivingYards: 115, yardsPerReception: 10.5, receivingTouchdowns: 0, longestReception: 24 },
      { name: '권용준', team: '서울시립대학교', receptions: 10, receivingYards: 70, yardsPerReception: 7.0, receivingTouchdowns: 1, longestReception: 17 },
      { name: '이선우', team: '서울대학교', receptions: 10, receivingYards: 106, yardsPerReception: 10.6, receivingTouchdowns: 0, longestReception: 45 },
      { name: '임현성', team: '한양대학교', receptions: 9, receivingYards: 231, yardsPerReception: 25.7, receivingTouchdowns: 3, longestReception: 57 },
      { name: '남현석', team: '연세대학교', receptions: 7, receivingYards: 72, yardsPerReception: 10.3, receivingTouchdowns: 0, longestReception: 25 },
      { name: '소진규', team: '한양대학교', receptions: 7, receivingYards: 63, yardsPerReception: 9.0, receivingTouchdowns: 1, longestReception: 24 },
      { name: '이명환', team: '서울대학교', receptions: 7, receivingYards: 42, yardsPerReception: 6.0, receivingTouchdowns: 1, longestReception: 18 },
      { name: '오성민', team: '한국외국어대학교', receptions: 6, receivingYards: 51, yardsPerReception: 8.5, receivingTouchdowns: 0, longestReception: 19 },
      { name: '권현수', team: '연세대학교', receptions: 6, receivingYards: 82, yardsPerReception: 13.7, receivingTouchdowns: 1, longestReception: 32 },
      { name: '양데이빗', team: '한양대학교', receptions: 6, receivingYards: 114, yardsPerReception: 19.0, receivingTouchdowns: 1, longestReception: 34 },
      { name: 'Sol Timothy', team: '연세대학교', receptions: 6, receivingYards: 73, yardsPerReception: 12.2, receivingTouchdowns: 1, longestReception: 20 },
      { name: '심찬', team: '연세대학교', receptions: 5, receivingYards: 59, yardsPerReception: 11.8, receivingTouchdowns: 2, longestReception: 20 },
      { name: '이도원', team: '건국대학교', receptions: 5, receivingYards: 72, yardsPerReception: 14.4, receivingTouchdowns: 0, longestReception: 24 }
    ],
    '2부': [
      { name: '윤상준', team: '고려대학교', receptions: 19, receivingYards: 180, yardsPerReception: 9.5, receivingTouchdowns: 2, longestReception: 33 },
      { name: '김태현', team: '고려대학교', receptions: 11, receivingYards: 85, yardsPerReception: 7.7, receivingTouchdowns: 1, longestReception: 33 },
      { name: '정종은', team: '동국대학교', receptions: 10, receivingYards: 58, yardsPerReception: 5.8, receivingTouchdowns: 0, longestReception: 21 },
      { name: '김승원', team: '숭실대학교', receptions: 9, receivingYards: 70, yardsPerReception: 7.8, receivingTouchdowns: 0, longestReception: 18 },
      { name: '문영민', team: '동국대학교', receptions: 9, receivingYards: 88, yardsPerReception: 9.8, receivingTouchdowns: 0, longestReception: 21 },
      { name: '정민영', team: '고려대학교', receptions: 9, receivingYards: 89, yardsPerReception: 9.9, receivingTouchdowns: 2, longestReception: 26 },
      { name: '김록겸', team: '고려대학교', receptions: 7, receivingYards: 74, yardsPerReception: 10.6, receivingTouchdowns: 0, longestReception: 33 },
      { name: '오승욱', team: '숭실대학교', receptions: 6, receivingYards: 101, yardsPerReception: 16.8, receivingTouchdowns: 2, longestReception: 81 },
      { name: '정명우', team: '숭실대학교', receptions: 6, receivingYards: 51, yardsPerReception: 8.5, receivingTouchdowns: 0, longestReception: 22 },
      { name: '김도훈', team: '고려대학교', receptions: 6, receivingYards: 39, yardsPerReception: 6.5, receivingTouchdowns: 0, longestReception: 14 }
    ]
  },
  'Gyeonggi-Gangwon': {
    '1부': [
      { name: '박온', team: '성균관대학교', receptions: 13, receivingYards: 193, yardsPerReception: 14.8, receivingTouchdowns: 1, longestReception: 38 },
      { name: '박지훈', team: '강원대학교', receptions: 11, receivingYards: 101, yardsPerReception: 9.2, receivingTouchdowns: 0, longestReception: 30 },
      { name: '배성민', team: '성균관대학교', receptions: 8, receivingYards: 105, yardsPerReception: 13.1, receivingTouchdowns: 1, longestReception: 46 },
      { name: '이승재', team: '인하대학교', receptions: 7, receivingYards: 16, yardsPerReception: 2.3, receivingTouchdowns: 1, longestReception: 12 },
      { name: '이한재', team: '성균관대학교', receptions: 7, receivingYards: 73, yardsPerReception: 10.4, receivingTouchdowns: 0, longestReception: 33 },
      { name: '정재성', team: '성균관대학교', receptions: 6, receivingYards: 81, yardsPerReception: 13.5, receivingTouchdowns: 1, longestReception: 26 }
    ],
    '2부': [
    ]
  },
  'Daegu-Gyeongbuk': {
    '1부': [
      { name: '전민우', team: '경북대학교', receptions: 18, receivingYards: 185, yardsPerReception: 10.3, receivingTouchdowns: 2, longestReception: 33 },
      { name: '황희재', team: '경북대학교', receptions: 18, receivingYards: 248, yardsPerReception: 13.8, receivingTouchdowns: 3, longestReception: 50 },
      { name: '조현영', team: '경북대학교', receptions: 16, receivingYards: 160, yardsPerReception: 10.0, receivingTouchdowns: 2, longestReception: 36 },
      { name: '배민재', team: '경일대학교', receptions: 13, receivingYards: 181, yardsPerReception: 13.9, receivingTouchdowns: 4, longestReception: 58 },
      { name: '김강민', team: '경북대학교', receptions: 11, receivingYards: 269, yardsPerReception: 24.5, receivingTouchdowns: 3, longestReception: 90 },
      { name: '김동혁', team: '대구한의대학교', receptions: 8, receivingYards: 69, yardsPerReception: 8.6, receivingTouchdowns: 0, longestReception: 17 },
      { name: '박기성', team: '한동대학교', receptions: 7, receivingYards: 61, yardsPerReception: 8.7, receivingTouchdowns: 0, longestReception: 21 },
      { name: '유동윤', team: '경일대학교', receptions: 6, receivingYards: 48, yardsPerReception: 8.0, receivingTouchdowns: 0, longestReception: 14 }
    ],
    '2부': [
      { name: '이승욱', team: '금오공과대학교', receptions: 7, receivingYards: 93, yardsPerReception: 13.3, receivingTouchdowns: 1, longestReception: 31 },
      { name: '권용찬', team: '금오공과대학교', receptions: 6, receivingYards: 103, yardsPerReception: 17.2, receivingTouchdowns: 1, longestReception: 33 }
    ]
  },
  'Busan-Gyeongnam': {
    '1부': [
      { name: '임지민', team: '동의대학교', receptions: 11, receivingYards: 153, yardsPerReception: 13.9, receivingTouchdowns: 2, longestReception: 27 },
      { name: '박종후', team: '경성대학교', receptions: 10, receivingYards: 147, yardsPerReception: 14.7, receivingTouchdowns: 3, longestReception: 41 },
      { name: '김범수', team: '울산대학교', receptions: 8, receivingYards: 82, yardsPerReception: 10.3, receivingTouchdowns: 2, longestReception: 37 },
      { name: '김민성', team: '울산대학교', receptions: 6, receivingYards: 64, yardsPerReception: 10.7, receivingTouchdowns: 1, longestReception: 27 },
      { name: '김민준', team: '울산대학교', receptions: 6, receivingYards: 25, yardsPerReception: 4.2, receivingTouchdowns: 0, longestReception: 13 }
    ],
    '2부': [
      { name: '이예승', team: '부산외국어대학교', receptions: 13, receivingYards: 159, yardsPerReception: 12.2, receivingTouchdowns: 2, longestReception: 53 },
      { name: '이시욱', team: '부산외국어대학교', receptions: 10, receivingYards: 126, yardsPerReception: 12.6, receivingTouchdowns: 2, longestReception: 28 },
      { name: '강채민', team: '부산외국어대학교', receptions: 8, receivingYards: 128, yardsPerReception: 16.0, receivingTouchdowns: 2, longestReception: 45 },
      { name: '박우진', team: '신라대학교', receptions: 7, receivingYards: 126, yardsPerReception: 18.0, receivingTouchdowns: 1, longestReception: 58 },
      { name: '허준영', team: '부산외국어대학교', receptions: 6, receivingYards: 40, yardsPerReception: 6.7, receivingTouchdowns: 0, longestReception: 10 }
    ]
  }
};

// 리그별 리시빙 통계 요약
export const receivingStats = {
  'Seoul 1부': receivingClassification.Seoul['1부'].length,
  'Seoul 2부': receivingClassification.Seoul['2부'].length,
  'Gyeonggi-Gangwon 1부': receivingClassification['Gyeonggi-Gangwon']['1부'].length,
  'Gyeonggi-Gangwon 2부': receivingClassification['Gyeonggi-Gangwon']['2부'].length,
  'Daegu-Gyeongbuk 1부': receivingClassification['Daegu-Gyeongbuk']['1부'].length,
  'Daegu-Gyeongbuk 2부': receivingClassification['Daegu-Gyeongbuk']['2부'].length,
  'Busan-Gyeongnam 1부': receivingClassification['Busan-Gyeongnam']['1부'].length,
  'Busan-Gyeongnam 2부': receivingClassification['Busan-Gyeongnam']['2부'].length
};

console.log('리시빙 협회 데이터 분류 결과:');
console.log('서울리그 1부:', receivingStats['Seoul 1부'] + '명');
console.log('서울리그 2부:', receivingStats['Seoul 2부'] + '명');
console.log('경기강원 1부:', receivingStats['Gyeonggi-Gangwon 1부'] + '명');
console.log('경기강원 2부:', receivingStats['Gyeonggi-Gangwon 2부'] + '명');
console.log('대구경북 1부:', receivingStats['Daegu-Gyeongbuk 1부'] + '명');
console.log('대구경북 2부:', receivingStats['Daegu-Gyeongbuk 2부'] + '명');
console.log('부산경남 1부:', receivingStats['Busan-Gyeongnam 1부'] + '명');
console.log('부산경남 2부:', receivingStats['Busan-Gyeongnam 2부'] + '명');