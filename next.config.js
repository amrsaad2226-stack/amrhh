/** @type {import('next').NextConfig} */
const nextConfig = {
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
