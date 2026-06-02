/** @type {import('next').NextConfig} */
const nextConfig = {
  // 301 redirects after the path rename:
  //   /equipment → /studio   (this page is the studio showcase)
  //   /space     → /services (this page is "Other Services")
  // The old /studio (pricing) is NOT redirected — that URL is reused by the
  // studio showcase. Pricing now lives at the fresh /pricing URL.
  async redirects() {
    return [
      { source: "/equipment", destination: "/studio", permanent: true },
      { source: "/space", destination: "/services", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      // Blog hero images live in Supabase Storage + come from Pexels stock.
      { protocol: "https", hostname: "vhsfdfaziafkibzpevsq.supabase.co" },
      { protocol: "https", hostname: "images.pexels.com" },
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
