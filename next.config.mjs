/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,

  async redirects() {
    // 環境変数がVercel側で設定されている場合のみ動く（他の人がクローンしても無害）
    if (process.env.REDIRECT_SUBDOMAIN && process.env.REDIRECT_DESTINATION) {
      return [
        {
          has: [
            {
              type: "host",
              value: process.env.REDIRECT_SUBDOMAIN, // Vercel上で「ha.ed1t.jp」を指定
            },
          ],
          source: "/:path*",
          destination: process.env.REDIRECT_DESTINATION, // Vercel上で「https://ed1t.jp」を指定
          permanent: true,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
