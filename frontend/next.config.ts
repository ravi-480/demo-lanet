module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["serpapi.com", "lh3.googleusercontent.com"],
  },
  webpack: (config: { infrastructureLogging: { level: string } }) => {
    config.infrastructureLogging = { level: "error" }; // Hide warnings in Next.js
    return config;
  },
};
