import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMockAuth } from "./MockAuthContext";

interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  invite_code: string;
  allow_members_edit_settings: boolean;
  allow_members_pin_messages: boolean;
  allow_members_send_messages: boolean;
  allow_members_add_others: boolean;
  require_moderator_approval: boolean;
  created_at: string;
}

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  is_admin: boolean;
  is_moderator: boolean;
  can_edit_settings: boolean;
  can_ban_members: boolean;
  can_kick_members: boolean;
  is_banned: boolean;
  joined_at: string;
}

interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Friend {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

interface MockProfile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
}

interface MockDataContextType {
  // Groups
  groups: Group[];
  createGroup: (data: Omit<Group, "id" | "created_at" | "invite_code">) => Group;
  updateGroup: (id: string, data: Partial<Group>) => void;
  getGroupById: (id: string) => Group | undefined;
  getGroupByInviteCode: (code: string) => Group | undefined;
  
  // Group Members
  groupMembers: GroupMember[];
  addGroupMember: (data: Omit<GroupMember, "id" | "joined_at">) => GroupMember;
  updateGroupMember: (id: string, data: Partial<GroupMember>) => void;
  removeGroupMember: (id: string) => void;
  getGroupMembers: (groupId: string) => GroupMember[];
  getUserMembership: (groupId: string, userId: string) => GroupMember | undefined;
  
  // Group Messages
  groupMessages: GroupMessage[];
  sendGroupMessage: (groupId: string, content: string) => GroupMessage | null;
  getGroupMessages: (groupId: string) => GroupMessage[];
  
  // Friends
  friends: Friend[];
  sendFriendRequest: (receiverId: string) => Friend | null;
  acceptFriendRequest: (requestId: string) => void;
  getFriends: () => MockProfile[];
  
  // Profiles
  profiles: MockProfile[];
  getProfile: (userId: string) => MockProfile | undefined;
  updateMyProfile: (data: Partial<MockProfile>) => void;
  searchProfiles: (query: string) => MockProfile[];
}

const MockDataContext = createContext<MockDataContextType | null>(null);

const GROUPS_KEY = "mock_groups";
const GROUP_MEMBERS_KEY = "mock_group_members";
const GROUP_MESSAGES_KEY = "mock_group_messages";
const FRIENDS_KEY = "mock_friends";
const PROFILES_KEY = "mock_profiles";

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function MockDataProvider({ children }: { children: ReactNode }) {
  const { user } = useMockAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [profiles, setProfiles] = useState<MockProfile[]>([]);

  // Load data from localStorage
  useEffect(() => {
    setGroups(JSON.parse(localStorage.getItem(GROUPS_KEY) || "[]"));
    setGroupMembers(JSON.parse(localStorage.getItem(GROUP_MEMBERS_KEY) || "[]"));
    setGroupMessages(JSON.parse(localStorage.getItem(GROUP_MESSAGES_KEY) || "[]"));
    setFriends(JSON.parse(localStorage.getItem(FRIENDS_KEY) || "[]"));
    setProfiles(JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]"));
  }, []);

  // Sync current user to profiles
  useEffect(() => {
    if (user) {
      const existingProfile = profiles.find((p) => p.id === user.id);
      if (!existingProfile) {
        const newProfile: MockProfile = {
          id: user.id,
          username: user.username,
          avatar_url: user.avatar_url,
        };
        const updatedProfiles = [...profiles, newProfile];
        setProfiles(updatedProfiles);
        localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles));
      }
    }
  }, [user, profiles]);

  const saveGroups = (data: Group[]) => {
    setGroups(data);
    localStorage.setItem(GROUPS_KEY, JSON.stringify(data));
  };

  const saveGroupMembers = (data: GroupMember[]) => {
    setGroupMembers(data);
    localStorage.setItem(GROUP_MEMBERS_KEY, JSON.stringify(data));
  };

  const saveGroupMessages = (data: GroupMessage[]) => {
    setGroupMessages(data);
    localStorage.setItem(GROUP_MESSAGES_KEY, JSON.stringify(data));
  };

  const saveFriends = (data: Friend[]) => {
    setFriends(data);
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(data));
  };

  const saveProfiles = (data: MockProfile[]) => {
    setProfiles(data);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(data));
  };

  // Group functions
  const createGroup = (data: Omit<Group, "id" | "created_at" | "invite_code">): Group => {
    const newGroup: Group = {
      ...data,
      id: crypto.randomUUID(),
      invite_code: generateInviteCode(),
      created_at: new Date().toISOString(),
    };
    saveGroups([...groups, newGroup]);
    return newGroup;
  };

  const updateGroup = (id: string, data: Partial<Group>) => {
    const updated = groups.map((g) => (g.id === id ? { ...g, ...data } : g));
    saveGroups(updated);
  };

  const getGroupById = (id: string) => groups.find((g) => g.id === id);

  const getGroupByInviteCode = (code: string) => groups.find((g) => g.invite_code === code);

  // Group Member functions
  const addGroupMember = (data: Omit<GroupMember, "id" | "joined_at">): GroupMember => {
    const newMember: GroupMember = {
      ...data,
      id: crypto.randomUUID(),
      joined_at: new Date().toISOString(),
    };
    saveGroupMembers([...groupMembers, newMember]);
    return newMember;
  };

  const updateGroupMember = (id: string, data: Partial<GroupMember>) => {
    const updated = groupMembers.map((m) => (m.id === id ? { ...m, ...data } : m));
    saveGroupMembers(updated);
  };

  const removeGroupMember = (id: string) => {
    saveGroupMembers(groupMembers.filter((m) => m.id !== id));
  };

  const getGroupMembers = (groupId: string) =>
    groupMembers.filter((m) => m.group_id === groupId && !m.is_banned);

  const getUserMembership = (groupId: string, userId: string) =>
    groupMembers.find((m) => m.group_id === groupId && m.user_id === userId);

  // Group Message functions
  const sendGroupMessage = (groupId: string, content: string): GroupMessage | null => {
    if (!user) return null;
    const newMessage: GroupMessage = {
      id: crypto.randomUUID(),
      group_id: groupId,
      sender_id: user.id,
      content,
      created_at: new Date().toISOString(),
    };
    saveGroupMessages([...groupMessages, newMessage]);
    return newMessage;
  };

  const getGroupMessages = (groupId: string) =>
    groupMessages.filter((m) => m.group_id === groupId).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  // Friend functions
  const sendFriendRequest = (receiverId: string): Friend | null => {
    if (!user) return null;
    const existing = friends.find(
      (f) =>
        (f.sender_id === user.id && f.receiver_id === receiverId) ||
        (f.sender_id === receiverId && f.receiver_id === user.id)
    );
    if (existing) return null;

    const newRequest: Friend = {
      id: crypto.randomUUID(),
      sender_id: user.id,
      receiver_id: receiverId,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    saveFriends([...friends, newRequest]);
    return newRequest;
  };

  const acceptFriendRequest = (requestId: string) => {
    const updated = friends.map((f) =>
      f.id === requestId ? { ...f, status: "accepted" as const } : f
    );
    saveFriends(updated);
  };

  const getFriends = (): MockProfile[] => {
    if (!user) return [];
    const acceptedFriends = friends.filter(
      (f) =>
        f.status === "accepted" &&
        (f.sender_id === user.id || f.receiver_id === user.id)
    );
    const friendIds = acceptedFriends.map((f) =>
      f.sender_id === user.id ? f.receiver_id : f.sender_id
    );
    return profiles.filter((p) => friendIds.includes(p.id));
  };

  // Profile functions
  const getProfile = (userId: string) => profiles.find((p) => p.id === userId);

  const updateMyProfile = (data: Partial<MockProfile>) => {
    if (!user) return;
    const updated = profiles.map((p) =>
      p.id === user.id ? { ...p, ...data } : p
    );
    saveProfiles(updated);
  };

  const searchProfiles = (query: string) =>
    profiles.filter(
      (p) =>
        p.id !== user?.id &&
        p.username.toLowerCase().includes(query.toLowerCase())
    );

  return (
    <MockDataContext.Provider
      value={{
        groups,
        createGroup,
        updateGroup,
        getGroupById,
        getGroupByInviteCode,
        groupMembers,
        addGroupMember,
        updateGroupMember,
        removeGroupMember,
        getGroupMembers,
        getUserMembership,
        groupMessages,
        sendGroupMessage,
        getGroupMessages,
        friends,
        sendFriendRequest,
        acceptFriendRequest,
        getFriends,
        profiles,
        getProfile,
        updateMyProfile,
        searchProfiles,
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error("useMockData must be used within MockDataProvider");
  }
  return context;
}
