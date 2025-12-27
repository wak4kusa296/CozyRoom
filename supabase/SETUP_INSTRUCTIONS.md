# Supabase データベースセットアップ手順

## 重要: 実行順序

**必ず以下の順序で実行してください。**

## ステップ1: テーブルとRLSポリシーの作成

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. 左メニューから **SQL Editor** を選択
4. **New query** をクリック
5. `supabase/schema.sql` の**すべての内容**をコピー＆ペースト
6. **RUN** ボタンをクリック（または `Ctrl+Enter` / `Cmd+Enter`）

### 確認

実行が成功すると、以下のテーブルが作成されます：
- `users`
- `comments`
- `push_subscriptions`

また、RLSポリシーも設定されます。

## ステップ2: 管理人の作成

**ステップ1が完了してから**、以下の手順を実行してください。

1. SQL Editorで **New query** をクリック
2. `supabase/init_admin.sql` の内容をコピー＆ペースト
3. **RUN** ボタンをクリック

### 確認

以下のクエリで管理人が作成されたか確認できます：

```sql
SELECT id, name, invitation_code, role, created_at 
FROM users 
WHERE invitation_code = 'A21DC087';
```

## トラブルシューティング

### エラー: "relation 'users' does not exist"

→ **ステップ1を先に実行してください。** `schema.sql` を実行していない可能性があります。

### エラー: "duplicate key value violates unique constraint"

→ 既に同じ招待コードのユーザーが存在します。`ON CONFLICT` 句により更新されますが、問題ありません。

### エラー: "permission denied"

→ RLSポリシーが正しく設定されていない可能性があります。`schema.sql` を再実行してください。

## 実行順序のまとめ

```
1. schema.sql を実行（テーブル作成）
   ↓
2. init_admin.sql を実行（管理人の作成）
   ↓
3. 完了！
```





