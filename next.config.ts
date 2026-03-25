import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
   reactStrictMode: true,
   // 이미지 최적화 설정
   images: {
      remotePatterns: [
         {
            protocol: 'https',
            hostname: 'bvmecrfidkotjuqvojbr.supabase.co',
         },
         {
            protocol: 'https',
            hostname: 'supabase.co',
         },
      ],
   },
};

export default nextConfig;
