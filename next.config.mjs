/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // vercel/Blob config
  images: {
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
