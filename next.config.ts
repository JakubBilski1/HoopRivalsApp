import withPWA from 'next-pwa';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Spread your nextConfig here if needed, but make sure conflicting properties are removed.
  ...nextConfig,
});
