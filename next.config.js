/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
};

module.exports = nextConfig;
