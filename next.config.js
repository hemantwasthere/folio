const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ["cdn.discordapp.com", "i.scdn.co", "github.com"],
  },
};

module.exports = withNextIntl(nextConfig);
