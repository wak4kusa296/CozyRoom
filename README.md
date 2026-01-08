# 画像フィルター調整システム

![xBRZ](https://img.shields.io/badge/xBRZ-Scaler-blue)
![Kuwahara](https://img.shields.io/badge/Kuwahara-Filter-green)
![Rough](https://img.shields.io/badge/Rough-Filter-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

**xBRZ × Kuwahara × ラフフィルター**を重ね掛けできる画像調整システムです。

## 🌟 特徴

- **xBRZフィルター**: [xBRjs](https://github.com/joseprio/xBRjs) (MIT License) を使用した本格的なピクセルアートスケーリング
- **Kuwaharaフィルター**: 絵画風効果を生成する非線形フィルター
- **ラフフィルター**: 画像に粗さ・質感を追加するフィルター
- **モダンなUI**: ダークテーマで使いやすいインターフェース
- **レスポンシブデザイン**: PC・タブレット・スマートフォンに対応
- **完全クライアントサイド**: プライバシー保護、サーバー不要

## 🚀 使い方

### 1. 画像をアップロード

- ファイルをドラッグ&ドロップ
- またはアップロードエリアをクリックしてファイルを選択

### 2. フィルターを設定

各フィルターを個別に有効/無効にでき、パラメータを調整できます：

- **xBRZフィルター**: 拡大倍率（2倍、3倍、4倍）
- **Kuwaharaフィルター**: ウィンドウサイズ、強度
- **ラフフィルター**: 粗さ、ノイズサイズ、コントラスト

### 3. 処理を実行

「処理を実行」ボタンをクリックすると、フィルターが順番に適用されます。

### 4. 結果をダウンロード

処理後の画像をPNG形式でダウンロードできます。

## 📁 ファイル構成

```
CozyRoom/
├── index.html          # メインHTMLファイル
├── style.css           # スタイルシート
├── filters.js          # フィルター実装（xBRZ、Kuwahara、ラフ）
├── app.js              # アプリケーションロジック
└── README.md           # このファイル
```

## 🎨 フィルター詳細

### xBRZフィルター

ピクセルアート専用の高品質スケーリングアルゴリズムです。

- **拡大倍率**: 2倍、3倍、4倍に対応
- **ライブラリ**: [xBRjs](https://github.com/joseprio/xBRjs) (MIT License)
- **最適な用途**: ドット絵、ピクセルアート、レトロゲームのスクリーンショット

### Kuwaharaフィルター

エッジを保持しながらノイズを低減し、絵画風の効果を生成します。

- **ウィンドウサイズ**: 3～21（奇数）
- **強度**: 0～100%
- **最適な用途**: 写真、イラスト、アーティスティックな効果

### ラフフィルター

画像に粗さや質感を追加します。

- **粗さ**: 0～100
- **ノイズサイズ**: 1～10
- **コントラスト**: 0～100%
- **最適な用途**: テクスチャ追加、手描き風効果

## 🛠️ 技術スタック

- **HTML5**: Canvas API、File API
- **CSS3**: CSS Grid、Flexbox、CSS変数
- **JavaScript (ES6+)**: Vanilla JavaScript
- **xBRjs**: ピクセルアートスケーリングライブラリ

## 🌐 ブラウザ互換性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 ライセンス

MIT License

### 使用ライブラリ

- **[xBRjs](https://github.com/joseprio/xBRjs)**
  - Copyright (c) 2020 Josep del Rio
  - MIT License

## 🙏 謝辞

- **[xBRjs](https://github.com/joseprio/xBRjs)** - xBRZフィルター実装（MIT License）
- **[pixel-scaler](https://github.com/irokaru/pixel-scaler)** - 実装の参考にさせていただきました

---

**Note**: このアプリケーションはクライアントサイドで完全に動作します。画像はサーバーにアップロードされません。
