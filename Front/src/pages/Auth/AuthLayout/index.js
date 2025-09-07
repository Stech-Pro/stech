import React from 'react';
import { Outlet } from 'react-router-dom';
import './index.css';

const AuthLayout = () => {
  return (
    <div className="authLayoutContainer">
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
