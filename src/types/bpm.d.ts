export type BpmErrorCode =
  | "BPM_API_NOT_CONFIGURED"
  | "BPM_NOT_LOGGED_IN"
  | "BPM_HTTP_ERROR"
  | "BPM_NO_TIMER"
  | "BPM_ERROR";

export interface BpmError {
  code: BpmErrorCode;
  message: string;
}

export interface BpmTimer {
  id: string;
  projectId: string;
  projectName: string;
  /** ISO timestamp from BPM server */
  startedAt: string;
}

export interface BpmTask {
  id: string;
  name: string;
  projectName?: string;
}

export interface BpmState {
  desktop: true;
  apiConfigured: boolean;
  loggedIn: boolean;
  timer: BpmTimer | null;
  error: BpmError | null;
}

export type BpmResult = { ok: true } | { ok: false; error: BpmError };
export type BpmTasksResult = { ok: true; tasks: BpmTask[] } | { ok: false; error: BpmError };

export interface BpmDesktopApi {
  getState(): Promise<BpmState>;
  refresh(): Promise<BpmState>;
  login(): Promise<boolean>;
  listTasks(): Promise<BpmTasksResult>;
  start(projectId: string): Promise<BpmResult>;
  stop(): Promise<BpmResult>;
  openBpm(path?: string): Promise<boolean>;
  setLaunchAtStartup(enabled: boolean): Promise<boolean>;
  getLaunchAtStartup(): Promise<boolean>;
  onStateChange(cb: (state: BpmState) => void): () => void;
  window: {
    dragStart(): void;
    dragEnd(): void;
    setInteractive(on: boolean): void;
    onSide(cb: (side: "left" | "right") => void): () => void;
  };
}

declare global {
  interface Window {
    bpm?: BpmDesktopApi;
  }
}
