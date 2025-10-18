import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FriendRequest {
  id: string;
  sender_id: string;
  sender: {
    username: string;
    avatar_url: string | null;
  };
}

export function FriendRequestsSection() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('friend_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests'
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setCurrentUserId(user.id);

    const { data, error } = await supabase
      .from("friend_requests")
      .select(`
        id,
        sender_id,
        sender:profiles!friend_requests_sender_id_fkey (username, avatar_url)
      `)
      .eq("receiver_id", user.id)
      .eq("status", "pending");

    if (error) {
      console.error("Error loading friend requests:", error);
    } else {
      setRequests(data as any || []);
    }
  };

  const handleAccept = async (requestId: string) => {
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (error) {
      toast.error("Error accepting friend request");
    } else {
      toast.success("Friend request accepted!");
      loadRequests();
    }
  };

  const handleReject = async (requestId: string) => {
    const { error } = await supabase
      .from("friend_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (error) {
      toast.error("Error rejecting friend request");
    } else {
      toast.success("Friend request rejected");
      loadRequests();
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No pending friend requests
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={request.sender.avatar_url || ""} />
              <AvatarFallback>
                {request.sender.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{request.sender.username}</p>
              <p className="text-sm text-muted-foreground">
                wants to be friends
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-success border-success hover:bg-success/10"
              onClick={() => handleAccept(request.id)}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive/10"
              onClick={() => handleReject(request.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
