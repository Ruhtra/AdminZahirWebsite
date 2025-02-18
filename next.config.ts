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
        hostname: "vdeckufzmvmcfnfcyugz.supabase.co",
      },
      {
        protocol: "https",
        hostname: "zahir-image.s3.sa-east-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
