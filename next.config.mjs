/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
    ],
  },
  webpack: (config, { dev }) => {
    // Disable webpack persistent cache in dev. Node 22 + macOS occasionally
    // fails the atomic rename of *.pack.gz_ → *.pack.gz which corrupts
    // .next/server. Cost: ~1s slower hot reload, totally worth the stability.
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
