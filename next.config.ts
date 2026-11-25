import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['cdn.dribbble.com', 'gsilpsppthrhhqcuwzjw.supabase.co'],
  },
  async redirects() {
    return [
      { source: '/goals', destination: '/', permanent: false },
      { source: '/allocation', destination: '/', permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
