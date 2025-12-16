# KAFA 크롤링 프론트엔드 연동 예시

## API 엔드포인트

### 1. 크롤링 및 저장 (버튼 클릭용)
```
POST /api/v1/kafa-stats/scrape-and-save/uni
POST /api/v1/kafa-stats/scrape-and-save/soc
```

### 2. 저장된 데이터 조회 (화면 표시용)
```
GET /api/v1/kafa-stats/players-json/uni
GET /api/v1/kafa-stats/players-json/soc
```

### 3. 파일 목록 조회 (관리용)
```
GET /api/v1/kafa-stats/json-files
```

## React 컴포넌트 예시

```tsx
import React, { useState } from 'react';
import axios from 'axios';

interface Player {
  rank: number;
  playerName: string;
  university: string;
  jerseyNumber: number;
  rushYards: number;
  yardsPerAttempt: number;
  attempts: number;
  touchdowns: number;
  longest: number;
}

interface KafaData {
  league: string;
  crawledAt: string;
  totalCount: number;
  players: Player[];
}

const KafaStatsPage: React.FC = () => {
  const [uniData, setUniData] = useState<KafaData | null>(null);
  const [socData, setSocData] = useState<KafaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 대학 리그 데이터 업데이트
  const updateUniData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. 크롤링 및 저장
      console.log('🔄 대학 리그 데이터 크롤링 시작...');
      const scrapeResponse = await axios.post('/api/v1/kafa-stats/scrape-and-save/uni');
      
      if (!scrapeResponse.data.success) {
        throw new Error(scrapeResponse.data.message);
      }
      
      console.log('✅ 크롤링 완료:', scrapeResponse.data.data.savedCount, '명');
      
      // 2. 저장된 데이터 조회
      const dataResponse = await axios.get('/api/v1/kafa-stats/players-json/uni');
      
      if (dataResponse.data.success) {
        setUniData(dataResponse.data.data);
      }
      
    } catch (err: any) {
      setError(`대학 리그 업데이트 실패: ${err.message}`);
      console.error('❌ 업데이트 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 사회인 리그 데이터 업데이트
  const updateSocData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 사회인 리그 데이터 크롤링 시작...');
      const scrapeResponse = await axios.post('/api/v1/kafa-stats/scrape-and-save/soc');
      
      if (!scrapeResponse.data.success) {
        throw new Error(scrapeResponse.data.message);
      }
      
      console.log('✅ 크롤링 완료:', scrapeResponse.data.data.savedCount, '명');
      
      const dataResponse = await axios.get('/api/v1/kafa-stats/players-json/soc');
      
      if (dataResponse.data.success) {
        setSocData(dataResponse.data.data);
      }
      
    } catch (err: any) {
      setError(`사회인 리그 업데이트 실패: ${err.message}`);
      console.error('❌ 업데이트 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 저장된 데이터 불러오기 (크롤링 없이)
  const loadSavedData = async () => {
    try {
      const [uniResponse, socResponse] = await Promise.all([
        axios.get('/api/v1/kafa-stats/players-json/uni'),
        axios.get('/api/v1/kafa-stats/players-json/soc')
      ]);
      
      if (uniResponse.data.success) {
        setUniData(uniResponse.data.data);
      }
      
      if (socResponse.data.success) {
        setSocData(socResponse.data.data);
      }
      
    } catch (err) {
      console.log('저장된 데이터가 없습니다. 먼저 업데이트하세요.');
    }
  };

  // 컴포넌트 마운트 시 저장된 데이터 불러오기
  React.useEffect(() => {
    loadSavedData();
  }, []);

  const renderPlayerTable = (data: KafaData | null, title: string) => {
    if (!data) return <p>데이터가 없습니다.</p>;
    
    return (
      <div className="player-table">
        <h3>{title}</h3>
        <p>
          총 {data.totalCount}명 | 업데이트: {new Date(data.crawledAt).toLocaleString()}
        </p>
        <table>
          <thead>
            <tr>
              <th>순위</th>
              <th>이름</th>
              <th>학교</th>
              <th>등번호</th>
              <th>러싱야드</th>
              <th>평균</th>
              <th>시도</th>
              <th>TD</th>
              <th>최장</th>
            </tr>
          </thead>
          <tbody>
            {data.players.slice(0, 20).map((player) => (
              <tr key={`${player.university}-${player.jerseyNumber}-${player.playerName}`}>
                <td>{player.rank}</td>
                <td>{player.playerName}</td>
                <td>{player.university}</td>
                <td>{player.jerseyNumber}</td>
                <td>{player.rushYards}</td>
                <td>{player.yardsPerAttempt.toFixed(1)}</td>
                <td>{player.attempts}</td>
                <td>{player.touchdowns}</td>
                <td>{player.longest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="kafa-stats-page">
      <h1>KAFA 리그 선수 통계</h1>
      
      {/* 업데이트 버튼들 */}
      <div className="update-buttons">
        <button 
          onClick={updateUniData} 
          disabled={loading}
          className="update-btn"
        >
          {loading ? '🔄 크롤링 중...' : '🏫 대학 리그 업데이트'}
        </button>
        
        <button 
          onClick={updateSocData} 
          disabled={loading}
          className="update-btn"
        >
          {loading ? '🔄 크롤링 중...' : '🏢 사회인 리그 업데이트'}
        </button>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* 데이터 표시 */}
      <div className="stats-container">
        {renderPlayerTable(uniData, "🏫 대학 리그 러싱 순위")}
        {renderPlayerTable(socData, "🏢 사회인 리그 러싱 순위")}
      </div>
    </div>
  );
};

export default KafaStatsPage;
```

## CSS 스타일 예시

```css
.kafa-stats-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.update-buttons {
  display: flex;
  gap: 15px;
  margin: 20px 0;
}

.update-btn {
  padding: 12px 24px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.update-btn:hover:not(:disabled) {
  background: #0056b3;
}

.update-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.error-message {
  padding: 12px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin: 15px 0;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.player-table {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.player-table table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.player-table th,
.player-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.player-table th {
  background: #f8f9fa;
  font-weight: bold;
}

.player-table tr:hover {
  background: #f8f9fa;
}

@media (max-width: 768px) {
  .update-buttons {
    flex-direction: column;
  }
  
  .player-table {
    overflow-x: auto;
  }
  
  .player-table table {
    min-width: 600px;
  }
}
```

## 사용법

1. **초기 로딩**: 페이지 접근 시 저장된 데이터 자동 불러오기
2. **업데이트**: "업데이트" 버튼 클릭으로 최신 데이터 크롤링
3. **실시간 표시**: 크롤링 완료 후 즉시 화면 업데이트
4. **오류 처리**: 네트워크 오류, 크롤링 실패 시 사용자에게 알림

## 주요 특징

- ✅ **실시간 크롤링**: 버튼 클릭으로 KAFA 최신 데이터 가져오기
- ✅ **로컬 캐싱**: JSON 파일 저장으로 빠른 데이터 접근
- ✅ **오류 처리**: 네트워크 오류, 파싱 오류 대응
- ✅ **로딩 상태**: 크롤링 중 UI 피드백
- ✅ **반응형**: 모바일/데스크톱 대응