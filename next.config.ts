import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.tiendanube.com",
      },
      {
        protocol: "https",
        hostname: "**.nuvemshop.com.br",
      },
      {
        protocol: "https",
        hostname: "**.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
