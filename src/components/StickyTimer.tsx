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
      {/* Collapsed State - Simple Pill */}
      {!isExpanded && (
        <div
          className="relative shadow-2xl transition-all duration-300 overflow-hidden"
          style={{
            width: "80px",
            height: "280px",
            borderRadius: "40px 0 0 40px",
            backgroundColor: isActive ? "hsl(var(--timer-green))" : "hsl(var(--timer-green))",
          }}
        >
          <div className="flex flex-col items-center justify-between h-full py-6 px-3 text-[hsl(var(--timer-dark))]">
            <div className="relative flex items-center gap-1">
              <span className="text-xs font-medium">new</span>
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-medium">
                {isActive ? "Active" : "Active"}
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

      {/* Expanded State - Droplet Shape */}
      {isExpanded && (
        <div className="relative animate-bounce-in" style={{ width: "380px", height: "550px" }}>
          {/* Droplet SVG Background */}
          <svg
            width="380"
            height="550"
            viewBox="0 0 380 550"
            className="absolute top-0 right-0"
            style={{ pointerEvents: "none" }}
          >
            <defs>
              <clipPath id="droplet-clip">
                <path d="M 380 50 C 380 50, 380 100, 350 150 C 320 200, 280 230, 200 280 C 120 330, 60 360, 30 410 C 10 445, 0 470, 0 470 L 0 130 C 0 130, 10 105, 30 140 C 60 190, 120 220, 200 270 C 280 320, 320 350, 350 400 C 380 450, 380 500, 380 500 Z" />
              </clipPath>
            </defs>
            <path
              d="M 380 50 C 380 50, 380 100, 350 150 C 320 200, 280 230, 200 280 C 120 330, 60 360, 30 410 C 10 445, 0 470, 0 470 L 0 130 C 0 130, 10 105, 30 140 C 60 190, 120 220, 200 270 C 280 320, 320 350, 350 400 C 380 450, 380 500, 380 500 Z"
              fill={isActive ? "hsl(var(--timer-green))" : "hsl(var(--timer-orange))"}
              className="transition-all duration-300"
            />
          </svg>
          
          {/* Content Inside Droplet */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
            style={{ clipPath: "url(#droplet-clip)" }}
          >
            <div className="flex flex-col items-center gap-6 text-[hsl(var(--timer-dark))] w-full max-w-[280px]">
              {/* Header */}
              <div className="flex items-center justify-between w-full">
                <ChevronLeft className="w-5 h-5 opacity-60" />
                <div className="relative flex items-center gap-1">
                  <span className="text-xs font-medium">new</span>
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </div>
              </div>

              {/* Timer Display */}
              <div className="text-6xl font-bold my-4">
                {formatTime(time)}
              </div>

              {/* Category */}
              <div className="text-base font-semibold mb-2">
                Marketing / Meetings
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-4">
                {!isActive ? (
                  <>
                    <Button
                      onClick={handleStart}
                      className="bg-[hsl(var(--timer-dark))] text-white hover:bg-[hsl(var(--timer-dark))]/90 font-bold px-8 py-2 rounded-lg text-sm shadow-none border-0"
                    >
                      START
                    </Button>
                    <Button
                      className="bg-transparent border-2 border-[hsl(var(--timer-dark))] text-[hsl(var(--timer-dark))] hover:bg-[hsl(var(--timer-dark))]/10 font-bold px-8 py-2 rounded-lg text-sm shadow-none"
                    >
                      TASKS
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="bg-[hsl(var(--timer-dark))] text-white hover:bg-[hsl(var(--timer-dark))]/90 font-bold px-8 py-2 rounded-lg text-sm shadow-none border-0"
                    >
                      BPM
                    </Button>
                    <Button
                      onClick={handleStop}
                      className="bg-transparent border-2 border-[hsl(var(--timer-dark))] text-[hsl(var(--timer-dark))] hover:bg-[hsl(var(--timer-dark))]/10 font-bold px-8 py-2 rounded-lg text-sm shadow-none"
                    >
                      STOP
                    </Button>
                  </>
                )}
              </div>

              {/* Next Meeting */}
              <div className="text-sm text-center opacity-80">
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
