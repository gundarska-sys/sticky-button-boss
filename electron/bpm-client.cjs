const { BPM_ORIGIN, BPM_ENDPOINTS, BPM_SESSION_COOKIE } = require("./bpm-contract.cjs");

class BpmError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code; // BPM_API_NOT_CONFIGURED | BPM_NOT_LOGGED_IN | BPM_HTTP_ERROR
  }
}

function isApiConfigured() {
  return Object.values(BPM_ENDPOINTS).every(Boolean);
}

class BpmClient {
  /** @param {Electron.Session} session persistent "persist:bpm" session */
  constructor(session) {
    this.session = session;
  }

  async isLoggedIn() {
    const cookies = await this.session.cookies.get({ url: BPM_ORIGIN, name: BPM_SESSION_COOKIE });
    return cookies.some((c) => c.value);
  }

  async request(key, body) {
    const ep = BPM_ENDPOINTS[key];
    if (!ep) throw new BpmError("BPM_API_NOT_CONFIGURED", `BPM endpoint "${key}" is not configured yet`);
    const res = await this.session.fetch(BPM_ORIGIN + ep.path, {
      method: ep.method,
      redirect: "manual",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401 || res.status === 302 || res.status === 0) {
      throw new BpmError("BPM_NOT_LOGGED_IN", "Log in to BPM");
    }
    if (!res.ok) throw new BpmError("BPM_HTTP_ERROR", `BPM responded ${res.status}`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  // Each mapper must convert the verified BPM response into:
  // Timer = { id, projectId, projectName, startedAt (ISO) } | null
  // Task  = { id, name, projectName? }

  async getCurrentTimer() {
    await this.request("currentTimer");
    throw new BpmError("BPM_API_NOT_CONFIGURED", "Map currentTimer response in bpm-client.cjs");
  }

  async listMyTasks() {
    await this.request("myTasks");
    throw new BpmError("BPM_API_NOT_CONFIGURED", "Map myTasks response in bpm-client.cjs");
  }

  async startTimer(projectId, allocationReason) {
    await this.request("startTimer");
    throw new BpmError("BPM_API_NOT_CONFIGURED", "Map startTimer request in bpm-client.cjs");
  }

  async stopTimer(timerId, pauseMinutes) {
    await this.request("stopTimer");
    throw new BpmError("BPM_API_NOT_CONFIGURED", "Map stopTimer request in bpm-client.cjs");
  }
}

module.exports = { BpmClient, BpmError, isApiConfigured };
