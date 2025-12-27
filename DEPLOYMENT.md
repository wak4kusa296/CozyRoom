# デプロイメントガイド

## 前提条件

1. Cloudflareアカウント
2. Supabaseプロジェクト
3. MicroCMSアカウント
4. GitHubリポジトリ

## ステップ1: 環境変数の準備

### Supabase

1. Supabaseダッシュボードでプロジェクトを作成
2. Settings > API から以下を取得：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### MicroCMS

1. MicroCMSでサービスを作成
2. API設定から以下を取得：
   - APIキー → `MICROCMS_API_KEY`
   - サービスドメイン → `MICROCMS_SERVICE_DOMAIN`

### Keep-Alive Secret

ランダムな文字列を生成（例：`openssl rand -hex 32`）

## ステップ2: Supabaseデータベースのセットアップ

1. SupabaseダッシュボードのSQL Editorを開く
2. `supabase/schema.sql` の内容を実行
3. 初期ユーザーを作成：

管理人の招待コード: `A21DC087`

```sql
-- supabase/init_admin.sql を参照するか、以下を実行
INSERT INTO users (name, invitation_code, role) 
VALUES ('管理人', 'A21DC087', 'admin')
ON CONFLICT (invitation_code) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role;
```

または、`supabase/init_admin.sql` ファイルの内容をSupabaseのSQL Editorで実行してください。

## ステップ3: Cloudflare Pagesの設定

### 方法1: GitHub連携（推奨）

1. Cloudflareダッシュボード > Pages > Create a project
2. "Connect to Git" を選択
3. GitHubリポジトリを選択
4. ビルド設定：
   - Framework preset: Next.js
   - Build command: `npm run pages:build`
   - Build output directory: `.vercel/output/static`
5. 環境変数を設定（上記の環境変数すべて）

### 方法2: Wrangler CLI

```bash
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name=cozyroom
```

## ステップ4: GitHub Actionsの設定

### Secrets の設定

GitHubリポジトリ > Settings > Secrets and variables > Actions で以下を追加：

#### Keep-Alive用
- `KEEP_ALIVE_SECRET`: Keep-Alive API用の認証トークン
- `KEEP_ALIVE_URL`: デプロイされたサイトのURL（例: `https://cozyroom.pages.dev`）

#### デプロイ用
- `CLOUDFLARE_API_TOKEN`: Cloudflare APIトークン
- `CLOUDFLARE_ACCOUNT_ID`: CloudflareアカウントID

#### ビルド用（オプション）
- 環境変数はCloudflare Pagesで設定するため、GitHub Actionsには不要

### Cloudflare API トークンの取得

1. Cloudflareダッシュボード > My Profile > API Tokens
2. "Create Token" をクリック
3. "Edit Cloudflare Workers" テンプレートを選択
4. 権限を設定：
   - Account: Cloudflare Pages: Edit
   - Zone: 必要に応じて設定
5. トークンを作成してコピー

### アカウントIDの取得

1. Cloudflareダッシュボードの右側サイドバーに表示
2. または、任意のページのURLから取得可能

## ステップ5: OGP画像の設定

1. `public/ogp-default.png` を1200x630pxの画像に置き換え
2. または、`app/layout.tsx` のOGP設定を変更

## ステップ6: 動作確認

1. デプロイされたサイトにアクセス
2. 招待コードでログイン
3. ブログ記事が表示されるか確認
4. コメント機能が動作するか確認
5. GitHub ActionsのKeep-Aliveワークフローが正常に動作するか確認

## トラブルシューティング

### ビルドエラー

- 環境変数が正しく設定されているか確認
- `next.config.js` の設定を確認
- ログを確認

### Keep-Alive が失敗する

- `KEEP_ALIVE_SECRET` が正しく設定されているか確認
- `KEEP_ALIVE_URL` が正しいか確認
- APIエンドポイントがアクセス可能か確認（`/api/cron`）

### コメントが表示されない

- SupabaseのRLSポリシーを確認
- Service Role Keyが正しく設定されているか確認
- アプリケーション側のフィルタリングロジックを確認

### 認証が動作しない

- Cookieが正しく設定されているか確認
- ミドルウェアの設定を確認
- Supabaseのusersテーブルにデータが存在するか確認

