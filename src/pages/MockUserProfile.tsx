import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, UserPlus, UserMinus, MoreVertical, Ban, Flag, Image as ImageIcon, FileText, Music, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { useMockData } from "@/contexts/MockDataContext";

const MockUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useMockAuth();
  const { getProfile, friends, sendFriendRequest, groups, getGroupMembers } = useMockData();
  const [activeTab, setActiveTab] = useState("images");

  const profile = getProfile(userId || "");
  
  const isFriend = friends.some(
    (f) =>
      f.status === "accepted" &&
      ((f.sender_id === user?.id && f.receiver_id === userId) ||
        (f.receiver_id === user?.id && f.sender_id === userId))
  );

  const hasPendingRequest = friends.some(
    (f) =>
      f.status === "pending" &&
      ((f.sender_id === user?.id && f.receiver_id === userId) ||
        (f.receiver_id === user?.id && f.sender_id === userId))
  );

  // Get mutual groups
  const mutualGroups = groups.filter(group => {
    const members = getGroupMembers(group.id);
    const userIsMember = members.some(m => m.user_id === userId);
    const currentUserIsMember = members.some(m => m.user_id === user?.id);
    return userIsMember && currentUserIsMember;
  });

  const handleSendMessage = () => {
    // Navigate to chat with this user
    navigate(`/chat/${userId}`);
  };

  const handleAddFriend = () => {
    if (userId) {
      sendFriendRequest(userId);
      toast.success("Friend request sent!");
    }
  };

  const handleRemoveFriend = () => {
    toast.success("Friend removed");
  };

  const handleBlock = () => {
    toast.success("User blocked");
    navigate(-1);
  };

  const handleReport = () => {
    navigate(`/report/${userId}`);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">User not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Mock shared media data
  const sharedImages = [
    "https://picsum.photos/200/200?random=1",
    "https://picsum.photos/200/200?random=2",
    "https://picsum.photos/200/200?random=3",
    "https://picsum.photos/200/200?random=4",
    "https://picsum.photos/200/200?random=5",
    "https://picsum.photos/200/200?random=6",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Profile</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleReport}>
                <Flag className="h-4 w-4 mr-2" />
                Report User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleBlock} className="text-destructive">
                <Ban className="h-4 w-4 mr-2" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <Avatar className="h-28 w-28 ring-4 ring-primary/20">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
              {profile.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          {/* Name & Bio */}
          <h2 className="text-2xl font-bold mt-4">{profile.username}</h2>
          {profile.bio && (
            <p className="text-muted-foreground mt-2 max-w-xs">{profile.bio}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSendMessage} className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Message
            </Button>
            {isFriend ? (
              <Button variant="outline" onClick={handleRemoveFriend} className="gap-2">
                <UserMinus className="h-4 w-4" />
                Remove Friend
              </Button>
            ) : hasPendingRequest ? (
              <Button variant="outline" disabled className="gap-2">
                Request Sent
              </Button>
            ) : (
              <Button variant="outline" onClick={handleAddFriend} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Friend
              </Button>
            )}
          </div>

          {/* Stats - Only Groups count */}
          <div className="flex justify-center gap-8 mt-8 p-6 bg-card rounded-xl border border-border w-full max-w-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{mutualGroups.length}</p>
              <p className="text-xs text-muted-foreground">Mutual Groups</p>
            </div>
          </div>

          {/* Shared Media Tabs */}
          <div className="mt-8 w-full max-w-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="images" className="gap-1">
                  <ImageIcon className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="files" className="gap-1">
                  <FileText className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="audio" className="gap-1">
                  <Music className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="video" className="gap-1">
                  <Video className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="images" className="mt-4">
                <div className="grid grid-cols-3 gap-1">
                  {sharedImages.map((img, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="files" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No shared files</p>
                </div>
              </TabsContent>

              <TabsContent value="audio" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No shared audio</p>
                </div>
              </TabsContent>

              <TabsContent value="video" className="mt-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No shared videos</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Mutual Groups */}
          {mutualGroups.length > 0 && (
            <div className="mt-8 w-full max-w-sm">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 text-left">Mutual Groups</h3>
              <div className="space-y-2">
                {mutualGroups.map((group) => (
                  <div 
                    key={group.id}
                    className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => navigate(`/group/${group.id}`)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={group.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {group.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-sm">{group.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getGroupMembers(group.id).length} members
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member Since */}
          <p className="text-xs text-muted-foreground mt-8">
            Member since January 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockUserProfile;