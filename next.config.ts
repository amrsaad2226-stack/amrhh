import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["firebasehosting.googleapis.com"],
  },
  // أضفنا هذا السطر للسماح لرابط الاستضافة بفتح المشروع
  allowedDevOrigins: [
    "3001-firebase-amrhh-1776113933975.cluster-lu4mup47g5gm4rtyvhzpwbfadi.cloudworkstations.dev",
    "3000-firebase-amrhh-1776113933975.cluster-lu4mup47g5gm4rtyvhzpwbfadi.cloudworkstations.dev"
  ],
};

export default nextConfig;