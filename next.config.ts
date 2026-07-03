import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Admin uploads (e.g. hero videos) pass through middleware.ts, which buffers
  // the request body. Next.js caps that buffer at 10MB by default, truncating
  // larger uploads and breaking request.formData(). Raise it above the 50MB
  // video client-cap (+ optional thumbnail + multipart overhead).
  experimental: {
    proxyClientMaxBodySize: '80mb',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '147.79.70.30.nip.io',
        port: '8990',
        pathname: '/**', // Allows all paths under this domain
      },
    ],
  },
};

export default nextConfig;
