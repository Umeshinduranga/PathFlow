import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ["mongoose", "bcryptjs"],
};

export default nextConfig;
