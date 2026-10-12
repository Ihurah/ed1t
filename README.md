# ed1t.jp

GeminiやLovableとともに作ったPortfolio。

## Xの投稿取得

`agent-twitter-client` のCookie認証で、最新の通常投稿2件を取得します。
本文・日時・投稿URL・いいね数を既存のカードに表示します。APIの返却データには
投稿ID・返信数・リポスト数・閲覧数も含まれます。
返信・リポスト・引用投稿は除外し、日付は日本時間で表示します。
取得結果は15分間キャッシュされます。

ライブラリの旧API設定を補うため、Xの公開クライアントから現在の認証ヘッダーと
GraphQL識別子を読み取り、必要なリクエスト署名を付けています。
現行のユーザー・タイムライン形式は、ライブラリが解析できる形式に変換します。
公開クライアントの設定はプロセス内で1時間キャッシュし、Cookieは送信しません。

表示アカウントは `app/config/x-profiles.mjs` で変更します。

```js
export const X_PROFILES = {
  main: { username: "Ihurah_com" },
  ha: { username: "hahaha_vet" },
};
```

トップページは `/api/x`、`/ha` は `/api/x?profile=ha` を利用します。
表示先はこの設定で固定し、クエリの `username` や `userId` では変更しません。
鍵アカウントの投稿は返しません。

### 認証の設定

1. Xにログインしたブラウザで `https://x.com` を開きます。
2. 開発者ツールの Application（FirefoxはStorage）→ Cookies → `https://x.com` で、
   同じログインセッションの `auth_token` と `ct0` の値を確認します。
3. `.env.local` に以下を追記します。既存のメール送信用設定などはそのまま残します。

```dotenv
X_AUTH_TOKEN=auth_tokenの値
X_CT0=ct0の値

# /haに別のログインセッションを使う場合
HA_X_AUTH_TOKEN=ha用auth_tokenの値
HA_X_CT0=ha用ct0の値
```

`HA_X_AUTH_TOKEN` と `HA_X_CT0` の両方が空なら、`/ha` もメインの認証を使います。
この場合も、表示する投稿アカウントは `ha.username` のままです。
片方だけの設定はエラーになります。

`X_BEARER_TOKEN`、`HA_X_BEARER_TOKEN`、`X_USER_ID` はこの取得処理では使いません。
Cookie値はログイン情報なので、チャット・ソースコード・Gitに貼らないでください。
`.env.local` はGitの対象外で、`.env.example` は値を入れない設定例です。

Vercelではプロジェクトの Environment Variables に同じ変数を登録し、再デプロイします。
ローカルでは `.env.local` の更新後、開発サーバーを再起動します。

```sh
npm install
npm run dev
```

開発URL: `http://localhost:1111`

### 取得できない場合

未設定や取得エラーの場合、APIは `503` と空配列を返します。
モック投稿は表示しません。原因は応答ヘッダー `X-Posts-Status` とサーバーログで確認できます。

- `X_POSTS_NOT_CONFIGURED`: Cookieが未設定、片方だけ、または形式が不正です。
- `X_PROFILE_UNAVAILABLE`: アカウントが存在しないか、非公開です。
- `X_UPSTREAM_ERROR`: Xからエラー応答がありました。ログのHTTPステータスも確認します。
- `X_FETCH_TIMEOUT`: 取得が12秒以内に終わりませんでした。
- `X_FETCH_FAILED`: ライブラリ内部の取得・解析処理が失敗しました。
- `X_CLIENT_UNAVAILABLE`: Xの公開クライアント設定を取得できませんでした。
- `X_CLIENT_INCOMPATIBLE`: Xの公開クライアント形式が変わり、互換処理の更新が必要です。

Cookieの期限が切れたら、新しいログインセッションの値に更新してください。
`agent-twitter-client@0.0.18` はnpmでサポート終了と表示されており、X側の変更により
取得できなくなる可能性があります。実際の接続はCookie設定後に確認してください。

```sh
npm test
npm run lint
npm run build
```
