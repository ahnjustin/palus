import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const dependenciesToChunk = {
  editor: [
    "mdast-util-to-markdown",
    "react-markdown",
    "rehype-parse",
    "rehype-remark",
    "remark-breaks",
    "remark-gfm",
    "remark-html",
    "remark-linkify-regex",
    "remark-parse",
    "remark-stringify",
    "strip-markdown",
    "unified",
    "unist-util-visit-parents"
  ],
  indexer: ["@palus/indexer"],
  media: ["plyr-react", "@livepeer/react", "browser-image-compression"],
  misc: [
    "@apollo/client",
    "@lens-chain/storage-client",
    "@lens-protocol/metadata",
    "dayjs",
    "html-to-image",
    "tailwind-merge",
    "@tanstack/react-query",
    "virtua",
    "zod",
    "zustand"
  ],
  prosekit: ["prosekit", "prosekit/core", "prosekit/react"],
  react: [
    "react",
    "react-dom",
    "react-helmet-async",
    "react-easy-crop",
    "react-hook-form",
    "react-hotkeys-hook",
    "react-router",
    "react-simple-pull-to-refresh",
    "react-tracked"
  ],
  ui: [
    "@headlessui/react",
    "@heroicons/react",
    "@hookform/resolvers",
    "@radix-ui/react-hover-card",
    "@radix-ui/react-scroll-area",
    "@radix-ui/react-select",
    "@radix-ui/react-slider",
    "@radix-ui/react-tooltip",
    "@uidotdev/usehooks",
    "class-variance-authority",
    "clsx",
    "plur",
    "sonner",
    "tailwindcss",
    "motion"
  ],
  wevm: [
    "@lens-chain/sdk/viem",
    "@metamask/sdk",
    "@walletconnect/ethereum-provider",
    "@wagmi/core",
    "family",
    "lens-modules",
    "thirdweb",
    "viem",
    "viem/zksync",
    "wagmi"
  ]
};

export default defineConfig({
  build: {
    cssMinify: "lightningcss",
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (/\.woff2$/.test(assetInfo.name ?? "")) {
            return "assets/fonts/[name][extname]";
          }

          return "assets/[name]-[hash][extname]";
        },
        manualChunks: dependenciesToChunk
      }
    },
    sourcemap: "hidden",
    target: "esnext"
  },
  plugins: [tsconfigPaths(), react(), tailwindcss()],
  preview: {
    allowedHosts: ["palus.app", "www.palus.app"]
  }
});
