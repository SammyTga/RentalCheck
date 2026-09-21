import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.20.6",
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
  ],
};

export default nextConfig;
