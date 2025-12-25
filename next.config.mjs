import webpack from 'next/dist/compiled/webpack/webpack-lib.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Stub native-only modules that some deps optionally import
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    // Ignore the porto module's problematic chain imports
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^porto$/,
      })
    )

    return config
  },
};

export default nextConfig;

