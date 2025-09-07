import './DeviceWarning.css';
import DeviceWarningImage from '../../assets/images/png/deviceWarning/deviceWarning.png'; // 이미지 경로 조정 필요

const DeviceWarning = () => {
  return (
    <div className="device-warning-overlay">
      <div className="device-warning-content">
        <img
          src={DeviceWarningImage}
          alt="Device Warning"
          className="device-warning-image"
        />
        <div className="device-warning-text">
          <h1>Stech 서비스는 PC에서만 실행 가능합니다.</h1>
          <p>페이지 너비를 다시 넓혀주세요!</p>
          <p>모바일과 태블릿 버전은 개발 중에 있습니다.</p>
          <p>불편을 드려 정말 죄송합니다.</p>
        </div>
        <div className="device-warning-buttons">
          <button onClick={() => window.history.back()} className="back-button">
            ← 이전 페이지
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="home-button"
          >
            ⌂ 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceWarning;
