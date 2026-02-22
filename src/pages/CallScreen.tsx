import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, VideoOff, Video, Mic, MicOff, PhoneOff, Minimize2 } from "lucide-react";
import MinimizedCallBar from "@/components/MinimizedCallBar";

const mockChatInfo: Record<string, { name: string; avatar: string }> = {
  "fake-user-1": { name: "Sarah Johnson", avatar: "https://i.pravatar.cc/150?u=sarah" },
  "fake-user-2": { name: "Mike Chen", avatar: "https://i.pravatar.cc/150?u=mike" },
  "fake-user-3": { name: "Emma Wilson", avatar: "https://i.pravatar.cc/150?u=emma" },
  "fake-user-4": { name: "Alex Turner", avatar: "https://i.pravatar.cc/150?u=alex" },
  "fake-user-5": { name: "Lisa Park", avatar: "https://i.pravatar.cc/150?u=lisa" },
};

export default function CallScreen() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const callType = searchParams.get("type") || "voice";

  const user = mockChatInfo[userId as string] || { name: "Unknown", avatar: "" };

  const [callState, setCallState] = useState<"waiting" | "connected">("waiting");
  const [elapsed, setElapsed] = useState(0);
  const [connectedAt, setConnectedAt] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-answer after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCallState("connected");
      setConnectedAt(Date.now());
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Call timer
  useEffect(() => {
    if (callState !== "connected") return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const endCall = useCallback(() => navigate(-1), [navigate]);

  const handleMinimize = () => {
    if (callState === "connected") {
      setIsMinimized(true);
    } else {
      endCall();
    }
  };

  if (isMinimized) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <MinimizedCallBar
          userName={user.name}
          userAvatar={user.avatar}
          startTime={connectedAt}
          onEnd={endCall}
          onExpand={() => setIsMinimized(false)}
        />
        <div className="flex-1 pt-8" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-between relative overflow-hidden"
      style={{ background: isCameraOn ? "#000" : "var(--gradient-primary)" }}>

      {/* Video mode: remote video fullscreen */}
      {isCameraOn && (
        <>
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="https://www.w3schools.com/html/mov_bbb.mp4"
            autoPlay loop muted playsInline
          />
          <div className="absolute inset-0 bg-black/20" />

          {/* Local PiP camera */}
          <div className="absolute bottom-28 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-primary-foreground/30 shadow-xl z-20">
            <video
              className="w-full h-full object-cover scale-x-[-1]"
              src="https://www.w3schools.com/html/movie.mp4"
              autoPlay loop muted playsInline
            />
          </div>
        </>
      )}

      {/* Top bar */}
      <div className="w-full flex items-center justify-between p-4 relative z-10">
        <Button variant="ghost" size="icon" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-full"
          onClick={handleMinimize}>
          <Minimize2 className="w-5 h-5" />
        </Button>

        {/* Timer at top when camera is on or connected */}
        {callState === "connected" && (
          <span className="text-primary-foreground/90 text-sm font-medium tabular-nums">
            {formatTime(elapsed)}
          </span>
        )}
        {callState === "waiting" && <span />}
        <span className="w-10" />
      </div>

      {/* Center: avatar + name + status (hidden in video mode) */}
      {!isCameraOn && (
        <div className="flex flex-col items-center gap-4 -mt-8 relative z-10">
          <div className={`relative rounded-full ${callState === "waiting" ? "animate-pulse" : ""}`}>
            <div className="absolute -inset-4 rounded-full bg-primary-foreground/10" />
            <div className="absolute -inset-8 rounded-full bg-primary-foreground/5" />
            <Avatar className="w-32 h-32 border-4 border-primary-foreground/20 relative z-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-4xl bg-primary-foreground/20 text-primary-foreground">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <h2 className="text-2xl font-bold text-primary-foreground mt-2">{user.name}</h2>

          {callState === "waiting" ? (
            <WaitingDots />
          ) : (
            <p className="text-primary-foreground/80 text-sm font-medium tabular-nums">
              {formatTime(elapsed)}
            </p>
          )}
        </div>
      )}

      {/* Spacer when camera is on */}
      {isCameraOn && <div className="flex-1" />}

      {/* Bottom action buttons */}
      <div className="w-full px-6 pb-10 relative z-10">
        <div className="flex items-center justify-around max-w-xs mx-auto">
          <ActionButton
            icon={isSpeaker ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            label={isSpeaker ? "Unmute" : "Speaker"}
            active={isSpeaker}
            onClick={() => setIsSpeaker(!isSpeaker)}
          />
          <ActionButton
            icon={isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            label="Camera"
            active={isCameraOn}
            onClick={() => setIsCameraOn(!isCameraOn)}
          />
          <ActionButton
            icon={isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            label={isMuted ? "Unmute" : "Mute"}
            active={isMuted}
            onClick={() => setIsMuted(!isMuted)}
          />
          <button onClick={endCall} className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors">
              <PhoneOff className="w-6 h-6 text-destructive-foreground" />
            </div>
            <span className="text-xs text-primary-foreground/70">End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
        active ? "bg-primary-foreground text-primary" : "bg-primary-foreground/20 text-primary-foreground"
      }`}>
        {icon}
      </div>
      <span className="text-xs text-primary-foreground/70">{label}</span>
    </button>
  );
}

function WaitingDots() {
  const [dots, setDots] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setDots((d) => (d + 1) % 4), 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-primary-foreground/80 text-sm font-medium">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-foreground/60 mr-1.5 align-middle" />
      Waiting{".".repeat(dots)}
    </p>
  );
}
