import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BellOff, Phone, Video, ArrowLeft, User, Mail, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent: boolean;
  type: "text" | "image" | "video" | "audio";
  mediaUrl?: string;
}

const mockMessages: Message[] = [
  { id: "1", content: "Photo 1", timestamp: "Yesterday", isSent: false, type: "image", mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb" },
  { id: "2", content: "Photo 2", timestamp: "Yesterday", isSent: false, type: "image", mediaUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2" },
];

const mockUserData = {
  "1": { 
    name: "Sarah Johnson", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", 
    online: true,
    bio: "Love traveling and photography! 📸✈️",
    birthday: "1995-06-15"
  },
  "2": { 
    name: "Mike Chen", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", 
    online: true,
    bio: "Tech enthusiast | Coffee lover ☕",
    birthday: "1992-03-22"
  },
};

export default function UserProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState("media");

  const user = mockUserData[userId as keyof typeof mockUserData] || mockUserData["1"];
  const messages = mockMessages;
  
  const mediaMessages = messages.filter((m) => m.type === "image" || m.type === "video");
  const photoMessages = messages.filter((m) => m.type === "image");
  const audioMessages = messages.filter((m) => m.type === "audio");

  const handleMessage = () => {
    toast({ title: "Opening chat..." });
    navigate(`/chat/${userId}`);
  };

  const handleMute = () => {
    toast({ title: "User muted", description: "You won't receive notifications from this user" });
  };

  const handleCall = () => {
    toast({ title: "Voice Call", description: "Starting voice call..." });
  };

  const handleVideoCall = () => {
    toast({ title: "Video Call", description: "Starting video call..." });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Header with profile */}
        <div className="relative bg-gradient-primary pt-12 pb-6 px-6 text-center">
          <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary-foreground/20 shadow-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-4xl">{user.name[0]}</AvatarFallback>
          </Avatar>
          
          <h2 className="text-2xl font-bold text-primary-foreground mb-1">{user.name}</h2>
          <p className="text-sm text-primary-foreground/70">
            {user.online ? "Active now" : "Last seen recently"}
          </p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-4 gap-2 p-4 border-b border-border bg-card">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 h-auto py-3"
            onClick={handleMessage}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs">Message</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 h-auto py-3"
            onClick={handleMute}
          >
            <BellOff className="w-5 h-5" />
            <span className="text-xs">Mute</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 h-auto py-3"
            onClick={handleCall}
          >
            <Phone className="w-5 h-5" />
            <span className="text-xs">Call</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 h-auto py-3"
            onClick={handleVideoCall}
          >
            <Video className="w-5 h-5" />
            <span className="text-xs">Video</span>
          </Button>
        </div>

        {/* Profile Info */}
        <div className="p-4 bg-card border-b border-border space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Bio</span>
            </div>
            <p className="text-base">{user.bio}</p>
          </div>

          {user.birthday && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Birthday</span>
              </div>
              <p className="text-base">
                {new Date(user.birthday).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Media tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-card">
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] bg-card">
            <TabsContent value="media" className="m-0 p-4">
              <div className="grid grid-cols-3 gap-2">
                {mediaMessages.length > 0 ? (
                  mediaMessages.map((msg) => (
                    <div key={msg.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      {msg.type === "image" && (
                        <img src={msg.mediaUrl} alt="" className="w-full h-full object-cover" />
                      )}
                      {msg.type === "video" && (
                        <video src={msg.mediaUrl} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="col-span-3 text-center text-muted-foreground py-8">
                    No media shared yet
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="photos" className="m-0 p-4">
              <div className="grid grid-cols-3 gap-2">
                {photoMessages.length > 0 ? (
                  photoMessages.map((msg) => (
                    <div key={msg.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={msg.mediaUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  <p className="col-span-3 text-center text-muted-foreground py-8">
                    No photos shared yet
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="audio" className="m-0 p-4">
              <div className="space-y-2">
                {audioMessages.length > 0 ? (
                  audioMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{msg.content}</p>
                        <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                      </div>
                      {msg.mediaUrl && (
                        <audio src={msg.mediaUrl} controls className="h-8" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No audio shared yet
                  </p>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
