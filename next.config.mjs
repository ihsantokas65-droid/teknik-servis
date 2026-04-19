/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yetkilikombiservisi.tr"
      },
      {
        protocol: "https",
        hostname: "www.yetkilikombiservisi.tr"
      }
    ]
  },
  experimental: {
    webpackBuildWorker: false
  }
};

export default nextConfig;
