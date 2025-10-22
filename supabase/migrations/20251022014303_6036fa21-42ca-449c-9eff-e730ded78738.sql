-- Add description column to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS description text;

-- Add permission settings to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS allow_members_edit_settings boolean DEFAULT false;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS allow_members_pin_messages boolean DEFAULT false;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS allow_members_send_messages boolean DEFAULT true;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS allow_members_add_others boolean DEFAULT false;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS require_moderator_approval boolean DEFAULT false;

-- Add member-specific permissions to group_members
ALTER TABLE group_members ADD COLUMN IF NOT EXISTS can_edit_settings boolean DEFAULT false;
ALTER TABLE group_members ADD COLUMN IF NOT EXISTS can_ban_members boolean DEFAULT false;
ALTER TABLE group_members ADD COLUMN IF NOT EXISTS can_kick_members boolean DEFAULT false;
ALTER TABLE group_members ADD COLUMN IF NOT EXISTS is_moderator boolean DEFAULT false;
ALTER TABLE group_members ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;

-- Create group_invites table for invite links
CREATE TABLE IF NOT EXISTS group_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  invite_code text UNIQUE NOT NULL,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  max_uses integer,
  uses_count integer DEFAULT 0
);

-- Create group_join_requests table for moderated groups
CREATE TABLE IF NOT EXISTS group_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE group_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_join_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_invites
CREATE POLICY "Group members can view invites"
  ON group_invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_invites.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can create invites"
  ON group_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_invites.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.is_admin = true
    )
  );

CREATE POLICY "Group admins can delete invites"
  ON group_invites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_invites.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.is_admin = true
    )
  );

-- RLS Policies for group_join_requests
CREATE POLICY "Users can create join requests"
  ON group_join_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own join requests"
  ON group_join_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Moderators can view join requests"
  ON group_join_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_join_requests.group_id
      AND group_members.user_id = auth.uid()
      AND (group_members.is_admin = true OR group_members.is_moderator = true)
    )
  );

CREATE POLICY "Moderators can update join requests"
  ON group_join_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_join_requests.group_id
      AND group_members.user_id = auth.uid()
      AND (group_members.is_admin = true OR group_members.is_moderator = true)
    )
  );

-- Add trigger for group_join_requests updated_at
CREATE TRIGGER update_group_join_requests_updated_at
  BEFORE UPDATE ON group_join_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();