/** @type {import('next').NextConfig} */
const nextConfig = {
    // Turbopack - Lightning-fast bundler
    experimental: {
        optimizePackageImports: ['@heroicons/react/24/outline', '@heroicons/react/24/solid'],
    },

    // Image Optimization
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.imgur.com',
            },
            {
                protocol: 'https',
                hostname: 'imgur.com',
            },
        ],
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // Performance & Optimization
    compress: true,
    reactStrictMode: true,
    productionBrowserSourceMaps: false,

    // Headers for performance
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=60, s-maxage=120',
                    },
                ],
            },
            {
                source: '/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },

    // Security Headers
    async redirects() {
        return [];
    },

    webpack: (config, { isServer }) => {
        config.optimization.minimize = true;
        return config;
    },
};

module.exports = nextConfig;
