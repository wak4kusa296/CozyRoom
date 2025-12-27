# Cloudflare Pages デプロイ手順

## 0. Cloudflare Pages プロジェクトの作成

**重要**: GitHub Actionsでデプロイする前に、Cloudflare Pagesでプロジェクトを作成する必要があります。

### プロジェクト作成手順

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com/)にログイン
2. 左サイドバーから「Workers & Pages」を選択
3. 「Pages」タブをクリック
4. 「Create a project」をクリック
5. **「Upload assets」を選択**（GitHub連携は不要です。GitHub Actionsでビルドしてからデプロイします）
6. プロジェクト名を入力（例: `cozyroom`）
   - **重要**: このプロジェクト名は、GitHub Secretsの `CLOUDFLARE_PAGES_PROJECT_NAME` に設定する必要があります
7. 「Create project」をクリック

### 自動ビルドを無効にする

GitHub Actionsでビルドしてからデプロイするため、Cloudflare Pagesの自動ビルドは使用しません。

- プロジェクトがGitHubリポジトリと連携している場合：
  1. プロジェクトの「Settings」タブを開く
  2. 「Builds & deployments」セクションで「Disable automatic builds」を選択
  3. または、プロジェクトを削除して「Upload assets」方式で再作成

### プロジェクト名の確認

- Cloudflare Pagesのダッシュボードで、作成したプロジェクトの名前を確認してください
- プロジェクト名は大文字小文字を区別します
- デフォルトでは `cozyroom` が使用されますが、変更した場合はGitHub Secretsに設定してください

## 1. 環境変数の設定

Cloudflare Pagesのダッシュボードで以下の環境変数を設定してください：

### 必須環境変数

- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのサービスロールキー
- `MICROCMS_API_KEY`: MicroCMSのAPIキー
- `MICROCMS_SERVICE_DOMAIN`: MicroCMSのサービスドメイン
- `KEEP_ALIVE_SECRET`: Keep-Alive API用の認証トークン（ランダムな文字列）

### 設定方法

1. Cloudflareダッシュボードにログイン
2. Pages > プロジェクト名 > Settings > Environment variables
3. 上記の環境変数を追加

## 1.5. 互換性フラグの設定

**重要**: `@cloudflare/next-on-pages`を使用する場合、`nodejs_compat`フラグを有効にする必要があります。

### 手動設定方法（詳細手順）

1. [Cloudflareダッシュボード](https://dash.cloudflare.com/)にログイン
2. 「Workers & Pages」→「Pages」→プロジェクト名を選択
3. 「Settings」タブを開く
4. 左サイドバーから「Functions」をクリック
5. 「Compatibility Flags」セクションを探す（Functions ページの中ほど）
6. **Production 環境**に設定：
   - Production セクションの「Add compatibility flag」ボタンをクリック
   - ドロップダウンから `nodejs_compat` を選択（入力ではなく選択）
   - 「Save」ボタンをクリック（画面の下部または右上）
7. **Preview 環境**にも設定：
   - Preview セクションの「Add compatibility flag」ボタンをクリック
   - ドロップダウンから `nodejs_compat` を選択
   - 「Save」ボタンをクリック

**重要**: 
- Production と Preview の**両方**に設定してください
- フラグ名は `nodejs_compat` と正確に入力（引用符不要）
- 設定後、ブラウザのページをリロードして確認してください
- **設定後、新しいデプロイが必要な場合があります**

### 設定の確認方法

1. Settings > Functions > Compatibility Flags に戻る
2. Production セクションに `nodejs_compat` が表示されているか確認
3. Preview セクションに `nodejs_compat` が表示されているか確認
4. 表示されていない場合は、再度追加してください

### 自動設定

GitHub Actionsのワークフローで自動的に設定されます（デプロイ時に実行）。

## 2. GitHub Actions の設定

### Secrets の設定

GitHubリポジトリの Settings > Secrets and variables > Actions で以下を設定：

- `KEEP_ALIVE_SECRET`: Keep-Alive API用の認証トークン（`.env.local`と同じ値）
- `KEEP_ALIVE_URL`: デプロイされたサイトのURL（例: `https://cozyroom.pages.dev`）
- `CLOUDFLARE_API_TOKEN`: Cloudflare APIトークン
- `CLOUDFLARE_ACCOUNT_ID`: CloudflareアカウントID
- `CLOUDFLARE_PAGES_PROJECT_NAME`: Cloudflare Pagesプロジェクト名（オプション、デフォルト: `cozyroom`）
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのサービスロールキー
- `MICROCMS_API_KEY`: MicroCMSのAPIキー
- `MICROCMS_SERVICE_DOMAIN`: MicroCMSのサービスドメイン

### Cloudflare API トークンの取得方法

1. Cloudflareダッシュボードにログイン
2. My Profile > API Tokens
3. "Create Token" をクリック
4. "Edit Cloudflare Workers" テンプレートを選択
5. 必要な権限を設定してトークンを作成

## 3. デプロイ方法

### 自動デプロイ（推奨）

`main`ブランチにプッシュすると、GitHub Actionsが自動的にデプロイします。

### 手動デプロイ

```bash
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name=cozyroom
```

## 4. Keep-Alive の確認

GitHub Actionsの "Supabase Keep-Alive" ワークフローが正常に動作しているか確認してください。

- 毎日自動実行される
- 手動実行も可能（workflow_dispatch）

## 5. トラブルシューティング

### ビルドエラー

- 環境変数が正しく設定されているか確認
- `next.config.js`の設定を確認

### Keep-Alive が失敗する

- `KEEP_ALIVE_SECRET`が正しく設定されているか確認
- `KEEP_ALIVE_URL`が正しいか確認
- APIエンドポイントがアクセス可能か確認

### プロジェクトが見つからないエラー（404）

エラーメッセージ: `Project not found. The specified project name does not match any of your existing projects.`

**解決方法**:

1. Cloudflare Pagesダッシュボードでプロジェクトが作成されているか確認
2. プロジェクト名が正確か確認（大文字小文字を含む）
3. GitHub Secretsに `CLOUDFLARE_PAGES_PROJECT_NAME` を設定し、実際のプロジェクト名と一致させる
   - 設定しない場合は、デフォルトで `cozyroom` が使用されます
4. プロジェクトが存在しない場合は、上記の「0. Cloudflare Pages プロジェクトの作成」の手順に従って作成してください


