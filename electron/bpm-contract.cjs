// Central BPM API contract. The ONLY place where verified BPM endpoints go.
//
// The BPM web app JS is only served after login, so the private timer/task
// API could not be verified. Every endpoint is null until someone captures the
// real requests (see README "Finishing the BPM adapter").
//
// Fill each entry as: { method: "GET" | "POST" | ..., path: "/verified/path" }
// and implement the matching mapper in bpm-client.cjs.

const BPM_ORIGIN = "https://bpm.zoomcharts.com:9000";

const BPM_ENDPOINTS = {
  currentTimer: null, // running timer for the logged-in user
  myTasks: null, // active tasks/projects for the logged-in user
  startTimer: null, // start timer for one project/task
  stopTimer: null, // stop/commit a running timer
};

// Session cookie name observed on BPM responses (HttpOnly). Used only to
// report "logged in" at a high level; its value never leaves the main process.
const BPM_SESSION_COOKIE = "tbpmsid";

module.exports = { BPM_ORIGIN, BPM_ENDPOINTS, BPM_SESSION_COOKIE };
