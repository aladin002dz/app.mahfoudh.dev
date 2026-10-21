import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // The slides remain under the static portfolio domain on GitHub Pages.
        source: "/777-ai-in-practice-slides/:path*",
        destination: "https://mahfoudh.dev/777-ai-in-practice-slides/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
