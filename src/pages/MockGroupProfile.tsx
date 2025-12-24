import { useState } from "react";
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
  Link as LinkIcon,
  QrCode,
  Upload,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { useMockData } from "@/contexts/MockDataContext";

const MockGroupProfile = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useMockAuth();
  const {
    getGroupById,
    getGroupMembers,
    getUserMembership,
    getProfile,
    updateGroup,
    updateGroupMember,
    removeGroupMember,
  } = useMockData();

  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAvatarPreview, setEditAvatarPreview] = useState("");
  const [copied, setCopied] = useState(false);

  const group = getGroupById(groupId || "");
  const members = getGroupMembers(groupId || "");
  const membership = getUserMembership(groupId || "", user?.id || "");

  const isAdmin = membership?.is_admin || false;
  const canEdit = isAdmin || membership?.can_edit_settings || group?.allow_members_edit_settings;

  const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditDialog = () => {
    if (group) {
      setEditName(group.name);
      setEditDescription(group.description || "");
      setEditAvatarPreview(group.avatar_url || "");
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateGroup = () => {
    if (!groupId) return;
    updateGroup(groupId, {
      name: editName,
      description: editDescription,
      avatar_url: editAvatarPreview || undefined,
    });
    toast.success("Group updated successfully");
    setIsEditDialogOpen(false);
  };

  const handleKickMember = (memberId: string) => {
    removeGroupMember(memberId);
    toast.success("Member removed from group");
  };

  const handleBanMember = (memberId: string) => {
    updateGroupMember(memberId, { is_banned: true });
    toast.success("Member banned from group");
  };

  const handlePromoteMember = (memberId: string, permission: string, value: boolean) => {
    updateGroupMember(memberId, { [permission]: value });
    toast.success("Permissions updated");
  };

  const copyInviteLink = () => {
    if (!group) return;
    const inviteLink = `${window.location.origin}/join-group/${group.invite_code}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredMembers = members.filter((member) => {
    const profile = getProfile(member.user_id);
    return profile?.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!group || !membership) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Group not found</h2>
          <Button onClick={() => navigate("/groups")}>Back to Groups</Button>
        </div>
      </div>
    );
  }

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
              <AvatarImage src={group.avatar_url} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                {group.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{group.name}</h2>
              {group.description && (
                <p className="text-muted-foreground mt-1">{group.description}</p>
              )}
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
                <Users className="h-4 w-4" />
                <span>{members.length} members</span>
              </div>
            </div>

            <div className="flex gap-2">
              {canEdit && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2" onClick={openEditDialog}>
                      <SettingsIcon className="h-4 w-4" />
                      Edit Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Group</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-20 w-20">
                            {editAvatarPreview ? (
                              <AvatarImage src={editAvatarPreview} />
                            ) : (
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                                {editName.charAt(0) || "G"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <label
                            htmlFor="edit-avatar-upload"
                            className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90"
                          >
                            <Upload className="h-3 w-3" />
                          </label>
                          <input
                            id="edit-avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleEditAvatarChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Group Name</Label>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleUpdateGroup} className="w-full">
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Invite
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Members</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Invite Code</Label>
                      <div className="flex gap-2">
                        <Input value={group.invite_code} readOnly className="font-mono" />
                        <Button variant="outline" size="icon" onClick={copyInviteLink}>
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <QrCode className="h-32 w-32 mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mt-2">
                          QR Code (Demo)
                        </p>
                      </div>
                    </div>
                    <Button className="w-full gap-2" onClick={copyInviteLink}>
                      <LinkIcon className="h-4 w-4" />
                      Copy Invite Link
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
              <p className="text-center text-muted-foreground py-8">No images yet</p>
            </TabsContent>

            <TabsContent value="files" className="space-y-2">
              <p className="text-center text-muted-foreground py-8">No files yet</p>
            </TabsContent>

            <TabsContent value="audio" className="space-y-2">
              <p className="text-center text-muted-foreground py-8">No audio files yet</p>
            </TabsContent>

            <TabsContent value="video" className="space-y-2">
              <p className="text-center text-muted-foreground py-8">No videos yet</p>
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
                  const profile = getProfile(member.user_id);
                  const isCurrentUser = member.user_id === user?.id;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                          {profile?.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {profile?.username || "Unknown"}
                            {isCurrentUser && " (You)"}
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
                        <div className="flex gap-1 flex-wrap mt-1">
                          {member.can_edit_settings && (
                            <Badge variant="outline" className="text-xs">
                              Edit Settings
                            </Badge>
                          )}
                          {member.can_kick_members && (
                            <Badge variant="outline" className="text-xs">
                              Kick
                            </Badge>
                          )}
                          {member.can_ban_members && (
                            <Badge variant="outline" className="text-xs">
                              Ban
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isAdmin && !isCurrentUser && (
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
                              {member.can_edit_settings ? "Remove" : "Allow"} Edit Settings
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
                              {member.can_kick_members ? "Remove" : "Allow"} Kick Members
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
                              {member.can_ban_members ? "Remove" : "Allow"} Ban Members
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

export default MockGroupProfile;
