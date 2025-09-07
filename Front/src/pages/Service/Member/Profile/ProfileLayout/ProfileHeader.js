// src/components/profileheader.js
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../../context/AuthContext';
// import './ProfileHeader.css';

export default function ProfileHeader() {
const auth = useAuth();
const role = auth?.role ?? auth?.user?.role ?? 'player';
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(null);

  const playerItems = [
    { path: '/service/profile' ,label: '프로필'},
    { path: '/service/profile/modify', label: '프로필 수정' },
    { path: '/service/profile/clip', label: '메모 클립 영상' },
  ];

  const coachItems = [
    {path: '/service/profile', label: '프로필'},
    { path: '/service/profile/teamstats', label: '팀 선수 스탯' },
    { path: '/service/profile/modify', label: '프로필 수정' },
    { path: '/service/profile/clip', label: '메모 클립 영상' },
    { path: '/service/profile/manage', label: '구단 관리' },
  ];

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
          {role === 'coach'
            ? coachItems.map(renderItem)
            : playerItems.map(renderItem)}
        </ul>
      </nav>
    </header>
  );
}
