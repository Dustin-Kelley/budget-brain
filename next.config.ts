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
};

export default nextConfig;
