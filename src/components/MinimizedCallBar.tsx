import { PhoneOff, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface MinimizedCallBarProps {
  userName: string;
  userAvatar: string;
  startTime: number; // timestamp when call connected
  onEnd: () => void;
  onExpand: () => void;
}

export default function MinimizedCallBar({ userName, startTime, onEnd, onExpand }: MinimizedCallBarProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-1.5 cursor-pointer"
      style={{ backgroundColor: "hsl(var(--success))", color: "hsl(var(--success-foreground, 0 0% 100%))" }}
      onClick={onExpand}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Phone className="w-3.5 h-3.5 shrink-0" />
        <span className="text-xs font-medium truncate">{userName}</span>
        <span className="text-xs tabular-nums opacity-80">{formatTime(elapsed)}</span>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onEnd(); }}
        className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center shrink-0 hover:bg-destructive/90 transition-colors"
      >
        <PhoneOff className="w-3 h-3" />
      </button>
    </div>
  );
}
