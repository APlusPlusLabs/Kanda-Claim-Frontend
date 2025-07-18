/** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   output: 'export', // This exports static files for shared hosting
//   distDir: 'build', // This creates a 'build' folder instead of '.next'
//   trailingSlash: true, // Required for static export
//   basePath: '', // Add your subdirectory path here if needed (e.g., '/myapp')
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//   },
//   // Skip build-time generation for dynamic routes
//   generateBuildId: async () => {
//     return 'build-id'
//   }
// }

// export default nextConfig
// const nextConfig = {
//   reactStrictMode: true,
//   output: 'export', // This exports static files for shared hosting
//   distDir: 'build', // This creates a 'build' folder instead of '.next'
//   trailingSlash: true, // Required for static export
//   basePath: '', // Add your subdirectory path here if needed (e.g., '/myapp')
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//   },
//   // Skip build-time generation for dynamic routes
//   generateBuildId: async () => {
//     return 'build-id'
//   }
// }
// export default nextConfig

// const nextConfig = {
//   reactStrictMode: true,
//   // output: 'export', // Removed for dynamic routes
//   distDir: 'build', // This creates a 'build' folder instead of '.next'
//   // trailingSlash: true, // Not needed without export
//   basePath: '', // Add your subdirectory path here if needed (e.g., '/myapp')
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//   },
// }
// export default nextConfig


const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.kandaclaim.com/api/:path*',
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig