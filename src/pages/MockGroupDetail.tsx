import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Users, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { useMockData } from "@/contexts/MockDataContext";

const MockGroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useMockAuth();
  const {
    getGroupById,
    getGroupMembers,
    getGroupMessages,
    sendGroupMessage,
    getUserMembership,
    getProfile,
  } = useMockData();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<ReturnType<typeof getGroupMessages>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const group = getGroupById(groupId || "");
  const members = getGroupMembers(groupId || "");
  const membership = getUserMembership(groupId || "", user?.id || "");

  useEffect(() => {
    if (groupId) {
      setMessages(getGroupMessages(groupId));
    }
  }, [groupId, getGroupMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Refresh messages periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (groupId) {
        setMessages(getGroupMessages(groupId));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [groupId, getGroupMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !groupId) return;

    if (!group?.allow_members_send_messages && !membership?.is_admin && !membership?.is_moderator) {
      toast.error("You don't have permission to send messages");
      return;
    }

    const msg = sendGroupMessage(groupId, newMessage.trim());
    if (msg) {
      setMessages(getGroupMessages(groupId));
      setNewMessage("");
    }
  };

  if (!group || !membership) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Group not found</h2>
          <Button onClick={() => navigate("/mock-groups")}>Back to Groups</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/mock-groups")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={() => navigate(`/mock-group/${groupId}/profile`)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={group.avatar_url} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                {group.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold truncate">{group.name}</h2>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{members.length} members</span>
              </div>
            </div>
          </div>
          {membership.is_admin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/mock-group/${groupId}/profile`)}
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((message) => {
          const isOwn = message.sender_id === user?.id;
          const senderProfile = getProfile(message.sender_id);
          return (
            <div
              key={message.id}
              className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
            >
              {!isOwn && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={senderProfile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                    {senderProfile?.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                {!isOwn && (
                  <span className="text-xs text-muted-foreground mb-1">
                    {senderProfile?.username || "Unknown"}
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
                <span className="text-xs text-muted-foreground mt-1">
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
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

export default MockGroupDetail;
