import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // vercel/Blob config
  images: {
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

export default withNextIntl(nextConfig);
