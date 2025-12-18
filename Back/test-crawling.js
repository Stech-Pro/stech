const axios = require('axios');

// 간단한 테스트: 사회인 러싱 페이지만 크롤링해서 실제 데이터 확인
async function testKafaCrawling() {
  try {
    console.log('🔍 KAFA 사회인 러싱 페이지 테스트 크롤링...');
    
    const url = 'https://www.kafa.org/stats/ind_soc1.html';
    const response = await axios.get(url, { timeout: 10000 });
    
    const cheerio = require('cheerio');
    const $ = cheerio.load(response.data);
    
    console.log('\n📋 테이블 구조 분석:');
    
    let rowCount = 0;
    $('.stats_table tr').each((index, element) => {
      if (index === 0) {
        // 헤더 확인
        console.log('📌 헤더 분석:');
        const headerCells = $(element).find('th');
        headerCells.each((cellIndex, cell) => {
          console.log(`  컬럼 ${cellIndex}: "${$(cell).text().trim()}"`);
        });
        return;
      }
      
      if (index <= 3) { // 상위 3명만 분석
        rowCount++;
        console.log(`\n🏃 ${index}번째 선수 데이터:`);
        
        const cells = $(element).find('td');
        console.log(`  총 셀 수: ${cells.length}`);
        
        cells.each((cellIndex, cell) => {
          const cellText = $(cell).text().trim();
          console.log(`  셀 ${cellIndex}: "${cellText}"`);
        });
        
        // 예상 구조로 파싱
        if (cells.length >= 6) {
          const rank = $(cells[0]).text().trim();
          const playerInfo = $(cells[1]).text().trim();
          const rushYards = $(cells[2]).text().trim();
          const yardsPerAttempt = $(cells[3]).text().trim();
          const attempts = $(cells[4]).text().trim();
          const touchdowns = $(cells[5]).text().trim();
          const longest = $(cells[6]) ? $(cells[6]).text().trim() : '없음';
          
          console.log(`\n  ✅ 파싱 결과:`);
          console.log(`     순위: ${rank}`);
          console.log(`     선수정보: ${playerInfo}`);
          console.log(`     러싱야드: ${rushYards}`);
          console.log(`     평균: ${yardsPerAttempt}`);
          console.log(`     시도: ${attempts}`);
          console.log(`     TD: ${touchdowns}`);
          console.log(`     최장: ${longest}`);
        }
      }
    });
    
    console.log(`\n📊 총 분석된 선수: ${rowCount}명`);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

testKafaCrawling();