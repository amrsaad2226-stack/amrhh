/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '3000-firebase-amrhh-1776113933975.cluster-lu4mup47g5gm4rtyvhzpwbfadi.cloudworkstations.dev',
  ],
  async redirects() {
    return [
      {
        source: '/portal/login',
        destination: '/login',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig

// Trigger deployment