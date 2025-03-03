/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: process.env.NODE_ENV !== "development",
  experimental: {
    serverMinification: false,
  },
};

export default nextConfig;
