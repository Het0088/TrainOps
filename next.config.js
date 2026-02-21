/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          uiVendor: {
            name: 'ui-vendor',
            test: /[\\/]node_modules[\\/](@radix-ui|recharts|framer-motion)[\\/]/,
            chunks: 'all',
            priority: 20,
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig