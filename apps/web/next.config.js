/** @type {import('next').NextConfig} */
const nextConfig = {
 typescript: {
  ignoreBuildErrors: true,
 },
 async redirects() {
  return [
   {
    source: '/dashboard',
    destination: '/dashboard/documents',
    permanent: true,
   },
  ]
 },
}

export default nextConfig
