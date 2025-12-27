# MicroCMS セットアップガイド

## エラー: MicroCMS API Error: 404

このエラーは、MicroCMSのAPIエンドポイントが見つからない場合に発生します。

## 解決方法

### ステップ1: MicroCMSでAPIエンドポイントを作成

1. [MicroCMS Dashboard](https://app.microcms.io) にログイン
2. サービスを選択（または新規作成）
3. **API設定** → **新規API作成** をクリック
4. 以下の設定で作成：
   - **API名**: `blog` （重要: この名前がエンドポイント名になります）
   - **API ID**: `blog` （自動生成されます）
   - **説明**: 任意

### ステップ2: フィールドの設定

記事に必要なフィールドを追加：

1. **タイトル** (title)
   - 種類: テキストフィールド
   - 必須: はい

2. **本文** (content)
   - 種類: リッチエディタ
   - 必須: はい

3. **公開日** (publishedAt)
   - 種類: 日時
   - 必須: はい

4. **アイキャッチ画像** (eyecatch) - オプション
   - 種類: 画像
   - 必須: いいえ

### ステップ3: 環境変数の確認

`.env.local` に以下が正しく設定されているか確認：

```env
MICROCMS_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROCMS_SERVICE_DOMAIN=your-service-name
```

**取得方法**:
1. MicroCMS Dashboard → 設定 → API設定
2. **APIキー** をコピー → `MICROCMS_API_KEY`
3. **サービスドメイン**（URLのサブドメイン部分）をコピー → `MICROCMS_SERVICE_DOMAIN`

例：
- URLが `https://your-service-name.microcms.io` の場合
- `MICROCMS_SERVICE_DOMAIN=your-service-name`

### ステップ4: エンドポイント名の確認

現在のコードは `/blog` エンドポイントを想定しています。

もし異なるエンドポイント名を使用する場合、`libs/microcms.ts` を編集：

```typescript
// 例: エンドポイント名が "posts" の場合
const API_BASE_URL = `https://${MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1`
// 使用箇所を "blog" から "posts" に変更
```

### ステップ5: テスト記事の作成

1. MicroCMS Dashboard → **コンテンツ管理** → **blog**
2. **新規作成** をクリック
3. タイトルと本文を入力
4. **公開** をクリック

### ステップ6: 動作確認

開発サーバーを再起動：

```bash
npm run dev
```

ブラウザで http://localhost:3001/blog にアクセスして、記事が表示されるか確認してください。

## トラブルシューティング

### エラー: "MicroCMS API エンドポイントが見つかりません"

**原因**: 
- APIエンドポイント名が "blog" ではない
- 環境変数 `MICROCMS_SERVICE_DOMAIN` が間違っている

**解決方法**:
1. MicroCMS DashboardでAPIエンドポイント名を確認
2. `libs/microcms.ts` の `/blog` を実際のエンドポイント名に変更
3. 環境変数を再確認

### エラー: "MicroCMS API Error: 401"

**原因**: APIキーが間違っている、または権限が不足している

**解決方法**:
1. MicroCMS Dashboard → 設定 → API設定
2. APIキーを再確認
3. `.env.local` の `MICROCMS_API_KEY` を更新
4. 開発サーバーを再起動

### エラー: "MicroCMS API Error: 403"

**原因**: APIキーの権限が不足している

**解決方法**:
1. MicroCMS Dashboard → 設定 → API設定
2. APIキーの権限を確認（読み取り権限が必要）
3. 必要に応じて新しいAPIキーを作成

## よくある質問

### Q: エンドポイント名を変更できますか？

A: はい。`libs/microcms.ts` の以下の箇所を変更してください：
- `getArticles()` 関数内の `/blog`
- `getArticleById()` 関数内の `/blog`
- `getAllArticleIds()` 関数内の `/blog`

### Q: 複数のエンドポイントを使用できますか？

A: はい。各エンドポイント用の関数を作成するか、エンドポイント名をパラメータ化してください。

### Q: 開発環境でMicroCMSを使わずに動作確認したい

A: `app/blog/page.tsx` でエラーハンドリングを追加しているため、エラーが表示されますが、アプリケーションは動作します。ダミーデータを返すようにすることもできます。







