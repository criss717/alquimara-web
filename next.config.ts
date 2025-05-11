import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "liuhsbsujfxoxmkhehtr.supabase.co",
        pathname: "/storage/v1/object/public/imagenes-jabones/**",
      },
    ],
  },
};

export default nextConfig;
