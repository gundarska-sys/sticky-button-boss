import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import dropletGreen from "@/assets/droplet-green.svg";
import pillGreen from "@/assets/pill-green.svg";
import dropletOrange from "@/assets/droplet-orange.svg";
import pillOrange from "@/assets/pill-orange.svg";

export const StickyTimer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}.${secs.toString().padStart(2, "0")} min`;
  };

  const handleStart = () => {
    setIsActive(true);
    setTime(0);
  };

  const handleStop = () => {
    setIsActive(false);
    setTime(0);
  };

  return (
    <div
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50 transition-all duration-100"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Collapsed State */}
      {!isExpanded && (
        <div className="relative" style={{ width: "61px", height: "252px" }}>
          <img
            src={isActive ? pillGreen : pillGreen}
            alt="Timer pill"
            className="absolute top-0 right-0 w-full h-full transition-all duration-300"
          />
          
          <div className="absolute inset-0 flex flex-col items-center justify-between py-6 px-3 text-[hsl(var(--timer-dark))]">
            <div className="relative flex items-center gap-1">
              <span className="text-xs font-medium">new</span>
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-medium">Active</div>
              <div className="text-sm font-bold whitespace-nowrap">
                {formatTime(time)}
              </div>
            </div>
            
            <div className="text-xs text-center opacity-80">
              <div className="mb-1">Meeting in</div>
              <div className="font-semibold">13 min</div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded State - Droplet */}
      {isExpanded && (
        <div className="relative animate-bounce-in" style={{ width: "215px", height: "487px" }}>
          <img
            src={isActive ? dropletGreen : dropletOrange}
            alt="Timer droplet"
            className="absolute top-0 right-0 w-full h-full transition-all duration-300"
          />
          
          <div className="absolute inset-0 flex items-center justify-center pr-6">
            <div className="flex flex-col items-center gap-3 w-full max-w-[160px]" style={{ color: "#434343" }}>
              <div className="self-end flex items-center gap-1 mb-1">
                <span className="font-medium" style={{ fontSize: "12.48px" }}>new</span>
                <div className="relative">
                  <Bell className="w-3.5 h-3.5" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                </div>
              </div>

              <div className="font-bold leading-none" style={{ fontSize: "24.97px" }}>
                {formatTime(time)}
              </div>

              <div className="font-semibold text-center -mt-1" style={{ fontSize: "12.48px" }}>
                Marketing / Meetings
              </div>

              <div className="flex gap-2.5">
                {!isActive ? (
                  <>
                    <Button
                      onClick={handleStart}
                      className="font-bold shadow-none border-0"
                      style={{
                        backgroundColor: "#063A39",
                        color: "white",
                        fontSize: "9.99px",
                        width: "54.93px",
                        height: "18.31px",
                        borderRadius: "3px",
                        padding: "0",
                      }}
                    >
                      START
                    </Button>
                    <Button
                      className="bg-transparent font-bold shadow-none"
                      style={{
                        border: "2px solid #063A39",
                        color: "#063A39",
                        fontSize: "9.99px",
                        width: "54.93px",
                        height: "18.31px",
                        borderRadius: "3px",
                        padding: "0",
                      }}
                    >
                      TASKS
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="bg-transparent font-bold shadow-none"
                      style={{
                        border: "2px solid #063A39",
                        color: "#063A39",
                        fontSize: "9.99px",
                        width: "54.93px",
                        height: "18.31px",
                        borderRadius: "3px",
                        padding: "0",
                      }}
                    >
                      BPM
                    </Button>
                    <Button
                      onClick={handleStop}
                      className="font-bold shadow-none border-0"
                      style={{
                        backgroundColor: "#063A39",
                        color: "white",
                        fontSize: "9.99px",
                        width: "54.93px",
                        height: "18.31px",
                        borderRadius: "3px",
                        padding: "0",
                      }}
                    >
                      STOP
                    </Button>
                  </>
                )}
              </div>

              <div className="text-center opacity-70">
                <div className="mb-0.5" style={{ fontSize: "9px" }}>Meeting in</div>
                <div className="font-bold" style={{ fontSize: "10px" }}>13 min</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
