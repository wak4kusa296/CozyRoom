# デバッグ手順

## 1. Cloudflare Pagesの互換性フラグを確認

1. https://dash.cloudflare.com/ にアクセス
2. **Workers & Pages** > **cozyroom** を選択
3. **Settings** > **Functions** を開く
4. **Compatibility Flags** セクションを探す
5. スクリーンショットを撮ってください

**確認事項:**
- Production compatibility flags に `nodejs_compat` が入っているか
- Preview compatibility flags に `nodejs_compat` が入っているか

## 2. ビルド設定を確認

1. **Settings** > **Builds & deployments** を開く
2. スクリーンショットを撮ってください

**確認事項:**
- Build command: `npm run pages:build`
- Build output directory: `.vercel/output/static`
- Framework preset: Next.js

## 3. ビルドログを確認

1. **Deployments** タブを開く
2. 最新のデプロイをクリック
3. **View build logs** を開く
4. 以下のメッセージを探す:
   - `✅ Prerendering (0 initial routes)` (良い)
   - `⚡️ Completed @cloudflare/next-on-pages` (良い)
   - `ERROR` や `Warning` (悪い - 内容を報告してください)

## 4. 実行時ログを確認

1. デプロイページで **Logs** または **Real-time Logs** タブを開く
2. サイトにアクセス: https://cozyroom-k4p.pages.dev/test
3. ログに表示されるエラーメッセージをすべてコピーしてください

**探すべきログ:**
- `Error:`
- `Exception:`
- `Failed to`
- Stack trace

## 5. 簡易テスト - 静的ページ

もし上記で問題が見つからない場合、完全に静的なページをテストします:

`app/static-test/page.tsx` を作成（すでに作成します）

## 報告してください

以下の情報を報告してください:
1. 互換性フラグの設定（スクリーンショット）
2. ビルド設定（スクリーンショット）
3. ビルドログの最後の50行
4. 実行時ログ（`/test` にアクセスしたときのログ）

