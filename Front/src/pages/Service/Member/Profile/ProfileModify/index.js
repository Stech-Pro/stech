import React, { useState, useEffect } from 'react';
import '../Profile/ProfileMain.css';
import './ProfileModify.css';
import {
  myProfile,
  updateProfile,
  uploadAvatar,
  withdrawUser,
} from '../../../../../api/authAPI'; // uploadAvatar 임포트
import { TEAM_BY_ID, TEAM_BY_NAME, TEAMS } from '../../../../../data/TEAMS';
import Select, { components as RSComponents } from 'react-select';
import CountryFlag from 'react-country-flag';
import countries from 'i18n-iso-countries';
import koLocale from 'i18n-iso-countries/langs/ko.json';
import toast from 'react-hot-toast';

import Eye from '../../../../../assets/images/png/AuthPng/Eye.png';
import EyeActive from '../../../../../assets/images/png/AuthPng/EyeActive.png';

countries.registerLocale(koLocale);
const toAlpha2 = (alpha3) => {
  try {
    return countries.alpha3ToAlpha2(alpha3) || '';
  } catch {
    return '';
  }
};
// ISO2 -> ISO3 헬퍼 (저장용)
const toAlpha3 = (alpha2) => {
  try {
    return countries.alpha2ToAlpha3(alpha2) || '';
  } catch {
    return '';
  }
};

// 한국어 국가 옵션 목록 생성 (value = ISO3)
const buildCountryOptions = () => {
  const namesKo = countries.getNames('ko', { select: 'official' });
  return Object.entries(namesKo)
    .map(([alpha2, label]) => ({
      value: toAlpha3(alpha2), // 저장: ISO3
      label, // 표시: 한국어 국가명
      alpha2, // 플래그용
    }))
    .filter((o) => !!o.value)
    .sort((a, b) => a.label.localeCompare(b.label, 'ko'));
};
const COUNTRY_OPTIONS = buildCountryOptions();

const POSITION_OPTIONS = [
  { value: 'QB', label: 'QB' },
  { value: 'RB', label: 'RB' },
  { value: 'WR', label: 'WR' },
  { value: 'TE', label: 'TE' },
  { value: 'OL', label: 'OL' },
  { value: 'DL', label: 'DL' },
  { value: 'LB', label: 'LB' },
  { value: 'DB', label: 'DB' },
  { value: 'K', label: 'K' },
  { value: 'P', label: 'P' },
];

// 1. react-select 기본 화살표를 숨기는 컴포넌트 (CSS background-image를 사용하기 위함)
const NullIndicator = () => null;

// 2. 국적 필드 렌더(옵션/싱글밸류): 국기 + 한글명
const Option = (props) => {
  const { alpha2, label } = props.data;
  return (
    <RSComponents.Option {...props}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <CountryFlag
          svg
          countryCode={alpha2}
          style={{ width: 16, height: 12 }}
        />
        <span>{label}</span>
      </span>
    </RSComponents.Option>
  );
};
const SingleValue = (props) => {
  const { alpha2, label } = props.data;
  return (
    <RSComponents.SingleValue {...props}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <CountryFlag
          svg
          countryCode={alpha2}
          style={{ width: 16, height: 12 }}
        />
        <span>{label}</span>
      </span>
    </RSComponents.SingleValue>
  );
};

// 3. 포지션 필드 렌더(옵션/싱글밸류): 단순 텍스트 (국기 없음)
const PositionOption = (props) => (
  <RSComponents.Option {...props}>
    <span>{props.data.label}</span>
  </RSComponents.Option>
);
const PositionSingleValue = (props) => (
  <RSComponents.SingleValue {...props}>
    <span>{props.data.label}</span>
  </RSComponents.SingleValue>
);

// 4. react-select 스타일 오버라이드 객체 (회원가입/프로필 페이지와 동일)
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'transparent',
    border: '1px solid white',
    borderRadius: '10px',
    padding: '0',
    color: '#ffffff',
    fontSize: '16px',
    minHeight: '40px',
    boxShadow: 'none',
    cursor: 'pointer',
    '&:hover': {
      borderColor: 'white',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#ffffff',
    margin: '0',
    padding: '0 0 0 10px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#444444',
    borderRadius: '10px',
    zIndex: 2,
    border: '1px solid white',
    marginTop: '5px',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#f77705'
      : state.isFocused
      ? '#616161'
      : 'transparent',
    color: '#ffffff',
    '&:active': {
      backgroundColor: '#f77705',
    },
    cursor: 'pointer',
    padding: '10px',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  placeholder: (provided) => ({
    ...provided,
    color: '#b8b8b8',
    padding: '0 0 0 10px',
  }),
  input: (provided) => ({
    ...provided,
    color: '#ffffff',
    padding: '0',
    margin: '0',
  }),
};
// ------------------------------------------------------------------

// ⚙️ teamName(약어/ID/텍스트)을 한글 팀명/로고/리그명으로 변환
function resolveTeamDisplay(teamName) {
  if (!teamName)
    return { id: null, name: 'N/A', logo: null, region: null, division: null };
  const byId = TEAM_BY_ID[teamName];
  if (byId) return byId;
  const byName = TEAM_BY_NAME[teamName];
  if (byName) return byName;
  const key = String(teamName).toLowerCase().replace(/\s+/g, '');
  const loose = TEAMS.find(
    (t) =>
      t.id?.toLowerCase().replace(/\s+/g, '') === key ||
      t.name?.toLowerCase().replace(/\s+/g, '') === key,
  );
  if (loose) return loose;
  return { id: null, name: teamName, logo: null, region: null, division: null };
}

// 🔹 region + division을 조합해 "서울 / 1부" 형식으로 변환 (ProfilePage와 동일 로직)
const REGION_KR = {
  Seoul: '서울',
  'Gyeonggi-Gangwon': '경기강원',
  'Daegu-Gyeongbuk': '대구경북',
  'Busan-Gyeongnam': '부산경남',
  Amateur: '사회인',
  Admin: '관리자',
};
function getRegionDisplay(team) {
  if (!team || !team.region) return 'N/A';
  const regionKR = REGION_KR[team.region] ?? team.region;
  return team.division ? `${regionKR} / ${team.division}` : regionKR;
}

// ------------------------------------------------------------------
// 📮 Daum Postcode API URL
// ------------------------------------------------------------------
const DAUM_POSTCODE_URL =
  'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
// ------------------------------------------------------------------

export default function ProfileModify() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false); // Daum Script 로드 상태
  const [showWithdrawModal, setShowWithdrawModal] = useState(false); // 회원탈퇴 모달

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Address: address 필드를 address1과 address2로 분리
  const splitAddress = (fullAddress) => {
    if (!fullAddress) return { address1: '', address2: '' };
    // 주소는 API에서 통째로 가져오고, 수정 화면에서는 주소1에 전체 주소를 표시하고 주소2는 비워둡니다.
    return { address1: fullAddress, address2: '' };
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const res = await myProfile(token);
        const payload = res.data;

        // address 필드를 UI에 맞게 분리
        const { address1, address2 } = splitAddress(payload.address);

        setProfileData({
          ...payload,
          // position이 배열로 올 경우를 대비하여 첫 번째 요소를 사용하거나 문자열 그대로 사용
          position: Array.isArray(payload.position)
            ? payload.position[0]
            : payload.position,
          height: String(payload.height || ''),
          weight: String(payload.weight || ''),
          age: String(payload.age || ''),
          career: String(payload.career || ''),
          address1: payload.address || '', // 주소 1에 전체 주소 표시
          address2: '', // 상세 주소는 비워둠
        });
      } catch (e) {
        console.error('프로필 불러오기 오류:', e);
        setProfileData(null);
        alert('프로필 정보를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // ------------------------------------------------------------------
  // 📮 Daum Postcode 스크립트 로딩 로직
  // ------------------------------------------------------------------
  useEffect(() => {
    if (window.daum?.Postcode) {
      setScriptLoaded(true);
      return;
    }
    let s = document.querySelector('script[data-daum-postcode]');
    if (!s) {
      s = document.createElement('script');
      s.src = DAUM_POSTCODE_URL;
      s.async = true;
      s.defer = true;
      s.dataset.daumPostcode = 'true';
      document.head.appendChild(s);
    }
    const onLoad = () => setScriptLoaded(true);
    const onError = () => setScriptLoaded(false);
    s.addEventListener('load', onLoad);
    s.addEventListener('error', onError);
    return () => {
      s.removeEventListener('load', onLoad);
      s.removeEventListener('error', onError);
    };
  }, []);

  // ------------------------------------------------------------------
  // 🔍 주소 검색 핸들러
  // ------------------------------------------------------------------
  const handleAddressSearch = () => {
    if (!scriptLoaded) {
      alert(
        '주소 검색 스크립트가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.',
      );
      return;
    }
    // window.daum.Postcode는 스크립트 로드 후 전역적으로 사용 가능하다고 가정합니다.
    new window.daum.Postcode({
      oncomplete: function (data) {
        let fullAddress = data.roadAddress;
        let extraAddress = '';
        if (data.bname !== '' && /[동|로|가]$/g.test(data.bname))
          extraAddress += data.bname;
        if (data.buildingName !== '' && data.apartment === 'Y') {
          extraAddress +=
            extraAddress !== '' ? ', ' + data.buildingName : data.buildingName;
        }
        if (extraAddress !== '') fullAddress += ' (' + extraAddress + ')';
        setProfileData((prev) => ({
          ...prev,
          address1: fullAddress,
          address2: '', // 상세 주소는 초기화
        }));
      },
    }).open();
  };
  // ------------------------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    // **숫자 필드에 대한 입력 유효성 검사**
    if (['height', 'weight', 'age', 'career'].includes(name)) {
      // 숫자가 아니거나 소수점(.)이 두 개 이상인 경우 입력을 무시
      if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
        return;
      }
    }

    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // react-select용 핸들러
  const handleSelectChange = (name, opt) => {
    setProfileData((prev) => ({
      ...prev,
      [name]: opt ? opt.value : '',
    }));
  };

  // ------------------------------------------------------------------
  // 📸 이미지 업로드 핸들러 (API 연동)
  // ------------------------------------------------------------------
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 프로필 이미지 미리보기 (즉시 반영)
    const reader = new FileReader();
    reader.onloadend = () => {
      // 임시 URL로 미리보기만 업데이트 (업로드 중임을 표시)
      setProfileData((prev) => ({ ...prev, profileImage: reader.result }));
    };
    reader.readAsDataURL(file);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('인증 토큰이 없습니다.');

      // 💡 API를 호출하여 파일을 업로드하고 URL을 받아옴
      const response = await uploadAvatar(file, token);

      // API 응답으로 받은 실제 URL로 상태 업데이트
      const avatarUrl = response.data?.avatarUrl;
      setProfileData((prev) => ({ ...prev, profileImage: avatarUrl }));
      alert('프로필 이미지가 성공적으로 업로드되었습니다.');
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert(
        '이미지 업로드에 실패했습니다: ' + (error.message || '알 수 없는 오류'),
      );

      // 업로드 실패 시 이미지를 초기 상태로 되돌림 (여기서는 null로 가정)
      setProfileData((prev) => ({ ...prev, profileImage: null }));
    }
  };

  const handleImageDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('인증 토큰이 없습니다.');

      // 서버에 프로필 이미지 삭제 요청
      await updateProfile({ avatar: null }, token);
      setProfileData((prev) => ({ ...prev, profileImage: null }));
      alert('프로필 이미지가 삭제되었습니다.');
    } catch (error) {
      console.error('이미지 삭제 오류:', error);
      alert(
        '이미지 삭제에 실패했습니다: ' + (error.message || '알 수 없는 오류'),
      );
    }
  };
  // ------------------------------------------------------------------

  const handleWithdrawClick = () => {
    setShowWithdrawModal(true);
  };

  const handleWithdrawConfirm = async () => {
    setShowWithdrawModal(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('인증 토큰이 없습니다.');

      await withdrawUser(token);
      toast.success('회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.');

      // 로컬 스토리지 정리
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // /service로 이동
      window.location.href = '/service';
    } catch (error) {
      console.error('회원 탈퇴 오류:', error);
      toast.error(
        '회원 탈퇴에 실패했습니다: ' + (error.message || '알 수 없는 오류'),
      );
    }
  };

  const handleWithdrawCancel = () => {
    setShowWithdrawModal(false);
  };

  const handleSave = async () => {
    if (!profileData) return;

    // 1. 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileData.email || !emailRegex.test(profileData.email)) {
      alert('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    const numericFields = ['height', 'weight', 'age', 'career'];
    for (const f of numericFields) {
      if (profileData[f] === '' || Number.isNaN(Number(profileData[f]))) {
        alert(
          '키, 몸무게, 나이, 경력은 숫자만 입력 가능하며, 빈 칸일 수 없습니다.',
        );
        return;
      }
    }

    // 2. 전송 데이터 구성
    const payload = {
      realName: profileData.realName,
      playerID: profileData.playerID,
      email: profileData.email,
      phone: profileData.phone,
      nationality: profileData.nationality,
      address:
        `${profileData.address1.trim()} ${profileData.address2.trim()}`.trim(),
      height: parseInt(profileData.height),
      weight: parseInt(profileData.weight),
      age: parseInt(profileData.age),
      career: profileData.career, // API 요구사항에 따라 문자열로 전송
      position: profileData.position,
      // profileImage URL은 updateProfile API 명세에 포함되지 않으므로 제외
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('인증 토큰이 없습니다.');

      await updateProfile(payload, token);
      alert('변경사항이 성공적으로 저장되었습니다!');
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      alert(
        '프로필 업데이트에 실패했습니다: ' +
          (error.message || '알 수 없는 오류'),
      );
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = () => {
    const { currentPassword, newPassword, confirmNewPassword } = passwords;

    // ⚠️ 비밀번호 변경은 별도의 API를 호출해야 하지만, 여기서는 프론트엔드 유효성 검사만 수행합니다.
    if (!currentPassword) {
      alert('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert('새로운 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 8) {
      alert('새로운 비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    // ⚠️ TODO: 여기에 비밀번호 변경 API 호출 로직 추가

    console.log('Password change successful!');
    alert('비밀번호가 성공적으로 변경되었습니다!');
  };

  if (isLoading)
    return (
      <div className="loading-message">프로필 정보를 불러오는 중입니다...</div>
    );
  if (!profileData)
    return <div className="error-message">프로필 정보를 찾을 수 없습니다.</div>;

  const selectedTeam = resolveTeamDisplay(profileData.teamName);
  const regionDisplay = getRegionDisplay(selectedTeam);

  const selectedNationalityOption = COUNTRY_OPTIONS.find(
    (opt) => opt.value === profileData.nationality,
  );

  const selectedPositionOption = POSITION_OPTIONS.find(
    (opt) => opt.value === profileData.position,
  );

  return (
    <div className="profile-main">
      <div className="profile-container">
        <div className="profile-title-container">
          <h1 className="profile-title">내 프로필 수정</h1>
        </div>

        <div className="profile-content">
          <div className="profile-image-modify">
            <div className="profile-image-section">
              {profileData.profileImage ? (
                <img
                  src={profileData.profileImage}
                  alt="Profile"
                  className="profile-image"
                />
              ) : (
                <div className="profile-placeholder-text" />
              )}
            </div>
            <div className="profile-image-buttons">
              <label htmlFor="file-upload" className="profile-image-button">
                사진 업로드
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={handleImageDelete}
                className="profile-image-button delete"
              >
                삭제
              </button>
            </div>
          </div>

          <div className="profile-info-section">
            <div className="profile-info-grid">
              {/* R1: 이름, 이메일 */}
              <div className="profile-form-group">
                <label>이름</label>
                <input
                  id="realName"
                  name="realName"
                  type="text"
                  value={profileData.realName}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="실명"
                />
              </div>
              <div className="profile-form-group">
                <label>이메일</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="example@email.com"
                />
              </div>

              {/* R2: 전화, 국적 */}
              <div className="profile-form-group">
                <label>전화</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="010-xxxx-xxxx"
                />
              </div>
              <div className="profile-form-group">
                <label>국적</label>
                <Select
                  inputId="nationality"
                  classNamePrefix="nationality-mod"
                  placeholder="국가 선택"
                  options={COUNTRY_OPTIONS}
                  components={{
                    Option,
                    SingleValue,
                    DropdownIndicator: NullIndicator,
                  }}
                  styles={selectStyles}
                  value={selectedNationalityOption}
                  onChange={(opt) => handleSelectChange('nationality', opt)}
                />
              </div>

              {/* R3: 별명(ID) (Full Width) */}
              <div className="profile-form-group full-width">
                <label>별명(ID)</label>
                <input
                  id="playerID"
                  name="playerID"
                  type="text"
                  value={profileData.playerID}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="선수 별명/ID"
                />
              </div>

              {/* R4: 주소 (Full Width) - 주소 찾기 버튼 제거 및 클릭 이벤트 추가 */}
              <div className="profile-form-group full-width">
                <label>주소</label>
                {/* 주소 입력 필드만 남기고 클릭 시 검색 실행 */}
                <input
                  id="address1"
                  name="address1"
                  type="text"
                  value={profileData.address1}
                  onChange={handleChange}
                  onClick={handleAddressSearch} // 클릭 시 검색 함수 호출
                  className="profile-input"
                  placeholder="주소 검색 (클릭)"
                  readOnly // 주소 검색을 통해서만 입력되도록 읽기 전용 설정
                  style={{ cursor: 'pointer' }} // 클릭 가능함을 시각적으로 표시
                />

                {/* 상세 주소 입력 필드 (readOnly 해제) */}
                <input
                  id="address2"
                  name="address2"
                  type="text"
                  value={profileData.address2}
                  onChange={handleChange}
                  className="profile-input mt-2"
                  placeholder="상세 주소"
                />
              </div>
            </div>

            <div className="profile-info-four-column">
              <div className="profile-form-group">
                <label>키(cm)</label>
                <input
                  id="height"
                  name="height"
                  type="text"
                  value={profileData.height}
                  onChange={handleChange}
                  className="profile-input"
                  pattern="[0-9]*"
                />
              </div>
              <div className="profile-form-group">
                <label>몸무게(kg)</label>
                <input
                  id="weight"
                  name="weight"
                  type="text"
                  value={profileData.weight}
                  onChange={handleChange}
                  className="profile-input"
                  pattern="[0-9]*"
                />
              </div>
              <div className="profile-form-group">
                <label>나이</label>
                <input
                  id="age"
                  name="age"
                  type="text"
                  value={profileData.age}
                  onChange={handleChange}
                  className="profile-input"
                  pattern="[0-9]*"
                />
              </div>
              <div className="profile-form-group">
                <label>경력(년)</label>
                <input
                  id="career"
                  name="career"
                  type="text"
                  value={profileData.career}
                  onChange={handleChange}
                  className="profile-input"
                  pattern="[0-9]*"
                />
              </div>
            </div>

            {/* 포지션, 지역 / 리그, 팀 */}
            <div className="profile-info-three-column">
              <div className="profile-form-group">
                <label>포지션</label>
                <Select
                  inputId="position"
                  name="position"
                  classNamePrefix="position-select-mod"
                  placeholder="포지션 선택"
                  options={POSITION_OPTIONS}
                  components={{
                    Option: PositionOption,
                    SingleValue: PositionSingleValue,
                    DropdownIndicator: NullIndicator,
                  }}
                  isSearchable={false}
                  styles={selectStyles}
                  value={selectedPositionOption}
                  onChange={(opt) => handleSelectChange('position', opt)}
                />
              </div>

              <div className="profile-form-group">
                <label>지역 / 리그</label>
                {/* 지역/리그는 수정 항목이 아닙니다. */}
                <p className="profile-input static-info">{regionDisplay}</p>
              </div>

              <div className="profile-form-group">
                <label>팀</label>
                {/* 팀 정보도 수정 항목이 아닙니다. */}
                <div className="profile-team-display profile-input static-info">
                  {selectedTeam.logo && (
                    <img
                      src={selectedTeam.logo}
                      alt={selectedTeam.name}
                      className="profile-team-icon"
                    />
                  )}
                  <p>{selectedTeam.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-save-container">
          <button onClick={handleSave} className="profile-save-button">
            변경사항 저장
          </button>
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className="profile-container">
        <div className="profile-title-container">
          <h1 className="profile-title">비밀번호 변경</h1>
        </div>

        <div className="password-change-section">
          <div className="profile-form-group">
            <label>현재 비밀번호</label>
            <div className="input-with-icon">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                className="profile-input-password"
              />
              <button
                type="button"
                className="profilepasswordToggleButton"
                tabIndex={-1}
                aria-hidden="true"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowCurrentPassword((s) => !s)}
              >
                <img src={showCurrentPassword ? EyeActive : Eye} alt="" />
              </button>
            </div>
          </div>

          <div className="profile-form-group">
            <label>새로운 비밀번호</label>
            <div className="input-with-icon">
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="profile-input-password"
                placeholder="최소 8자"
              />
              <button
                type="button"
                className="profilepasswordToggleButton"
                onClick={() => setShowPassword((s) => !s)}
              >
                <img
                  src={showPassword ? EyeActive : Eye}
                  alt="toggle password"
                />
              </button>
            </div>
          </div>

          <div className="profile-form-group">
            <label>새로운 비밀번호 확인</label>
            <div className="input-with-icon">
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type={showPasswordConfirm ? 'text' : 'password'}
                value={passwords.confirmNewPassword}
                onChange={handlePasswordChange}
                className="profile-input-password"
              />
              <button
                type="button"
                className="profilepasswordToggleButton"
                onClick={() => setShowPasswordConfirm((s) => !s)}
              >
                <img
                  src={showPasswordConfirm ? EyeActive : Eye}
                  alt="toggle password"
                />
              </button>
            </div>
          </div>
          <div className="profile-save-container">
            <button
              onClick={handlePasswordSave}
              className="profile-save-button"
            >
              비밀번호 변경
            </button>
          </div>
        </div>
      </div>
      <div className="profile-container">
        <div className="profile-title-container">
          <h1 className="profile-title">회원 탈퇴</h1>
        </div>

        <div className="profile-save-container">
          <button
            type="button"
            className="withdraw-button"
            onClick={handleWithdrawClick}
          >
            회원 탈퇴
          </button>
        </div>
      </div>

      {/* 회원 탈퇴 확인 모달 */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={handleWithdrawCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">회원 탈퇴</h2>
            <p className="modal-message">
              정말로 회원 탈퇴를 진행하시겠습니까?
              <br />
              모든 개인 정보와 데이터가 삭제되며, 복구할 수 없습니다.
            </p>
            <div className="modal-buttons">
              <button
                className="modal-button cancel"
                onClick={handleWithdrawCancel}
              >
                취소
              </button>
              <button
                className="modal-button confirm"
                onClick={handleWithdrawConfirm}
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
