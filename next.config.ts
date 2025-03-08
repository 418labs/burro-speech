import { NextConfig } from 'next/types';

const nextConfig: NextConfig = {
  env: {},
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
