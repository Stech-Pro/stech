const axios = require('axios');
const cheerio = require('cheerio');

// 11개 모든 스탯 페이지 테스트
async function testAllKafaStats() {
  const statTypes = [
    { page: 1, name: 'RUSHING', url: 'ind_soc1.html' },
    { page: 2, name: 'PASSING', url: 'ind_soc2.html' },
    { page: 3, name: 'RECEIVING', url: 'ind_soc3.html' },
    { page: 4, name: 'FUMBLES', url: 'ind_soc4.html' },
    { page: 5, name: 'TACKLES', url: 'ind_soc5.html' },
    { page: 6, name: 'INTERCEPTIONS', url: 'ind_soc6.html' },
    { page: 7, name: 'FIELD GOALS', url: 'ind_soc7.html' },
    { page: 8, name: 'KICKOFFS', url: 'ind_soc8.html' },
    { page: 9, name: 'KICKOFF RETURNS', url: 'ind_soc9.html' },
    { page: 10, name: 'PUNTING', url: 'ind_soc10.html' },
    { page: 11, name: 'PUNTING RETURNS', url: 'ind_soc11.html' }
  ];

  for (const stat of statTypes) {
    try {
      console.log(`\n🔍 ${stat.name} (${stat.url}) 테스트 중...`);
      
      const url = `https://www.kafa.org/stats/${stat.url}`;
      const response = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(response.data);
      
      // 헤더 분석
      console.log(`📌 ${stat.name} 헤더:`);
      $('.stats_table tr').first().find('th').each((index, cell) => {
        const headerText = $(cell).text().trim();
        console.log(`  컬럼 ${index}: "${headerText}"`);
      });
      
      // 첫 번째 선수 데이터 분석
      const firstPlayerRow = $('.stats_table tr').eq(1);
      if (firstPlayerRow.length > 0) {
        console.log(`\n🏃 첫 번째 선수 데이터:`);
        firstPlayerRow.find('td').each((index, cell) => {
          const cellText = $(cell).text().trim();
          console.log(`  셀 ${index}: "${cellText}"`);
        });
      }
      
      // 1초 딜레이
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ ${stat.name} 테스트 실패:`, error.message);
    }
  }
  
  console.log('\n✅ 모든 스탯 페이지 테스트 완료!');
}

testAllKafaStats();