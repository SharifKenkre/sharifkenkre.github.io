/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // enables static export (creates /out)
  images: { unoptimized: true }, // required if you use next/image on static export
  trailingSlash: true,       // optional but helps with GitHub Pages routing
};
module.exports = nextConfig;
