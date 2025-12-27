/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages用の設定
  // @cloudflare/next-on-pagesが自動的に設定を調整するため、通常の設定でOK
  images: {
    unoptimized: true,
  },
  // ワークスペースルートの警告を解消
  outputFileTracingRoot: require('path').join(__dirname),
}

module.exports = nextConfig

