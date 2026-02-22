import { useCall } from "@/contexts/CallContext";
import { useLocation } from "react-router-dom";
import MinimizedCallBar from "./MinimizedCallBar";
import { useNavigate } from "react-router-dom";

export default function GlobalCallBar() {
  const { activeCall, endCall } = useCall();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show bar when on the call screen itself
  if (!activeCall || location.pathname.startsWith("/call/")) return null;

  return (
    <MinimizedCallBar
      userName={activeCall.userName}
      userAvatar={activeCall.userAvatar}
      startTime={activeCall.startTime}
      onEnd={endCall}
      onExpand={() => navigate(`/call/${activeCall.userId}?type=voice`)}
    />
  );
}
