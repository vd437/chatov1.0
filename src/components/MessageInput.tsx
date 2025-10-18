import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, Image, Video, Send } from "lucide-react";
import EmojiPicker from "@/components/EmojiPicker";
import VoiceRecorder from "@/components/VoiceRecorder";
import { toast } from "@/hooks/use-toast";

interface MessageInputProps {
  onSend: (content: string, type: "text" | "image" | "video" | "audio", mediaUrl?: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message, "text");
      setMessage("");
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  const handleFileSelect = (type: "image" | "video") => {
    const input = type === "image" ? imageInputRef.current : videoInputRef.current;
    const file = input?.files?.[0];
    
    if (file) {
      const url = URL.createObjectURL(file);
      onSend(type === "image" ? "📷 Photo" : "🎥 Video", type, url);
      toast({
        title: "Media sent!",
        description: `Your ${type} has been sent successfully.`,
      });
      if (input) input.value = "";
    }
  };

  const handleVoiceRecordingSend = (audioUrl: string, duration: number) => {
    onSend(`🎤 Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`, "audio", audioUrl);
    toast({
      title: "Voice message sent!",
      description: "Your audio has been sent successfully.",
    });
  };

  return (
    <div className="border-t border-border bg-card px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-end gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => imageInputRef.current?.click()}
          >
            <Image className="w-5 h-5" />
          </Button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={() => handleFileSelect("image")}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => videoInputRef.current?.click()}
          >
            <Video className="w-5 h-5" />
          </Button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={() => handleFileSelect("video")}
          />
        </div>

        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="pr-12 bg-muted/50"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="w-5 h-5" />
          </Button>

          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 w-72">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
            </div>
          )}
        </div>

        <VoiceRecorder onSend={handleVoiceRecordingSend} />

        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          className="rounded-full w-10 h-10 p-0"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
