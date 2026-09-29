const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("bpm", {
  getState: () => ipcRenderer.invoke("bpm:getState"),
  login: () => ipcRenderer.invoke("bpm:login"),
  listTasks: () => ipcRenderer.invoke("bpm:listTasks"),
  start: (projectId) => ipcRenderer.invoke("bpm:start", String(projectId)),
  stop: () => ipcRenderer.invoke("bpm:stop"),
  refresh: () => ipcRenderer.invoke("bpm:refresh"),
  openBpm: (path) => ipcRenderer.invoke("bpm:open", typeof path === "string" ? path : undefined),
  setLaunchAtStartup: (enabled) => ipcRenderer.invoke("app:setLaunchAtStartup", !!enabled),
  getLaunchAtStartup: () => ipcRenderer.invoke("app:getLaunchAtStartup"),
  onStateChange: (cb) => {
    const handler = (_e, state) => cb(state);
    ipcRenderer.on("bpm:state", handler);
    return () => ipcRenderer.removeListener("bpm:state", handler);
  },
  window: {
    dragStart: () => ipcRenderer.send("win:dragStart"),
    dragEnd: () => ipcRenderer.send("win:dragEnd"),
    setInteractive: (on) => ipcRenderer.send("win:setInteractive", !!on),
    onSide: (cb) => {
      const handler = (_e, side) => cb(side);
      ipcRenderer.on("win:side", handler);
      return () => ipcRenderer.removeListener("win:side", handler);
    },
  },
});
