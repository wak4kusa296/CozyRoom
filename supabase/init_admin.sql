-- ============================================
-- 初期管理人の作成
-- ============================================
-- このSQLをSupabaseのSQL Editorで実行してください

-- 管理人の招待コード: admin
INSERT INTO users (name, invitation_code, role) 
VALUES ('管理人', 'admin', 'admin')
ON CONFLICT (invitation_code) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role;

-- 確認用: 作成されたユーザーを確認
SELECT id, name, invitation_code, role, created_at 
FROM users 
WHERE invitation_code = 'admin';

