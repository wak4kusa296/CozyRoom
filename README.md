# CozyRoom

完全招待制のブログWebアプリケーション

## 技術スタック

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **CMS:** MicroCMS
- **DB/Auth:** Supabase (PostgreSQL)
- **Deployment:** Cloudflare Pages

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

詳細な設定手順は `ENV_SETUP.md` を参照してください。

**クイックセットアップ**:

```bash
# Windows (PowerShell)
Copy-Item env.example.txt .env.local

# Mac/Linux
cp env.example.txt .env.local
```

その後、`.env.local` を編集して各環境変数を設定してください。

**必要な環境変数**:
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのサービスロールキー
- `MICROCMS_API_KEY`: MicroCMSのAPIキー
- `MICROCMS_SERVICE_DOMAIN`: MicroCMSのサービスドメイン
- `KEEP_ALIVE_SECRET`: Keep-Alive API用の認証トークン（ランダムな文字列）

**Cloudflare Pagesでの設定**:
Cloudflare Pagesでも同じ環境変数を設定する必要があります。詳細は `ENV_SETUP.md` を参照してください。

### 3. Supabase データベースのセットアップ

**推奨: クイックセットアップ**

`supabase/quick_setup.sql` の内容をSupabaseのSQL Editorで一度に実行してください。
これでテーブル、RLSポリシー、初期管理人（招待コード: `admin`）がすべて作成されます。

**手動セットアップ（2ステップ）**

1. `supabase/schema.sql` を実行（テーブルとRLSポリシーの作成）
2. `supabase/init_admin.sql` を実行（管理人の作成）

詳細は `supabase/SETUP_INSTRUCTIONS.md` を参照してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## デプロイ

### Cloudflare Pages へのデプロイ

詳細は `cloudflare-pages.md` を参照してください。

#### クイックデプロイ

```bash
npm run pages:build
npm run pages:deploy
```

## GitHub Actions の設定

### Keep-Alive の設定

1. GitHubリポジトリの Settings > Secrets and variables > Actions で以下を設定：
   - `KEEP_ALIVE_SECRET`: Keep-Alive API用の認証トークン
   - `KEEP_ALIVE_URL`: デプロイされたサイトのURL

2. `.github/workflows/cron.yml` が毎日自動実行されます

### 自動デプロイの設定

1. GitHubリポジトリの Settings > Secrets and variables > Actions で以下を設定：
   - `CLOUDFLARE_API_TOKEN`: Cloudflare APIトークン
   - `CLOUDFLARE_ACCOUNT_ID`: CloudflareアカウントID
   - その他の環境変数（上記参照）

2. `main`ブランチにプッシュすると自動デプロイされます

## プロジェクト構造

```
.
├── app/              # Next.js App Router
│   ├── actions/      # Server Actions
│   ├── api/          # API Routes
│   └── blog/         # ブログページ
├── libs/             # ユーティリティ関数
│   ├── supabase/     # Supabaseクライアント
│   └── microcms.ts   # MicroCMSクライアント
├── supabase/         # データベーススキーマ
└── public/           # 静的ファイル
```

## 機能

### 認証
- 招待コードによる認証
- Cookieベースのセッション管理

### ブログ
- MicroCMSから記事を取得
- 記事一覧・詳細ページ

### コメント
- 1-on-1コメント機能（返信機能）
- 表示制御（RLS）:
  - 一般ユーザー: 自分のコメントと自分宛ての管理人からの返信のみ表示
  - 管理人: 全員のコメントを表示

### インフラ
- Keep-Alive API（Supabaseの自動停止を防ぐ）
- GitHub Actionsによる定期実行

## OGP画像の設定

`public/ogp-default.png` に1200x630pxのOGP画像を配置してください。
現在は `app/layout.tsx` で `/ogp-default.png` を参照しています。

## ライセンス

MIT
