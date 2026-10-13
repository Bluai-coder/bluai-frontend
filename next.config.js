// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   experimental: {
//     optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
//   },
//   async rewrites() {
//     return [
//       {
//         source: '/api/v1/:path*',
//         destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/:path*`,
//       },
//     ];
//   },
// };

// module.exports = nextConfig;








/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  async rewrites() {
    return [
      // ✅ Your existing backend
      {
        source: '/api/v1/:path*',
        destination: `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
        }/:path*`,
      },

      // ✅ 🔥 ADD THIS (BluHealth Proxy)
      {
        source: '/api/bluhealth/:path*',
        destination:
          'https://bluhealthapi.bluai.ai/api/bluhealth/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 







