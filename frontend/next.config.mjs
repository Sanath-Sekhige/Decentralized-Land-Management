/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Fix for "Can't resolve 'electron'"
    config.resolve.alias = {
      ...config.resolve.alias,
      electron: false, 
    };
    
    return config;
  },
};

export default nextConfig;