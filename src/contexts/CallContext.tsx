import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

interface ActiveCall {
  userId: string;
  userName: string;
  userAvatar: string;
  startTime: number;
}

interface CallContextType {
  activeCall: ActiveCall | null;
  startCall: (call: ActiveCall) => void;
  endCall: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  const startCall = useCallback((call: ActiveCall) => {
    setActiveCall(call);
  }, []);

  const endCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  return (
    <CallContext.Provider value={{ activeCall, startCall, endCall }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used within CallProvider");
  return ctx;
}
