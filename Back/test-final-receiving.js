// 수정된 리시빙 매핑으로 실제 크롤링 테스트

const axios = require('axios');
const cheerio = require('cheerio');

async function testFinalReceivingMapping() {
  console.log('🔍 수정된 리시빙 스탯 필드 매핑 테스트...');
  
  try {
    const url = 'https://www.kafa.org/stats/ind_soc3.html';
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    // 수정된 필드 매핑 시뮬레이션
    const fieldMappings = {
      2: 'receptions',
      3: 'receivingYards', 
      4: 'yardsPerReception',
      5: 'touchdowns',      // ✅ Fixed: was 'targets'
      6: 'longestReception' // ✅ Fixed: correct position
    };
    
    // 첫 번째 선수 데이터 파싱
    const firstRow = $('.stats_table tr').eq(1);
    const cells = firstRow.find('td');
    
    if (cells.length >= 6) {
      const playerCell = $(cells[1]).text().trim();
      const playerInfo = parsePlayerInfo(playerCell);
      
      const statData = {
        rank: 1,
        playerName: playerInfo.playerName,
        university: playerInfo.university,
        jerseyNumber: playerInfo.jerseyNumber,
      };
      
      // 각 셀 데이터 매핑
      cells.each((cellIndex, cell) => {
        if (cellIndex === 0 || cellIndex === 1) return;
        
        const cellValue = $(cell).text().trim();
        const fieldName = fieldMappings[cellIndex];
        
        if (fieldName) {
          let processedValue = cellValue;
          
          if (!isNaN(parseFloat(processedValue))) {
            statData[fieldName] = parseFloat(processedValue);
          } else {
            statData[fieldName] = processedValue;
          }
        }
      });
      
      console.log('\n✅ 파싱된 데이터:');
      console.log(JSON.stringify(statData, null, 2));
      
      // extractStatFields 시뮬레이션
      const extractedFields = {
        receptions: statData.receptions || 0,
        receivingYards: statData.receivingYards || 0,
        touchdowns: statData.touchdowns || 0,
        longest: statData.longestReception || 0,
        yardsPerReception: statData.yardsPerReception || 0
      };
      
      console.log('\n🎯 최종 추출된 필드:');
      console.log(JSON.stringify(extractedFields, null, 2));
      
      // 0 값 체크
      const zeroFields = Object.keys(extractedFields).filter(key => extractedFields[key] === 0);
      if (zeroFields.length > 0) {
        console.log(`\n❌ 0값 필드 발견: ${zeroFields.join(', ')}`);
      } else {
        console.log('\n✅ 모든 필드가 정상값을 가지고 있습니다!');
      }
      
    } else {
      console.log('❌ 충분한 셀이 없습니다');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

// 선수 정보 파싱 헬퍼
function parsePlayerInfo(text) {
  // "서울 골든이글스 90번 김영인" 형태 파싱
  const match = text.match(/(.+?)\s+(\d+)번\s+(.+)/);
  if (match) {
    return {
      university: match[1].trim(),
      jerseyNumber: parseInt(match[2]),
      playerName: match[3].trim()
    };
  }
  return { university: '', jerseyNumber: 0, playerName: text };
}

testFinalReceivingMapping();