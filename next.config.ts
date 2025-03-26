import withPWA from 'next-pwa';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // productionBrowserSourceMaps: true, // Removed or moved if necessary
  // Add any additional Next.js config options here
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Spread your nextConfig here if needed, but make sure conflicting properties are removed.
  ...nextConfig,
});
