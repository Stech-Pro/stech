const axios = require('axios');
const cheerio = require('cheerio');

// 리시빙 스탯 확인
async function testReceivingMapping() {
  console.log('🔍 리시빙 스탯 필드 매핑 확인...');
  
  try {
    const url = 'https://www.kafa.org/stats/ind_soc3.html';
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    console.log('📌 리시빙 헤더:');
    $('.stats_table tr').first().find('th').each((index, cell) => {
      const headerText = $(cell).text().trim();
      console.log(`  컬럼 ${index}: "${headerText}"`);
    });
    
    console.log('\n🏃 첫 번째 선수 데이터:');
    const firstRow = $('.stats_table tr').eq(1);
    const cells = firstRow.find('td');
    
    cells.each((index, cell) => {
      const cellText = $(cell).text().trim();
      console.log(`  셀 ${index}: "${cellText}"`);
    });
    
    // 현재 우리 매핑
    const ourMapping = {
      2: 'receptions',          
      3: 'receivingYards',      
      4: 'yardsPerReception',   
      5: 'targets',            // ❌ 실제로는 touchdowns!
      6: 'touchdowns',         // ❌ 실제로는 longest!
      7: 'longestReception'    // ❌ 이 컬럼은 존재하지 않음!
    };
    
    console.log('\n❌ 문제 발견!');
    console.log('실제 KAFA 구조: [순위] [선수] [REC] [REC YDS] [YDS/ATT] [TD] [LNG]');
    console.log('우리 매핑:     [순위] [선수] [REC] [REC YDS] [YDS/ATT] [targets] [touchdowns] [longestReception]');
    console.log('');
    console.log('올바른 매핑:');
    console.log('  셀 2: receptions');
    console.log('  셀 3: receivingYards'); 
    console.log('  셀 4: yardsPerReception');
    console.log('  셀 5: touchdowns (TD)');
    console.log('  셀 6: longestReception (LNG)');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

testReceivingMapping();