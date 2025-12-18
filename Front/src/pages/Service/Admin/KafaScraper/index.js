import React, { useState } from 'react';
import { scrapeKafaStats } from '../../../../api/kafaStatsAPI';
import { useAuth } from '../../../../context/AuthContext';
import toast from 'react-hot-toast';
import './index.css';

export default function KafaScraper() {
  const { token, isAuthenticated, user } = useAuth();
  const [isScrapingUni, setIsScrapingUni] = useState(false);
  const [isScrapingSoc, setIsScrapingSoc] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleScrape = async (league) => {
    const isUni = league === 'uni';
    const setLoading = isUni ? setIsScrapingUni : setIsScrapingSoc;

    try {
      setLoading(true);
      setLastResult(null);

      const loadingToast = toast.loading(
        `${isUni ? '대학 리그' : '사회인 리그'} 크롤링 중...`
      );

      const result = await scrapeKafaStats(league, token);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(
          `${isUni ? '대학 리그' : '사회인 리그'} 크롤링 완료!`
        );
        setLastResult({
          league: isUni ? '대학 리그' : '사회인 리그',
          ...result
        });
      } else {
        throw new Error(result.message || '크롤링 실패');
      }
    } catch (error) {
      console.error('크롤링 오류:', error);
      toast.error(error.message || '크롤링 중 오류가 발생했습니다');
      setLastResult({
        league: isUni ? '대학 리그' : '사회인 리그',
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="kafa-scraper-container">
        <h1>🔐 관리자 권한이 필요합니다</h1>
      </div>
    );
  }

  return (
    <div className="kafa-scraper-container">
      <h1>📊 KAFA 통계 크롤링</h1>
      <p className="description">
        KAFA 웹사이트에서 최신 선수 통계 데이터를 크롤링합니다.
        <br />
        크롤링된 데이터는 리그 포지션별 통계 페이지에 자동으로 반영됩니다.
      </p>

      <div className="scraper-actions">
        <div className="scraper-card">
          <h3>🎓 대학 리그 크롤링</h3>
          <p>서울, 경기강원, 대구경북, 부산경남 리그의 모든 통계를 크롤링합니다.</p>
          <button
            onClick={() => handleScrape('uni')}
            disabled={isScrapingUni}
            className="scrape-button uni"
          >
            {isScrapingUni ? '🔄 크롤링 중...' : '대학 리그 크롤링 시작'}
          </button>
        </div>

        <div className="scraper-card">
          <h3>👔 사회인 리그 크롤링</h3>
          <p>사회인 리그의 모든 통계를 크롤링합니다.</p>
          <button
            onClick={() => handleScrape('soc')}
            disabled={isScrapingSoc}
            className="scrape-button soc"
          >
            {isScrapingSoc ? '🔄 크롤링 중...' : '사회인 리그 크롤링 시작'}
          </button>
        </div>
      </div>

      {lastResult && (
        <div className={`result-box ${lastResult.success ? 'success' : 'error'}`}>
          <h3>{lastResult.success ? '✅ 크롤링 성공' : '❌ 크롤링 실패'}</h3>
          <div className="result-details">
            <p><strong>리그:</strong> {lastResult.league}</p>
            {lastResult.success ? (
              <>
                <p><strong>메시지:</strong> {lastResult.message}</p>
                {lastResult.data && (
                  <div className="data-summary">
                    <p><strong>크롤링된 데이터:</strong></p>
                    <pre>{JSON.stringify(lastResult.data, null, 2)}</pre>
                  </div>
                )}
              </>
            ) : (
              <p><strong>오류:</strong> {lastResult.error}</p>
            )}
          </div>
        </div>
      )}

      <div className="info-box">
        <h3>ℹ️ 크롤링 정보</h3>
        <ul>
          <li>크롤링은 수 분이 소요될 수 있습니다.</li>
          <li>크롤링 중에는 페이지를 닫지 마세요.</li>
          <li>크롤링된 데이터는 자동으로 데이터베이스에 저장됩니다.</li>
          <li>기존 데이터가 있는 경우 최신 데이터로 업데이트됩니다.</li>
        </ul>
      </div>
    </div>
  );
}
