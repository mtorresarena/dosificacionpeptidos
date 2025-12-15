/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/dosificacionpeptidos',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
