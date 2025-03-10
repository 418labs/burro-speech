import { NextConfig } from 'next/types';

const nextConfig: NextConfig = {
  env: {
    GOOGLE_ANALYTICS: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || '',
  },
  images: {
    remotePatterns: [
      {
        hostname: '*',
        port: '',
      },
    ],
  },
};

export default nextConfig;
