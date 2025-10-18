import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BellOff, Phone, Video, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent: boolean;
  type: "text" | "image" | "video" | "audio";
  mediaUrl?: string;
}

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    name: string;
    avatar: string;
    online: boolean;
    lastSeen?: string;
  };
  messages: Message[];
  onMessage: () => void;
  onMute: () => void;
  onCall: () => void;
  onVideoCall: () => void;
}

export default function UserProfileDialog({
  open,
  onOpenChange,
  user,
  messages,
  onMessage,
  onMute,
  onCall,
  onVideoCall,
}: UserProfileDialogProps) {
  const [activeTab, setActiveTab] = useState("media");

  // Filter messages by type
  const mediaMessages = messages.filter((m) => m.type === "image" || m.type === "video");
  const photoMessages = messages.filter((m) => m.type === "image");
  const audioMessages = messages.filter((m) => m.type === "audio");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0">
        {/* Header with profile */}
        <div className="relative bg-gradient-primary pt-12 pb-6 px-6 text-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => onOpenChange(false)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary-foreground/20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-4xl">{user.name[0]}</AvatarFallback>
          </Avatar>
          
          <h2 className="text-2xl font-bold text-primary-foreground mb-1">{user.name}</h2>
          <p className="text-sm text-primary-foreground/70">
            {user.online ? "Active now" : `Last seen ${user.lastSeen || "recently"}`}
          </p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-4 gap-2 p-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 h-auto py-3"
            onClick={onMessage}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs">Message</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 h-auto py-3"
            onClick={onMute}
          >
            <BellOff className="w-5 h-5" />
            <span className="text-xs">Mute</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 h-auto py-3"
            onClick={onCall}
          >
            <Phone className="w-5 h-5" />
            <span className="text-xs">Call</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 h-auto py-3"
            onClick={onVideoCall}
          >
            <Video className="w-5 h-5" />
            <span className="text-xs">Video</span>
          </Button>
        </div>

        {/* Media tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[300px]">
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
      </DialogContent>
    </Dialog>
  );
}
