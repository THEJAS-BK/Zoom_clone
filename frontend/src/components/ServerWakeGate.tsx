// components/ServerWakeGate.tsx
import { useEffect, useState } from "react";
import api from "../utils/axios";

type WakeStatus = "checking" | "awake" | "waking";

export default function ServerWakeGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<WakeStatus>("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval>;

    const ping = async () => {
      try {
        await api.get("/health", { timeout: 5000 });
        if (!cancelled) {
          setStatus("awake");
          clearInterval(interval);
        }
      } catch {
        if (!cancelled) {
          setStatus("waking");
          setAttempt((a) => a + 1);
        }
      }
    };

    ping(); // first attempt immediately
    interval = setInterval(ping, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (status === "awake") {
    return <>{children}</>;
  }

  return (
       <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center px-6">
         <div className="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-3 max-w-sm text-center">
           <div className="w-8 h-8 border-4 border-gray-200 border-t-[#0a0e1a] rounded-full animate-spin" />
           <p className="text-sm font-semibold text-[#0a0e1a]">
             {status === "checking" ? "Connecting..." : "Waking up the server..."}
           </p>
           <p className="text-xs text-gray-500">
             The free-tier server sleeps when idle. This can take up to 30–50 seconds.
           </p>
            {attempt > 3 && (
             <p className="text-xs text-gray-400">Still trying (attempt {attempt})...</p>
           )} 
         </div>
       </div>
  );
}