import React from 'react';
import { Outlet } from 'react-router-dom';
import './index.css';

const AuthLayout = () => {
  return (
    <div
      className="authLayoutContainer"
      style={{
        widht: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#141414',
        overflow: 'auto',
        margin:0,
      }}
    >
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
