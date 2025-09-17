# 프론트엔드 API 이전 가이드

## 변경 내용 요약
플레이콜 API(`/team/analyze-game-playcall`)가 deprecated되고, 팀 스탯 API(`/team/stats/{gameKey}`)에 플레이콜 비율과 3rd down 상세 정보가 추가되었습니다.

## API 응답 구조 변경

### 기존 팀 스탯 API 응답
```json
{
  "success": true,
  "message": "팀 스탯 조회가 완료되었습니다",
  "data": {
    "homeTeamStats": {
      "teamName": "DGTuskers",
      "totalYards": 425,
      "passingYards": 280,
      "rushingYards": 145,
      "turnovers": 2,
      "penaltyYards": 45
      // ... 기타 필드들
    },
    "awayTeamStats": {
      // 동일한 구조
    }
  }
}
```

### 변경된 팀 스탯 API 응답 (플레이콜 비율, 3rd down 추가)
```json
{
  "success": true,
  "message": "팀 스탯 조회가 완료되었습니다",
  "data": {
    "homeTeamStats": {
      "teamName": "DGTuskers",
      "totalYards": 425,
      "passingYards": 280,
      "rushingYards": 145,
      "turnovers": 2,
      "penaltyYards": 45,
      // 새로 추가된 필드들
      "playCallRatio": {
        "runPlays": 25,
        "passPlays": 35,
        "runPercentage": 42,
        "passPercentage": 58
      },
      "thirdDownStats": {
        "attempts": 12,
        "conversions": 5,
        "percentage": 42
      }
    },
    "awayTeamStats": {
      // 동일한 구조
    }
  }
}
```

## 프론트엔드 수정 사항

### 1. API 엔드포인트 변경 불필요
- 현재 프론트엔드는 이미 `/team/stats/{gameKey}` API를 사용 중
- 플레이콜 API는 사용하지 않고 있어 변경 없음

### 2. ClipPage 컴포넌트 수정 (선택사항)

현재 프론트엔드에서 플레이콜 비율을 직접 계산하고 있는데, API에서 제공하는 데이터를 사용하도록 수정할 수 있습니다:

**현재 코드 (Front/src/pages/Service/Member/Game/Clip/index.js:420-451)**
```javascript
const rpStats = useMemo(() => {
  const calc = (teamName, apiStat) => {
    // 프론트에서 직접 계산
    const arr = clips.filter(/* ... */);
    const run = arr.filter((c) => c.playType === 'RUN').length;
    const pass = arr.length - run;
    // ...
  };
  return {
    home: calc(homeMeta?.name, teamStats?.home),
    away: calc(awayMeta?.name, teamStats?.away),
  };
}, [clips, homeMeta?.name, awayMeta?.name, teamStats]);
```

**수정 후 (API 데이터 사용)**
```javascript
const rpStats = useMemo(() => {
  // API에서 제공하는 플레이콜 비율 사용
  return {
    home: {
      runPct: teamStats?.home?.playCallRatio?.runPercentage || 0,
      passPct: teamStats?.home?.playCallRatio?.passPercentage || 0,
      run: teamStats?.home?.playCallRatio?.runPlays || 0,
      pass: teamStats?.home?.playCallRatio?.passPlays || 0,
    },
    away: {
      runPct: teamStats?.away?.playCallRatio?.runPercentage || 0,
      passPct: teamStats?.away?.playCallRatio?.passPercentage || 0,
      run: teamStats?.away?.playCallRatio?.runPlays || 0,
      pass: teamStats?.away?.playCallRatio?.passPlays || 0,
    },
  };
}, [teamStats]);
```

### 3. 3rd down 상세 정보 활용 (선택사항)

현재는 3rd down 퍼센테이지만 표시하고 있지만, 이제 시도/성공 횟수도 표시할 수 있습니다:

```javascript
// 현재
<div className="tsc-row">
  <div>{teamStats.home.thirdDownPct}%</div>
  <div className="tsc-label">3rd Down %</div>
  <div>{teamStats.away.thirdDownPct}%</div>
</div>

// 수정 후 (상세 정보 표시)
<div className="tsc-row">
  <div>
    {teamStats.home.thirdDownStats?.conversions || 0}/
    {teamStats.home.thirdDownStats?.attempts || 0} 
    ({teamStats.home.thirdDownStats?.percentage || 0}%)
  </div>
  <div className="tsc-label">3rd Down</div>
  <div>
    {teamStats.away.thirdDownStats?.conversions || 0}/
    {teamStats.away.thirdDownStats?.attempts || 0}
    ({teamStats.away.thirdDownStats?.percentage || 0}%)
  </div>
</div>
```

## 백엔드 변경 사항 (완료)

1. **TeamStatsDataDto에 필드 추가** ✅
   - playCallRatio: 플레이콜 비율 정보
   - thirdDownStats: 3rd down 상세 정보

2. **TeamStatsAnalyzerService 수정** ✅
   - convertToTeamStatsData 메서드에서 플레이콜 비율과 3rd down 통계 계산 추가

3. **플레이콜 API Deprecated 처리** ✅
   - API 문서에 deprecated 표시 및 대체 API 안내

## 권장 사항

1. **단계적 이전**: 현재 코드도 정상 작동하므로 급하게 변경할 필요 없음
2. **성능 고려**: API에서 계산된 데이터를 사용하면 프론트엔드 성능 향상
3. **일관성**: 백엔드에서 계산하면 모든 클라이언트가 동일한 결과를 받음