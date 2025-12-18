// 실제 KAFA 데이터와 우리 필드 매핑 비교 분석

const actualKafaStructure = {
  1: { // RUSHING
    headers: ["순위", "선수", "RUSH YDS", "YDS/ATT", "ATT", "TD", "LNG"],
    mapping: {
      2: 'rushingYards',    // ✅ 맞음
      3: 'yardsPerAttempt', // ✅ 맞음
      4: 'attempts',        // ✅ 맞음
      5: 'touchdowns',      // ✅ 맞음
      6: 'longestRush'      // ✅ 맞음
    }
  },
  
  2: { // PASSING
    headers: ["순위", "선수", "PASS YDS", "YDS/ATT", "CMP%", "ATT", "CMP", "TD", "INT", "LNG"],
    mapping: {
      2: 'passingYards',        // ✅ 맞음
      3: 'yardsPerAttempt',     // ✅ 맞음
      4: 'completionPercentage', // ✅ 맞음
      5: 'attempts',            // ✅ 맞음
      6: 'completions',         // ✅ 맞음
      7: 'touchdowns',          // ✅ 맞음
      8: 'interceptions',       // ✅ 맞음
      9: 'longestPass'          // ✅ 맞음
    }
  },
  
  3: { // RECEIVING
    headers: ["순위", "선수", "REC", "REC YDS", "YDS/ATT", "TD", "LNG"],
    mapping: {
      2: 'receptions',          // ✅ 맞음
      3: 'receivingYards',      // ✅ 맞음
      4: 'yardsPerReception',   // ✅ 맞음
      5: 'touchdowns',          // ✅ 맞음
      6: 'longestReception'     // ✅ 맞음
    }
    // ❌ 문제: targets 필드가 없음!
  },
  
  4: { // FUMBLES
    headers: ["순위", "선수", "FF", "FR", "FR TD"],
    mapping: {
      2: 'forcedFumbles',    // ❌ 우리는 'fumbles'라고 했음
      3: 'fumbleRecoveries', // ❌ 우리는 'recovered'라고 했음
      4: 'fumbleRecoveryTDs' // ❌ 우리는 'lost'를 예상했음
    }
    // ❌ 완전히 다름!
  },
  
  5: { // TACKLES
    headers: ["순위", "선수", "ATT", "SACK", "SOLO", "COMBO"],
    mapping: {
      2: 'totalTackles',     // ✅ 맞음
      3: 'sacks',           // ❌ 우리 매핑에 없음
      4: 'soloTackles',     // ✅ 맞음
      5: 'assistTackles'    // ✅ 맞음 (COMBO = 어시스트)
    }
    // ❌ tacklesForLoss는 없음
  },
  
  6: { // INTERCEPTIONS
    headers: ["순위", "선수", "INT", "INT TD", "INT YDS", "LNG"],
    mapping: {
      2: 'interceptions',     // ✅ 맞음
      3: 'touchdowns',        // ❌ 우리는 4번으로 예상
      4: 'interceptionYards', // ❌ 우리는 3번으로 예상
      5: 'longestReturn'      // ✅ 맞음
    }
    // ❌ 순서가 바뀜!
  },
  
  7: { // FIELD GOALS
    headers: ["순위", "선수", "FG%", "YDS AVG", "FGM", "ATT", "YDS", "LNG"],
    mapping: {
      2: 'fieldGoalPercentage',  // ✅ 맞음
      3: 'averageDistance',      // ✅ 맞음
      4: 'fieldGoalsMade',       // ✅ 맞음
      5: 'fieldGoalsAttempted',  // ✅ 맞음
      6: 'totalYards',          // ❌ 우리 매핑에 없음
      7: 'longestMade'          // ✅ 맞음
    }
  },
  
  8: { // KICKOFFS
    headers: ["순위", "선수", "YDS AVG", "KO", "YDS", "TD", "LNG"],
    mapping: {
      2: 'averageDistance',  // ❌ 우리는 'average'라고 했음
      3: 'kickoffs',         // ✅ 맞음
      4: 'yards',           // ✅ 맞음
      5: 'touchdowns',      // ❌ 우리는 'touchbacks'라고 했음
      6: 'longest'          // ✅ 맞음
    }
    // ❌ touchbacks는 없고 touchdowns가 있음!
  },
  
  9: { // KICKOFF RETURNS
    headers: ["순위", "선수", "YDS AVG", "KO RETURNS", "YDS", "TD", "LNG"],
    mapping: {
      2: 'yardsPerReturn',   // ✅ 맞음
      3: 'returns',          // ✅ 맞음
      4: 'returnYards',      // ✅ 맞음
      5: 'touchdowns',       // ✅ 맞음
      6: 'longestReturn'     // ✅ 맞음
    }
  },
  
  10: { // PUNTING
    headers: ["순위", "선수", "YDS AVG", "PUNTS", "YDS", "TD", "LNG"],
    mapping: {
      2: 'averageDistance',   // ✅ 맞음
      3: 'totalPunts',        // ✅ 맞음
      4: 'totalYards',        // ✅ 맞음
      5: 'touchdowns',        // ❌ 우리는 'inside20'이라고 했음
      6: 'longestPunt'        // ✅ 맞음
    }
    // ❌ inside20은 없고 touchdowns가 있음!
  },
  
  11: { // PUNTING RETURNS
    headers: ["순위", "선수", "YDS AVG", "PUNT RETURNS", "YDS", "TD", "LNG"],
    mapping: {
      2: 'yardsPerReturn',   // ✅ 맞음
      3: 'returns',          // ✅ 맞음
      4: 'returnYards',      // ✅ 맞음
      5: 'touchdowns',       // ✅ 맞음
      6: 'longestReturn'     // ✅ 맞음
    }
  }
};

console.log('🔍 필드 매핑 분석 완료!');
console.log('\n❌ 수정이 필요한 스탯들:');
console.log('4. FUMBLES - 완전히 다른 구조');
console.log('5. TACKLES - sacks 필드 추가 필요, tacklesForLoss 제거');
console.log('6. INTERCEPTIONS - 필드 순서 변경');
console.log('8. KICKOFFS - touchbacks → touchdowns로 변경');
console.log('10. PUNTING - inside20 → touchdowns로 변경');

console.log('\n✅ 이미 올바른 스탯들:');
console.log('1. RUSHING, 2. PASSING, 3. RECEIVING (일부), 7. FIELD GOALS, 9. KICKOFF RETURNS, 11. PUNTING RETURNS');