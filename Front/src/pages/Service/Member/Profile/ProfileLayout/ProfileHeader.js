// src/components/profileheader.js
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './ProfileHeader.css'; // 필요시 스타일 추가

export default function ProfileHeader() {
  const { role = 'player' } = useAuth() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(null);

  // 메뉴 정의 (경로/라벨은 예시)
  const playerItems = [
    { path: '/service/profile', label: '프로필 수정' },
    { path: '/service/profile/password', label: '메모 클립 영상' },
  ];

  const coachItems = [
    { path: '/service/profile', label: '팀 선수 스탯' },
    { path: '/service/profile/password', label: '프로필 수정' },
    { path: '/service/profile/team', label: '메모 클립 영상' },
    { path: '/service/profile/members', label: '구단 관리' },
  ];

  const items = role === 'coach' ? coachItems : playerItems;

  const renderItem = (item) => (
    <li
      key={item.path}
      className="ph-item"
      onMouseEnter={() => setHovered(item.path)}
      onMouseLeave={() => setHovered(null)}
    >
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `ph-link ${isActive ? 'ph-link-active' : ''} ${hovered === item.path ? 'ph-link-hovered' : ''}`
        }
        end={item.path === '/service/profile'}
        title={item.label}
      >
        <span className="ph-label">{item.label}</span>
        {location.pathname === item.path && <div className="ph-active-indicator" />}
      </NavLink>
    </li>
  );

  return (
    <header className="ph-container">
      <div className="ph-left">
        <h1 className="ph-title" onClick={() => navigate('/service/profile')}>프로필</h1>
      </div>

      <nav className="ph-nav">
        <ul className="ph-menu">
          {items.map(renderItem)}
        </ul>
      </nav>
    </header>
  );
}
