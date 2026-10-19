/** @type {import('next').NextConfig} */
const nextConfig = {
  // Served media (generated previews/videos) lives in /data, outside the
  // public dir, so it's streamed through an API route instead.
  experimental: {},
};

export default nextConfig;
