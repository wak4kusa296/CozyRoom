# 環境変数設定ガイド

このドキュメントでは、`.env.local`ファイルとCloudflare Pagesでの環境変数設定方法を説明します。

## 1. ローカル開発環境（.env.local）

### ステップ1: ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成します。

```bash
# Windows (PowerShell)
Copy-Item env.example.txt .env.local

# Mac/Linux
cp env.example.txt .env.local
```

### ステップ2: 各環境変数の取得と設定

#### Supabase の設定

1. [Supabase](https://supabase.com) にログイン
2. プロジェクトを選択（または新規作成）
3. Settings > API に移動
4. 以下の値を取得：

```env
# Project URL（例: https://xxxxxxxxxxxxx.supabase.co）
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# anon public key（公開キー）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# service_role key（秘密キー - 絶対に公開しないこと）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**重要**: `SUPABASE_SERVICE_ROLE_KEY` は機密情報です。GitHubにコミットしないでください。

#### MicroCMS の設定

1. [MicroCMS](https://microcms.io) にログイン
2. サービスを選択（または新規作成）
3. 設定 > API設定 に移動
4. 以下の値を取得：

```env
# APIキー
MICROCMS_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# サービスドメイン（URLのサブドメイン部分）
MICROCMS_SERVICE_DOMAIN=your-service-name
```

**注意**: MicroCMSでAPIエンドポイント名が `blog` 以外の場合は、`libs/microcms.ts` の `API_BASE_URL` を変更してください。

#### Keep-Alive Secret の生成

ランダムな文字列を生成します：

```bash
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Mac/Linux
openssl rand -hex 32

# または、オンラインツールを使用
# https://www.random.org/strings/
```

生成した文字列を設定：

```env
KEEP_ALIVE_SECRET=your-generated-random-string-here
```

### ステップ3: .env.local の完成例

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MjM5MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2MTYyMzkwMjJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# MicroCMS
MICROCMS_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROCMS_SERVICE_DOMAIN=your-service-name

# Keep-Alive API (GitHub Actions用)
KEEP_ALIVE_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### ステップ4: 動作確認

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、エラーが表示されないことを確認してください。

## 2. Cloudflare Pages の環境変数設定

### ステップ1: Cloudflare Pages ダッシュボードにアクセス

1. [Cloudflare Dashboard](https://dash.cloudflare.com) にログイン
2. 左メニューから **Pages** を選択
3. プロジェクトを選択（または新規作成）

### ステップ2: 環境変数の設定

1. プロジェクトページで **Settings** タブをクリック
2. 左メニューから **Environment variables** を選択
3. **Add variable** をクリック

### ステップ3: 各環境変数を追加

以下の環境変数をすべて追加します：

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | SupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabaseサービスロールキー |
| `MICROCMS_API_KEY` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | MicroCMS APIキー |
| `MICROCMS_SERVICE_DOMAIN` | `your-service-name` | MicroCMSサービスドメイン |
| `KEEP_ALIVE_SECRET` | `your-generated-random-string` | Keep-Alive認証トークン |

**重要**: 
- すべての環境変数を **Production** 環境に設定してください
- `NEXT_PUBLIC_` で始まる変数は、クライアント側でも使用されるため、公開されます
- `SUPABASE_SERVICE_ROLE_KEY` は機密情報です。絶対に公開しないでください

### ステップ4: 環境変数の確認

設定後、以下のように表示されます：

```
Environment variables (6)
├─ NEXT_PUBLIC_SUPABASE_URL
├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
├─ SUPABASE_SERVICE_ROLE_KEY
├─ MICROCMS_API_KEY
├─ MICROCMS_SERVICE_DOMAIN
└─ KEEP_ALIVE_SECRET
```

### ステップ5: 再デプロイ

環境変数を追加・変更した後は、再デプロイが必要です：

1. **Deployments** タブに移動
2. 最新のデプロイメントの **...** メニューから **Retry deployment** を選択
3. または、GitHubにプッシュして自動デプロイをトリガー

## 3. GitHub Actions の Secrets 設定

Keep-Alive機能と自動デプロイを使用する場合、GitHub Secretsも設定が必要です。

### ステップ1: GitHubリポジトリの設定

1. GitHubリポジトリのページに移動
2. **Settings** > **Secrets and variables** > **Actions** を選択
3. **New repository secret** をクリック

### ステップ2: 必要なSecretsを追加

#### Keep-Alive用

| Secret名 | 値 | 説明 |
|----------|-----|------|
| `KEEP_ALIVE_SECRET` | `.env.local`と同じ値 | Keep-Alive API認証トークン |
| `KEEP_ALIVE_URL` | `https://your-site.pages.dev` | デプロイされたサイトのURL |

#### デプロイ用（自動デプロイを使用する場合）

| Secret名 | 値 | 説明 |
|----------|-----|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare APIトークン | Cloudflare APIトークン |
| `CLOUDFLARE_ACCOUNT_ID` | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | CloudflareアカウントID |

**Cloudflare APIトークンの取得方法**:
1. Cloudflare Dashboard > My Profile > API Tokens
2. **Create Token** をクリック
3. **Edit Cloudflare Workers** テンプレートを選択
4. 権限を設定：
   - Account: Cloudflare Pages: Edit
5. トークンを作成してコピー

**アカウントIDの取得方法**:
- Cloudflare Dashboardの右側サイドバーに表示
- または、任意のページのURLから取得可能

## 4. トラブルシューティング

### 環境変数が読み込まれない

- `.env.local` ファイルがプロジェクトルートにあるか確認
- ファイル名が正確か確認（`.env.local` で始まる）
- 開発サーバーを再起動（`npm run dev`）

### Cloudflare Pagesでビルドエラー

- 環境変数が正しく設定されているか確認
- 変数名にタイポがないか確認
- デプロイログを確認

### Keep-Aliveが失敗する

- `KEEP_ALIVE_SECRET` が `.env.local` とGitHub Secretsで一致しているか確認
- `KEEP_ALIVE_URL` が正しいか確認（末尾にスラッシュなし）
- APIエンドポイントがアクセス可能か確認（`/api/cron`）

## 5. セキュリティのベストプラクティス

1. **`.env.local` をGitにコミットしない**
   - `.gitignore` に既に含まれていますが、確認してください

2. **機密情報の管理**
   - `SUPABASE_SERVICE_ROLE_KEY` は絶対に公開しない
   - GitHub Secretsを使用して機密情報を管理

3. **環境変数の分離**
   - 開発環境と本番環境で異なる値を使用
   - Cloudflare Pagesでは本番環境用の値を設定

4. **定期的なローテーション**
   - APIキーやトークンは定期的に更新
   - 特に `KEEP_ALIVE_SECRET` は定期的に変更

