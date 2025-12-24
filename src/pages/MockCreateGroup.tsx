import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Users, Link as LinkIcon, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { useMockData } from "@/contexts/MockDataContext";

const MockCreateGroup = () => {
  const navigate = useNavigate();
  const { user } = useMockAuth();
  const { getFriends, createGroup, addGroupMember } = useMockData();
  const [step, setStep] = useState(1);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  // Group details
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Group permissions
  const [allowMembersEditSettings, setAllowMembersEditSettings] = useState(false);
  const [allowMembersPinMessages, setAllowMembersPinMessages] = useState(false);
  const [allowMembersSendMessages, setAllowMembersSendMessages] = useState(true);
  const [allowMembersAddOthers, setAllowMembersAddOthers] = useState(false);
  const [requireModeratorApproval, setRequireModeratorApproval] = useState(false);

  const friends = getFriends();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFriend = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    try {
      const newGroup = createGroup({
        name: groupName,
        description: groupDescription,
        avatar_url: avatarPreview || undefined,
        created_by: user.id,
        allow_members_edit_settings: allowMembersEditSettings,
        allow_members_pin_messages: allowMembersPinMessages,
        allow_members_send_messages: allowMembersSendMessages,
        allow_members_add_others: allowMembersAddOthers,
        require_moderator_approval: requireModeratorApproval,
      });

      // Add creator as admin
      addGroupMember({
        group_id: newGroup.id,
        user_id: user.id,
        is_admin: true,
        is_moderator: false,
        can_edit_settings: true,
        can_ban_members: true,
        can_kick_members: true,
        is_banned: false,
      });

      // Add selected friends as members
      selectedFriends.forEach((friendId) => {
        addGroupMember({
          group_id: newGroup.id,
          user_id: friendId,
          is_admin: false,
          is_moderator: false,
          can_edit_settings: false,
          can_ban_members: false,
          can_kick_members: false,
          is_banned: false,
        });
      });

      toast.success("Group created successfully!");
      navigate(`/group/${newGroup.id}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to create group");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (step > 1 ? setStep(step - 1) : navigate("/groups"))}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">
              {step === 1 && "Select Friends"}
              {step === 2 && "Group Details"}
              {step === 3 && "Group Permissions"}
            </h1>
          </div>
        </div>

        {step === 1 && (
          <div className="p-4 space-y-4">
            <p className="text-muted-foreground">
              Select friends to add to your group (you can skip this and add them later)
            </p>
            <div className="space-y-2">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:bg-accent/5 cursor-pointer"
                  onClick={() => toggleFriend(friend.id)}
                >
                  <Checkbox
                    checked={selectedFriends.includes(friend.id)}
                    onCheckedChange={() => toggleFriend(friend.id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={friend.avatar_url} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {friend.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{friend.username}</span>
                </div>
              ))}
              {friends.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No friends yet. You can add members later.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Skip for Now
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1">
                Continue ({selectedFriends.length} selected)
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-4 space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} />
                  ) : (
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      <Users className="h-10 w-10" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90"
                >
                  <Upload className="h-4 w-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name *</Label>
              <Input
                id="group-name"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-description">Group Description</Label>
              <Textarea
                id="group-description"
                placeholder="Describe your group..."
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={() => setStep(3)} className="w-full">
              Continue to Permissions
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="p-4 space-y-6">
            <div>
              <h2 className="font-semibold mb-4">Members can:</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Edit group settings</Label>
                    <p className="text-sm text-muted-foreground">
                      Includes name, icon, and description
                    </p>
                  </div>
                  <Switch
                    checked={allowMembersEditSettings}
                    onCheckedChange={setAllowMembersEditSettings}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pin messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow members to pin important messages
                    </p>
                  </div>
                  <Switch
                    checked={allowMembersPinMessages}
                    onCheckedChange={setAllowMembersPinMessages}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Send messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow members to send new messages
                    </p>
                  </div>
                  <Switch
                    checked={allowMembersSendMessages}
                    onCheckedChange={setAllowMembersSendMessages}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div>
                      <Label>Add other members</Label>
                      <p className="text-sm text-muted-foreground">
                        Send invitations via link or QR code
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={allowMembersAddOthers}
                    onCheckedChange={setAllowMembersAddOthers}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Moderator approval required</Label>
                    <p className="text-sm text-muted-foreground">
                      New members require moderator approval
                    </p>
                  </div>
                  <Switch
                    checked={requireModeratorApproval}
                    onCheckedChange={setRequireModeratorApproval}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Invite Options
              </h3>
              <p className="text-sm text-muted-foreground">
                After creating the group, you'll be able to share an invite link or QR code with others.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" disabled>
                  <LinkIcon className="h-4 w-4" />
                  Copy Link
                </Button>
                <Button variant="outline" size="sm" className="gap-2" disabled>
                  <QrCode className="h-4 w-4" />
                  Show QR Code
                </Button>
              </div>
            </div>

            <Button onClick={handleCreateGroup} className="w-full">
              Create Group
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockCreateGroup;
