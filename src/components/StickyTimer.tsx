import { useState, useEffect } from "react";
import { Bell, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const StickyTimer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [bpmMode, setBpmMode] = useState(false);

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
    setBpmMode(false);
  };

  return (
    <div
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Collapsed State */}
      {!isExpanded && (
        <div
          className={`rounded-l-[2rem] px-4 py-8 shadow-2xl transition-all duration-300 ${
            isActive
              ? "bg-[hsl(var(--timer-green))] text-[hsl(var(--timer-dark))]"
              : "bg-[hsl(var(--timer-green))] text-[hsl(var(--timer-dark))]"
          }`}
          style={{ minHeight: "200px" }}
        >
          <div className="flex flex-col items-center gap-4 text-sm font-medium">
            <div className="relative">
              <span className="text-xs">new</span>
              <Bell className="w-4 h-4 inline-block ml-1" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <div className="text-xs opacity-80">
              {isActive ? "Active" : "Ready"}
            </div>
            <div className="text-base font-bold whitespace-nowrap">
              {formatTime(time)}
            </div>
            <div className="text-xs opacity-70 text-center">
              <div>Meeting in</div>
              <div className="font-semibold">13 min</div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div
          className={`animate-bounce-in rounded-l-[3rem] px-8 py-10 shadow-2xl transition-colors duration-300 ${
            isActive
              ? "bg-[hsl(var(--timer-green))] text-[hsl(var(--timer-dark))]"
              : "bg-[hsl(var(--timer-orange))] text-[hsl(var(--timer-dark))]"
          }`}
          style={{
            minWidth: "280px",
            clipPath: "path('M 0 0 C 0 0, 0 50, 0 100 C 0 150, 30 180, 80 200 C 120 215, 160 225, 200 225 C 240 225, 270 215, 280 180 C 285 160, 285 130, 285 100 C 285 70, 285 40, 280 20 C 270 5, 240 0, 200 0 Z')",
          }}
        >
          <div className="flex flex-col items-center gap-4">
            {/* Header */}
            <div className="flex items-center justify-between w-full">
              <ChevronLeft className="w-5 h-5 opacity-60" />
              <div className="relative">
                <span className="text-xs font-medium">new</span>
                <Bell className="w-4 h-4 inline-block ml-1" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
            </div>

            {/* Timer Display */}
            <div className="text-5xl font-bold my-4">
              {formatTime(time)}
            </div>

            {/* Category */}
            <div className="text-sm font-semibold mb-2">
              Marketing / Meetings
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
              {!isActive ? (
                <>
                  <Button
                    onClick={handleStart}
                    className="bg-[hsl(var(--timer-dark))] text-white hover:bg-[hsl(var(--timer-dark))]/80 font-semibold px-6 rounded-lg"
                  >
                    START
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[hsl(var(--timer-dark))] text-[hsl(var(--timer-dark))] hover:bg-[hsl(var(--timer-dark))]/10 font-semibold px-6 rounded-lg"
                  >
                    TASKS
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setBpmMode(!bpmMode)}
                    className="bg-[hsl(var(--timer-dark))] text-white hover:bg-[hsl(var(--timer-dark))]/80 font-semibold px-6 rounded-lg"
                  >
                    BPM
                  </Button>
                  <Button
                    onClick={handleStop}
                    variant="outline"
                    className="border-[hsl(var(--timer-dark))] text-[hsl(var(--timer-dark))] hover:bg-[hsl(var(--timer-dark))]/10 font-semibold px-6 rounded-lg"
                  >
                    STOP
                  </Button>
                </>
              )}
            </div>

            {/* Next Meeting */}
            <div className="text-xs opacity-70 text-center">
              <div>Meeting in</div>
              <div className="font-semibold text-sm">13 min</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
