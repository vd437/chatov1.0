import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const sb = supabase as any;

interface MessageRequest {
  id: string;
  sender_id: string;
  last_message: string | null;
  sender: {
    username: string;
    avatar_url: string | null;
  };
}

export function MessageRequestsSection() {
  const [requests, setRequests] = useState<MessageRequest[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();

    // Set up realtime subscription
    const channel = supabase
      .channel('message_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_requests'
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

    const { data, error } = await sb
      .from("message_requests")
      .select(`
        id,
        sender_id,
        last_message,
        sender:profiles!message_requests_sender_id_fkey (username, avatar_url)
      `)
      .eq("receiver_id", user.id)
      .eq("status", "pending");

    if (error) {
      console.error("Error loading message requests:", error);
    } else {
      setRequests(data as any || []);
    }
  };

  const handleAccept = async (requestId: string) => {
    const { error } = await sb
      .from("message_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (error) {
      toast.error("Error accepting message request");
    } else {
      toast.success("Message request accepted!");
      loadRequests();
    }
  };

  const handleBlock = async (requestId: string, senderId: string) => {
    // Update message request status
    const { error: requestError } = await sb
      .from("message_requests")
      .update({ status: "blocked" })
      .eq("id", requestId);

    if (requestError) {
      toast.error("Error blocking user");
      return;
    }

    // Add to blocks table
    const { error: blockError } = await sb
      .from("user_blocks")
      .insert({
        blocker_id: currentUserId,
        blocked_id: senderId
      });

    if (blockError && blockError.code !== "23505") {
      toast.error("Error blocking user");
    } else {
      toast.success("User blocked");
      loadRequests();
    }
  };

  const handleDelete = async (requestId: string) => {
    const { error } = await sb
      .from("message_requests")
      .delete()
      .eq("id", requestId);

    if (error) {
      toast.error("Error deleting message request");
    } else {
      toast.success("Message request deleted");
      loadRequests();
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No pending message requests
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="bg-card border border-border rounded-lg p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={request.sender.avatar_url || ""} />
              <AvatarFallback>
                {request.sender.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{request.sender.username}</p>
              {request.last_message && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {request.last_message}
                </p>
              )}
            </div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg mb-3">
            <p className="text-sm text-center text-muted-foreground">
              Do you agree to correspondence?
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-success border-success hover:bg-success/10"
              onClick={() => handleAccept(request.id)}
            >
              <Check className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
              onClick={() => handleBlock(request.id, request.sender_id)}
            >
              <Ban className="w-4 h-4 mr-1" />
              Block
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => handleDelete(request.id)}
            >
              <X className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
