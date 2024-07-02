/** @type {import('next').NextConfig} */
import path from "path";

const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  webpack(config, options) {
    const {isServer} = options;

    const dirPath = path.resolve("./src/app/api");

    // Agregar alias para src/app/api
    config.resolve.alias["@api"] = dirPath;
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      use: [
        {
          loader: "file-loader",
          options: {
            limit: config.inlineImageLimit,
            fallback: "file-loader",
            publicPath: `/_next/static/images/`,
            outputPath: `${isServer ? "../" : ""}static/images/`,
            name: "[name]-[hash].[ext]",
            esModule: config.esModule || false,
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
