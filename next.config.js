/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.asariweb.pl",
        pathname: "/**",
      },
    ],
  },
};
