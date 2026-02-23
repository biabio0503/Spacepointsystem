'use client';

import { useNavigate, useLocation, Outlet } from '@/lib/navigation';
import { LayoutDashboard, Calendar, Users, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const logoImg = '/logo.svg';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: '홈' },
  { path: '/admin/events', icon: Calendar, label: '사업관리' },
  { path: '/admin/members', icon: Users, label: '가입자' },
];

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#EEF1F8' }}>
      {/* Top bar */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #0A1328, #1B2A5C)' }}
      >
        <div className="flex items-center gap-2.5">
          <img src={logoImg} alt="SPACE logo" style={{ width: 36, height: 36, borderRadius: '50%' }} />
          <div>
            <h1 className="text-white" style={{ fontSize: 16, fontWeight: 800, letterSpacing: '1px' }}>SPACE</h1>
            <p className="text-white/50" style={{ fontSize: 11 }}>관리자 모드</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}
        >
          <LogOut size={14} />
          <span>로그아웃</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20">
        {children}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center justify-center gap-0.5 py-1 px-4 flex-1"
              >
                <Icon
                  size={22}
                  color={isActive ? '#1B2A5C' : '#9CA3AF'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className="text-[10px]"
                  style={{ color: isActive ? '#1B2A5C' : '#9CA3AF', fontWeight: isActive ? 600 : 400 }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
