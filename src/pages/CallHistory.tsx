import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Video, ArrowUpRight, ArrowDownLeft, Search, MoreVertical, Trash2, PhoneCall, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMockData } from "@/contexts/MockDataContext";
import { useMockAuth } from "@/contexts/MockAuthContext";

interface CallLog {
  id: string;
  userId: string;
  type: "voice" | "video";
  direction: "outgoing" | "incoming" | "missed";
  timestamp: string;
  duration?: number; // seconds
}

const CALL_LOGS_KEY = "mock_call_logs";

function getCallLogs(): CallLog[] {
  const stored = localStorage.getItem(CALL_LOGS_KEY);
  if (stored) return JSON.parse(stored);

  // Generate demo data
  const demo: CallLog[] = [
    { id: "cl-1", userId: "fake-user-1", type: "voice", direction: "outgoing", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), duration: 185 },
    { id: "cl-2", userId: "fake-user-2", type: "video", direction: "incoming", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), duration: 420 },
    { id: "cl-3", userId: "fake-user-3", type: "voice", direction: "missed", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
    { id: "cl-4", userId: "fake-user-4", type: "video", direction: "outgoing", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), duration: 60 },
    { id: "cl-5", userId: "fake-user-5", type: "voice", direction: "missed", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
    { id: "cl-6", userId: "fake-user-1", type: "video", direction: "incoming", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), duration: 900 },
    { id: "cl-7", userId: "fake-user-2", type: "voice", direction: "outgoing", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), duration: 45 },
  ];
  localStorage.setItem(CALL_LOGS_KEY, JSON.stringify(demo));
  return demo;
}

function formatCallTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffHours < 48) {
    return "Yesterday";
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const CallHistory = () => {
  const navigate = useNavigate();
  const { getProfile } = useMockData();
  const [callLogs, setCallLogs] = useState<CallLog[]>(getCallLogs);
  const [search, setSearch] = useState("");

  const filtered = callLogs.filter((log) => {
    if (!search.trim()) return true;
    const profile = getProfile(log.userId);
    return profile?.username.toLowerCase().includes(search.toLowerCase());
  });

  const clearHistory = () => {
    setCallLogs([]);
    localStorage.setItem(CALL_LOGS_KEY, JSON.stringify([]));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-foreground">Calls</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={clearHistory} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete call history
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/user-search")}>
                <PhoneCall className="h-4 w-4 mr-2" />
                Make a call
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search calls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/50 border-none"
          />
        </div>
      </div>

      {/* Call list */}
      <div className="divide-y divide-border">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Phone className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">No calls yet</p>
          </div>
        )}

        {filtered.map((log) => {
          const profile = getProfile(log.userId);
          const isMissed = log.direction === "missed";
          const isOutgoing = log.direction === "outgoing";

          return (
            <div
              key={log.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/call/${log.userId}`)}
            >
              {/* Avatar */}
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {profile?.username?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isMissed ? "text-destructive" : "text-foreground"}`}>
                  {profile?.username || "Unknown"}
                </p>
                <div className="flex items-center gap-1.5 text-xs mt-0.5">
                  {/* Direction arrow */}
                  {isOutgoing ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-success shrink-0" />
                  ) : isMissed ? (
                    <ArrowDownLeft className="h-3.5 w-3.5 text-destructive shrink-0" />
                  ) : (
                    <ArrowDownLeft className="h-3.5 w-3.5 text-success shrink-0" />
                  )}
                  <span className="text-muted-foreground">
                    {formatCallTime(log.timestamp)}
                    {log.duration ? ` · ${formatDuration(log.duration)}` : ""}
                  </span>
                </div>
              </div>

              {/* Call type icon */}
              <div className="shrink-0">
                {log.type === "video" ? (
                  <Video className={`h-5 w-5 ${isMissed ? "text-destructive" : "text-primary"}`} />
                ) : (
                  <Phone className={`h-5 w-5 ${isMissed ? "text-destructive" : "text-primary"}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CallHistory;
