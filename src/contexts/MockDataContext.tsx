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
const DEMO_INITIALIZED_KEY = "mock_demo_initialized";

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Fake profiles for demo
const FAKE_PROFILES: MockProfile[] = [
  { id: "fake-user-1", username: "Sarah_Johnson", avatar_url: "https://i.pravatar.cc/150?u=sarah", bio: "Love hiking and photography 📸" },
  { id: "fake-user-2", username: "Mike_Chen", avatar_url: "https://i.pravatar.cc/150?u=mike", bio: "Software developer | Coffee addict ☕" },
  { id: "fake-user-3", username: "Emma_Wilson", avatar_url: "https://i.pravatar.cc/150?u=emma", bio: "Music enthusiast 🎵" },
  { id: "fake-user-4", username: "Alex_Turner", avatar_url: "https://i.pravatar.cc/150?u=alex", bio: "Gamer and tech lover 🎮" },
  { id: "fake-user-5", username: "Lisa_Park", avatar_url: "https://i.pravatar.cc/150?u=lisa", bio: "Travel blogger ✈️" },
];

const DEMO_GROUP_ID = "demo-group-123";

function createDemoData(userId: string) {
  const demoGroup: Group = {
    id: DEMO_GROUP_ID,
    name: "Friends Hangout",
    description: "A place to chat with friends and share fun moments! 🎉",
    avatar_url: "https://i.pravatar.cc/150?u=group",
    created_by: "fake-user-1",
    invite_code: "DEMO1234",
    allow_members_edit_settings: false,
    allow_members_pin_messages: true,
    allow_members_send_messages: true,
    allow_members_add_others: true,
    require_moderator_approval: false,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const demoMembers: GroupMember[] = [
    { id: "member-1", group_id: DEMO_GROUP_ID, user_id: "fake-user-1", is_admin: true, is_moderator: true, can_edit_settings: true, can_ban_members: true, can_kick_members: true, is_banned: false, joined_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "member-2", group_id: DEMO_GROUP_ID, user_id: "fake-user-2", is_admin: false, is_moderator: true, can_edit_settings: true, can_ban_members: false, can_kick_members: true, is_banned: false, joined_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "member-3", group_id: DEMO_GROUP_ID, user_id: "fake-user-3", is_admin: false, is_moderator: false, can_edit_settings: false, can_ban_members: false, can_kick_members: false, is_banned: false, joined_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "member-4", group_id: DEMO_GROUP_ID, user_id: "fake-user-4", is_admin: false, is_moderator: false, can_edit_settings: false, can_ban_members: false, can_kick_members: false, is_banned: false, joined_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "member-5", group_id: DEMO_GROUP_ID, user_id: "fake-user-5", is_admin: false, is_moderator: false, can_edit_settings: false, can_ban_members: false, can_kick_members: false, is_banned: false, joined_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "member-current", group_id: DEMO_GROUP_ID, user_id: userId, is_admin: false, is_moderator: false, can_edit_settings: false, can_ban_members: false, can_kick_members: false, is_banned: false, joined_at: new Date().toISOString() },
  ];

  const now = Date.now();
  const demoMessages: GroupMessage[] = [
    { id: "msg-1", group_id: DEMO_GROUP_ID, sender_id: "fake-user-1", content: "Hey everyone! Welcome to the group! 👋", created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString() },
    { id: "msg-2", group_id: DEMO_GROUP_ID, sender_id: "fake-user-2", content: "Thanks for creating this Sarah! This is gonna be fun 🎉", created_at: new Date(now - 1.9 * 60 * 60 * 1000).toISOString() },
    { id: "msg-3", group_id: DEMO_GROUP_ID, sender_id: "fake-user-3", content: "Hi all! What are we planning for this weekend?", created_at: new Date(now - 1.8 * 60 * 60 * 1000).toISOString() },
    { id: "msg-4", group_id: DEMO_GROUP_ID, sender_id: "fake-user-4", content: "I was thinking maybe we could do a game night? 🎮", created_at: new Date(now - 1.5 * 60 * 60 * 1000).toISOString() },
    { id: "msg-5", group_id: DEMO_GROUP_ID, sender_id: "fake-user-5", content: "That sounds awesome! Count me in!", created_at: new Date(now - 1.2 * 60 * 60 * 1000).toISOString() },
    { id: "msg-6", group_id: DEMO_GROUP_ID, sender_id: "fake-user-1", content: "Game night sounds perfect! Should we do it at my place?", created_at: new Date(now - 1 * 60 * 60 * 1000).toISOString() },
    { id: "msg-7", group_id: DEMO_GROUP_ID, sender_id: "fake-user-2", content: "Works for me! I'll bring some snacks 🍕", created_at: new Date(now - 45 * 60 * 1000).toISOString() },
    { id: "msg-8", group_id: DEMO_GROUP_ID, sender_id: "fake-user-3", content: "I can bring drinks!", created_at: new Date(now - 30 * 60 * 1000).toISOString() },
    { id: "msg-9", group_id: DEMO_GROUP_ID, sender_id: "fake-user-4", content: "Let's set up a tournament! Winner gets bragging rights 😎", created_at: new Date(now - 15 * 60 * 1000).toISOString() },
    { id: "msg-10", group_id: DEMO_GROUP_ID, sender_id: "fake-user-5", content: "You're on! I've been practicing 💪", created_at: new Date(now - 5 * 60 * 1000).toISOString() },
  ];

  const demoFriends: Friend[] = FAKE_PROFILES.map((profile, index) => ({
    id: `friend-${index}`,
    sender_id: profile.id,
    receiver_id: userId,
    status: "accepted" as const,
    created_at: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
  }));

  return { demoGroup, demoMembers, demoMessages, demoFriends };
}

export function MockDataProvider({ children }: { children: ReactNode }) {
  const { user } = useMockAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [profiles, setProfiles] = useState<MockProfile[]>([]);

  // Load data from localStorage and initialize demo data
  useEffect(() => {
    const storedGroups = JSON.parse(localStorage.getItem(GROUPS_KEY) || "[]");
    const storedMembers = JSON.parse(localStorage.getItem(GROUP_MEMBERS_KEY) || "[]");
    const storedMessages = JSON.parse(localStorage.getItem(GROUP_MESSAGES_KEY) || "[]");
    const storedFriends = JSON.parse(localStorage.getItem(FRIENDS_KEY) || "[]");
    const storedProfiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]");
    
    // Always ensure fake profiles exist
    const existingFakeIds = storedProfiles.map((p: MockProfile) => p.id);
    const missingFakeProfiles = FAKE_PROFILES.filter(fp => !existingFakeIds.includes(fp.id));
    const updatedProfiles = [...storedProfiles, ...missingFakeProfiles];
    
    setGroups(storedGroups);
    setGroupMembers(storedMembers);
    setGroupMessages(storedMessages);
    setFriends(storedFriends);
    setProfiles(updatedProfiles);
    
    if (missingFakeProfiles.length > 0) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles));
    }
  }, []);

  // Initialize demo data when user logs in
  useEffect(() => {
    if (user) {
      const demoInitialized = localStorage.getItem(DEMO_INITIALIZED_KEY);
      if (!demoInitialized) {
        const { demoGroup, demoMembers, demoMessages, demoFriends } = createDemoData(user.id);
        
        // Add demo group if not exists
        const existingGroup = groups.find(g => g.id === DEMO_GROUP_ID);
        if (!existingGroup) {
          const newGroups = [...groups, demoGroup];
          setGroups(newGroups);
          localStorage.setItem(GROUPS_KEY, JSON.stringify(newGroups));
        }
        
        // Add demo members
        const existingMemberIds = groupMembers.map(m => m.id);
        const newMembers = demoMembers.filter(m => !existingMemberIds.includes(m.id));
        if (newMembers.length > 0) {
          const updatedMembers = [...groupMembers, ...newMembers];
          setGroupMembers(updatedMembers);
          localStorage.setItem(GROUP_MEMBERS_KEY, JSON.stringify(updatedMembers));
        }
        
        // Add demo messages
        const existingMsgIds = groupMessages.map(m => m.id);
        const newMessages = demoMessages.filter(m => !existingMsgIds.includes(m.id));
        if (newMessages.length > 0) {
          const updatedMessages = [...groupMessages, ...newMessages];
          setGroupMessages(updatedMessages);
          localStorage.setItem(GROUP_MESSAGES_KEY, JSON.stringify(updatedMessages));
        }
        
        // Add demo friends
        const existingFriendIds = friends.map(f => f.id);
        const newFriends = demoFriends.filter(f => !existingFriendIds.includes(f.id));
        if (newFriends.length > 0) {
          const updatedFriends = [...friends, ...newFriends];
          setFriends(updatedFriends);
          localStorage.setItem(FRIENDS_KEY, JSON.stringify(updatedFriends));
        }
        
        localStorage.setItem(DEMO_INITIALIZED_KEY, "true");
      }
    }
  }, [user, groups, groupMembers, groupMessages, friends]);

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
