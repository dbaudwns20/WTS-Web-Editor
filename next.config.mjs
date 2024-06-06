/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // vercel/Blob config
  images: {
    domains: ["~"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "c35dbgh5rquhetbl.public.blob.vercel-storage.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
