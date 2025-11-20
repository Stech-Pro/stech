// src/pages/Service/ServiceLayout/index.js
import React, { useState } from 'react';
import { useLocation, useNavigate, Outlet, useMatch } from 'react-router-dom';
import ServiceSidebar from './ServiceSidebar';
import SupportModal from '../../../components/SupportModal';
import UploadVideoModal from '../../../components/UploadVideoModal.jsx';
import useDeviceWidth from '../../../hooks/useDeviceWidth.js';
import DeviceWarning from '../../../pages/Common/DeviceWarning/index.js';
import './index.css';

const ServiceLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const isServiceVideo = !!useMatch('/service/video/*');
  const isGuestVideo = !!useMatch('/service/guest/video/*');
  const isTestVideo = !!useMatch('/service/testvideo/*');
  const isVideo = isServiceVideo || isGuestVideo|| isTestVideo;
  const windowWidth = useDeviceWidth();

  if (windowWidth <= 1200) {
    return <DeviceWarning />;
  }
  return (
    <>
      {isVideo ? (
        <div className="flex-1">
          <Outlet />
        </div>
      ) : (
        <div className="serviceLayoutContainer">
          <ServiceSidebar className="serviceSidebar" />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      )}
      <UploadVideoModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUploaded={() => console.log('upload ok')}
      />

      {/* ---------- 3. 모달 ---------- */}
      {location.pathname.startsWith('/service/support') && (
        <SupportModal onClose={() => navigate(-1)} />
      )}
    </>
  );
};

export default ServiceLayout;
