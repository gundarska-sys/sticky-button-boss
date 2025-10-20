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
        <div className="relative animate-bounce-in" style={{ width: "350px", height: "700px" }}>
          {/* Droplet SVG Background */}
          <svg
            width="350"
            height="700"
            viewBox="0 0 350 700"
            className="absolute top-0 right-0"
            style={{ pointerEvents: "none" }}
          >
            <path
              d="M 350 60
                 Q 340 30, 320 10
                 L 350 0
                 L 350 700
                 L 320 690
                 Q 340 670, 340 640
                 Q 340 580, 320 520
                 Q 300 460, 250 420
                 Q 200 380, 120 350
                 Q 60 330, 20 320
                 Q 5 318, 0 318
                 L 0 382
                 Q 5 382, 20 380
                 Q 60 370, 120 350
                 Q 200 320, 250 280
                 Q 300 240, 320 180
                 Q 340 120, 340 60
                 Q 340 30, 320 10
                 Z"
              fill={isActive ? "hsl(var(--timer-green))" : "hsl(var(--timer-orange))"}
              className="transition-all duration-300"
            />
          </svg>
          
          {/* Content Inside Droplet */}
          <div className="absolute inset-0 flex items-center justify-center pr-4">
            <div className="flex flex-col items-center gap-5 text-[hsl(var(--timer-dark))] w-full max-w-[260px] mr-4">
              {/* Header - Bell notification */}
              <div className="self-end flex items-center gap-1">
                <span className="text-xs font-medium">new</span>
                <div className="relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </div>
              </div>

              {/* Timer Display */}
              <div className="text-[68px] font-bold leading-none">
                {formatTime(time)}
              </div>

              {/* Category */}
              <div className="text-lg font-semibold">
                Marketing / Meetings
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!isActive ? (
                  <>
                    <Button
                      onClick={handleStart}
                      className="bg-[hsl(var(--timer-dark))] text-white hover:bg-[hsl(var(--timer-dark))]/90 font-bold px-8 py-2.5 rounded-lg text-sm shadow-none border-0"
                    >
                      START
                    </Button>
                    <Button
                      className="bg-transparent border-2 border-[hsl(var(--timer-dark))] text-[hsl(var(--timer-dark))] hover:bg-[hsl(var(--timer-dark))]/10 font-bold px-8 py-2.5 rounded-lg text-sm shadow-none"
                    >
                      TASKS
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="bg-transparent border-2 border-[hsl(var(--timer-dark))] text-[hsl(var(--timer-dark))] hover:bg-[hsl(var(--timer-dark))]/10 font-bold px-8 py-2.5 rounded-lg text-sm shadow-none"
                    >
                      BPM
                    </Button>
                    <Button
                      onClick={handleStop}
                      className="bg-[hsl(var(--timer-dark))] text-white hover:bg-[hsl(var(--timer-dark))]/90 font-bold px-8 py-2.5 rounded-lg text-sm shadow-none border-0"
                    >
                      STOP
                    </Button>
                  </>
                )}
              </div>

              {/* Next Meeting */}
              <div className="text-sm text-center opacity-70 mt-2">
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
