import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Phone, Video, MoreVertical, BellOff, Bell, Flag, Trash2, RotateCcw, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent: boolean;
  type: "text" | "image" | "video" | "audio";
  mediaUrl?: string;
  reactions?: { [key: string]: number };
}

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Hey! How are you doing?",
    timestamp: "10:30 AM",
    isSent: false,
    type: "text",
  },
  {
    id: "2",
    content: "I'm doing great! Just finished a project.",
    timestamp: "10:32 AM",
    isSent: true,
    type: "text",
  },
  {
    id: "3",
    content: "That's awesome! What was it about?",
    timestamp: "10:33 AM",
    isSent: false,
    type: "text",
  },
  {
    id: "4",
    content: "It's a new social platform, really exciting!",
    timestamp: "10:35 AM",
    isSent: true,
    type: "text",
  },
];

const mockChatInfo = {
  "fake-user-1": { name: "Sarah Johnson", avatar: "https://i.pravatar.cc/150?u=sarah", online: true },
  "fake-user-2": { name: "Mike Chen", avatar: "https://i.pravatar.cc/150?u=mike", online: true },
  "fake-user-3": { name: "Emma Wilson", avatar: "https://i.pravatar.cc/150?u=emma", online: false },
  "fake-user-4": { name: "Alex Turner", avatar: "https://i.pravatar.cc/150?u=alex", online: false },
  "fake-user-5": { name: "Lisa Park", avatar: "https://i.pravatar.cc/150?u=lisa", online: true },
};

export default function ChatDetail() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userReactions, setUserReactions] = useState<{ [messageId: string]: string }>({});

  const chatInfo = mockChatInfo[chatId as keyof typeof mockChatInfo] || mockChatInfo["1"];

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Unmuted" : "Muted",
      description: isMuted ? "You will receive notifications" : "Notifications are muted",
    });
  };

  const handleBlockToggle = () => {
    setIsBlocked(!isBlocked);
    toast({
      title: isBlocked ? "Unblocked" : "Blocked",
      description: isBlocked ? `${chatInfo.name} has been unblocked` : `${chatInfo.name} has been blocked`,
    });
  };

  const handleClearChat = (clearBothSides: boolean) => {
    setMessages([]);
    toast({
      title: "Chat cleared",
      description: clearBothSides ? "Conversation cleared for both parties" : "Conversation cleared for you",
    });
    setClearDialogOpen(false);
  };

  const handleDeleteChat = (deleteBothSides: boolean) => {
    toast({
      title: "Chat deleted",
      description: deleteBothSides ? "Conversation deleted for both parties" : "Conversation deleted for you",
    });
    setDeleteDialogOpen(false);
    navigate("/chats");
  };

  const handleSendMessage = (content: string, type: "text" | "image" | "video" | "audio", mediaUrl?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSent: true,
      type,
      mediaUrl,
    };
    setMessages([...messages, newMessage]);
  };

  const handleDeleteMessage = (messageId: string, deleteBothSides: boolean) => {
    setMessages(messages.filter(msg => msg.id !== messageId));
    toast({
      title: "Message deleted",
      description: deleteBothSides ? "Message deleted for both parties" : "Message deleted for you",
    });
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions };
          const oldEmoji = userReactions[messageId];
          
          // Remove old reaction count if replacing
          if (oldEmoji && oldEmoji !== emoji) {
            reactions[oldEmoji] = Math.max((reactions[oldEmoji] || 1) - 1, 0);
            if (reactions[oldEmoji] === 0) delete reactions[oldEmoji];
          }
          
          // Add new reaction or increment if not current user's reaction
          if (!userReactions[messageId] || userReactions[messageId] !== emoji) {
            reactions[emoji] = (reactions[emoji] || 0) + 1;
          }
          
          return { ...msg, reactions };
        }
        return msg;
      })
    );
    setUserReactions({ ...userReactions, [messageId]: emoji });
  };

  const handleRemoveReaction = (messageId: string) => {
    const emoji = userReactions[messageId];
    if (!emoji) return;
    
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions };
          reactions[emoji] = Math.max((reactions[emoji] || 1) - 1, 0);
          if (reactions[emoji] === 0) delete reactions[emoji];
          return { ...msg, reactions };
        }
        return msg;
      })
    );
    
    const newReactions = { ...userReactions };
    delete newReactions[messageId];
    setUserReactions(newReactions);
  };

  const handleProfileClick = () => {
    navigate(`/user/${chatId}`);
  };

  const handleCall = () => {
    navigate(`/call/${chatId}?type=voice`);
  };

  const handleVideoCall = () => {
    navigate(`/call/${chatId}?type=video`);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/chats")}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={handleProfileClick}>
          <div className="relative">
            <Avatar className="w-10 h-10 border-2 border-primary/20">
              <AvatarImage src={chatInfo.avatar} alt={chatInfo.name} />
              <AvatarFallback>{chatInfo.name[0]}</AvatarFallback>
            </Avatar>
            {chatInfo.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-card" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{chatInfo.name}</h3>
            <p className="text-xs text-muted-foreground">
              {chatInfo.online ? "Active now" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleCall}>
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleVideoCall}>
            <Video className="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleMuteToggle}>
                {isMuted ? (
                  <>
                    <Bell className="w-4 h-4 mr-3" />
                    Unmute conversation
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4 mr-3" />
                    Mute conversation
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/report/${chatId}`)}>
                <Flag className="w-4 h-4 mr-3" />
                Report conversation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBlockToggle}>
                <Ban className="w-4 h-4 mr-3" />
                {isBlocked ? "Unblock user" : "Block user"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setClearDialogOpen(true)}>
                <RotateCcw className="w-4 h-4 mr-3" />
                Clear conversation
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Delete conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-4 pb-4">
            {isBlocked && (
              <div className="text-center py-4 text-muted-foreground">
                <Ban className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">You have blocked this user</p>
              </div>
            )}
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onDelete={handleDeleteMessage}
                onReaction={handleReaction}
                onRemoveReaction={handleRemoveReaction}
                currentUserReaction={userReactions[message.id]}
                reactions={message.reactions}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <MessageInput onSend={handleSendMessage} />

      {/* Clear Chat Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear conversation history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all messages from this conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <div className="flex gap-2 w-full">
              <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleClearChat(false)} className="flex-1">
                Clear for me
              </AlertDialogAction>
            </div>
            <AlertDialogAction 
              onClick={() => handleClearChat(true)}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear for both parties
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Chat Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The conversation will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <div className="flex gap-2 w-full">
              <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteChat(false)} className="flex-1">
                Delete for me
              </AlertDialogAction>
            </div>
            <AlertDialogAction 
              onClick={() => handleDeleteChat(true)}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete for both parties
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
