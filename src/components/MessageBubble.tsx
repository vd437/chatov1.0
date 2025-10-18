import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Smile, Plus, Share } from "lucide-react";
import EmojiPicker from "@/components/EmojiPicker";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent: boolean;
  type: "text" | "image" | "video" | "audio";
  mediaUrl?: string;
}

interface MessageBubbleProps {
  message: Message;
  onDelete?: (messageId: string, deleteBothSides: boolean) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string) => void;
  currentUserReaction?: string;
  reactions?: { [key: string]: number };
}

export default function MessageBubble({ message, onDelete, onReaction, onRemoveReaction, currentUserReaction, reactions }: MessageBubbleProps) {
  const navigate = useNavigate();
  const { content, timestamp, isSent, type, mediaUrl } = message;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickEmoji, setShowQuickEmoji] = useState(false);
  const [removeReactionOpen, setRemoveReactionOpen] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const topEmojis = ["❤️", "😂", "😮", "😢", "👍"];

  const handleClick = () => {
    if (showQuickEmoji || showEmojiPicker) {
      setShowQuickEmoji(false);
      setShowEmojiPicker(false);
      return;
    }
    clickTimer.current = setTimeout(() => {
      setShowQuickEmoji(true);
    }, 200);
  };

  const handleLongPressStart = () => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }
    longPressTimer.current = setTimeout(() => {
      setDeleteDialogOpen(true);
      setShowQuickEmoji(false);
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (currentUserReaction && currentUserReaction !== emoji) {
      // Replace old reaction with new one
      if (onRemoveReaction) {
        onRemoveReaction(message.id);
      }
    }
    if (onReaction) {
      onReaction(message.id, emoji);
    }
    setShowQuickEmoji(false);
    setShowEmojiPicker(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
      setShowQuickEmoji(false);
      setShowEmojiPicker(false);
    }
  };

  const handleReactionClick = (emoji: string) => {
    if (currentUserReaction === emoji) {
      setRemoveReactionOpen(true);
    }
  };

  const handleDelete = (deleteBothSides: boolean) => {
    if (onDelete) {
      onDelete(message.id, deleteBothSides);
    }
    setDeleteDialogOpen(false);
  };

  const handleRemoveReaction = () => {
    if (onRemoveReaction) {
      onRemoveReaction(message.id);
    }
    setRemoveReactionOpen(false);
  };

  // Add/remove click outside listener
  useEffect(() => {
    if (showQuickEmoji || showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showQuickEmoji, showEmojiPicker]);

  const handleRedirect = () => {
    setDeleteDialogOpen(false);
    navigate("/forward-message", { state: { messageContent: content } });
  };

  return (
    <>
      <div
        className={cn(
          "flex animate-fade-in relative",
          isSent ? "justify-end" : "justify-start"
        )}
      >
        <div className="relative max-w-[70%]">
          <div
            className={cn(
              "rounded-2xl shadow-sm overflow-hidden cursor-pointer select-none",
              isSent
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm"
            )}
            onClick={handleClick}
            onMouseDown={handleLongPressStart}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onTouchStart={handleLongPressStart}
            onTouchEnd={handleLongPressEnd}
          >
          {type === "image" && mediaUrl && (
            <div className="relative group">
              <img
                src={mediaUrl}
                alt="Shared image"
                className="w-full h-auto object-cover max-h-[400px] rounded-t-xl"
              />
              <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl"
              )} />
            </div>
          )}
          {type === "video" && mediaUrl && (
            <div className="relative">
              <video
                src={mediaUrl}
                controls
                className="w-full h-auto max-h-[400px] object-cover rounded-t-xl"
              />
            </div>
          )}
          {type === "audio" && mediaUrl && (
            <div className="px-4 py-3">
              <audio src={mediaUrl} controls className="w-full max-w-xs" />
            </div>
          )}
          <div className={cn("px-4 py-2", (type === "image" || type === "video" || type === "audio") && mediaUrl && "pt-3")}>
            {content && <p className="text-sm break-words mb-1">{content}</p>}
            <span
              className={cn(
                "text-xs block",
                isSent ? "text-primary-foreground/70" : "text-muted-foreground"
              )}
            >
              {timestamp}
            </span>
          </div>
          </div>

          {/* Reactions */}
          {reactions && Object.keys(reactions).length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {Object.entries(reactions).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  className={cn(
                    "bg-background/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs flex items-center gap-1 border transition-all",
                    currentUserReaction === emoji ? "border-primary" : "border-border"
                  )}
                >
                  <span>{emoji}</span>
                  <span className="text-muted-foreground">{count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Emoji Picker */}
          {showQuickEmoji && (
            <div 
              ref={emojiPickerRef}
              className={cn(
                "absolute top-full mt-2 z-10 bg-card border border-border rounded-2xl shadow-lg p-2 flex items-center gap-2",
                isSent ? "right-0" : "left-0"
              )}
            >
              {topEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(emoji)}
                  className={cn(
                    "text-2xl hover:scale-125 transition-transform p-2 hover:bg-accent rounded-lg",
                    currentUserReaction === emoji && "bg-accent scale-110"
                  )}
                >
                  {emoji}
                </button>
              ))}
              <button
                onClick={() => {
                  setShowQuickEmoji(false);
                  setShowEmojiPicker(true);
                }}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Full Emoji Picker */}
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className={cn(
                "absolute top-full mt-2 z-10",
                isSent ? "right-0" : "left-0"
              )}
            >
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Message Sheet */}
      <Sheet open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Message options</SheetTitle>
            <SheetDescription>
              Choose an action for this message.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-3 mt-6">
            <Button
              onClick={handleRedirect}
              variant="outline"
              className="w-full"
            >
              <Share className="w-4 h-4 mr-2" />
              Forward message
            </Button>
            <Button
              onClick={() => handleDelete(false)}
              variant="outline"
              className="w-full"
            >
              Delete for me
            </Button>
            <Button
              onClick={() => handleDelete(true)}
              variant="destructive"
              className="w-full"
            >
              Delete for both parties
            </Button>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Remove Reaction Sheet */}
      <Sheet open={removeReactionOpen} onOpenChange={setRemoveReactionOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Remove reaction?</SheetTitle>
            <SheetDescription>
              Do you want to remove your {currentUserReaction} reaction from this message?
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-3 mt-6">
            <Button
              onClick={handleRemoveReaction}
              variant="destructive"
              className="w-full"
            >
              Remove reaction
            </Button>
            <Button
              onClick={() => setRemoveReactionOpen(false)}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
