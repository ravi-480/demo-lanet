module.exports = {
  reactStrictMode: true,
  webpack: (config: { infrastructureLogging: { level: string } }) => {
    config.infrastructureLogging = { level: "error" }; // Hide warnings in Next.js
    return config;
  },
};
