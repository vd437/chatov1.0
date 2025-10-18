import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

export default function UserSearch() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a username to search");
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${searchQuery}%`)
      .neq("id", currentUserId || "")
      .limit(20);

    if (error) {
      toast.error("Error searching users");
      console.error(error);
    } else {
      setSearchResults(data || []);
      if (data?.length === 0) {
        toast.info("No users found");
      }
    }
    setIsLoading(false);
  };

  const handleSendFriendRequest = async (receiverId: string) => {
    if (!currentUserId) {
      toast.error("Please log in to send friend requests");
      return;
    }

    const { error } = await supabase
      .from("friend_requests")
      .insert({
        sender_id: currentUserId,
        receiver_id: receiverId,
        status: "pending"
      });

    if (error) {
      if (error.code === "23505") {
        toast.error("Friend request already sent");
      } else {
        toast.error("Error sending friend request");
      }
    } else {
      toast.success("Friend request sent!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Search Users</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 h-12"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="h-12"
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        <div className="space-y-3">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
            >
              <div
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => navigate(`/user/${user.id}`)}
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar_url || ""} />
                  <AvatarFallback>
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.username}</p>
                  {user.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSendFriendRequest(user.id)}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          ))}
        </div>

        {searchResults.length === 0 && searchQuery && !isLoading && (
          <div className="text-center text-muted-foreground py-12">
            No users found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
