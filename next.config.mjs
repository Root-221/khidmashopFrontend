/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    const targetOrigin = (
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "")
    );

    if (!targetOrigin) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${targetOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
