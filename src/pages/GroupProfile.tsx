import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Image as ImageIcon,
  File,
  Music,
  Video,
  Search,
  MoreVertical,
  Shield,
  UserX,
  Crown,
  Settings as SettingsIcon,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GroupInfo {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  member_count: number;
  is_admin: boolean;
}

interface Member {
  id: string;
  user_id: string;
  is_admin: boolean;
  is_moderator: boolean;
  can_edit_settings: boolean;
  can_ban_members: boolean;
  can_kick_members: boolean;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

const GroupProfile = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!groupId) return;
    fetchGroupInfo();
    fetchMembers();
  }, [groupId, currentUserId]);

  const fetchGroupInfo = async () => {
    const { data: group } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (!group) return;

    const { data: members } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", groupId);

    const { data: currentMember } = await supabase
      .from("group_members")
      .select("is_admin")
      .eq("group_id", groupId)
      .eq("user_id", currentUserId)
      .single();

    setGroupInfo({
      id: group.id,
      name: group.name,
      description: group.description,
      avatar_url: group.avatar_url,
      member_count: members?.length || 0,
      is_admin: currentMember?.is_admin || false,
    });

    setEditName(group.name);
    setEditDescription(group.description || "");
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("group_members")
      .select(
        `
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `
      )
      .eq("group_id", groupId)
      .eq("is_banned", false);

    if (data) {
      setMembers(data as any);
    }
  };

  const handleKickMember = async (memberId: string) => {
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Member removed from group" });
    fetchMembers();
    fetchGroupInfo();
  };

  const handleBanMember = async (memberId: string) => {
    const { error } = await supabase
      .from("group_members")
      .update({ is_banned: true })
      .eq("id", memberId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to ban member",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Member banned from group" });
    fetchMembers();
  };

  const handlePromoteMember = async (
    memberId: string,
    permission: string,
    value: boolean
  ) => {
    const { error } = await supabase
      .from("group_members")
      .update({ [permission]: value })
      .eq("id", memberId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Permissions updated" });
    fetchMembers();
  };

  const handleUpdateGroup = async () => {
    const { error } = await supabase
      .from("groups")
      .update({
        name: editName,
        description: editDescription,
      })
      .eq("id", groupId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update group",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Success", description: "Group updated successfully" });
    setIsEditDialogOpen(false);
    fetchGroupInfo();
  };

  const filteredMembers = members.filter((member) =>
    member.profiles.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!groupInfo) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/group/${groupId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Group Profile</h1>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={groupInfo.avatar_url} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                {groupInfo.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{groupInfo.name}</h2>
              {groupInfo.description && (
                <p className="text-muted-foreground mt-1">
                  {groupInfo.description}
                </p>
              )}
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
                <Users className="h-4 w-4" />
                <span>{groupInfo.member_count} members</span>
              </div>
            </div>
            {groupInfo.is_admin && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    Edit Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Group Name</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleUpdateGroup} className="w-full">
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="media">
                <ImageIcon className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="files">
                <File className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="audio">
                <Music className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="video">
                <Video className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="members">
                <Users className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="media" className="space-y-2">
              <p className="text-center text-muted-foreground py-8">
                No images yet
              </p>
            </TabsContent>

            <TabsContent value="files" className="space-y-2">
              <p className="text-center text-muted-foreground py-8">
                No files yet
              </p>
            </TabsContent>

            <TabsContent value="audio" className="space-y-2">
              <p className="text-center text-muted-foreground py-8">
                No audio files yet
              </p>
            </TabsContent>

            <TabsContent value="video" className="space-y-2">
              <p className="text-center text-muted-foreground py-8">
                No videos yet
              </p>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-2">
                {filteredMembers.map((member) => {
                  const isCurrentUser = member.user_id === currentUserId;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.profiles.avatar_url} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                          {member.profiles.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {member.profiles.username}
                          </span>
                          {member.is_admin && (
                            <Badge variant="secondary" className="gap-1">
                              <Crown className="h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                          {member.is_moderator && (
                            <Badge variant="secondary" className="gap-1">
                              <Shield className="h-3 w-3" />
                              Mod
                            </Badge>
                          )}
                        </div>
                      </div>
                      {groupInfo.is_admin && !isCurrentUser && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handlePromoteMember(
                                  member.id,
                                  "can_edit_settings",
                                  !member.can_edit_settings
                                )
                              }
                            >
                              {member.can_edit_settings ? "Remove" : "Allow"} Edit
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handlePromoteMember(
                                  member.id,
                                  "can_kick_members",
                                  !member.can_kick_members
                                )
                              }
                            >
                              {member.can_kick_members ? "Remove" : "Allow"} Kick
                              Members
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handlePromoteMember(
                                  member.id,
                                  "can_ban_members",
                                  !member.can_ban_members
                                )
                              }
                            >
                              {member.can_ban_members ? "Remove" : "Allow"} Ban
                              Members
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handlePromoteMember(
                                  member.id,
                                  "is_moderator",
                                  !member.is_moderator
                                )
                              }
                            >
                              {member.is_moderator ? "Remove" : "Make"} Moderator
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleBanMember(member.id)}
                              className="text-destructive"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Ban Member
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleKickMember(member.id)}
                              className="text-destructive"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Kick Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GroupProfile;
