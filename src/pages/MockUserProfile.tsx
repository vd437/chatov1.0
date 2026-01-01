import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, UserPlus, UserMinus, MoreVertical, Ban, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const { getProfile, friends, sendFriendRequest } = useMockData();

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

  const handleSendMessage = () => {
    toast.info("Direct messaging coming soon!");
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
    toast.success("Report submitted");
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

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-8 p-6 bg-card rounded-xl border border-border w-full max-w-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-xs text-muted-foreground">Friends</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">5</p>
              <p className="text-xs text-muted-foreground">Groups</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">24</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
          </div>

          {/* Mutual Groups */}
          <div className="mt-8 w-full max-w-sm">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Mutual Groups</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://i.pravatar.cc/150?u=group" />
                  <AvatarFallback className="bg-primary text-primary-foreground">F</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Friends Hangout</p>
                  <p className="text-xs text-muted-foreground">6 members</p>
                </div>
              </div>
            </div>
          </div>

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
