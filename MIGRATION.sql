-- Migration: Add Advanced Document Sharing Features
-- Run this if you're using Supabase SQL editor instead of Prisma migrate

-- Add new columns to files table
ALTER TABLE files 
ADD COLUMN IF NOT EXISTS watermark_text TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create client_groups table
CREATE TABLE IF NOT EXISTS client_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES client_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- Create document_shares table
CREATE TABLE IF NOT EXISTS document_shares (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_group_id TEXT REFERENCES client_groups(id) ON DELETE CASCADE,
    access_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP(3),
    max_downloads INTEGER,
    download_count INTEGER DEFAULT 0,
    watermark_enabled BOOLEAN DEFAULT false,
    view_only BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create access_logs table
CREATE TABLE IF NOT EXISTS access_logs (
    id TEXT PRIMARY KEY,
    file_id TEXT REFERENCES files(id) ON DELETE CASCADE,
    share_id TEXT REFERENCES document_shares(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    session_id TEXT,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create document_comments table
CREATE TABLE IF NOT EXISTS document_comments (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    page_number INTEGER,
    x_position DOUBLE PRECISION,
    y_position DOUBLE PRECISION,
    is_resolved BOOLEAN DEFAULT false,
    parent_comment_id TEXT REFERENCES document_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create next_step_hints table
CREATE TABLE IF NOT EXISTS next_step_hints (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    hint_text TEXT NOT NULL,
    action_type TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_shares_access_token ON document_shares(access_token);
CREATE INDEX IF NOT EXISTS idx_document_shares_file_id ON document_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_file_id ON access_logs(file_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_document_comments_file_id ON document_comments(file_id);
CREATE INDEX IF NOT EXISTS idx_next_step_hints_file_id ON next_step_hints(file_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);

-- Add RLS policies (if using Supabase with RLS enabled)

-- Client Groups policies
ALTER TABLE client_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view groups they created or are members of" ON client_groups
    FOR SELECT USING (
        auth.uid() = created_by 
        OR EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create groups" ON client_groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own groups" ON client_groups
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own groups" ON client_groups
    FOR DELETE USING (auth.uid() = created_by);

-- Document Shares policies
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their shared documents" ON document_shares
    FOR SELECT USING (
        auth.uid() = shared_by 
        OR auth.uid() = shared_with
    );

CREATE POLICY "Users can create shares for their files" ON document_shares
    FOR INSERT WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can update their shares" ON document_shares
    FOR UPDATE USING (auth.uid() = shared_by);

CREATE POLICY "Users can delete their shares" ON document_shares
    FOR DELETE USING (auth.uid() = shared_by);

-- Access Logs policies (read-only for owners)
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs for their files" ON access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM files 
            WHERE id = file_id AND uploaded_by = auth.uid()::text
        )
    );

CREATE POLICY "System can insert logs" ON access_logs
    FOR INSERT WITH CHECK (true);

-- Comments policies
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on files they have access to" ON document_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM files 
            WHERE id = file_id AND uploaded_by = auth.uid()::text
        )
    );

CREATE POLICY "Authenticated users can create comments" ON document_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON document_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON document_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Hints policies
ALTER TABLE next_step_hints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view hints for their files" ON next_step_hints
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM files 
            WHERE id = file_id AND uploaded_by = auth.uid()::text
        )
    );

CREATE POLICY "Users can create hints for their files" ON next_step_hints
    FOR INSERT WITH CHECK (
        auth.uid() = created_by
        AND EXISTS (
            SELECT 1 FROM files 
            WHERE id = file_id AND uploaded_by = auth.uid()::text
        )
    );

CREATE POLICY "Users can update their hints" ON next_step_hints
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their hints" ON next_step_hints
    FOR DELETE USING (auth.uid() = created_by);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully! All advanced features tables created.';
END $$;

