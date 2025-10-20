import { useState, useEffect } from "react";
import { Bell, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div
          className="relative bg-[hsl(var(--timer-green))] text-[hsl(var(--timer-dark))] shadow-2xl transition-all duration-300"
          style={{
            width: "80px",
            height: "280px",
            borderRadius: "40px 0 0 40px",
          }}
        >
          <div className="flex flex-col items-center justify-between h-full py-6 px-3">
            <div className="relative flex items-center gap-1">
              <span className="text-xs font-medium">new</span>
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-medium">
                {isActive ? "Active" : "Ready"}
              </div>
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

      {/* Expanded State */}
      {isExpanded && (
        <div className="relative animate-bounce-in">
          <svg
            width="400"
            height="600"
            viewBox="0 0 400 600"
            className="absolute top-1/2 right-0 -translate-y-1/2"
            style={{ pointerEvents: "none" }}
          >
            <path
              d="M 400 0 C 350 0, 320 20, 300 60 C 280 100, 260 140, 220 180 C 180 220, 140 240, 100 270 C 60 300, 20 330, 0 370 L 0 230 C 20 270, 60 300, 100 330 C 140 360, 180 380, 220 420 C 260 460, 280 500, 300 540 C 320 580, 350 600, 400 600 Z"
              fill={isActive ? "hsl(var(--timer-green))" : "hsl(var(--timer-orange))"}
              className="transition-all duration-300"
            />
          </svg>
          
          <div
            className="relative z-10 pr-12 pl-8 py-12"
            style={{ width: "340px", minHeight: "600px" }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-6">
              {/* Header */}
              <div className="flex items-center justify-between w-full px-4">
                <ChevronLeft className="w-5 h-5 opacity-60" />
                <div className="relative flex items-center gap-1">
                  <span className="text-xs font-medium">new</span>
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </div>
              </div>

              {/* Timer Display */}
              <div className="text-6xl font-bold my-6" style={{ color: "hsl(var(--timer-dark))" }}>
                {formatTime(time)}
              </div>

              {/* Category */}
              <div className="text-base font-semibold mb-4" style={{ color: "hsl(var(--timer-dark))" }}>
                Marketing / Meetings
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                {!isActive ? (
                  <>
                    <Button
                      onClick={handleStart}
                      className="bg-[hsl(var(--timer-dark))] text-white hover:bg-[hsl(var(--timer-dark))]/90 font-bold px-8 py-2 rounded-lg text-sm"
                    >
                      START
                    </Button>
                    <Button
                      className="bg-transparent border-2 border-[hsl(var(--timer-dark))] text-[hsl(var(--timer-dark))] hover:bg-[hsl(var(--timer-dark))]/10 font-bold px-8 py-2 rounded-lg text-sm"
                    >
                      TASKS
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="bg-[hsl(var(--timer-dark))] text-white hover:bg-[hsl(var(--timer-dark))]/90 font-bold px-8 py-2 rounded-lg text-sm"
                    >
                      BPM
                    </Button>
                    <Button
                      onClick={handleStop}
                      className="bg-transparent border-2 border-[hsl(var(--timer-dark))] text-[hsl(var(--timer-dark))] hover:bg-[hsl(var(--timer-dark))]/10 font-bold px-8 py-2 rounded-lg text-sm"
                    >
                      STOP
                    </Button>
                  </>
                )}
              </div>

              {/* Next Meeting */}
              <div className="text-sm text-center" style={{ color: "hsl(var(--timer-dark))", opacity: 0.8 }}>
                <div className="mb-1">Meeting in</div>
                <div className="font-bold text-base">13 min</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
