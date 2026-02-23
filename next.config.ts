import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
   reactStrictMode: true,
   // 이미지 최적화 설정
   images: {
      domains: [],
   },
   // 실험적 기능
   experimental: {
      optimizePackageImports: ['@mui/material', '@mui/icons-material'],
   },
};

export default nextConfig;
