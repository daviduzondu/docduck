
/** @type {import('next').NextConfig} */
const nextConfig = {
 turbopack: {
  resolveAlias: {
   yjs: './node_modules/yjs',
  },
 },
};

export default nextConfig;
