import React from 'react';
import './index.css';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import img from './images/headimg.png';
import MainHeader from './MainHeader';
import Footer from './Footer';
import Component from './images/Component.png';
import Detail from './images/detail.png';
import Screen from './images/screen.png';
import MobileScreen from './images/mobilescreen.png';
import Gameimage from './images/Gameimage.png';
import BF from './images/BF.png';
import BG from './images/BG.png';
import BK from './images/BK.png';
import BS from './images/BS.png';
import BT from './images/BT.png';
import CA from './images/CA.png';
import DA from './images/DA.png';
import DC from './images/DC.png';
import DD from './images/DD.png';
import DF from './images/DF.png';
import DH from './images/DH.png';
import DK from './images/DK.png';
import DS from './images/DS.png';
import DT from './images/DT.png';
import DU from './images/DU.png';
import DW from './images/DW.png';
import GE from './images/GE.png';
import GP from './images/GP.png';
import GS from './images/GS.png';
import HD from './images/HD.png';
import HF from './images/HF.png';
import HH from './images/HH.png';
import HI from './images/HI.png';
import HL from './images/HL.png';
import HY from './images/HY.png';
import KA from './images/KA.png';
import IH from './images/IH.png';
import KH from './images/KH.png';
import HS from './images/HS.png';
import KI from './images/KI.png';
import KK from './images/KK.png';
import KM from './images/KM.png';
import RH from './images/RH.png';
import KO from './images/KO.png';
import KP from './images/KP.png';
import KU from './images/KU.png';
import KS from './images/KS.png';
import KW from './images/KW.png';
import SG from './images/SG.png';
import SK from './images/SK.png';
import SL from './images/SL.png';
import SN from './images/SN.png';
import UD from './images/UD.png';
import SS from './images/SS.png';
import US from './images/US.png';
import VI from './images/VI.png';
import YI from './images/YI.png';
import YN from './images/YN.png';
import YS from './images/YS.png';

const LandingPage = () => {
  usePageTitle('Stech');
  return (
    <div className="landing-page-container" style={{ width: '100%' }}>
      {/* Section 1: Hero */}
      <section className="section hero-section">
        <MainHeader style={{ zIndex: '2' }} />
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="h1-header">데이터와 경기가</div>
              <div className="h1-header2">하나가 되는 순간</div>
            </div>
            <p>
              코치와 분석가들은 더 이상 수작업에 의존하지 않아도 됩니다.
              <br />
              Stech은 경기 영상을 업로드하는 것만으로 선수의 움직임과 전술
              흐름을 인식하고,
              <br />
              효율적이고 정확한 분석 결과를 제공합니다. 데이터 기반의 의사결정을
              가능하게 <br />
              하는 Stech. 스포츠 현장에서 전략과 퍼포먼스의 차이를 만드세요.
              <br />
            </p>
            <div className="link">
              <button className="toServiceButton">
                {/* Link 컴포넌트에 직접 스타일 적용 */}
                <Link
                  to="/service"
                  className="serviceButton"
                  style={{ color: '#ffffff', textDecoration: 'none' }}
                >
                  STECH PRO 서비스 이용하기
                </Link>
              </button>
            </div>
          </div>
          <div className="hero-wrap">
            <div
              className="hero-bg"
              style={{ backgroundImage: `url(${img})` }}
            ></div>
            <img src={img} alt="Hero-Image" />
          </div>
        </div>
        <div className="slider-container">
          <div className="slider-track">
            <img src={YS} alt="연세대 이글스" width="80px" />
            <img src={SN} alt="서울대 그린테러스" width="80px" />
            <img src={HY} alt="한양대 라이온스" width="80px" />
            <img src={KM} alt="국민대 레이저백스" width="80px" />
            <img src={US} alt="서울시립대 시티혹스" width="80px" />
            <img src={HF} alt="한국외대 블랙나이츠" width="80px" />
            <img src={KK} alt="건국대 레이징불스" width="80px" />
            <img src={HI} alt="홍익대 카우보이스" width="80px" />
            <img src={KU} alt="고려대 타이거스" width="80px" />
            <img src={DT} alt="동국대 터스커스" width="80px" />
            <img src={SS} alt="숭실대 크루세이더스" width="80px" />
            <img src={CA} alt="중앙대 블루드래곤스" width="80px" />
            <img src={KH} alt="경희대 커맨더스" width="80px" />
            <img src={SG} alt="서강대 알바트로스" width="80px" />
            <img src={SK} alt="성균관대 로얄스" width="80px" />
            <img src={KW} alt="강원대 카프라스" width="80px" />
            <img src={DK} alt="단국대 코디악베어스" width="80px" />
            <img src={YI} alt="용인대 화이트타이거스" width="80px" />
            <img src={IH} alt="인하대 틸 드래곤스" width="80px" />
            <img src={HL} alt="한림대 피닉스" width="80px" />
            <img src={HS} alt="한신대 킬러웨일스" width="80px" />
            <img src={KA} alt="카이스트 매버릭스" width="80px" />
            <img src={KP} alt="경북대 오렌지파이터스" width="80px" />
            <img src={KI} alt="경일대 블랙베어스" width="80px" />
            <img src={KS} alt="계명대 슈퍼라이온스" width="80px" />
            <img src={KO} alt="금오공대 레이븐스" width="80px" />
            <img src={DC} alt="대구가톨릭대 스커드엔젤스" width="80px" />
            <img src={DD} alt="대구대 플라잉타이거스" width="80px" />
            <img src={DH} alt="대구한의대 라이노스" width="80px" />
            <img src={DW} alt="동국대 화이트엘리펀츠" width="80px" />
            <img src={YN} alt="영남대 페가수스" width="80px" />
            <img src={HD} alt="한동대 홀리램스" width="80px" />
            <img src={GS} alt="경성대 드래곤스" width="80px" />
            <img src={BS} alt="부산대 이글스" width="80px" />
            <img src={HH} alt="한국해양대 바이킹스" width="80px" />
            <img src={SL} alt="신라대 데빌스" width="80px" />
            <img src={BK} alt="부경대 매드모비딕스" width="80px" />
            <img src={DU} alt="동의대 터틀파이터스" width="80px" />
            <img src={DA} alt="동아대 레오파즈" width="80px" />
            <img src={DS} alt="동서대 블루돌핀스" width="80px" />
            <img src={BF} alt="부산외대 토네이도" width="80px" />
            <img src={UD} alt="울산대 유니콘스" width="80px" />
            <img src={GP} alt="군위 피닉스" width="80px" />
            <img src={BG} alt="부산 그리폰즈" width="80px" />
            <img src={BT} alt="삼성 블루스톰" width="80px" />
            <img src={GE} alt="서울 골든이글스" width="80px" />
            <img src={DF} alt="서울 디펜더스" width="80px" />
            <img src={VI} alt="서울 바이킹스" width="80px" />
            <img src={RH} alt="인천 라이노스" width="80px" />
          </div>
        </div>
      </section>

      {/* Section 2: Analyze Game Footage */}
      <section className="section analyze-section">
        <div style={{ margin: '80px auto 40px auto', textAlign: 'center' }}>
          <span className="gradient-text-default">
            AI 기반의 정밀한 분석으로
          </span>
          <br />
          <span className="gradient-text-default">경기 영상을</span>
          <span className="gradient-text-precision">&nbsp;파헤치다</span>{' '}
          {/* Precision만 다른 그라데이션 */}
        </div>
        <div className="gradient-text">
          Stech과 함께라면 모든 경기가 데이터가 되고, <br />
          모든 플레이가 성장의 기회가 됩니다.
        </div>
        <div className="dashboard-image">
          <img src={Component} alt="Component" style={{ margin: '0 auto' }} />
        </div>
      </section>

      {/* Section 3: Delivering Value */}
      <section className="section value-section">
        <span className="gradient-text-default">
          분석의 모든 단계에서
          <br /> 가치를 전달하다
        </span>
        <div className="value-content-container">
          <div className="value-image">
            <img
              src={Detail}
              alt="Component"
              style={{ margin: '0 auto', width: '700px' }}
            />
          </div>
          <div className="value-content">
            <h2>분석의 과정</h2>
            <p>
              특수 카메라도, 복잡한 설치도 필요 없습니다. 스마트폰, 캠코더, 중계
              영상 등 어떤 사이드라인 영상이든 Stech에 업로드하세요. SAMURAI
              2.0으로 구동되는 Stech의 AI가 자동으로 영상을 분석해 선수 한 명 한
              명을 추적하고, 움직임을 기록하며, 스냅부터 휘슬까지 핵심 플레이를
              식별합니다. 수 시간 걸리던 필름 분석을 단 몇 분으로 줄이고, 이제
              코칭에 더 많은 시간을 집중하세요.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Key Features */}
      <section className="section key-features-section">
        <span className="gradient-text-default">핵심 기능</span>
        <div className="key-features-description">
          지역 라이벌전이든, 플레이오프 진출이든 ― Stech은 첫 스냅 전에 이미
          <br />
          당신이 이기고, 대응하고, 이끌 수 있도록 전략적 인사이트를 제공합니다.
        </div>
        <div className="features-content">
          <div className="features-main-image">
            <img src={Screen} alt="Component" style={{ margin: '0 auto' }} />
          </div>
          <div className="features-list">
            <div className="feature-item">자동 태깅 및 북마크 기능</div>
            <div className="feature-item">
              주요 이벤트의 즉각 타임스탬프 생성
            </div>
            <div className="feature-item">선수 개별 데이터 관리</div>
          </div>
        </div>
        <div className="features-mobile-image">
          <img
            src={MobileScreen}
            alt="Component"
            style={{ margin: '0 auto' }}
          />
        </div>
      </section>

      {/* Section 5: AI-Powered Reports */}
      <section className="section ai-reports-section">
        <span className="gradient-text-default">
          경기 전 전략 준비를 위한
          <br />
          AI 기반 게임 리포트
        </span>
        <div className="ai-reports-description">
          첫 휘슬이 울리기 전,
          <br />
          당신의 팀에 전략적 우위를 제공하는 리포트
        </div>
        <div className="report-content">
          <div
            className="feature-item"
            style={{ width: '440px', height: '120px' }}
          >
            선수 및 포지션 유닛을 위한
            <br />
            실행 가능한 인사이트 제공
          </div>
          <div className="report-main-image">
            <img
              src={Gameimage}
              alt="Component"
              style={{ margin: '0 auto', width: '500px' }}
            />
          </div>
          <div className="report-features">
            <div
              className="feature-item"
              style={{ width: '440px', height: '120px' }}
            >
              분석된 영상을 기반으로 한<br />
              종합 리포트 제공
            </div>
            <div
              className="feature-item"
              style={{ width: '440px', height: '120px' }}
            >
              상대팀 프로파일링 및<br />
              상황별 전략 인텔리전스 제공
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
