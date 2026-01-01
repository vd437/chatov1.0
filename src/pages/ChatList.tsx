import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, MoreVertical, Plus, Clock, Sparkles, Zap, Video, Ban, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageRequestsSection } from "@/components/MessageRequestsSection";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { toast } from "@/hooks/use-toast";

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  hasStory?: boolean;
  storySeenStatus?: "unseen" | "seen" | "none";
}

const mockChats: Chat[] = [
  {
    id: "fake-user-1",
    name: "Sarah Johnson",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    lastMessage: "Hey! How are you doing?",
    timestamp: "2m ago",
    unread: 2,
    online: true,
    hasStory: true,
    storySeenStatus: "unseen",
  },
  {
    id: "fake-user-2",
    name: "Mike Chen",
    avatar: "https://i.pravatar.cc/150?u=mike",
    lastMessage: "Thanks for the help earlier!",
    timestamp: "1h ago",
    unread: 0,
    online: true,
    hasStory: true,
    storySeenStatus: "seen",
  },
  {
    id: "fake-user-3",
    name: "Emma Wilson",
    avatar: "https://i.pravatar.cc/150?u=emma",
    lastMessage: "See you tomorrow 👋",
    timestamp: "3h ago",
    unread: 0,
    online: false,
    hasStory: false,
    storySeenStatus: "none",
  },
  {
    id: "fake-user-4",
    name: "Alex Turner",
    avatar: "https://i.pravatar.cc/150?u=alex",
    lastMessage: "Did you see the photos?",
    timestamp: "1d ago",
    unread: 5,
    online: false,
    hasStory: false,
    storySeenStatus: "none",
  },
];

export default function ChatList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [storyChoiceOpen, setStoryChoiceOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [longPressedChat, setLongPressedChat] = useState<Chat | null>(null);

  const filteredChats = mockChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const handleAvatarClick = (e: React.MouseEvent, chat: Chat) => {
    e.stopPropagation();
    setSelectedChat(chat);
    if (chat.hasStory && chat.storySeenStatus !== "none") {
      setStoryChoiceOpen(true);
    } else {
      navigate(`/user/${chat.id}`);
    }
  };

  const handleLongPressStart = (chat: Chat) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressedChat(chat);
      setContextMenuOpen(true);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleDeleteConversation = (deleteBothSides: boolean) => {
    toast({
      title: "Conversation deleted",
      description: deleteBothSides
        ? "Conversation deleted for both parties"
        : "Conversation deleted for you",
    });
    setDeleteDialogOpen(false);
    setContextMenuOpen(false);
  };

  const handleBlockUser = () => {
    toast({
      title: "User blocked",
      description: `${longPressedChat?.name} has been blocked`,
    });
    setContextMenuOpen(false);
  };

  const handleVideoCall = () => {
    toast({
      title: "Video Call",
      description: `Starting video call with ${longPressedChat?.name}...`,
    });
    setContextMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b border-border backdrop-blur-lg bg-card/80">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">chato chato</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate("/stories")}>
              <Zap className="h-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-2xl mx-auto px-4">
        <Tabs defaultValue="chats" className="w-full">
          <TabsList className="grid w-full grid-cols-2 my-4">
            <TabsTrigger value="chats">Chats</TabsTrigger>
            <TabsTrigger value="requests">Message Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="chats" className="space-y-2">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50"
              />
            </div>

            <ScrollArea className="h-[calc(100vh-240px)]">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  onMouseDown={() => handleLongPressStart(chat)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onTouchStart={() => handleLongPressStart(chat)}
                  onTouchEnd={handleLongPressEnd}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent/50 cursor-pointer transition-all animate-fade-in group"
                >
                  <div 
                    className="relative"
                    onClick={(e) => handleAvatarClick(e, chat)}
                  >
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                      <AvatarFallback>{chat.name[0]}</AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-success rounded-full border-2 border-background" />
                    )}
                    {chat.hasStory && chat.storySeenStatus !== "none" && (
                      <button
                        className={cn(
                          "absolute -bottom-1 -right-1 rounded-full p-1.5 shadow-lg transition-colors",
                          chat.storySeenStatus === "unseen"
                            ? "bg-primary hover:bg-primary/90"
                            : "bg-muted hover:bg-muted/80"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAvatarClick(e, chat);
                        }}
                      >
                        <Zap className={cn(
                          "w-3 h-3",
                          chat.storySeenStatus === "unseen" ? "text-primary-foreground" : "text-muted-foreground"
                        )} />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {chat.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {chat.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>

                  {chat.unread > 0 && (
                    <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {chat.unread}
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="requests" className="pt-4">
            <MessageRequestsSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* Story/Profile Choice Sheet */}
      <Sheet open={storyChoiceOpen} onOpenChange={setStoryChoiceOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{selectedChat?.name}</SheetTitle>
            <SheetDescription>Choose what you want to view</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 mt-6">
            <Button
              onClick={() => {
                setStoryChoiceOpen(false);
                navigate("/stories");
              }}
              variant="outline"
              className="w-full"
            >
              View Story
            </Button>
            <Button
              onClick={() => {
                setStoryChoiceOpen(false);
                if (selectedChat) {
                  navigate(`/user/${selectedChat.id}`);
                }
              }}
              variant="outline"
              className="w-full"
            >
              View Profile
            </Button>
            <Button
              onClick={() => setStoryChoiceOpen(false)}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Chat Context Menu Sheet */}
      <Sheet open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{longPressedChat?.name}</SheetTitle>
            <SheetDescription>Choose an action for this conversation</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 mt-6">
            <Button
              onClick={handleVideoCall}
              variant="outline"
              className="w-full"
            >
              <Video className="w-4 h-4 mr-2" />
              Video Call
            </Button>
            <Button
              onClick={handleBlockUser}
              variant="outline"
              className="w-full"
            >
              <Ban className="w-4 h-4 mr-2" />
              Block User
            </Button>
            <Button
              onClick={() => {
                setContextMenuOpen(false);
                setDeleteDialogOpen(true);
              }}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Conversation
            </Button>
            <Button
              onClick={() => setContextMenuOpen(false)}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Conversation Dialog */}
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
              <AlertDialogAction
                onClick={() => handleDeleteConversation(false)}
                className="flex-1"
              >
                Delete for me
              </AlertDialogAction>
            </div>
            <AlertDialogAction
              onClick={() => handleDeleteConversation(true)}
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
