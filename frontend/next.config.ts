import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker/Cloud Run deployment
  output: 'standalone',
  
  sassOptions: {
    includePaths: [
      path.join(process.cwd(), 'node_modules'),
      path.join(process.cwd(), 'node_modules/@carbon'),
    ],
    silenceDeprecations: ['import'],
    // Note: Custom importer removed - webpack's resolve.alias handles ~@ibm/plex imports
  },
  // Using webpack explicitly for Carbon SCSS compatibility
  // Turbopack has issues with Carbon's SCSS processing
  webpack: (config) => {
    // Resolve font files from @ibm/plex package
    // Handle both ~@ibm/plex and @ibm/plex imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '~@ibm/plex': path.join(process.cwd(), 'node_modules/@ibm/plex'),
    };
    
    // Configure webpack to handle font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });
    
    return config;
  },
};

export default nextConfig;
