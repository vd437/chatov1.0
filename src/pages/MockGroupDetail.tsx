import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Users, Settings as SettingsIcon, MoreVertical, Trash2, Reply, Forward, Pin, Copy, Image as ImageIcon, Paperclip, Mic, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { useMockData } from "@/contexts/MockDataContext";
import EmojiPicker from "@/components/EmojiPicker";

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
    addMessageReaction,
    removeMessageReaction,
    getMessageReactors,
  } = useMockData();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<ReturnType<typeof getGroupMessages>>([]);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; content: string; sender: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMessageEmoji, setShowMessageEmoji] = useState<string | null>(null);
  const [showFullEmojiPicker, setShowFullEmojiPicker] = useState(false);
  const [showReactorsSheet, setShowReactorsSheet] = useState(false);
  const [selectedReactionEmoji, setSelectedReactionEmoji] = useState<string>("");
  const [selectedReactionMessageId, setSelectedReactionMessageId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    const content = replyingTo 
      ? `↩️ @${replyingTo.sender}: "${replyingTo.content.slice(0, 30)}..."\n\n${newMessage.trim()}`
      : newMessage.trim();

    const msg = sendGroupMessage(groupId, content);
    if (msg) {
      setMessages(getGroupMessages(groupId));
      setNewMessage("");
      setReplyingTo(null);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Message copied!");
    setSelectedMessage(null);
  };

  const handleReply = (message: { id: string; content: string; sender_id: string }) => {
    const senderProfile = getProfile(message.sender_id);
    setReplyingTo({
      id: message.id,
      content: message.content,
      sender: senderProfile?.username || "Unknown",
    });
    setSelectedMessage(null);
    inputRef.current?.focus();
  };

  const handleForward = () => {
    toast.info("Forward feature coming soon!");
    setSelectedMessage(null);
  };

  const handlePinMessage = () => {
    if (!membership?.is_admin && !membership?.is_moderator && !group?.allow_members_pin_messages) {
      toast.error("You don't have permission to pin messages");
      return;
    }
    toast.success("Message pinned!");
    setSelectedMessage(null);
  };

  const handleDeleteMessage = () => {
    toast.success("Message deleted!");
    setSelectedMessage(null);
  };

  const handleEmojiSelect = (messageId: string, emoji: string) => {
    addMessageReaction(messageId, emoji);
    setShowMessageEmoji(null);
    setShowFullEmojiPicker(false);
    setMessages(getGroupMessages(groupId || ""));
  };

  const handleRemoveReaction = (messageId: string) => {
    removeMessageReaction(messageId);
    setMessages(getGroupMessages(groupId || ""));
  };

  const handleShowReactors = (messageId: string, emoji: string) => {
    setSelectedReactionMessageId(messageId);
    setSelectedReactionEmoji(emoji);
    setShowReactorsSheet(true);
  };

  const topEmojis = ["❤️", "😂", "😮", "😢", "👍"];

  const getReactionCounts = (reactions?: { userId: string; emoji: string }[]) => {
    if (!reactions) return {};
    const counts: { [emoji: string]: number } = {};
    reactions.forEach(r => {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    });
    return counts;
  };

  const getUserReaction = (reactions?: { userId: string; emoji: string }[]) => {
    if (!reactions || !user) return null;
    const reaction = reactions.find(r => r.userId === user.id);
    return reaction?.emoji || null;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + 
           date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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

  const reactors = getMessageReactors(selectedReactionMessageId, selectedReactionEmoji);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/groups")} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:bg-muted/50 rounded-lg p-1 -m-1 transition-colors"
            onClick={() => navigate(`/group/${groupId}/profile`)}
          >
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={group.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {group.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold truncate">{group.name}</h2>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{members.length} members</span>
                <span className="text-primary">• tap for info</span>
              </div>
            </div>
          </div>
          {membership.is_admin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/group/${groupId}/profile`)}
              className="shrink-0"
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        )}
        {messages.map((message, index) => {
          const isOwn = message.sender_id === user?.id;
          const senderProfile = getProfile(message.sender_id);
          const prevMessage = messages[index - 1];
          const showAvatar = !isOwn && (!prevMessage || prevMessage.sender_id !== message.sender_id);
          const showName = showAvatar;
          const reactionCounts = getReactionCounts(message.reactions);
          const userReaction = getUserReaction(message.reactions);
          
          return (
            <div
              key={message.id}
              className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""} group`}
            >
              {!isOwn && (
                <div className="w-8">
                  {showAvatar && (
                    <Avatar 
                      className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                      onClick={() => navigate(`/user/${message.sender_id}`)}
                    >
                      <AvatarImage src={senderProfile?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {senderProfile?.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              )}
              <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%]`}>
                {showName && (
                  <span 
                    className="text-xs font-medium text-primary mb-1 cursor-pointer hover:underline"
                    onClick={() => navigate(`/user/${message.sender_id}`)}
                  >
                    {senderProfile?.username || "Unknown"}
                  </span>
                )}
                <div className="relative">
                  <div
                    className={`rounded-2xl px-4 py-2 shadow-sm cursor-pointer ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border rounded-bl-md"
                    }`}
                    onClick={() => setShowMessageEmoji(showMessageEmoji === message.id ? null : message.id)}
                  >
                    <p className="break-words whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                  
                  {/* Reactions Display */}
                  {Object.keys(reactionCounts).length > 0 && (
                    <div className={`flex gap-1 mt-1 flex-wrap ${isOwn ? "justify-end" : "justify-start"}`}>
                      {Object.entries(reactionCounts).map(([emoji, count]) => (
                        <button
                          key={emoji}
                          onClick={() => handleShowReactors(message.id, emoji)}
                          className={`bg-background/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs flex items-center gap-1 border transition-all hover:scale-105 ${
                            userReaction === emoji ? "border-primary" : "border-border"
                          }`}
                        >
                          <span>{emoji}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick Emoji Picker */}
                  {showMessageEmoji === message.id && (
                    <div className={`absolute top-full mt-2 z-20 bg-card border border-border rounded-2xl shadow-lg p-2 flex items-center gap-1 ${isOwn ? "right-0" : "left-0"}`}>
                      {topEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (userReaction === emoji) {
                              handleRemoveReaction(message.id);
                            } else {
                              handleEmojiSelect(message.id, emoji);
                            }
                          }}
                          className={`text-xl hover:scale-125 transition-transform p-1.5 hover:bg-accent rounded-lg ${
                            userReaction === emoji ? "bg-accent scale-110" : ""
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFullEmojiPicker(true);
                          setShowMessageEmoji(message.id);
                        }}
                        className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground"
                      >
                        <Smile className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  
                  {/* Message Actions */}
                  <div className={`absolute top-0 ${isOwn ? "left-0 -translate-x-full" : "right-0 translate-x-full"} opacity-0 group-hover:opacity-100 transition-opacity px-1`}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 bg-card shadow-sm border">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isOwn ? "start" : "end"}>
                        <DropdownMenuItem onClick={() => handleReply(message)}>
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyMessage(message.content)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleForward}>
                          <Forward className="h-4 w-4 mr-2" />
                          Forward
                        </DropdownMenuItem>
                        {(membership?.is_admin || membership?.is_moderator || group?.allow_members_pin_messages) && (
                          <DropdownMenuItem onClick={handlePinMessage}>
                            <Pin className="h-4 w-4 mr-2" />
                            Pin
                          </DropdownMenuItem>
                        )}
                        {(isOwn || membership?.is_admin || membership?.is_moderator) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleDeleteMessage} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {formatTime(message.created_at)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Full Emoji Picker Dialog */}
      {showFullEmojiPicker && showMessageEmoji && (
        <Dialog open={showFullEmojiPicker} onOpenChange={setShowFullEmojiPicker}>
          <DialogContent className="p-0 max-w-sm">
            <EmojiPicker
              onEmojiSelect={(emoji) => {
                handleEmojiSelect(showMessageEmoji, emoji);
                setShowFullEmojiPicker(false);
              }}
              onClose={() => setShowFullEmojiPicker(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Reactors Sheet */}
      <Sheet open={showReactorsSheet} onOpenChange={setShowReactorsSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedReactionEmoji}</span>
              <span>Reactions</span>
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[300px] mt-4">
            <div className="space-y-2">
              {reactors.map((reactor) => (
                <div
                  key={reactor.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => {
                    setShowReactorsSheet(false);
                    navigate(`/user/${reactor.id}`);
                  }}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={reactor.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {reactor.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{reactor.username}</p>
                    {reactor.bio && (
                      <p className="text-sm text-muted-foreground truncate">{reactor.bio}</p>
                    )}
                  </div>
                  {reactor.id === user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveReaction(selectedReactionMessageId);
                        setShowReactorsSheet(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {reactors.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No reactions yet</p>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="bg-card border-t border-border px-4 py-2 flex items-center gap-2">
          <div className="flex-1 bg-muted rounded-lg px-3 py-2">
            <p className="text-xs text-primary font-medium">Replying to {replyingTo.sender}</p>
            <p className="text-xs text-muted-foreground truncate">{replyingTo.content}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setReplyingTo(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="sticky bottom-0 bg-card border-t border-border p-3">
        <div className="flex gap-2 items-end">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <ImageIcon className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              placeholder="Type a message..."
              className="pr-10 rounded-full bg-muted border-0"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>
          {newMessage.trim() ? (
            <Button onClick={handleSendMessage} size="icon" className="h-9 w-9 rounded-full">
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockGroupDetail;