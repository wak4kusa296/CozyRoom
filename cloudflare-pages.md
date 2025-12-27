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

### 自動ビルドを無効にする（重要）

**エラー**: `Failed: build output directory not found` が出る場合、自動ビルドが有効になっています。

GitHub Actionsでビルドしてからデプロイするため、Cloudflare Pagesの自動ビルドは**必ず無効にする必要があります**。

#### 方法1: GitHub連携を解除する（推奨）

**現在のエラー**: `Failed: build output directory not found` は、Cloudflare Pagesの自動ビルドが有効になっているためです。

1. [Cloudflareダッシュボード](https://dash.cloudflare.com/)にログイン
2. 「Workers & Pages」→「Pages」→プロジェクト名を選択
3. 「Settings」タブを開く
4. 左サイドバーから「**Builds & deployments**」を選択
5. 「Source」または「Connected repository」セクションを探す
6. GitHubリポジトリが表示されている場合：
   - 「**Disconnect repository**」または「**Unlink repository**」ボタンをクリック
   - 確認ダイアログで「Disconnect」または「Unlink」を選択
7. これで、GitHub Actionsでのデプロイのみが実行され、Cloudflare Pagesの自動ビルドは停止します

**確認方法**: 
- Settings > Builds & deployments に戻ると、GitHubリポジトリの表示が消えているはずです
- これ以降、GitHub Actionsでのデプロイのみが実行されます

#### 方法2: プロジェクトを再作成する

1. 既存のプロジェクトを削除（必要に応じて）
2. 「Create a project」をクリック
3. **必ず「Upload assets」を選択**（「Connect to Git」は選択しない）
4. プロジェクト名を入力（例: `cozyroom`）
5. 「Create project」をクリック

**注意**: プロジェクトを再作成した場合、環境変数と互換性フラグを再度設定する必要があります。

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
4. **重要**: 各環境変数を追加する際、必ず「Production」と「Preview」の両方のチェックボックスにチェックを入れる
5. 「Save」または「Add variable」をクリックして保存

### 環境変数が消える問題

**重要**: `wrangler.toml`を使用してDirect Upload（`wrangler pages deploy`）でデプロイする場合、環境変数の扱いが異なることがあります。

#### 環境変数の設定方法（推奨）

Cloudflare Pagesのダッシュボードで設定する方法が最も確実です：

1. **Settings > Environment variables で設定**：
   - プロジェクト設定（Settings）で設定してください
   - デプロイメント（Deployments）の設定ではありません
   - **Production と Preview の両方にチェックを入れる**

2. **wrangler.tomlには環境変数を書かない**：
   - `wrangler.toml`に環境変数を書くことは推奨されません（機密情報がGitにコミットされるため）
   - 環境変数はダッシュボードで設定するのが安全です

#### 環境変数が消える場合の確認事項

1. **プロジェクトを削除・再作成していないか**：
   - プロジェクトを削除すると、環境変数も削除されます
   - 既存のプロジェクトを使用する限り、環境変数は保持されます

2. **環境変数の設定場所を確認**：
   - Settings > Environment variables で設定されているか確認
   - デプロイ後に Settings > Environment variables に戻って、環境変数が残っているか確認

3. **Production と Preview の両方に設定**：
   - 環境変数を追加する際、Production と Preview の両方にチェックを入れることを確認
   - 片方だけに設定すると、もう一方の環境では環境変数が使えません

4. **設定の確認方法**：
   - Settings > Environment variables に戻ると、追加した環境変数が一覧に表示されます
   - 各環境変数の横に「Production」と「Preview」の両方が表示されているか確認してください

### 環境変数のバックアップ（推奨）

環境変数を設定したら、以下の方法でバックアップを取ることをお勧めします：

1. 環境変数の一覧をスクリーンショットまたはメモに保存
2. または、`.env.example.txt` ファイルに値の形式をメモしておく（実際の値は記載しない）

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

### wrangler.tomlでの設定（追加の設定方法）

`wrangler.toml`ファイルにも互換性フラグを設定できます：

```toml
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]
```

この設定は既に追加されていますが、ダッシュボードでの設定も併せて必要です。

### 自動設定

GitHub Actionsのワークフローでデプロイ後に自動的に設定を試みますが、手動設定が最も確実です。

### トラブルシューティング

フラグを設定してもエラーが出る場合：

1. **ブラウザを完全に閉じて再度開く**
2. **設定ページをリロードして確認**：
   - Settings > Functions > Compatibility Flags に戻る
   - Production と Preview の両方に `nodejs_compat` が表示されているか確認
3. **新しいデプロイを実行**：
   - フラグを設定した後、GitHub Actionsで新しいデプロイを実行
4. **APIで確認**（上級者向け）：
   ```bash
   curl -X GET "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/pages/projects/YOUR_PROJECT_NAME" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json" | grep -A 10 "compatibility_flags"
   ```
   レスポンスに `"compatibility_flags":["nodejs_compat"]` が含まれているか確認

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

### 500 Internal Server Error

エラーメッセージ: `500 Internal Server Error`

**これは進展です！** `nodejs_compat`フラグが適用され、Node.js互換性の問題は解決されています。500エラーはアプリケーション側の問題です。

**確認すべきこと**:

1. **Cloudflare Pagesのログを確認**：
   - Cloudflareダッシュボード > Pages > プロジェクト名
   - 「Deployments」タブを開く
   - 最新のデプロイをクリック
   - 「View Logs」または「Functions」セクションでエラーログを確認

2. **環境変数が正しく設定されているか確認**：
   - Settings > Environment variables
   - すべての必須環境変数が設定されているか確認
   - Production と Preview の両方に設定されているか確認

3. **よくある原因**：
   - 環境変数の値が間違っている
   - SupabaseやMicroCMSへの接続エラー
   - データベースの接続エラー
   - APIキーが無効または期限切れ

4. **デプロイログを確認**（GitHub Actions）：
   - GitHubリポジトリ > Actions
   - 最新のデプロイワークフローを確認
   - ビルドやデプロイ中にエラーが出ていないか確認


