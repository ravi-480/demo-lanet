import { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  swcMinify: true, // Use SWC for minification
  compress: true, // Enable gzip compression
  reactStrictMode: false, // React strict mode

  images: {
    domains: [
      'serpapi.com',
      'lh3.googleusercontent.com',
      'res.cloudinary.com',
    ],
  },

  webpack: (config, { isServer }) => {
    config.infrastructureLogging = { level: 'error' }; // Reduce log noise
    return config;
  },
};

export default withAnalyzer(nextConfig);
