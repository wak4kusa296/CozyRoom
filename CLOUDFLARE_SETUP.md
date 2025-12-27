# Cloudflare Pages セットアップガイド（簡易版）

このガイドでは、Cloudflare PagesとGitHubを連携し、プッシュするだけで自動デプロイする方法を説明します。

## 手順

### 1. Cloudflare Pagesでビルド設定を有効化

1. [Cloudflareダッシュボード](https://dash.cloudflare.com/)にログイン
2. **Workers & Pages** > **Pages** > **cozyroom** を選択
3. **Settings** > **Builds & deployments** を開く
4. 以下を設定：

#### Build configuration

```
Framework preset: Next.js
Build command: npm run pages:build
Build output directory: .vercel/output/static
Root directory: (空欄)
```

#### Production deployments

- **Enabled** に設定
- Production branch: `main`

5. **Save** をクリック

### 2. 環境変数を設定

**Settings** > **Environment variables** で以下を追加：

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseサービスロールキー |
| `MICROCMS_API_KEY` | MicroCMS APIキー |
| `MICROCMS_SERVICE_DOMAIN` | MicroCMSサービスドメイン |
| `KEEP_ALIVE_SECRET` | Keep-Alive認証トークン |

**重要**: すべての変数を **Production** と **Preview** の両方に設定してください。

### 3. 互換性フラグを設定

**Settings** > **Functions** > **Compatibility Flags** で：

- Production: `nodejs_compat` を追加
- Preview: `nodejs_compat` を追加

### 4. デプロイ

GitHubにプッシュすると、自動的にデプロイされます：

```bash
git add .
git commit -m "Update project"
git push origin main
```

### 5. 確認

1. **Deployments** タブでビルドログを確認
2. デプロイが完了したら、URLにアクセスして動作確認

## トラブルシューティング

### ビルドが失敗する

- 環境変数が正しく設定されているか確認
- Build commandが `npm run pages:build` になっているか確認

### 互換性エラーが出る

- Compatibility Flagsで `nodejs_compat` が設定されているか確認
- Production と Preview の両方に設定されているか確認

### 環境変数が読み込まれない

- Production と Preview の両方にチェックが入っているか確認
- 変数名にタイポがないか確認

## 完了！

これで、GitHubにプッシュするだけで自動的にCloudflare Pagesにデプロイされます。

