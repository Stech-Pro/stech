// src/components/Auth/SignupProfileForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProfile, createProfileWithAvatar } from '../../api/authAPI';
import { useAuth } from '../../context/AuthContext';
// RSComponents (React Select Components)를 명시적으로 가져옵니다.
import Select, { components as RSComponents } from 'react-select'; 
import CountryFlag from 'react-country-flag';
import countries from 'i18n-iso-countries';
import koLocale from 'i18n-iso-countries/langs/ko.json';

countries.registerLocale(koLocale);

// ISO2<->ISO3 헬퍼
const toAlpha3 = (alpha2) => {
  try {
    return countries.alpha2ToAlpha3(alpha2) || '';
  } catch {
    return '';
  }
};
const toAlpha2 = (alpha3) => {
  try {
    return countries.alpha3ToAlpha2(alpha3) || '';
  } catch {
    return '';
  }
};

// 한국어 국가 옵션 목록 생성 (value = ISO3)
const buildCountryOptions = () => {
  const namesKo = countries.getNames('ko', { select: 'official' }); // { KR: '대한민국', US: '미국', ... }
  return Object.entries(namesKo)
    .map(([alpha2, label]) => ({
      value: toAlpha3(alpha2), // 저장: ISO3 (KOR/USA/…)
      label, // 표시: 한국어 국가명
      alpha2, // 플래그용
    }))
    .filter((o) => !!o.value)
    .sort((a, b) => a.label.localeCompare(b.label, 'ko'));
};
const COUNTRY_OPTIONS = buildCountryOptions();

// 포지션 옵션 목록 생성 (value = label)
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

// ***********************************************
// react-select 공통 스타일 및 컴포넌트 정의
// ***********************************************

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
const PositionOption = (props) => {
  const { label } = props.data;
  return (
    <RSComponents.Option {...props}>
      <span>{label}</span>
    </RSComponents.Option>
  );
};
const PositionSingleValue = (props) => {
  const { label } = props.data;
  return (
    <RSComponents.SingleValue {...props}>
      <span>{label}</span>
    </RSComponents.SingleValue>
  );
};

// 4. react-select 스타일 오버라이드 객체 (모든 Select 컴포넌트에 공통 적용)
const selectStyles = {
  // Control (입력 필드) 스타일: 기존 input/select 스타일을 따름
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'transparent',
    border: state.isFocused ? '1px solid white' : '1px solid white', 
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
  // SingleValue (선택된 값) 스타일
  singleValue: (provided) => ({
    ...provided,
    color: '#ffffff',
    margin: '0',
    padding: '0 0 0 10px', // 왼쪽 패딩 추가
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  // Menu (드롭다운 목록) 스타일
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#444444', 
    borderRadius: '10px',
    zIndex: 2,
    border: '1px solid white',
    marginTop: '5px',
  }),
  // Option (드롭다운 항목) 스타일
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#f77705' // 선택된 항목
      : state.isFocused
      ? '#616161' // 호버/포커스된 항목
      : 'transparent',
    color: '#ffffff',
    '&:active': {
      backgroundColor: '#f77705',
    },
    cursor: 'pointer',
    padding: '10px',
  }),
  // IndicatorSeparator (구분선) 제거
  indicatorSeparator: () => ({
    display: 'none',
  }),
  // Placeholder 스타일
  placeholder: (provided) => ({
    ...provided,
    color: '#b8b8b8', 
    padding: '0 0 0 10px', 
  }),
  // Input (검색 입력 필드) 스타일
  input: (provided) => ({
    ...provided,
    color: '#ffffff',
    padding: '0',
    margin: '0',
  }),
};

// ***********************************************
// 컴포넌트 본문
// ***********************************************
const DAUM_POSTCODE_URL =
  'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

const SignupProfileForm = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [profileData, setProfileData] = useState({
    profileImage: null, // 파일은 서버 스펙상 직접 전송 불가(avatar는 URL만)
    realName: '',
    email: '',
    address1: '',
    address2: '',
    height: '',
    weight: '',
    age: '',
    grade: '',
    nationality: 'KOR',
    position: '', // 초기값 빈 문자열
    avatarUrl: '',
    phone: '',
    career: '',
    playerID: '',
  });

  const [emailStatus, setEmailStatus] = useState(null);
  const [emailMessage, setEmailMessage] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData((prev) => ({ ...prev, profileImage: file }));
    }
  };

  const handleAddressSearch = () => {
    if (!scriptLoaded) {
      alert(
        '주소 검색 스크립트가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.',
      );
      return;
    }
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
          address2: '',
        }));
      },
    }).open();
  };

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const checkEmailAvailability = async (email) => {
    if (!isEmailValid(email)) {
      setEmailStatus('unavailable');
      setEmailMessage('유효한 이메일 형식이 아닙니다.');
      return;
    }
    setEmailStatus('available');
    setEmailMessage('사용 가능한 형식입니다.');
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setProfileData((prev) => ({ ...prev, email }));
    if (!email) {
      setEmailStatus(null);
      setEmailMessage('');
      return;
    }
    checkEmailAvailability(email);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 항목 검증 강화
    if (!profileData.realName.trim()) return alert('성명을 입력해주세요.');
    if (!profileData.email.trim() || !isEmailValid(profileData.email)) {
      return alert('유효한 이메일을 입력해주세요.');
    }
    if (emailStatus && emailStatus !== 'available') {
      return alert(emailMessage || '이메일을 확인해주세요.');
    }

    // 추가 필수 항목 검증
    if (!profileData.address1.trim()) {
      return alert('주소를 입력해주세요.');
    }
    if (!profileData.height.trim()) {
      return alert('키를 입력해주세요.');
    }
    if (!profileData.weight.trim()) {
      return alert('몸무게를 입력해주세요.');
    }
    if (!profileData.grade.trim()) {
      return alert('경력을 입력해주세요.');
    }
    if (!profileData.nationality.trim()) {
      return alert('국적을 입력해주세요.');
    }
    if (!profileData.position.trim()) {
      return alert('포지션을 선택해주세요.');
    }

    // 숫자 형식 검증
    const height = parseFloat(profileData.height);
    const weight = parseFloat(profileData.weight);
    const age = parseFloat(profileData.age);

    if (isNaN(height) || height <= 0 || height > 300) {
      return alert('올바른 키를 입력해주세요. (단위: cm)');
    }
    if (isNaN(weight) || weight <= 0 || weight > 500) {
      return alert('올바른 몸무게를 입력해주세요. (단위: kg)');
    }
    if (profileData.age && (isNaN(age) || age <= 0 || age > 100)) {
      return alert('올바른 나이를 입력해주세요.');
    }

    // 토큰 확인
    if (!token) {
      alert('로그인이 필요합니다. 다시 로그인해주세요.');
      navigate('/auth');
      return;
    }

    try {
      let response;
      
      if (profileData.profileImage) {
        // 이미지가 있는 경우: FormData로 전송
        const formData = new FormData();
        formData.append('realName', profileData.realName.trim());
        formData.append('email', profileData.email.trim());
        formData.append('nationality', profileData.nationality.trim());
        formData.append('phone', profileData.phone.trim());
        formData.append('address', `${profileData.address1} ${profileData.address2 || ''}`.trim());
        formData.append('height', profileData.height);
        formData.append('weight', profileData.weight);
        formData.append('age', profileData.age || '20');
        formData.append('career', profileData.grade.trim());
        formData.append('position', profileData.position.trim());
        formData.append('playerID', profileData.playerID.trim());
        formData.append('avatar', profileData.profileImage);

        console.log('이미지와 함께 프로필 생성 중...');
        response = await createProfileWithAvatar(formData, token);
      } else {
        // 이미지가 없는 경우: 기존 방식 사용
        const payload = {
          realName: profileData.realName.trim(),
          email: profileData.email.trim(),
          nationality: profileData.nationality.trim(),
          phone: profileData.phone.trim(),
          address: `${profileData.address1} ${profileData.address2 || ''}`.trim(),
          height: parseInt(profileData.height),
          weight: parseInt(profileData.weight),
          age: parseInt(profileData.age) || 20,
          career: profileData.grade.trim(),
          position: profileData.position.trim(),
          playerID: profileData.playerID.trim(),
        };

        console.log('프로필만 생성 중...');
        response = await createProfile(payload, token);
      }

      console.log('프로필 생성 응답:', response);

      // 새 토큰이 반환되면 저장
      if (response.data?.token) {
        console.log('새 토큰 저장:', response.data.token);
        localStorage.setItem('token', response.data.token);
      }

      alert('프로필이 생성되었습니다.');
      navigate('/service');
    } catch (err) {
      console.error('프로필 생성 오류:', err);
      alert(
        '프로필 생성에 실패했습니다: ' + (err.message || '알 수 없는 오류'),
      );
    }
  };
  return (
    <form onSubmit={handleSubmit} className="profileForm">
      <div className="profileformtab-container">
        <button type="button" className="profileformTitle">
          프로필 생성
        </button>
      </div>

      {/* 프로필 이미지(파일 선택은 미리보기만, 서버 전송 X) */}
      <div className="profileformSection ">
        <div className="profileformimagePlaceholder">
          {profileData.profileImage ? (
            <img
              src={URL.createObjectURL(profileData.profileImage)}
              alt="Profile"
              className="profileImage"
            />
          ) : (
            <div className="profileplaceholderText"></div>
          )}
        </div>
        <div className="profileimageButtons">
          <label htmlFor="profileformImage" className="profileformuploadButton">
            사진 업로드
          </label>
          <input
            type="file"
            id="profileformImage"
            name="profileformImage"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="profileformremoveButton"
            onClick={() =>
              setProfileData((prev) => ({ ...prev, profileImage: null }))
            }
          >
            삭제
          </button>
        </div>
      </div>

      <div className="profileformGrid">
        <div className="profileformGroup">
          <label>성명(표시명)</label>
          <input
            type="text"
            name="realName"
            value={profileData.realName}
            onChange={handleChange}
            placeholder="예: 홍길동"
          />
        </div>

        <div className="profileformGroup">
          <label>이메일</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleEmailChange}
            className={emailStatus === 'checking' ? 'checking' : ''}
          />
          {emailMessage && (
            <div
              className={
                emailStatus === 'available'
                  ? 'status-message status-success'
                  : emailStatus === 'unavailable'
                  ? 'status-message status-error'
                  : 'status-message'
              }
            >
              {emailMessage}
            </div>
          )}
        </div>

        <div className="profileformGroup">
          <label>연락처</label>
          <input
            type="tel"
            name="phone"
            value={profileData.phone}
            onChange={handleChange}
            placeholder="010-1234-5678"
          />
        </div>

        <div className="profileformGroup">
          <label>별명</label>
          <input
            type="text"
            name="playerID"
            value={profileData.playerID}
            onChange={handleChange}
            placeholder="개똥이"
          />
        </div>

        <div className="profileformGroup full-width">
          <label>주소</label>
          <div className="input-with-button">
            <input
              type="text"
              name="address1"
              value={profileData.address1}
              onChange={handleChange}
              readOnly
            />
            <button type="button" onClick={handleAddressSearch}>
              찾기
            </button>
          </div>
        </div>
        <div className="profileformGroup full-width">
          <input
            type="text"
            name="address2"
            value={profileData.address2}
            onChange={handleChange}
            placeholder="상세 주소"
          />
        </div>

        <div className="profileformGroup">
          <label>키</label>
          <input
            type="text"
            name="height"
            value={profileData.height}
            onChange={handleChange}
            placeholder="180"
          />
        </div>
        <div className="profileformGroup">
          <label>몸무게</label>
          <input
            type="text"
            name="weight"
            value={profileData.weight}
            onChange={handleChange}
            placeholder="76"
          />
        </div>
        <div className="profileformGroup">
          <label>나이</label>
          <input
            type="text"
            name="age"
            value={profileData.age}
            onChange={handleChange}
            placeholder="예: 25"
          />
        </div>

        <div className="profileformGroup">
          <label>경력</label>
          <input
            type="text"
            name="grade"
            value={profileData.grade}
            onChange={handleChange}
            placeholder="예: 2년"
          />
        </div>
        <div className="profileformGroup">
          <label>국적</label>
          <Select
            inputId="nationality"
            classNamePrefix="nationality" // CSS 타겟팅용
            placeholder="국가 선택"
            options={COUNTRY_OPTIONS}
            components={{ Option, SingleValue, DropdownIndicator: NullIndicator }} // DropdownIndicator 제거
            isSearchable
            styles={selectStyles} // 커스텀 스타일 적용
            value={(() => {
              const alpha3 = profileData.nationality; // KOR/USA/…
              const alpha2 = alpha3 ? toAlpha2(alpha3) : '';
              const selectedOption = COUNTRY_OPTIONS.find((o) => o.alpha2 === alpha2);
              return selectedOption || null;
            })()}
            onChange={(opt) =>
              setProfileData((prev) => ({
                ...prev,
                nationality: opt ? opt.value : '',
              }))
            }
          />
        </div>

        <div className="profileformGroup">
          <label>포지션 (주포지션)</label>
          {/* <select> 태그를 Select 컴포넌트로 변경 */}
          <Select
            inputId="position"
            name="position"
            classNamePrefix="position-select" // CSS 타겟팅용
            placeholder="포지션 선택"
            options={POSITION_OPTIONS}
            components={{ 
              Option: PositionOption, 
              SingleValue: PositionSingleValue, 
              DropdownIndicator: NullIndicator // DropdownIndicator 제거
            }} 
            isSearchable={false} // 포지션은 검색 불필요
            styles={selectStyles} // 커스텀 스타일 적용
            value={POSITION_OPTIONS.find(
              (opt) => opt.value === profileData.position
            )}
            onChange={(opt) =>
              setProfileData((prev) => ({
                ...prev,
                position: opt ? opt.value : '',
              }))
            }
          />
        </div>
      </div>

      <button type="submit" className="profileformsubmitButton">
        프로필 생성
      </button>
    </form>
  );
};

export default SignupProfileForm;