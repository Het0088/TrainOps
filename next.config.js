const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Set empty turbopack config to allow custom webpack config to work without error in Next.js 16
  turbopack: {},
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
