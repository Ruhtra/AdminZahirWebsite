import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "btfhhwkwasgwxaphlfln.supabase.co",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/",
        destination: "/admin/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
