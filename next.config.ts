import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  // Turbopack (dev) — ExcelJS works fine without special config
  turbopack: {},

  // Webpack (production build) — mock Node.js built-ins not available in browser
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        stream: false,
        path: false,
        zlib: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
