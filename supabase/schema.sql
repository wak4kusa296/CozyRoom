-- ============================================
-- CozyRoom Database Schema
-- ============================================

-- 1. users テーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invitation_code TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- invitation_code にインデックスを追加
CREATE INDEX IF NOT EXISTS idx_users_invitation_code ON users(invitation_code);

-- 2. comments テーブル
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 検索用インデックス
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- 3. push_subscriptions テーブル (将来的なWebプッシュ用)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- ============================================
-- Row Level Security (RLS) ポリシー
-- ============================================

-- RLS を有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- users テーブルのRLSポリシー
-- ============================================

-- 全員が自分の情報を読み取れる
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 全員が自分の情報を更新できる
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- サービスロールのみが新規ユーザーを作成できる（招待コード認証時に使用）
-- 注意: 実際の認証はアプリケーション側で行うため、このポリシーは参考用
-- 通常はアプリケーション側のServer Actionsで直接INSERTする

-- ============================================
-- comments テーブルのRLSポリシー
-- ============================================

-- 一般ユーザー: 自分の投稿と自分宛ての管理人からの返信のみ表示
-- 管理人: 全員のコメントを表示
CREATE POLICY "Users can read own comments and admin replies"
  ON comments FOR SELECT
  USING (
    -- 自分のコメント
    user_id = auth.uid()
    OR
    -- 自分宛ての管理人からの返信（parent_idが自分のコメントID）
    (
      parent_id IN (
        SELECT id FROM comments WHERE user_id = auth.uid()
      )
      AND EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = comments.user_id 
        AND users.role = 'admin'
      )
    )
    OR
    -- 管理人は全員のコメントを閲覧可能
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 認証済みユーザーはコメントを投稿できる
CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のコメントを更新できる
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- ユーザーは自分のコメントを削除できる
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- push_subscriptions テーブルのRLSポリシー
-- ============================================

-- ユーザーは自分のプッシュ購読情報を読み取れる
CREATE POLICY "Users can read own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分のプッシュ購読情報を追加できる
CREATE POLICY "Users can insert own push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のプッシュ購読情報を削除できる
CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 関数: updated_at の自動更新
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at トリガーを各テーブルに追加
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 初期データ（オプション）
-- ============================================

-- 管理人の招待コード: A21DC087
-- 注意: このSQLを実行する前に、supabase/init_admin.sql を参照してください
-- INSERT INTO users (name, invitation_code, role) 
-- VALUES ('管理人', 'A21DC087', 'admin')
-- ON CONFLICT (invitation_code) DO UPDATE
-- SET name = EXCLUDED.name,
--     role = EXCLUDED.role;

