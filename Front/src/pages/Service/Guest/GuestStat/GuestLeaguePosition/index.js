import StatPosition from '../../../../../components/Stat/StatPosition';
import { TEAMS } from '../../../../../data/TEAMS';
import { useState, useEffect } from 'react';
import { getKafaStats } from '../../../../../api/kafaStatsAPI';
import { transformKafaToStatPlayer } from '../../../../../utils/kafaDataTransformer';
import toast from 'react-hot-toast';

const GuestLeaguePositionPage = () => {
  const [transformedData, setTransformedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndTransformKafaData = async () => {
      try {
        setLoading(true);
        setError(null);

        // KAFA 통계 타입들 (API에서 사용하는 영어 타입)
        const statTypes = [
          'rushing',
          'passing',
          'receiving',
          'fumbles',
          'tackles',
          'interceptions',
          'fieldgoals',
          'kickoffs',
          'kickoffreturns',
          'punting',
          'puntreturns'
        ];

        // 모든 데이터를 statType별로 저장
        const dataByStatType = {};

        // 대학 리그(uni)와 사회인 리그(soc) 데이터 가져오기
        for (const statType of statTypes) {
          dataByStatType[statType] = [];

          try {
            // 대학 리그 데이터
            const uniResult = await getKafaStats('uni', statType);
            console.log(`📊 KAFA uni ${statType} 응답:`, uniResult);

            if (uniResult?.success && uniResult.data?.players && Array.isArray(uniResult.data.players)) {
              console.log(`✅ uni ${statType}: ${uniResult.data.players.length}명 추가`);
              dataByStatType[statType].push(...uniResult.data.players);
            } else if (uniResult?.success && Array.isArray(uniResult.data)) {
              console.log(`✅ uni ${statType}: ${uniResult.data.length}명 추가`);
              dataByStatType[statType].push(...uniResult.data);
            }
          } catch (err) {
            console.warn(`❌ KAFA uni ${statType} 실패:`, err.message);
          }

          try {
            // 사회인 리그 데이터
            const socResult = await getKafaStats('soc', statType);
            console.log(`📊 KAFA soc ${statType} 응답:`, socResult);

            if (socResult?.success && socResult.data?.players && Array.isArray(socResult.data.players)) {
              console.log(`✅ soc ${statType}: ${socResult.data.players.length}명 추가`);
              dataByStatType[statType].push(...socResult.data.players);
            } else if (socResult?.success && Array.isArray(socResult.data)) {
              console.log(`✅ soc ${statType}: ${socResult.data.length}명 추가`);
              dataByStatType[statType].push(...socResult.data);
            }
          } catch (err) {
            console.warn(`❌ KAFA soc ${statType} 실패:`, err.message);
          }
        }

        console.log('📋 dataByStatType:', dataByStatType);

        // 각 리그별로 데이터 변환
        const transformedByLeague = {
          '서울': transformKafaToStatPlayer(dataByStatType, '서울'),
          '경기강원': transformKafaToStatPlayer(dataByStatType, '경기강원'),
          '대구경북': transformKafaToStatPlayer(dataByStatType, '대구경북'),
          '부산경남': transformKafaToStatPlayer(dataByStatType, '부산경남'),
          '사회인': transformKafaToStatPlayer(dataByStatType, '사회인'),
        };

        console.log('🔄 변환된 데이터:', transformedByLeague);
        setTransformedData(transformedByLeague);

      } catch (err) {
        console.error('❌ KAFA 데이터 로딩 실패:', err);
        setError(err.message);
        toast.error(err.message || 'KAFA 통계 데이터 로딩 실패');
      } finally {
        setLoading(false);
      }
    };

    fetchAndTransformKafaData();
  }, []);

  if (loading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        fontSize: '18px',
        color: '#666'
      }}>
        🔄 KAFA 통계 데이터를 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '18px', color: '#d63031', marginBottom: '16px' }}>
          ⚠️ 데이터를 불러오지 못했습니다
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
          {error}
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Admin 페이지에서 KAFA 크롤링을 먼저 실행해주세요.
        </div>
      </div>
    );
  }

  return (
    <div>
      <StatPosition data={transformedData} teams={TEAMS} />
    </div>
  );
};

export default GuestLeaguePositionPage;