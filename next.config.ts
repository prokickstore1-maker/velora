import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "192.168.18.31",
    "localhost",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "192.168.18.31:3000",
        "192.168.18.31",
        "localhost:3000",
        "myvelorastore1.com",
        "www.myvelorastore1.com",
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
