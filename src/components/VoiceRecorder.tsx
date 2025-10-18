import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Send, X, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onSend: (audioUrl: string, duration: number) => void;
}

export default function VoiceRecorder({ onSend }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      updateDuration();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const updateDuration = () => {
    if (isRecording && !isPaused) {
      const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current;
      setDuration(Math.floor(elapsed / 1000));
      animationFrameRef.current = requestAnimationFrame(updateDuration);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setDuration(0);
    setAudioBlob(null);
    setAudioUrl(null);
    audioChunksRef.current = [];
    pausedTimeRef.current = 0;
  };

  const handleSend = () => {
    if (audioUrl && audioBlob) {
      onSend(audioUrl, duration);
      cancelRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isRecording && !audioBlob) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={startRecording}
      >
        <Mic className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-full">
      {isRecording && (
        <>
          {/* Recording indicator with animation */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 bg-destructive rounded-full animate-pulse",
                    i === 0 || i === 4 ? "h-3" : i === 1 || i === 3 ? "h-5" : "h-7"
                  )}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "0.8s",
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-destructive">
              {formatDuration(duration)}
            </span>
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-1 ml-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={cancelRecording}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={stopRecording}
            >
              <Square className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {!isRecording && audioBlob && (
        <>
          <span className="text-sm font-medium">{formatDuration(duration)}</span>
          <div className="flex items-center gap-1 ml-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={cancelRecording}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              className="rounded-full h-8 w-8 bg-primary"
              onClick={handleSend}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
