import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface StoryItem {
  id: string;
  type: "image" | "video" | "text";
  content: string;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  duration: number;
}

interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  items: StoryItem[];
  timestamp: Date;
}

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const StoryViewer = ({
  story,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: StoryViewerProps) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentItem = story.items[currentItemIndex];

  useEffect(() => {
    setProgress(0);
    setIsPaused(false);

    if (currentItem.type === "video" && videoRef.current) {
      videoRef.current.play();
    }

    if (!isPaused) {
      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = (elapsed / currentItem.duration) * 100;

        if (newProgress >= 100) {
          handleNextItem();
        } else {
          setProgress(newProgress);
        }
      }, 50);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [currentItemIndex, isPaused]);

  const handleNextItem = () => {
    if (currentItemIndex < story.items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    } else if (hasNext) {
      onNext();
    } else {
      onClose();
    }
  };

  const handlePreviousItem = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    } else if (hasPrevious) {
      onPrevious();
    }
  };

  const handleLeftClick = () => {
    handlePreviousItem();
  };

  const handleRightClick = () => {
    handleNextItem();
  };

  const handleMouseDown = () => {
    setIsPaused(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleMouseUp = () => {
    setIsPaused(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const renderStoryContent = () => {
    switch (currentItem.type) {
      case "image":
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={currentItem.content}
              alt="Story"
              className="max-w-full max-h-full object-contain"
            />
            {currentItem.text && (
              <div className="absolute bottom-8 left-0 right-0 px-8">
                <p className="text-white text-center text-lg font-medium drop-shadow-lg">
                  {currentItem.text}
                </p>
              </div>
            )}
          </div>
        );
      case "video":
        return (
          <video
            ref={videoRef}
            src={currentItem.content}
            className="max-w-full max-h-full object-contain"
            onEnded={handleNextItem}
          />
        );
      case "text":
        return (
          <div
            className="w-full h-full flex items-center justify-center p-8"
            style={{ backgroundColor: currentItem.backgroundColor }}
          >
            <p
              className="text-4xl font-bold text-center"
              style={{ color: currentItem.textColor }}
            >
              {currentItem.content}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex gap-1 mb-4">
          {story.items.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: index < currentItemIndex ? "100%" : index === currentItemIndex ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={story.userAvatar} alt={story.userName} />
              <AvatarFallback>{story.userName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-semibold">{story.userName}</p>
              <p className="text-white/70 text-sm">
                {Math.floor((Date.now() - story.timestamp.getTime()) / (1000 * 60))}m ago
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer z-20"
          onClick={handleLeftClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer z-20"
          onClick={handleRightClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {renderStoryContent()}

        {hasPrevious && currentItemIndex === 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousItem}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-30"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}

        {(hasNext || currentItemIndex < story.items.length - 1) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextItem}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-30"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}
      </div>
    </div>
  );
};
