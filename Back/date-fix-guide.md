# 게임키 날짜 문제 해결 가이드

## 문제 상황
- 프론트엔드에서 1월 1일을 선택 → gameKey가 YSSN20241231로 생성됨
- 하루씩 밀려서 저장되는 현상 발생

## 원인 분석
타임존 차이로 인한 문제일 가능성이 높습니다:
- 한국 시간(KST): UTC+9
- 프론트엔드에서 UTC로 변환할 때 날짜가 변경될 수 있음

## 프론트엔드 해결 방법

### 1. 로컬 날짜를 그대로 사용하는 방법
```javascript
// 잘못된 방법 (UTC 변환으로 인해 날짜 변경 가능)
const date = new Date(selectedDate);
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');

// 올바른 방법 (로컬 타임존 기준)
const date = new Date(selectedDate);
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');
const gameKey = `YSSN${year}${month}${day}`;
```

### 2. 명시적으로 한국 시간 사용
```javascript
// 한국 시간으로 강제 설정
const koreanDate = new Date(selectedDate + 'T00:00:00+09:00');
const year = koreanDate.getFullYear();
const month = String(koreanDate.getMonth() + 1).padStart(2, '0');
const day = String(koreanDate.getDate()).padStart(2, '0');
const gameKey = `YSSN${year}${month}${day}`;
```

### 3. moment.js 또는 date-fns 사용
```javascript
// moment.js 사용
import moment from 'moment-timezone';

const gameDate = moment(selectedDate).tz('Asia/Seoul');
const gameKey = `YSSN${gameDate.format('YYYYMMDD')}`;

// date-fns 사용
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const gameKey = `YSSN${format(new Date(selectedDate), 'yyyyMMdd')}`;
```

## 백엔드 확인 사항
백엔드에서 날짜를 저장할 때도 일관된 타임존 사용이 필요합니다:

```typescript
// game.service.ts에서 날짜 저장 시
const gameInfo = {
  gameKey: gameData.gameKey,
  date: gameData.date, // 이 값이 프론트엔드에서 전달된 값과 일치하는지 확인
  // ...
};
```

## 권장 사항
1. 프론트엔드에서 gameKey 생성 시 로컬 타임존을 명시적으로 사용
2. 날짜 문자열을 전달할 때는 ISO 형식 사용 (예: "2025-01-01T00:00:00+09:00")
3. 백엔드와 프론트엔드 모두 한국 시간(Asia/Seoul) 기준으로 통일

## 테스트 방법
1. 프론트엔드에서 날짜 선택 시 console.log로 확인:
   ```javascript
   console.log('선택한 날짜:', selectedDate);
   console.log('생성된 gameKey:', gameKey);
   ```

2. 백엔드에서 받은 데이터 확인:
   - `game.controller.ts`의 로그 확인
   - MongoDB에 저장된 실제 값 확인