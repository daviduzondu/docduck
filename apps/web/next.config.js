/** @type {import('next').NextConfig} */
const nextConfig = {
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
