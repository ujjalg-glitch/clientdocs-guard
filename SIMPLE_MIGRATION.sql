-- ============================================
-- SIMPLE MIGRATION - No RLS Issues
-- ============================================
-- Run this instead if you haven't run migration yet
-- This version has simplified RLS policies

-- Step 1: Add new columns to files table
ALTER TABLE files 
ADD COLUMN IF NOT EXISTS watermark_text TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Step 2: Create client_groups table
CREATE TABLE IF NOT EXISTS client_groups (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Step 3: Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    group_id TEXT NOT NULL REFERENCES client_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' NOT NULL,
    joined_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT group_members_unique UNIQUE(group_id, user_id)
);

-- Step 4: Create document_shares table
CREATE TABLE IF NOT EXISTS document_shares (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_group_id TEXT REFERENCES client_groups(id) ON DELETE CASCADE,
    access_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP(3),
    max_downloads INTEGER,
    download_count INTEGER DEFAULT 0 NOT NULL,
    watermark_enabled BOOLEAN DEFAULT false NOT NULL,
    view_only BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Step 5: Create access_logs table
CREATE TABLE IF NOT EXISTS access_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    file_id TEXT REFERENCES files(id) ON DELETE CASCADE,
    share_id TEXT REFERENCES document_shares(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    session_id TEXT,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Step 6: Create document_comments table
CREATE TABLE IF NOT EXISTS document_comments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    page_number INTEGER,
    x_position DOUBLE PRECISION,
    y_position DOUBLE PRECISION,
    is_resolved BOOLEAN DEFAULT false NOT NULL,
    parent_comment_id TEXT REFERENCES document_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Step 7: Create next_step_hints table
CREATE TABLE IF NOT EXISTS next_step_hints (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    hint_text TEXT NOT NULL,
    action_type TEXT NOT NULL,
    priority INTEGER DEFAULT 1 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Step 8: Create indexes
CREATE INDEX IF NOT EXISTS idx_document_shares_access_token ON document_shares(access_token);
CREATE INDEX IF NOT EXISTS idx_document_shares_file_id ON document_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_shared_by ON document_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_access_logs_file_id ON access_logs(file_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_document_comments_file_id ON document_comments(file_id);
CREATE INDEX IF NOT EXISTS idx_next_step_hints_file_id ON next_step_hints(file_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_client_groups_created_by ON client_groups(created_by);

-- Step 9: Enable RLS
ALTER TABLE client_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_step_hints ENABLE ROW LEVEL SECURITY;

-- Step 10: Create SIMPLE RLS Policies (no recursion)

-- Client Groups policies
CREATE POLICY "client_groups_select_policy" ON client_groups
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "client_groups_insert_policy" ON client_groups
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "client_groups_update_policy" ON client_groups
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "client_groups_delete_policy" ON client_groups
    FOR DELETE USING (created_by = auth.uid());

-- Group Members policies
CREATE POLICY "group_members_select_policy" ON group_members
    FOR SELECT USING (true);

CREATE POLICY "group_members_insert_policy" ON group_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM client_groups 
            WHERE id = group_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "group_members_delete_policy" ON group_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM client_groups 
            WHERE id = group_id AND created_by = auth.uid()
        )
    );

-- Document Shares policies
CREATE POLICY "document_shares_select_policy" ON document_shares
    FOR SELECT USING (shared_by = auth.uid() OR shared_with = auth.uid());

CREATE POLICY "document_shares_insert_policy" ON document_shares
    FOR INSERT WITH CHECK (shared_by = auth.uid());

CREATE POLICY "document_shares_update_policy" ON document_shares
    FOR UPDATE USING (shared_by = auth.uid());

CREATE POLICY "document_shares_delete_policy" ON document_shares
    FOR DELETE USING (shared_by = auth.uid());

-- Access Logs policies
CREATE POLICY "access_logs_select_policy" ON access_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "access_logs_insert_policy" ON access_logs
    FOR INSERT WITH CHECK (true);

-- Comments policies
CREATE POLICY "document_comments_select_policy" ON document_comments
    FOR SELECT USING (true);

CREATE POLICY "document_comments_insert_policy" ON document_comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "document_comments_update_policy" ON document_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "document_comments_delete_policy" ON document_comments
    FOR DELETE USING (user_id = auth.uid());

-- Hints policies
CREATE POLICY "next_step_hints_select_policy" ON next_step_hints
    FOR SELECT USING (true);

CREATE POLICY "next_step_hints_insert_policy" ON next_step_hints
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "next_step_hints_update_policy" ON next_step_hints
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "next_step_hints_delete_policy" ON next_step_hints
    FOR DELETE USING (created_by = auth.uid());

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '📊 Created 6 new tables with simplified RLS policies';
    RAISE NOTICE '🔒 No infinite recursion issues!';
END $$;

