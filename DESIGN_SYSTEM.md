# デザインシステム

このプロジェクトのデザインシステムは、**Swiss Brutalism** スタイルに基づいた一貫性のあるUIコンポーネントライブラリです。

## ディレクトリ構造

```
app/components/ui/
├── Button.tsx          # ボタンコンポーネント
├── Input.tsx           # テキスト入力フィールド
├── Textarea.tsx        # テキストエリア
├── Typography.tsx      # タイポグラフィコンポーネント
├── Card.tsx            # カードコンポーネント
├── Alert.tsx           # アラートメッセージ
├── Link.tsx            # リンクコンポーネント
├── Badge.tsx           # バッジコンポーネント
├── index.ts            # 一括エクスポート
└── README.md           # 詳細ドキュメント
```

## クイックスタート

### インストール

必要な依存関係は既にインストール済みです：

```bash
npm install clsx tailwind-merge
```

### 基本的な使用例

```tsx
import { Button, Input, Typography } from '@/app/components/ui'

export default function Example() {
  return (
    <div className="space-y-component">
      <Typography variant="heading-lg">タイトル</Typography>
      
      <Input
        label="メールアドレス"
        type="email"
        placeholder="example@email.com"
      />
      
      <Button>送信</Button>
    </div>
  )
}
```

## デザイントークン

### カラーシステム

セマンティックなカラーパレットを使用：

- **背景色**: `sys-bg-base`, `sys-bg-surface`
- **テキスト色**: `sys-text-primary`, `sys-text-secondary`, `sys-text-disabled`
- **ボーダー色**: `sys-border-hairline`, `sys-border-focus`

### タイポグラフィスケール

7段階のタイポグラフィスケール：

1. **Display Large** (72px) - ヒーローセクション
2. **Display Medium** (60px) - 大きな見出し
3. **Heading Large** (36px) - セクション見出し
4. **Heading Medium** (24px) - サブセクション見出し
5. **Body Large** (18px) - 強調本文
6. **Body Medium** (16px) - 標準本文
7. **Caption** (12px) - ラベル・キャプション

### スペーシングシステム

3段階のスペーシング：

- `block` (4px) - 最小単位
- `component` (8px) - コンポーネント間
- `section` (80px) - セクション間

## コンポーネント一覧

| コンポーネント | 説明 | 主要なProps |
|--------------|------|------------|
| **Button** | ボタン | `variant`, `size`, `isLoading` |
| **Input** | テキスト入力 | `label`, `error` |
| **Textarea** | テキストエリア | `label`, `error` |
| **Typography** | タイポグラフィ | `variant`, `color`, `as` |
| **Card** | カード | `variant` |
| **Alert** | アラート | `variant` |
| **Link** | リンク | `href`, `variant` |
| **Badge** | バッジ | `variant` |

詳細は [`app/components/ui/README.md`](./app/components/ui/README.md) を参照してください。

## デザイン原則

### 1. ミニマリズム

装飾を最小限に抑え、機能性を優先します。

### 2. 一貫性

すべてのコンポーネントは統一されたデザイントークンを使用します。

### 3. アクセシビリティ

- キーボードナビゲーションのサポート
- 適切なフォーカス管理
- セマンティックHTMLの使用

### 4. 拡張性

`className`プロップでカスタマイズ可能で、既存のスタイルを上書きできます。

## グリッドシステム

レスポンシブグリッドシステム：

```tsx
<div className="grid-mobile md:grid-tablet lg:grid-desktop">
  <div className="col-span-4 md:col-span-6 lg:col-span-6">
    {/* コンテンツ */}
  </div>
</div>
```

- **Mobile**: 4カラム
- **Tablet**: 8カラム
- **Desktop**: 12カラム（最大幅1280px）

## 既存コンポーネントの移行

既存のコンポーネントを新しいデザインシステムに移行する際は、以下のパターンに従ってください：

### Before

```tsx
<button className="border border-sys-border-hairline text-sys-text-primary px-4 py-2 hover:border-sys-border-focus">
  クリック
</button>
```

### After

```tsx
import { Button } from '@/app/components/ui'

<Button>クリック</Button>
```

## カスタマイズ

### Tailwind設定の拡張

`tailwind.config.js`でデザイントークンを追加・変更できます：

```js
theme: {
  extend: {
    colors: {
      'sys-bg-base': '#F9FAFB',
      // 新しいカラーを追加
    },
  },
}
```

### コンポーネントの拡張

各コンポーネントは`className`でカスタマイズ可能：

```tsx
<Button className="w-full bg-custom-color">
  カスタムボタン
</Button>
```

## ベストプラクティス

1. **コンポーネントを優先**: インラインスタイルではなく、UIコンポーネントを使用
2. **デザイントークンを使用**: ハードコードされた値ではなく、トークンを使用
3. **一貫性を保つ**: 既存のパターンに従う
4. **アクセシビリティを考慮**: キーボードナビゲーションとフォーカス管理を適切に実装

## 参考資料

- [UIコンポーネント詳細ドキュメント](./app/components/ui/README.md)
- [Tailwind CSS設定](./tailwind.config.js)
- [グローバルスタイル](./app/globals.css)

