<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Discipline Vitals — Habit Tracker</title>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<style>
  :root {
    color-scheme: dark;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: #0b0e13;
    color: #e7e9ec;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, system-ui, sans-serif;
  }

  .wrap {
    max-width: 880px;
    margin: 0 auto;
    padding: 24px 16px 60px;
  }

  .card {
    background: #12161d;
    border: 1px solid #232a35;
    border-radius: 14px;
  }

  .btn {
    border: 1px solid #232a35;
    background: #161b23;
    color: #c7ccd3;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
  }

  .btn:hover {
    border-color: #34d399;
    color: #fff;
  }

  .btn-primary {
    background: #34d399;
    color: #0d1117;
    border-color: #34d399;
    font-weight: 600;
  }

  .btn-primary:hover {
    background: #2fc58e;
    color: #0d1117;
  }

  .btn-danger {
    border-color: #5a2529;
    color: #e2555a;
  }

  .btn-danger:hover {
    border-color: #e2555a;
    color: #fff;
  }

  .tab {
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #8b93a1;
  }

  .tab.active {
    background: #1a2029;
    color: #34d399;
  }

  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="number"] {
    background: #0d1117;
    border: 1px solid #232a35;
    color: #e7e9ec;
    border-radius: 8px;
    padding: 9px 10px;
    font-size: 13px;
    outline: none;
  }

  input:focus {
    border-color: #34d399;
  }

  select {
    background: #0d1117;
    border: 1px solid #232a35;
    color: #e7e9ec;
    border-radius: 8px;
    padding: 8px;
    font-size: 13px;
  }

  ::placeholder {
    color: #5b6472;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 4px;
    border-bottom: 1px solid #1c222c;
  }

  .checkbox {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: 1px solid #3a4250;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
  }

  .auth-box {
    max-width: 420px;
    margin: 60px auto;
    padding: 24px;
  }

  .auth-title {
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .auth-subtitle {
    color: #8b93a1;
    font-size: 13px;
    margin-bottom: 20px;
  }

  .auth-box input {
    width: 100%;
    margin-bottom: 10px;
  }

  .auth-link {
    color: #34d399;
    cursor: pointer;
    font-size: 13px;
    text-align: center;
    margin-top: 14px;
  }

  .auth-link:hover {
    text-decoration: underline;
  }

  .profile-row {
    padding: 14px 0;
    border-bottom: 1px solid #1c222c;
  }

  .profile-label {
    font-size: 11px;
    color: #5b6472;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 5px;
  }

  .profile-value {
    font-size: 16px;
    color: #e7e9ec;
  }

  #sync-badge {
    font-size: 11px;
    color: #5b6472;
  }

  @media (max-width: 600px) {
    .stat-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .top-nav {
      overflow-x: auto;
    }

    .top-nav .tab {
      white-space: nowrap;
    }

    .wrap {
      padding: 16px 12px 50px;
    }
  }
</style>
</head>

<body>

<div class="wrap" id="app">
  <div style="padding:60px 0;text-align:center;color:#5b6472;">
    Connecting...
  </div>
</div>

<script>

/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL = "https://vifnwjqckxpwngzohsye.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_HcOoVCICT22kESgApWNECA_OsUQxaXC";

const sb = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


/* =========================================================
   DEFAULT HABITS
========================================================= */

const DEFAULT_HABITS = [
  { id: "h1", name: "2 litre water" },
  { id: "h2", name: "5 pages reading" },
  { id: "h3", name: "2 hrs learning track" },
  { id: "h4", name: "30 min walk" },
  { id: "h5", name: "7 hrs sleep" },
  { id: "h6", name: "10 min meditation" },
  { id: "h7", name: "10 min gratitude" }
];


/* =========================================================
   HELPERS
========================================================= */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function todayISO() {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isoOf(y, m, day) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function monthLabel(y, m) {
  return new Date(y, m, 1).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric"
    }
  );
}


/* =========================================================
   APP STATE
========================================================= */

const state = {
  habits: DEFAULT_HABITS,
  entries: {},

  tab: "today",

  selectedDate: todayISO(),

  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth(),

  reviewYear: new Date().getFullYear(),
  reviewMonth: new Date().getMonth(),

  syncStatus: "connecting",

  profile: null
};

let saveTimer = null;


/* =========================================================
   AUTH
========================================================= */

async function createAccount() {

  const name =
    document.getElementById("signup-name").value.trim();

  const age =
    Number(document.getElementById("signup-age").value);

  const email =
    document.getElementById("signup-email").value.trim();

  const password =
    document.getElementById("signup-password").value;

  if (!name) {
    alert("Please enter your name.");
    return;
  }

  if (!age || age < 1 || age > 120) {
    alert("Please enter a valid age.");
    return;
  }

  if (!email) {
    alert("Please enter your email.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  const { data, error } = await sb.auth.signUp({
    email: email,
    password: password,

    options: {
      data: {
        name: name,
        age: age
      }
    }
  });

  if (error) {
    alert(error.message);
    return;
  }

  if (!data.user) {
    alert("Account could not be created.");
    return;
  }

  /*
    We store name and age in Supabase Auth metadata first.
    After the user logs in, startApp() creates the profile
    table record.
  */

  if (data.session) {

    await ensureProfile(data.user);

    alert("Account created successfully.");

    await startApp(data.user);

  } else {

    alert(
      "Account created successfully.\n\n" +
      "Please check your email and verify your account, " +
      "then return here and login."
    );

    showLogin();
  }
}


async function loginUser() {

  const email =
    document.getElementById("login-email").value.trim();

  const password =
    document.getElementById("login-password").value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  const { data, error } =
    await sb.auth.signInWithPassword({
      email: email,
      password: password
    });

  if (error) {
    alert(error.message);
    return;
  }

  if (!data.user) {
    alert("Login failed.");
    return;
  }

  await startApp(data.user);
}


async function logoutUser() {

  const { error } =
    await sb.auth.signOut();

  if (error) {
    alert(error.message);
    return;
  }

  state.profile = null;
  state.habits = DEFAULT_HABITS;
  state.entries = {};

  showLogin();
}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

async function forgotPassword() {

  const email =
    document.getElementById("forgot-email").value.trim();

  if (!email) {
    alert("Please enter your email address.");
    return;
  }

  /*
    During localhost testing, the current browser URL
    becomes the redirect destination.

    Later, when we publish the application, we will
    configure the production URL in Supabase.
  */

  const redirectUrl =
    window.location.origin + window.location.pathname;

  const { error } =
    await sb.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: redirectUrl
      }
    );

  if (error) {
    alert(error.message);
    return;
  }

  alert(
    "Password reset link sent.\n\n" +
    "Please check your email."
  );
}


function showPasswordReset() {

  document.getElementById("app").innerHTML = `

    <div class="card auth-box">

      <div class="auth-title">
        Reset Password
      </div>

      <div class="auth-subtitle">
        Enter your new password.
      </div>

      <input
        id="new-password"
        type="password"
        placeholder="New password"
      />

      <input
        id="confirm-password"
        type="password"
        placeholder="Confirm new password"
      />

      <button
        class="btn btn-primary"
        style="width:100%;"
        onclick="updatePassword()"
      >
        Update Password
      </button>

    </div>

  `;
}


async function updatePassword() {

  const password =
    document.getElementById("new-password").value;

  const confirm =
    document.getElementById("confirm-password").value;

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirm) {
    alert("Passwords do not match.");
    return;
  }

  const { error } =
    await sb.auth.updateUser({
      password: password
    });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Password updated successfully.");

  await sb.auth.signOut();

  showLogin();
}


/* =========================================================
   AUTH SCREENS
========================================================= */

function showLogin() {

  document.getElementById("app").innerHTML = `

    <div class="card auth-box">

      <div class="auth-title">
        Discipline Vitals
      </div>

      <div class="auth-subtitle">
        Login to continue
      </div>

      <input
        id="login-email"
        type="email"
        placeholder="Email"
      />

      <input
        id="login-password"
        type="password"
        placeholder="Password"
      />

      <button
        class="btn btn-primary"
        style="width:100%;"
        onclick="loginUser()"
      >
        Login
      </button>

      <div
        class="auth-link"
        onclick="showSignup()"
      >
        Create new user
      </div>

      <div
        class="auth-link"
        onclick="showForgotPassword()"
      >
        Forgot password?
      </div>

    </div>

  `;
}


function showSignup() {

  document.getElementById("app").innerHTML = `

    <div class="card auth-box">

      <div class="auth-title">
        Create Account
      </div>

      <div class="auth-subtitle">
        Create your Discipline Vitals account
      </div>

      <input
        id="signup-name"
        type="text"
        placeholder="Name"
      />

      <input
        id="signup-age"
        type="number"
        placeholder="Age"
        min="1"
        max="120"
      />

      <input
        id="signup-email"
        type="email"
        placeholder="Email"
      />

      <input
        id="signup-password"
        type="password"
        placeholder="Password"
      />

      <button
        class="btn btn-primary"
        style="width:100%;"
        onclick="createAccount()"
      >
        Create Account
      </button>

      <div
        class="auth-link"
        onclick="showLogin()"
      >
        Already have an account? Login
      </div>

    </div>

  `;
}


function showForgotPassword() {

  document.getElementById("app").innerHTML = `

    <div class="card auth-box">

      <div class="auth-title">
        Forgot Password
      </div>

      <div class="auth-subtitle">
        Enter your email and we will send you
        a password reset link.
      </div>

      <input
        id="forgot-email"
        type="email"
        placeholder="Email"
      />

      <button
        class="btn btn-primary"
        style="width:100%;"
        onclick="forgotPassword()"
      >
        Send Reset Link
      </button>

      <div
        class="auth-link"
        onclick="showLogin()"
      >
        Back to Login
      </div>

    </div>

  `;
}


/* =========================================================
   PROFILE
========================================================= */

async function ensureProfile(user) {

  const metadata =
    user.user_metadata || {};

  const name =
    metadata.name || "User";

  const age =
    metadata.age || null;

  const { data, error } =
    await sb
      .from("profiles")
      .select("id,name,age,created_at")
      .eq("id", user.id)
      .maybeSingle();

  if (error) {
    console.error("Profile read error:", error);
    return null;
  }

  if (data) {

    state.profile = data;

    return data;
  }

  const { data: newProfile, error: insertError } =
    await sb
      .from("profiles")
      .insert({
        id: user.id,
        name: name,
        age: age
      })
      .select()
      .single();

  if (insertError) {
    console.error(
      "Profile creation error:",
      insertError
    );

    return null;
  }

  state.profile = newProfile;

  return newProfile;
}


async function showProfile() {

  const {
    data: { user }
  } = await sb.auth.getUser();

  if (!user) {
    showLogin();
    return;
  }

  const profile =
    await ensureProfile(user);

  if (!profile) {
    alert("Unable to load profile.");
    return;
  }

  document.getElementById("app").innerHTML = `

    <div
      class="card"
      style="padding:24px;max-width:520px;margin:30px auto;"
    >

      <div
        style="
          font-size:26px;
          font-weight:600;
          margin-bottom:6px;
        "
      >
        Profile
      </div>

      <div
        style="
          color:#8b93a1;
          font-size:13px;
          margin-bottom:20px;
        "
      >
        Your Discipline Vitals account
      </div>

      <div class="profile-row">

        <div class="profile-label">
          Name
        </div>

        <div class="profile-value">
          ${escapeHtml(profile.name)}
        </div>

      </div>

      <div class="profile-row">

        <div class="profile-label">
          Age
        </div>

        <div class="profile-value">
          ${escapeHtml(profile.age)}
        </div>

      </div>

      <div class="profile-row">

        <div class="profile-label">
          Email
        </div>

        <div class="profile-value">
          ${escapeHtml(user.email)}
        </div>

      </div>

      <div
        style="
          display:flex;
          gap:10px;
          margin-top:24px;
        "
      >

        <button
          class="btn"
          style="flex:1;"
          onclick="render()"
        >
          Back to Tracker
        </button>

        <button
          class="btn btn-danger"
          style="flex:1;"
          onclick="logoutUser()"
        >
          Log Out
        </button>

      </div>

    </div>

  `;
}


/* =========================================================
   USER-SPECIFIC HABIT STORAGE
========================================================= */

async function saveData() {

  const {
    data: { user }
  } = await sb.auth.getUser();

  if (!user) {
    return;
  }

  state.syncStatus = "saving";

  updateSyncBadge();

  clearTimeout(saveTimer);

  saveTimer = setTimeout(async () => {

    const { error } =
      await sb
        .from("habit_tracker_users")
        .upsert({
          user_id: user.id,

          data: {
            habits: state.habits,
            entries: state.entries
          },

          updated_at:
            new Date().toISOString()
        });

    state.syncStatus =
      error ? "error" : "synced";

    if (error) {
      console.error(
        "Save error:",
        error
      );
    }

    updateSyncBadge();

  }, 400);
}


async function loadData() {

  const {
    data: { user }
  } = await sb.auth.getUser();

  if (!user) {
    return false;
  }

  const { data, error } =
    await sb
      .from("habit_tracker_users")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

  if (error) {

    console.error(
      "Load data error:",
      error
    );

    state.syncStatus = "error";

    return false;
  }

  if (data && data.data) {

    state.habits =
      data.data.habits &&
      data.data.habits.length
        ? data.data.habits
        : DEFAULT_HABITS;

    state.entries =
      data.data.entries || {};

  } else {

    state.habits = DEFAULT_HABITS;

    state.entries = {};

    const { error: insertError } =
      await sb
        .from("habit_tracker_users")
        .insert({
          user_id: user.id,

          data: {
            habits: state.habits,
            entries: state.entries
          },

          updated_at:
            new Date().toISOString()
        });

    if (insertError) {
      console.error(
        "Initial data creation error:",
        insertError
      );

      state.syncStatus = "error";

      return false;
    }
  }

  state.syncStatus = "synced";

  return true;
}


function updateSyncBadge() {

  const el =
    document.getElementById("sync-badge");

  if (!el) {
    return;
  }

  const map = {
    connecting: "Connecting...",
    saving: "Saving...",
    synced: "Synced",
    error: "Sync failed"
  };

  el.textContent =
    map[state.syncStatus] || "";

  el.style.color =
    state.syncStatus === "error"
      ? "#e2555a"
      : "#5b6472";
}


/* =========================================================
   HABIT CALCULATIONS
========================================================= */

function completionForDate(date) {

  if (!state.habits.length) {
    return 0;
  }

  const day =
    state.entries[date] || {};

  const done =
    state.habits.filter(
      h => day[h.id]
    ).length;

  return Math.round(
    (done / state.habits.length) * 100
  );
}


function hasAnyEntry(date) {

  const day =
    state.entries[date];

  return !!day &&
    Object.keys(day).length > 0;
}


function pointsPerHabit() {

  return state.habits.length
    ? Math.round(100 / state.habits.length)
    : 0;
}


function computeStreak() {

  let count = 0;

  let d = new Date();

  for (
    let i = 0;
    i < 3650;
    i++
  ) {

    const iso =
    `${d.getFullYear()}-${String(
        d.getMonth() + 1
    ).padStart(2, "0")}-${String(
        d.getDate()
    ).padStart(2, "0")}`;

    const pct =
      completionForDate(iso);

    if (
      i === 0 &&
      pct < 100
    ) {
      d.setDate(
        d.getDate() - 1
      );

      continue;
    }

    if (pct === 100) {

      count++;

      d.setDate(
        d.getDate() - 1
      );

    } else {

      break;
    }
  }

  return count;
}


function monthStats(year, month) {

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const todayD =
    new Date();

  const isCurrentMonth =
    year === todayD.getFullYear() &&
    month === todayD.getMonth();

  const lastDay =
    isCurrentMonth
      ? todayD.getDate()
      : daysInMonth;

  let perfect = 0;
  let missed = 0;
  let attempted = 0;
  let sumPct = 0;
  let daysWithData = 0;

  for (
    let day = 1;
    day <= lastDay;
    day++
  ) {

    const iso =
      isoOf(
        year,
        month,
        day
      );

    if (!hasAnyEntry(iso)) {
      continue;
    }

    daysWithData++;

    const pct =
      completionForDate(iso);

    sumPct += pct;

    attempted++;

    if (pct === 100) {
      perfect++;
    }

    if (pct === 0) {
      missed++;
    }
  }

  const accuracy =
    daysWithData
      ? Math.round(
          sumPct / daysWithData
        )
      : 0;

  return {
    perfect,
    missed,
    attempted,
    accuracy,
    daysWithData,
    daysInMonth,
    lastDay
  };
}


function heatColor(pct) {

  if (pct === null) {
    return "#12161d";
  }

  if (pct === 0) {
    return "#5a1f1f";
  }

  if (pct < 40) {
    return "#6b3a1a";
  }

  if (pct < 70) {
    return "#5a5a1a";
  }

  if (pct < 100) {
    return "#1f4d3a";
  }

  return "#1d9e75";
}


/* =========================================================
   HABIT ACTIONS
========================================================= */

function toggleHabit(date, habitId) {

  const day = {
    ...(state.entries[date] || {})
  };

  day[habitId] =
    !day[habitId];

  state.entries = {
    ...state.entries,
    [date]: day
  };

  saveData();

  render();
}


function addHabit() {

  const input =
    document.getElementById(
      "new-habit-input"
    );

  if (!input) {
    return;
  }

  const name =
    input.value.trim();

  if (!name) {
    return;
  }

  state.habits = [
    ...state.habits,

    {
      id: "h" + Date.now(),
      name
    }
  ];

  input.value = "";

  saveData();

  render();
}


function removeHabit(id) {

  state.habits =
    state.habits.filter(
      h => h.id !== id
    );

  saveData();

  render();
}


function setTab(tab) {

  state.tab = tab;

  render();
}


function shiftViewMonth(delta) {

  let m =
    state.viewMonth + delta;

  let y =
    state.viewYear;

  if (m < 0) {
    m = 11;
    y--;
  }

  if (m > 11) {
    m = 0;
    y++;
  }

  state.viewMonth = m;

  state.viewYear = y;

  render();
}


function shiftReviewMonth(delta) {

  let m =
    state.reviewMonth + delta;

  let y =
    state.reviewYear;

  if (m < 0) {
    m = 11;
    y--;
  }

  if (m > 11) {
    m = 0;
    y++;
  }

  state.reviewMonth = m;

  state.reviewYear = y;

  render();
}


function goToDay(iso) {

  state.selectedDate = iso;

  state.tab = "today";

  render();
}


/* =========================================================
   MAIN RENDER
========================================================= */

function render() {

  const app =
    document.getElementById("app");

  const todayPct =
    completionForDate(
      todayISO()
    );

  const todayPoints =
    Math.round(
      (todayPct / 100) * 100
    );

  const streak =
    computeStreak();

  const curMonth =
    monthStats(
      new Date().getFullYear(),
      new Date().getMonth()
    );

  let html = "";


  /* HEADER */

  html += `

    <div
      class="card"
      style="
        padding:20px 22px;
        margin-bottom:16px;
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:20px;
      "
    >

      <div>

        <div
          style="
            font-size:11px;
            letter-spacing:1.5px;
            color:#5b6472;
            text-transform:uppercase;
            margin-bottom:6px;
          "
        >
          Discipline vitals
        </div>

        <div
          style="
            font-size:26px;
            font-weight:600;
          "
        >
          Today's ritual
        </div>

        <div
          id="sync-badge"
          style="margin-top:6px;"
        ></div>

      </div>

      <div style="text-align:right;">

        <button
          class="btn"
          onclick="showProfile()"
        >
          Profile
        </button>

        <div
          style="
            font-size:30px;
            font-weight:700;
            color:#34d399;
            margin-top:10px;
          "
        >
          ${todayPct}%
        </div>

        <div
          style="
            font-size:12px;
            color:#8b93a1;
          "
        >
          ${todayPoints}/100 points earned today
        </div>

      </div>

    </div>

  `;


  /* USER NAME */

  if (state.profile) {

    html += `

      <div
        style="
          font-size:13px;
          color:#8b93a1;
          margin-bottom:12px;
        "
      >
        Welcome,
        <span style="color:#34d399;">
          ${escapeHtml(state.profile.name)}
        </span>
      </div>

    `;
  }


  /* STATISTICS */

  const stats = [

    [
      "Current streak",
      streak + "d",
      "consecutive perfect days"
    ],

    [
      "Month average",
      curMonth.accuracy + "%",
      monthLabel(
        new Date().getFullYear(),
        new Date().getMonth()
      )
    ],

    [
      "Traction",
      todayPoints + " pts",
      "earned today"
    ],

    [
      "Points pool",
      "100",
      "raw habit points"
    ]

  ];

  html +=

    `<div class="stat-grid">` +

    stats.map(
      s => `

        <div
          class="card"
          style="padding:14px;"
        >

          <div
            style="
              color:#5b6472;
              font-size:11px;
              text-transform:uppercase;
              letter-spacing:0.5px;
              margin-bottom:8px;
            "
          >
            ${s[0]}
          </div>

          <div
            style="
              font-size:20px;
              font-weight:600;
            "
          >
            ${s[1]}
          </div>

          <div
            style="
              font-size:11px;
              color:#5b6472;
              margin-top:2px;
            "
          >
            ${s[2]}
          </div>

        </div>

      `
    ).join("") +

    `</div>`;


  /* NAVIGATION */

  html += `

    <div
      class="top-nav"
      style="
        display:flex;
        gap:4px;
        margin-bottom:16px;
      "
    >

      <div
        class="tab ${
          state.tab === "today"
            ? "active"
            : ""
        }"
        onclick="setTab('today')"
      >
        Checklist
      </div>

      <div
        class="tab ${
          state.tab === "calendar"
            ? "active"
            : ""
        }"
        onclick="setTab('calendar')"
      >
        Monthly log
      </div>

      <div
        class="tab ${
          state.tab === "review"
            ? "active"
            : ""
        }"
        onclick="setTab('review')"
      >
        Review
      </div>

      <div
        class="tab"
        onclick="showProfile()"
      >
        Profile
      </div>

    </div>

  `;


  /* =====================================================
     TODAY
  ===================================================== */

  if (state.tab === "today") {

    const dayEntries =
      state.entries[
        state.selectedDate
      ] || {};

    html += `

      <div
        class="card"
        style="padding:18px;"
      >

        <div
          style="
            font-size:13px;
            color:#8b93a1;
            margin-bottom:12px;
          "
        >
          ${
            state.selectedDate === todayISO()
              ? "Today"
              : state.selectedDate
          }
        </div>

    `;

    state.habits.forEach(h => {

      const done =
        !!dayEntries[h.id];

      html += `

        <div class="row">

          <div
            class="checkbox"
            style="
              border-color:
                ${done
                  ? "#34d399"
                  : "#3a4250"};

              background:
                ${done
                  ? "#34d399"
                  : "transparent"};
            "
            onclick="
              toggleHabit(
                '${state.selectedDate}',
                '${h.id}'
              )
            "
          >

            ${
              done
                ? '<span style="color:#0d1117;font-size:12px;font-weight:700;">&#10003;</span>'
                : ""
            }

          </div>

          <div
            style="
              flex:1;
              font-size:14px;
              color:#e7e9ec;
            "
          >
            ${escapeHtml(h.name)}
          </div>

          <div
            style="
              font-size:11px;
              color:#5b6472;
            "
          >
            ${pointsPerHabit()} pts
          </div>

          <div
            style="
              cursor:pointer;
              color:#5b6472;
              font-size:13px;
            "
            onclick="
              event.stopPropagation();
              removeHabit('${h.id}')
            "
          >
            &#10005;
          </div>

        </div>

      `;
    });


    html += `

        <div
          style="
            display:flex;
            gap:8px;
            margin-top:14px;
            flex-wrap:wrap;
          "
        >

          <input
            id="new-habit-input"
            type="text"
            placeholder="Add a habit..."
            style="
              flex:1;
              min-width:160px;
            "
            onkeydown="
              if(event.key==='Enter')
                addHabit()
            "
          />

          <button
            class="btn"
            onclick="addHabit()"
          >
            + Add
          </button>

        </div>

      </div>

    `;
  }


  /* =====================================================
     CALENDAR
  ===================================================== */

  if (state.tab === "calendar") {

    const first =
      new Date(
        state.viewYear,
        state.viewMonth,
        1
      );

    const startWeekday =
      first.getDay();

    const daysInMonth =
      new Date(
        state.viewYear,
        state.viewMonth + 1,
        0
      ).getDate();

    html += `

      <div
        class="card"
        style="padding:18px;"
      >

        <div
          style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:14px;
          "
        >

          <button
            class="btn"
            onclick="shiftViewMonth(-1)"
          >
            &larr;
          </button>

          <div
            style="
              font-size:14px;
              font-weight:600;
            "
          >
            ${monthLabel(
              state.viewYear,
              state.viewMonth
            )}
          </div>

          <button
            class="btn"
            onclick="shiftViewMonth(1)"
          >
            &rarr;
          </button>

        </div>

        <div
          class="cal-grid"
          style="
            margin-bottom:6px;
            font-size:11px;
            color:#5b6472;
            text-align:center;
          "
        >

          ${
            ["S","M","T","W","T","F","S"]
              .map(
                d => `<div>${d}</div>`
              )
              .join("")
          }

        </div>

        <div class="cal-grid">

    `;

    for (
      let i = 0;
      i < startWeekday;
      i++
    ) {

      html += `<div></div>`;
    }


    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {

      const iso =
        isoOf(
          state.viewYear,
          state.viewMonth,
          day
        );

      const pct =
        hasAnyEntry(iso)
          ? completionForDate(iso)
          : null;

      const isToday =
        iso === todayISO();

      html += `

        <div
          onclick="goToDay('${iso}')"
          title="${
            pct === null
              ? "No data"
              : pct + "% complete"
          }"

          style="
            aspect-ratio:1;
            border-radius:8px;
            background:${heatColor(pct)};
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:12px;
            cursor:pointer;
            border:${
              isToday
                ? "1.5px solid #fff"
                : "1px solid transparent"
            };
          "
        >
          ${day}
        </div>

      `;
    }


    html += `

        </div>

        <div
          style="
            display:flex;
            gap:14px;
            margin-top:14px;
            font-size:11px;
            color:#8b93a1;
            flex-wrap:wrap;
          "
        >

          <span>
            <span
              style="
                display:inline-block;
                width:10px;
                height:10px;
                background:#5a1f1f;
                border-radius:3px;
                margin-right:4px;
              "
            ></span>
            0%
          </span>

          <span>
            <span
              style="
                display:inline-block;
                width:10px;
                height:10px;
                background:#6b3a1a;
                border-radius:3px;
                margin-right:4px;
              "
            ></span>
            1-39%
          </span>

          <span>
            <span
              style="
                display:inline-block;
                width:10px;
                height:10px;
                background:#5a5a1a;
                border-radius:3px;
                margin-right:4px;
              "
            ></span>
            40-69%
          </span>

          <span>
            <span
              style="
                display:inline-block;
                width:10px;
                height:10px;
                background:#1f4d3a;
                border-radius:3px;
                margin-right:4px;
              "
            ></span>
            70-99%
          </span>

          <span>
            <span
              style="
                display:inline-block;
                width:10px;
                height:10px;
                background:#1d9e75;
                border-radius:3px;
                margin-right:4px;
              "
            ></span>
            100%
          </span>

        </div>

      </div>

    `;
  }


  /* =====================================================
     REVIEW
  ===================================================== */

  if (state.tab === "review") {

    const rs =
      monthStats(
        state.reviewYear,
        state.reviewMonth
      );

    html += `

      <div
        class="card"
        style="
          padding:18px;
          margin-bottom:16px;
        "
      >

        <div
          style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:14px;
          "
        >

          <button
            class="btn"
            onclick="shiftReviewMonth(-1)"
          >
            &larr;
          </button>

          <div
            style="
              font-size:14px;
              font-weight:600;
            "
          >
            ${monthLabel(
              state.reviewYear,
              state.reviewMonth
            )}
          </div>

          <button
            class="btn"
            onclick="shiftReviewMonth(1)"
          >
            &rarr;
          </button>

        </div>

        <div
          class="stat-grid"
          style="margin-bottom:0;"
        >

          <div>
            <div
              style="
                font-size:22px;
                font-weight:700;
                color:#34d399;
              "
            >
              ${rs.perfect}
            </div>

            <div
              style="
                font-size:11px;
                color:#8b93a1;
              "
            >
              Perfect days
            </div>
          </div>


          <div>
            <div
              style="
                font-size:22px;
                font-weight:700;
                color:#e2555a;
              "
            >
              ${rs.missed}
            </div>

            <div
              style="
                font-size:11px;
                color:#8b93a1;
              "
            >
              Missed days (0%)
            </div>
          </div>


          <div>
            <div
              style="
                font-size:22px;
                font-weight:700;
              "
            >
              ${rs.attempted}
            </div>

            <div
              style="
                font-size:11px;
                color:#8b93a1;
              "
            >
              Days logged
            </div>
          </div>


          <div>
            <div
              style="
                font-size:22px;
                font-weight:700;
                color:#60a5fa;
              "
            >
              ${rs.accuracy}%
            </div>

            <div
              style="
                font-size:11px;
                color:#8b93a1;
              "
            >
              Accuracy
            </div>
          </div>

        </div>

      </div>

    `;


    html += `

      <div
        class="card"
        style="padding:18px;"
      >

        <div
          style="
            font-size:13px;
            color:#8b93a1;
            margin-bottom:14px;
          "
        >
          Task consistency this month
        </div>

    `;


    state.habits.forEach(h => {

      let done = 0;
      let total = 0;

      for (
        let day = 1;
        day <= rs.lastDay;
        day++
      ) {

        const iso =
          isoOf(
            state.reviewYear,
            state.reviewMonth,
            day
          );

        if (!hasAnyEntry(iso)) {
          continue;
        }

        total++;

        if (
          (state.entries[iso] || {})[h.id]
        ) {
          done++;
        }
      }

      const pct =
        total
          ? Math.round(
              (done / total) * 100
            )
          : 0;

      const barColor =
        pct === 100
          ? "#34d399"
          : pct >= 60
            ? "#60a5fa"
            : "#e2555a";


      html += `

        <div
          style="margin-bottom:12px;"
        >

          <div
            style="
              display:flex;
              justify-content:space-between;
              font-size:12px;
              margin-bottom:4px;
            "
          >

            <span
              style="color:#c7ccd3;"
            >
              ${escapeHtml(h.name)}
            </span>

            <span
              style="color:#5b6472;"
            >
              ${done}/${total}
              &middot;
              ${pct}%
            </span>

          </div>

          <div
            style="
              height:6px;
              background:#1c222c;
              border-radius:3px;
              overflow:hidden;
            "
          >

            <div
              style="
                height:100%;
                width:${pct}%;
                background:${barColor};
              "
            ></div>

          </div>

        </div>

      `;
    });


    html += `

      </div>

    `;
  }


  /* =====================================================
     LAST 30 DAYS
  ===================================================== */

  const last30 = [];

  const d0 =
    new Date();

  for (
    let i = 29;
    i >= 0;
    i--
  ) {

    const dd =
      new Date(d0);

    dd.setDate(
      d0.getDate() - i
    );

    const iso =
      `${dd.getFullYear()}-${String(
        dd.getMonth() + 1
      ).padStart(2, "0")}-${String(
        dd.getDate()
      ).padStart(2, "0")}`;

    last30.push({
      iso,
      pct:
        hasAnyEntry(iso)
          ? completionForDate(iso)
          : null
    });
  }


  html += `

    <div
      style="margin-top:18px;"
    >

      <div
        style="
          font-size:12px;
          color:#5b6472;
          margin-bottom:8px;
        "
      >
        Last 30 days
      </div>

      <div
        style="
          display:flex;
          gap:3px;
          align-items:flex-end;
          height:60px;
        "
      >

        ${
          last30
            .map(
              d => `

                <div
                  title="${
                    d.iso
                  }: ${
                    d.pct === null
                      ? "no data"
                      : d.pct + "%"
                  }"

                  style="
                    flex:1;
                    height:${
                      d.pct === null
                        ? 4
                        : Math.max(
                            4,
                            (d.pct / 100) * 60
                          )
                    }px;

                    background:${
                      d.pct === null
                        ? "#1c222c"
                        : heatColor(d.pct)
                    };

                    border-radius:2px;
                  "
                ></div>

              `
            )
            .join("")
        }

      </div>

    </div>

  `;


  app.innerHTML = html;

  updateSyncBadge();
}


/* =========================================================
   START APPLICATION
========================================================= */

async function startApp(user) {

  state.profile =
    await ensureProfile(user);

  const loaded =
    await loadData();

  if (!loaded) {

    alert(
      "Unable to load your habit data. " +
      "Please check your Supabase tables and RLS policies."
    );

    return;
  }

  render();
}


/* =========================================================
   AUTH STATE LISTENER
========================================================= */

sb.auth.onAuthStateChange(
  (event, session) => {

    /*
      Supabase sends PASSWORD_RECOVERY
      after the user clicks the password
      reset link.

      We show the new password screen.
    */

    if (
      event === "PASSWORD_RECOVERY"
    ) {

      showPasswordReset();

    }
  }
);


/* =========================================================
   INITIALIZE APPLICATION
========================================================= */

(async function init() {

  try {

    const {
      data: { session }
    } = await sb.auth.getSession();


    /*
      If there is an active recovery
      session, show password reset page.
    */

    if (
      window.location.hash.includes(
        "type=recovery"
      )
    ) {

      showPasswordReset();

      return;
    }


    /*
      Normal application startup.
    */

    if (!session) {

      showLogin();

      return;
    }


    await startApp(
      session.user
    );

  } catch (error) {

    console.error(
      "Application startup error:",
      error
    );

    document.getElementById("app").innerHTML = `

      <div
        class="card"
        style="
          padding:24px;
          margin-top:40px;
          text-align:center;
        "
      >

        <div
          style="
            color:#e2555a;
            font-size:18px;
            margin-bottom:10px;
          "
        >
          Unable to start application
        </div>

        <div
          style="
            color:#8b93a1;
            font-size:13px;
          "
        >
          Please check the browser console
          for details.
        </div>

      </div>

    `;
  }

})();

</script>

</body>
</html>
