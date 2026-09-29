import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import dropletGreen from "@/assets/droplet-green.svg";
import pillGreen from "@/assets/pill-green.svg";
import dropletOrange from "@/assets/droplet-orange.svg";
import pillOrange from "@/assets/pill-orange.svg";
import type { BpmState, BpmTask } from "@/types/bpm";

const W = 215;
const H = 487;
const LAST_PROJECT_KEY = "bpm:lastProject";
const TEXT = "#434343";
const BTN = "#063A39";

type Project = { id: string; name: string };

const loadLastProject = (): Project | null => {
  try {
    return JSON.parse(localStorage.getItem(LAST_PROJECT_KEY) || "null");
  } catch {
    return null;
  }
};

const formatElapsed = (seconds: number) => {
  const s = Math.max(0, seconds);
  const mins = Math.floor(s / 60);
  return `${mins}.${(s % 60).toString().padStart(2, "0")} min`;
};

const btnBase: React.CSSProperties = {
  fontSize: "9.99px",
  width: "54.93px",
  height: "18.31px",
  borderRadius: "3px",
  fontWeight: 700,
  transition: "background-color 120ms, color 120ms, border-color 120ms",
};

const FilledButton = ({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) => (
  <button
    disabled={disabled}
    onMouseDown={(e) => e.stopPropagation()}
    onClick={onClick}
    className="hover:!bg-[#6B6B6B] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:!bg-[#063A39]"
    style={{ ...btnBase, backgroundColor: BTN, color: "white", border: 0 }}
  >
    {children}
  </button>
);

const OutlineButton = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button
    onMouseDown={(e) => e.stopPropagation()}
    onClick={onClick}
    className="hover:!bg-[#3D3D3D] hover:!text-white hover:!border-[#3D3D3D]"
    style={{ ...btnBase, backgroundColor: "transparent", color: BTN, border: `0.83px solid ${BTN}` }}
  >
    {children}
  </button>
);

export const StickyTimer = () => {
  const api = typeof window !== "undefined" ? window.bpm : undefined;
  const isDesktop = !!api;

  const [state, setState] = useState<BpmState | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [side, setSide] = useState<"left" | "right">("right");
  const [webY, setWebY] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [selected, setSelected] = useState<Project | null>(loadLastProject);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tasks, setTasks] = useState<BpmTask[] | null>(null);
  const [tasksMsg, setTasksMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Desktop state sync
  useEffect(() => {
    if (!api) return;
    api.getState().then(setState);
    const offState = api.onStateChange(setState);
    const offSide = api.window.onSide(setSide);
    return () => {
      offState();
      offSide();
    };
  }, [api]);

  const timer = state?.timer ?? null;
  const isActive = !!timer;
  const canUseBpm = !!state?.apiConfigured && !!state?.loggedIn;

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isActive]);

  const elapsed = useMemo(
    () => (timer ? Math.floor((now - new Date(timer.startedAt).getTime()) / 1000) : 0),
    [timer, now],
  );

  // Hover / click-through
  const expand = () => {
    setIsExpanded(true);
    api?.window.setInteractive(true);
  };
  const collapse = () => {
    if (isDragging) return;
    setIsExpanded(false);
    setPickerOpen(false);
    api?.window.setInteractive(false);
  };

  // Dragging: desktop moves the OS window (main snaps to edge); web moves the element.
  const onDragStart = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    api?.window.dragStart();
  };
  useEffect(() => {
    if (!isDragging) return;
    const move = (e: MouseEvent) => {
      if (isDesktop) return;
      setSide(e.clientX < window.innerWidth / 2 ? "left" : "right");
      setWebY(Math.max(0, Math.min(e.clientY - H / 2, window.innerHeight - H)));
    };
    const up = () => {
      setIsDragging(false);
      api?.window.dragEnd();
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
  }, [isDragging, isDesktop, api]);

  const openPicker = useCallback(async () => {
    setPickerOpen((o) => !o);
    if (!api || tasks) return;
    const res = await api.listTasks();
    if (res.ok) {
      setTasks(res.tasks);
      setTasksMsg(res.tasks.length ? null : "No active tasks");
    } else {
      setTasksMsg(res.error.code === "BPM_API_NOT_CONFIGURED" ? "Task list not connected yet" : res.error.message);
    }
  }, [api, tasks]);

  const choose = (p: Project) => {
    setSelected(p);
    localStorage.setItem(LAST_PROJECT_KEY, JSON.stringify(p));
    setPickerOpen(false);
  };

  const handleStart = async () => {
    if (!api || !selected) return;
    setBusy(true);
    await api.start(selected.id);
    setBusy(false);
  };
  const handleStop = async () => {
    if (!api) return;
    setBusy(true);
    await api.stop();
    setBusy(false);
  };
  const openBpm = (path?: string) => {
    if (api) api.openBpm(path);
    else window.open(`https://bpm.zoomcharts.com:9000/${path ?? ""}`, "_blank", "noopener");
  };

  // Status line under the buttons
  let status: { text: string; action?: { label: string; run: () => void } } | null = null;
  if (!isDesktop) status = { text: "Desktop app" };
  else if (!state) status = { text: "Connecting…" };
  else if (!state.loggedIn) status = { text: "Not logged in", action: { label: "Connect BPM", run: () => api!.login() } };
  else if (!state.apiConfigured) status = { text: "BPM timer sync setup needed", action: { label: "Open BPM", run: () => openBpm("#/app/apps") } };
  else if (state.error) status = { text: state.error.message };

  const projectLabel = timer?.projectName ?? selected?.name ?? "Select project";
  const startDisabled = !canUseBpm || !selected || busy;

  const wrapperStyle: React.CSSProperties = isDesktop
    ? { position: "fixed", left: 0, top: 0, width: W, height: H }
    : { position: "fixed", top: webY, width: W, height: H, [side]: 0 };

  return (
    <div className="z-[9999] select-none" style={{ ...wrapperStyle, cursor: isDragging ? "grabbing" : "default" }}>
      {!isExpanded && (
        <div
          className="absolute cursor-grab"
          style={{ width: 61, height: 252, top: "50%", transform: "translateY(-50%)", [side]: 0 }}
          onMouseEnter={expand}
          onMouseDown={onDragStart}
        >
          <img
            src={isActive ? pillGreen : pillOrange}
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full"
            style={{ transform: side === "left" ? "scaleX(-1)" : "none" }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-2 text-center" style={{ color: TEXT }}>
            <div className="text-xs font-medium">{isActive ? "Active" : "START"}</div>
            {isActive && <div className="text-sm font-bold whitespace-nowrap">{formatElapsed(elapsed)}</div>}
          </div>
        </div>
      )}

      {isExpanded && (
        <div
          className="absolute inset-0 animate-bounce-in cursor-grab"
          style={{ transform: side === "left" ? "scaleX(-1)" : "none" }}
          onMouseLeave={collapse}
          onMouseDown={onDragStart}
        >
          <img src={isActive ? dropletGreen : dropletOrange} alt="" draggable={false} className="absolute inset-0 w-full h-full" />

          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ paddingRight: side === "right" ? 24 : 0, paddingLeft: side === "left" ? 24 : 0, transform: side === "left" ? "scaleX(-1)" : "none" }}
          >
            <div className="relative flex flex-col items-center gap-3 w-full max-w-[160px]" style={{ color: TEXT }}>
              <div className="font-bold leading-none" style={{ fontSize: "24.97px" }}>
                {formatElapsed(elapsed)}
              </div>

              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={isActive ? undefined : openPicker}
                disabled={isActive}
                title={projectLabel}
                className="flex items-center gap-0.5 font-semibold text-center -mt-1 max-w-full disabled:cursor-default"
                style={{ fontSize: "12.48px" }}
              >
                <span className="truncate">{projectLabel}</span>
                {!isActive && <ChevronDown className="w-3 h-3 shrink-0" />}
              </button>

              {pickerOpen && !isActive && (
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute top-12 z-10 w-full max-h-[120px] overflow-y-auto rounded-[3px] bg-white/95 shadow-md text-left"
                  style={{ fontSize: "10px" }}
                >
                  {loadLastProject() && (
                    <button className="block w-full px-2 py-1 text-left hover:bg-black/5 font-semibold" onClick={() => choose(loadLastProject()!)}>
                      Last: {loadLastProject()!.name}
                    </button>
                  )}
                  {tasks?.map((t) => (
                    <button key={t.id} className="block w-full px-2 py-1 text-left hover:bg-black/5 truncate" onClick={() => choose({ id: t.id, name: t.name })}>
                      {t.name}
                      {t.projectName && <span className="opacity-60"> · {t.projectName}</span>}
                    </button>
                  ))}
                  {!tasks && !tasksMsg && <div className="px-2 py-1 opacity-60">{isDesktop ? "Loading…" : "Desktop app only"}</div>}
                  {tasksMsg && <div className="px-2 py-1 opacity-60">{tasksMsg}</div>}
                </div>
              )}

              <div className="flex gap-2.5">
                {!isActive ? (
                  <>
                    <FilledButton onClick={handleStart} disabled={startDisabled}>START</FilledButton>
                    <OutlineButton onClick={() => openBpm("#/app/my-tasks")}>TASKS</OutlineButton>
                  </>
                ) : (
                  <>
                    <OutlineButton onClick={() => openBpm("#/app/apps")}>BPM</OutlineButton>
                    <FilledButton onClick={handleStop} disabled={busy}>STOP</FilledButton>
                  </>
                )}
              </div>

              {status && (
                <div className="text-center opacity-70 leading-tight" style={{ fontSize: "9px" }}>
                  <div>{status.text}</div>
                  {status.action && (
                    <button
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={status.action.run}
                      className="font-bold underline"
                      style={{ fontSize: "10px" }}
                    >
                      {status.action.label}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
