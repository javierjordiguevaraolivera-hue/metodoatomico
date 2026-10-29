import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Que Next no agregue ni quite slashes antes de redirigir.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
