import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Users, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

interface GroupInfo {
  id: string;
  name: string;
  avatar_url?: string;
  member_count: number;
  is_admin: boolean;
}

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        avatar_url: group.avatar_url,
        member_count: members?.length || 0,
        is_admin: currentMember?.is_admin || false,
      });
    };

    fetchGroupInfo();
  }, [groupId, currentUserId]);

  useEffect(() => {
    if (!groupId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("group_messages")
        .select(`
          *,
          profiles:sender_id (
            username,
            avatar_url
          )
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data as any);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`group_messages:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", payload.new.sender_id)
            .single();

          const newMsg = {
            ...payload.new,
            profiles: profile,
          } as Message;

          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !groupId) return;

    const { error } = await supabase.from("group_messages").insert({
      group_id: groupId,
      sender_id: currentUserId,
      content: newMessage,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    setNewMessage("");
  };

  if (!groupInfo) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/groups")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={() => navigate(`/group/${groupId}/profile`)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={groupInfo.avatar_url} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                {groupInfo.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold truncate">{groupInfo.name}</h2>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{groupInfo.member_count} members</span>
              </div>
            </div>
          </div>
          {groupInfo.is_admin && (
            <Button variant="ghost" size="icon">
              <SettingsIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
            >
              {!isOwn && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.profiles?.avatar_url} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                    {message.profiles?.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                {!isOwn && (
                  <span className="text-xs text-muted-foreground mb-1">
                    {message.profiles?.username || "Unknown"}
                  </span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[70%] ${
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 bg-card border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
