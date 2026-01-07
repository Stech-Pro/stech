// src/pages/Service/ServiceLayout/index.js
import React, { useState } from 'react';
import { useLocation, useNavigate, Outlet, useMatch } from 'react-router-dom';
import ServiceSidebar from './ServiceSidebar';
import SupportModal from '../../../components/SupportModal';
import UploadVideoModal from '../../../components/UploadVideoModal.jsx';
import useDeviceWidth from '../../../hooks/useDeviceWidth.js';
import DeviceWarning from '../../../pages/Common/DeviceWarning/index.js';
import './index.css';
import { HiMenu, HiX } from 'react-icons/hi';
import NotificationHoverIcon from '../../../components/Notifications/NotificationHoverIcon.js';

const SIDEBAR_ID = 'service-sidebar';

const ServiceLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showUpload, setShowUpload] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isServiceVideo = !!useMatch('/service/video/*');
  const isGuestVideo = !!useMatch('/service/guest/video/*');
  const isTestVideo = !!useMatch('/service/testvideo/*');
  const isVideo = isServiceVideo || isGuestVideo || isTestVideo;

  // if (windowWidth <= 1200) {
  //   return <DeviceWarning />;
  // }
  return (
    <>
      {isVideo ? (
        <div className="flex-1">
          <Outlet />
        </div>
      ) : (
        <div className="min-h-screen flex flex-col md:pl-[300px]">
          <header className="md:hidden sticky top-0 z-30 bg-[#141414] backdrop-blur border-b border-[#1f2023]">
            <div className="flex items-center justify-between px-4 h-14">
              <button
                type="button"
                aria-label="Open sidebar"
                aria-controls='service-sidebar-mobile'
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2  bg-[#141414] text-white"
              >
                <HiMenu className="w-4 h-4" />
              </button>

              <NotificationHoverIcon className='bg-transparent border-none '/>
        
            </div>
          </header>

          <ServiceSidebar
            className="max-md:hidden w-[300px] flex fixed inset-y-0 left-0 flex-col backdrop-blur-md h-screen overflow-y-auto z-30 bg-[#000000] "
          />

          {sidebarOpen && (
            <button
              type="button"
              aria-label="Close sidebar overlay"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 md:hidden bg-black/40"
            />
          )}
          <aside
            role="dialog"
            aria-modal="true"
            className={`md:hidden fixed inset-y-0 left-0 z-50 w-[min(85vw,var(--sidebar-width))] max-w-[var(--sidebar-width)]
                        bg-[#0f1012] shadow-2xl transition-transform duration-300
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            {/* 드로어 헤더(닫기 버튼) */}
            <div className="h-14 px-4 border-b border-[#1f2023] flex items-center justify-between">
              <span className="text-sm text-white/80"></span>
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg border border-[#1f2023] text-white"
              >
                <HiX className="w-4 h-4" />
              </button>
            </div>

            {/* 실제 사이드바 내용 렌더 */}
            <div className='h-[calc(100vh-56px)] overflow-y-auto'>
              <ServiceSidebar/>
              </div>
          </aside>
          
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
