const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/stech_db');

async function analyzeHighlights() {
  try {
    const gameClipsCollection = mongoose.connection.collection('gameclips');
    
    // YSKM20250906 경기 찾기
    const game = await gameClipsCollection.findOne({ gameKey: 'YSKM20250906' });
    
    if (!game) {
      console.log('❌ YSKM20250906 경기를 찾을 수 없습니다');
      return;
    }
    
    console.log(`🎮 경기: ${game.gameKey}`);
    console.log(`🏠 홈팀: ${game.homeTeam}`);
    console.log(`🚌 어웨이팀: ${game.awayTeam}`);
    console.log(`📊 총 클립 수: ${game.Clips.length}`);
    
    // 현재 하이라이트 조건으로 필터링
    const highlights = game.Clips.filter(clip => {
      const hasSignificantPlay = clip.significantPlays && clip.significantPlays.some(play => play !== null);
      const hasLongGain = clip.gainYard >= 10;
      return hasSignificantPlay || hasLongGain;
    });
    
    console.log(`🔥 현재 조건 하이라이트: ${highlights.length}개`);
    
    // 조건별 분석
    const significantPlayOnly = game.Clips.filter(clip => {
      const hasSignificantPlay = clip.significantPlays && clip.significantPlays.some(play => play !== null);
      return hasSignificantPlay && clip.gainYard < 10;
    });
    
    const longGainOnly = game.Clips.filter(clip => {
      const hasSignificantPlay = clip.significantPlays && clip.significantPlays.some(play => play !== null);
      const hasLongGain = clip.gainYard >= 10;
      return hasLongGain && !hasSignificantPlay;
    });
    
    const both = game.Clips.filter(clip => {
      const hasSignificantPlay = clip.significantPlays && clip.significantPlays.some(play => play !== null);
      const hasLongGain = clip.gainYard >= 10;
      return hasSignificantPlay && hasLongGain;
    });
    
    console.log('\n📊 하이라이트 분석:');
    console.log(`  📋 significantPlays만: ${significantPlayOnly.length}개`);
    console.log(`  📏 10야드+ 이득만: ${longGainOnly.length}개`);
    console.log(`  🎯 둘 다 만족: ${both.length}개`);
    
    // gainYard 분포 확인
    const gainYardDistribution = {};
    highlights.forEach(clip => {
      const gain = clip.gainYard || 0;
      const range = Math.floor(gain / 5) * 5; // 5야드 단위로 그룹핑
      gainYardDistribution[range] = (gainYardDistribution[range] || 0) + 1;
    });
    
    console.log('\n📈 gainYard 분포:');
    Object.keys(gainYardDistribution).sort((a,b) => a-b).forEach(range => {
      console.log(`  ${range}~${parseInt(range)+4}야드: ${gainYardDistribution[range]}개`);
    });
    
    // significantPlays 종류 확인
    const significantTypes = {};
    highlights.forEach(clip => {
      if (clip.significantPlays) {
        clip.significantPlays.forEach(play => {
          if (play !== null) {
            significantTypes[play] = (significantTypes[play] || 0) + 1;
          }
        });
      }
    });
    
    console.log('\n🎯 significantPlays 종류:');
    Object.keys(significantTypes).forEach(type => {
      console.log(`  ${type}: ${significantTypes[type]}개`);
    });
    
    // 샘플 클립 몇 개 보기
    console.log('\n📋 하이라이트 샘플 (처음 5개):');
    highlights.slice(0, 5).forEach((clip, i) => {
      console.log(`  ${i+1}. gainYard: ${clip.gainYard}, significantPlays: ${JSON.stringify(clip.significantPlays)}`);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    mongoose.disconnect();
  }
}

analyzeHighlights();