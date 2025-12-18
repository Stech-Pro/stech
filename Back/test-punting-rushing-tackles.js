// 펀팅, 러싱, 태클 스탯 필드 매핑 확인

const axios = require('axios');
const cheerio = require('cheerio');

async function testMultipleStats() {
  const statsToTest = [
    { page: 10, name: 'PUNTING', url: 'ind_soc10.html' },
    { page: 1, name: 'RUSHING', url: 'ind_soc1.html' },
    { page: 5, name: 'TACKLES', url: 'ind_soc5.html' }
  ];

  for (const stat of statsToTest) {
    try {
      console.log(`\n🔍 ${stat.name} 스탯 확인 중...`);
      
      const url = `https://www.kafa.org/stats/${stat.url}`;
      const response = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(response.data);
      
      console.log(`📌 ${stat.name} 헤더:`);
      $('.stats_table tr').first().find('th').each((index, cell) => {
        const headerText = $(cell).text().trim();
        console.log(`  컬럼 ${index}: "${headerText}"`);
      });
      
      console.log(`\n🏃 첫 번째 선수 데이터:`);
      const firstRow = $('.stats_table tr').eq(1);
      const cells = firstRow.find('td');
      
      cells.each((index, cell) => {
        const cellText = $(cell).text().trim();
        console.log(`  셀 ${index}: "${cellText}"`);
      });
      
      // 현재 우리 매핑 출력
      console.log(`\n📋 현재 우리 ${stat.name} 매핑:`);
      if (stat.name === 'PUNTING') {
        console.log('  셀 2: averageDistance');
        console.log('  셀 3: totalPunts'); 
        console.log('  셀 4: totalYards');
        console.log('  셀 5: touchdowns');  // ❓ 실제로는 inside20일 수도?
        console.log('  셀 6: longestPunt');
      } else if (stat.name === 'RUSHING') {
        console.log('  셀 2: rushingYards');
        console.log('  셀 3: yardsPerAttempt');
        console.log('  셀 4: attempts');
        console.log('  셀 5: touchdowns');
        console.log('  셀 6: longestRush');
      } else if (stat.name === 'TACKLES') {
        console.log('  셀 2: totalTackles');
        console.log('  셀 3: sacks');
        console.log('  셀 4: soloTackles');
        console.log('  셀 5: assistTackles');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ ${stat.name} 테스트 실패:`, error.message);
    }
  }
}

testMultipleStats();