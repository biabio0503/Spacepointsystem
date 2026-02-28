'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, QrCode, User, Calendar, Package } from 'lucide-react';

const navItems = [
  { path: '/home', icon: Home, label: '홈' },
  { path: '/events', icon: Calendar, label: '사업' },
  { path: '/qr', icon: QrCode, label: 'QR' },
  { path: '/rental', icon: Package, label: '대여' },
  { path: '/mypage', icon: User, label: '마이' },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 z-50 pb-safe">
      <div className="flex items-center justify-around px-2 h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = pathname === path;
          const isQR = path === '/qr';
          if (isQR) {
            return (
              <button
                key={path}
                onClick={() => router.push(path)}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #1B2A5C, #2E4A9A)' }}
                >
                  <Icon size={24} color="white" />
                </div>
              </button>
            );
          }
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 flex-1"
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
  );
}
