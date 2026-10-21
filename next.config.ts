import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // The slides repo is served by GitHub Pages on its own subdomain.
        source: "/777-ai-in-practice-slides/:path*",
        destination: "https://slides.mahfoudh.dev/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
