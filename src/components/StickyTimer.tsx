import { useState, useEffect, useRef } from "react";
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
  const [side, setSide] = useState<'left' | 'right'>('right');
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [userSetPosition, setUserSetPosition] = useState(false);
  const [nextMeetingTime, setNextMeetingTime] = useState<Date | null>(null);
  const [showMeetingInput, setShowMeetingInput] = useState(false);
  const [meetingTimeInput, setMeetingTimeInput] = useState("");
  const [position, setPosition] = useState(() => ({
    x: window.innerWidth - 215,
    y: 50,
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const timerRef = useRef<HTMLDivElement>(null);

  // Calculate time until meeting
  const getTimeUntilMeeting = () => {
    if (!nextMeetingTime) return "No meeting";
    
    const now = new Date();
    const diff = nextMeetingTime.getTime() - now.getTime();
    
    if (diff < 0) return "Meeting started";
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const handleSetMeetingTime = () => {
    if (meetingTimeInput) {
      const meetingDate = new Date(meetingTimeInput);
      setNextMeetingTime(meetingDate);
      localStorage.setItem('nextMeetingTime', meetingDate.toISOString());
      setShowMeetingInput(false);
      setMeetingTimeInput("");
    }
  };

  // Load saved meeting time on mount
  useEffect(() => {
    const saved = localStorage.getItem('nextMeetingTime');
    if (saved) {
      const meetingDate = new Date(saved);
      if (meetingDate > new Date()) {
        setNextMeetingTime(meetingDate);
      } else {
        localStorage.removeItem('nextMeetingTime');
      }
    }
  }, []);

  // Check for new notifications
  useEffect(() => {
    const checkNotifications = async () => {
      // TODO: Replace with actual API call to check notifications
      // For now, this is a placeholder that can be triggered by external events
      // Example: const response = await fetch('https://bpm.zoomcharts.com:9000/api/notifications/unread');
      // setHasNewNotifications(response.hasUnread);
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Check if in Teams meeting - only on initial load
  useEffect(() => {
    if (userSetPosition) return; // Don't override user position
    
    const checkTeamsMeeting = () => {
      // Check if running in Teams context or if window title contains "Meeting"
      const inTeams = window.location.href.includes('teams.microsoft.com') || 
                      document.title.toLowerCase().includes('meeting') ||
                      document.title.toLowerCase().includes('teams');
      setIsInMeeting(inTeams);
      
      // Update position based on meeting status only if user hasn't set it
      if (inTeams) {
        setPosition(prev => ({
          ...prev,
          y: window.innerHeight - 487 - 50, // Bottom position
        }));
      } else {
        setPosition(prev => ({
          ...prev,
          y: 50, // Top position
        }));
      }
    };

    checkTeamsMeeting();
  }, []); // Only run once on mount

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newY = e.clientY - dragOffset.y;
        const midScreen = window.innerWidth / 2;
        const newSide = e.clientX < midScreen ? 'left' : 'right';
        
        setPosition({
          x: newSide === 'right' ? window.innerWidth - 215 : 0,
          y: Math.max(0, Math.min(newY, window.innerHeight - 487)),
        });
        setSide(newSide);
        setUserSetPosition(true); // Mark that user has manually positioned it
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (timerRef.current) {
      const rect = timerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

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
      ref={timerRef}
      className="fixed z-[9999]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
        width: "215px",
        height: "487px",
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => !isDragging && setIsExpanded(false)}
      onMouseDown={handleMouseDown}
    >
      {/* Collapsed State */}
      {!isExpanded && (
        <div className="absolute" style={{ width: "61px", height: "252px", top: "50%", transform: "translateY(-50%)", right: side === 'right' ? '0' : 'auto', left: side === 'left' ? '0' : 'auto' }}>
          <img
            src={isActive ? pillGreen : pillOrange}
            alt="Timer pill"
            className="absolute top-0 w-full h-full transition-all duration-300"
            style={{ left: 0, transform: side === 'left' ? 'scaleX(-1)' : 'none' }}
          />
          
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center px-3 text-[hsl(var(--timer-dark))] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowMeetingInput(true);
            }}
          >
            <div className="text-xs text-center">
              {nextMeetingTime ? (
                <>
                  <div className="mb-1">Meeting in</div>
                  <div className="font-semibold">{getTimeUntilMeeting()}</div>
                </>
              ) : (
                <div className="font-semibold">No meeting</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expanded State - Droplet */}
      {isExpanded && (
        <div 
          className="absolute inset-0 animate-bounce-in" 
          style={{ 
            transform: side === 'left' ? 'scaleX(-1)' : 'none'
          }}
        >
          <img
            src={isActive ? dropletGreen : dropletOrange}
            alt="Timer droplet"
            className="absolute inset-0 w-full h-full transition-all duration-300"
          />
          
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ 
              paddingRight: side === 'right' ? '24px' : '0',
              paddingLeft: side === 'left' ? '24px' : '0',
              transform: side === 'left' ? 'scaleX(-1)' : 'none'
            }}
          >
            <div className="flex flex-col items-center gap-3 w-full max-w-[160px]" style={{ color: "#434343" }}>
              <div className="self-end flex items-center gap-1 mb-1">
                {hasNewNotifications && <span className="font-medium" style={{ fontSize: "12.48px" }}>new</span>}
                <div 
                  className="relative cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHasNewNotifications(false); // Mark as read when clicked
                    window.open('https://bpm.zoomcharts.com:9000/#/app/notifications', '_blank');
                  }}
                >
                  <Bell className="w-3.5 h-3.5" />
                  {hasNewNotifications && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  )}
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
                      className="font-bold shadow-none border-0 transition-colors"
                      style={{
                        backgroundColor: "#063A39",
                        color: "white",
                        fontSize: "9.99px",
                        width: "54.93px",
                        height: "18.31px",
                        borderRadius: "3px",
                        padding: "0",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6B6B6B"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#063A39"}
                    >
                      START
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://bpm.zoomcharts.com:9000/#/app/my-tasks', '_blank');
                      }}
                      className="bg-transparent font-bold shadow-none transition-colors"
                      style={{
                        border: "0.83px solid #063A39",
                        color: "#063A39",
                        fontSize: "9.99px",
                        width: "54.93px",
                        height: "18.31px",
                        borderRadius: "3px",
                        padding: "0",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#3D3D3D";
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.borderColor = "#3D3D3D";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#063A39";
                        e.currentTarget.style.borderColor = "#063A39";
                      }}
                    >
                      TASKS
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://bpm.zoomcharts.com:9000/#/app/apps', '_blank');
                      }}
                      className="bg-transparent font-bold shadow-none transition-colors"
                      style={{
                        border: "0.83px solid #063A39",
                        color: "#063A39",
                        fontSize: "9.99px",
                        width: "54.93px",
                        height: "18.31px",
                        borderRadius: "3px",
                        padding: "0",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#3D3D3D";
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.borderColor = "#3D3D3D";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#063A39";
                        e.currentTarget.style.borderColor = "#063A39";
                      }}
                    >
                      BPM
                    </Button>
                    <Button
                      onClick={handleStop}
                      className="font-bold shadow-none border-0 transition-colors"
                      style={{
                        backgroundColor: "#063A39",
                        color: "white",
                        fontSize: "9.99px",
                        width: "54.93px",
                        height: "18.31px",
                        borderRadius: "3px",
                        padding: "0",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#6B6B6B"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#063A39"}
                    >
                      STOP
                    </Button>
                  </>
                )}
              </div>

              <div className="text-center opacity-70">
                <div 
                  className="mb-0.5 cursor-pointer hover:opacity-100 transition-opacity"
                  style={{ fontSize: "9px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMeetingInput(true);
                  }}
                >
                  Meeting in
                </div>
                <div className="font-bold" style={{ fontSize: "10px" }}>
                  {getTimeUntilMeeting()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Time Input Dialog */}
      {showMeetingInput && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]"
          onClick={() => setShowMeetingInput(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            style={{ color: "#434343" }}
          >
            <h3 className="text-lg font-bold mb-4">Set Next Meeting</h3>
            <input
              type="datetime-local"
              value={meetingTimeInput}
              onChange={(e) => setMeetingTimeInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              style={{ fontSize: "14px" }}
            />
            <div className="flex gap-3">
              <Button
                onClick={handleSetMeetingTime}
                className="flex-1 font-bold shadow-none border-0"
                style={{
                  backgroundColor: "#063A39",
                  color: "white",
                  fontSize: "12px",
                  padding: "8px",
                  borderRadius: "6px",
                }}
              >
                Set Time
              </Button>
              <Button
                onClick={() => setShowMeetingInput(false)}
                className="flex-1 bg-transparent font-bold shadow-none"
                style={{
                  border: "1px solid #063A39",
                  color: "#063A39",
                  fontSize: "12px",
                  padding: "8px",
                  borderRadius: "6px",
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
