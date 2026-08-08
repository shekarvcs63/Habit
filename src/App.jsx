import { supabase } from "./supabase";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Droplet, BookOpen, GraduationCap, Coffee, Footprints, Moon, Brain,
  HeartHandshake, Plus, Trash2, ChevronLeft, ChevronRight, Flame,
  Target, TrendingUp, Coins, CalendarDays, ListChecks, BarChart3, X, Check
} from "lucide-react";

const ICONS = [
  { key: "droplet", Icon: Droplet },
  { key: "book", Icon: BookOpen },
  { key: "grad", Icon: GraduationCap },
  { key: "coffee", Icon: Coffee },
  { key: "walk", Icon: Footprints },
  { key: "moon", Icon: Moon },
  { key: "brain", Icon: Brain },
  { key: "heart", Icon: HeartHandshake },
];

const STORAGE_KEY = "habit-tracker-data-v1";

const DEFAULT_HABITS = [
  { id: "h1", name: "2 litre water", icon: "droplet" },
  { id: "h2", name: "5 pages reading", icon: "book" },
  { id: "h3", name: "2 hrs learning track", icon: "grad" },
  { id: "h4", name: "30 min walk", icon: "walk" },
  { id: "h5", name: "7 hrs sleep", icon: "moon" },
  { id: "h6", name: "10 min meditation", icon: "brain" },
  { id: "h7", name: "10 min gratitude", icon: "heart" },
];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isoOf(y, m, day) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function iconFor(key) {
  return (ICONS.find((i) => i.key === key) || ICONS[0]).Icon;
}

export default function HabitTracker() {
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [entries, setEntries] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("today");
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [reviewYear, setReviewYear] = useState(new Date().getFullYear());
  const [reviewMonth, setReviewMonth] = useState(new Date().getMonth());
  const [newHabit, setNewHabit] = useState("");
  const [newIcon, setNewIcon] = useState("droplet");
  const [saveState, setSaveState] = useState("idle");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = localStorage.getItem(STORAGE_KEY);
if (data) {
  const parsed = JSON.parse(data);
  setHabits(parsed.habits || []);
  setEntries(parsed.entries || {});
}
      } catch (e) {
        // no existing data yet, keep defaults
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

 const persist = useCallback((nextHabits, nextEntries) => {
  try {
    setSaveState("saving");

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ habits: nextHabits, entries: nextEntries })
    );

    // 👇 Add delay so "Saving..." is visible
    setTimeout(() => {
      setSaveState("saved");
    }, 500); // 0.5 second

  } catch (e) {
    console.error(e);
    setSaveState("error");
  }
}, []);

  useEffect(() => {
    if (!loaded) return;
    persist(habits, entries);
  }, [habits, entries, loaded, persist]);
useEffect(() => {
  console.log("Entries:", entries);
}, [entries]);
const toggleHabit = async (date, habitId) => {
  const value = !entries?.[date]?.[habitId];

  setEntries((prev) => {
    const updated = { ...prev };
    if (!updated[date]) updated[date] = {};
    updated[date][habitId] = value;
    return updated;
  });

  // 🔥 THIS IS WHAT WAS MISSING
  await supabase.from("entries").upsert([
    {
      date: date,
      habit_id: habitId,
      done: value,
    },
  ]);
};
const addHabit = () => {
    const name = newHabit.trim();
    if (!name) return;
    const id = "h" + Date.now();
    setHabits((prev) => [...prev, { id, name, icon: newIcon }]);
    setNewHabit("");
  };

  const removeHabit = (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const pointsPerHabit = habits.length ? Math.round(100 / habits.length) : 0;

  const completionForDate = (date) => {
    if (!habits.length) return 0;
    const day = entries[date] || {};
const done = habits.filter((h) => day[h.id] === true).length;
    return Math.round((done / habits.length) * 100);
  };

  const hasAnyEntry = (date) => {
    const day = entries[date];
    if (!day) return false;
    return Object.values(day).some(Boolean) || Object.keys(day).length > 0;
  };

  const todayPct = completionForDate(todayISO());
  const todayPoints = Math.round((todayPct / 100) * 100);

  const streak = useMemo(() => {
    let count = 0;
    let d = new Date();
    // start from today; if today incomplete, streak counts up to yesterday
    for (let i = 0; i < 3650; i++) {
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const pct = completionForDate(iso);
      if (i === 0 && pct < 100) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      if (pct === 100) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [entries, habits]);

  const monthStats = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayD = new Date();
    const isCurrentMonth = year === todayD.getFullYear() && month === todayD.getMonth();
    const lastDay = isCurrentMonth ? todayD.getDate() : daysInMonth;
    let perfect = 0, missed = 0, attempted = 0, sumPct = 0, daysWithData = 0;
    for (let day = 1; day <= lastDay; day++) {
      const iso = isoOf(year, month, day);
      if (!hasAnyEntry(iso)) continue;
      daysWithData++;
      const pct = completionForDate(iso);
      sumPct += pct;
      attempted++;
      if (pct === 100) perfect++;
      if (pct === 0) missed++;
    }
    const accuracy = daysWithData ? Math.round(sumPct / daysWithData) : 0;
    return { perfect, missed, attempted, accuracy, daysWithData, daysInMonth, lastDay };
  };

  const currentMonthStats = useMemo(
    () => monthStats(new Date().getFullYear(), new Date().getMonth()),
    [entries, habits]
  );

  const reviewStats = useMemo(
    () => monthStats(reviewYear, reviewMonth),
    [entries, habits, reviewYear, reviewMonth]
  );

  const perHabitConsistency = useMemo(() => {
    const { lastDay } = monthStats(reviewYear, reviewMonth);
    return habits.map((h) => {
      let done = 0, total = 0;
      for (let day = 1; day <= lastDay; day++) {
        const iso = isoOf(reviewYear, reviewMonth, day);
        if (!hasAnyEntry(iso)) continue;
        total++;
        if ((entries[iso] || {})[h.id]) done++;
      }
      return { habit: h, pct: total ? Math.round((done / total) * 100) : 0, done, total };
    });
  }, [habits, entries, reviewYear, reviewMonth]);

  const last30 = useMemo(() => {
    const arr = [];
    const d = new Date();
    for (let i = 29; i >= 0; i--) {
      const dd = new Date(d);
      dd.setDate(d.getDate() - i);
      const iso = `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}-${String(dd.getDate()).padStart(2, "0")}`;
      arr.push({ iso, pct: hasAnyEntry(iso) ? completionForDate(iso) : null });
    }
    return arr;
  }, [entries, habits]);

  const monthDays = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(day);
    return cells;
  }, [viewYear, viewMonth]);

  const monthLabel = (y, m) =>
    new Date(y, m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const heatColor = (pct) => {
    if (pct === null) return "var(--surface-1)";
    if (pct === 0) return "#5a1f1f";
    if (pct < 40) return "#6b3a1a";
    if (pct < 70) return "#5a5a1a";
    if (pct < 100) return "#1f4d3a";
    return "#1d9e75";
  };

  const shiftViewMonth = (delta) => {
    let m = viewMonth + delta, y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m); setViewYear(y);
  };
  const shiftReviewMonth = (delta) => {
    let m = reviewMonth + delta, y = reviewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setReviewMonth(m); setReviewYear(y);
  };

  const selectedDayEntries = entries[selectedDate] || {};
  const isFuture = selectedDate > todayISO();

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 16px", fontFamily: "'Inter', system-ui, sans-serif", color: "#e7e9ec" }}>
      <style>{`
        .card { background:#12161d; border:1px solid #232a35; border-radius:14px; }
        .btn { border:1px solid #232a35; background:#161b23; color:#c7ccd3; border-radius:8px; padding:6px 10px; cursor:pointer; font-size:13px; }
        .btn:hover { border-color:#34d399; color:#fff; }
        .tab { padding:8px 14px; border-radius:8px; cursor:pointer; font-size:13px; display:flex; align-items:center; gap:6px; color:#8b93a1; }
        .tab.active { background:#1a2029; color:#34d399; }
        input[type=text] { background:#0d1117; border:1px solid #232a35; color:#e7e9ec; border-radius:8px; padding:8px 10px; font-size:13px; }
        ::placeholder { color:#5b6472; }
      `}</style>

      <div className="card" style={{ padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: "#5b6472", textTransform: "uppercase", marginBottom: 6 }}>Discipline vitals</div>
            <div style={{ fontSize: 26, fontWeight: 600 }}>Today's ritual</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#34d399" }}>{todayPct}%</div>
            <div style={{ fontSize: 12, color: "#8b93a1" }}>{todayPoints}/100 points earned today</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Current streak", value: `${streak}d`, sub: "consecutive perfect days", Icon: Flame },
          { label: "Month average", value: `${currentMonthStats.accuracy}%`, sub: monthLabel(new Date().getFullYear(), new Date().getMonth()), Icon: TrendingUp },
          { label: "Traction", value: `${todayPoints} pts`, sub: `vs per week goal`, Icon: Target },
          { label: "Points pool", value: "100", sub: "raw habit points", Icon: Coins },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#5b6472", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              <s.Icon size={13} /> {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#5b6472", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        <div className={`tab ${tab === "today" ? "active" : ""}`} onClick={() => setTab("today")}><ListChecks size={14} /> Checklist</div>
        <div className={`tab ${tab === "calendar" ? "active" : ""}`} onClick={() => setTab("calendar")}><CalendarDays size={14} /> Monthly log</div>
        <div className={`tab ${tab === "review" ? "active" : ""}`} onClick={() => setTab("review")}><BarChart3 size={14} /> Review</div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#5b6472", alignSelf: "center" }}>
          {saveState === "saving" ? "Saving..." : saveState === "error" ? "Save failed" : loaded ? "Saved" : ""}
        </div>
      </div>

      {tab === "today" && (
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 13, color: "#8b93a1", marginBottom: 12 }}>
            {selectedDate === todayISO() ? "Today" : selectedDate}
          </div>
          {habits.map((h) => {
            const Icon = iconFor(h.icon);
            const done = !!selectedDayEntries[h.id];
            return (
              <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 4px", borderBottom: "1px solid #1c222c" }}>
                <div
                  onClick={() => toggleHabit(selectedDate, h.id)}
                  style={{
                    width: 20, height: 20, borderRadius: 6, border: `1px solid ${done ? "#34d399" : "#3a4250"}`,
                    background: done ? "#34d399" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0
                  }}
                >
                  {done && <Check size={13} color="#0d1117" />}
                </div>
                <Icon size={15} color="#8b93a1" />
                <div style={{ flex: 1, fontSize: 14, color: done ? "#e7e9ec" : "#c7ccd3", textDecoration: done ? "none" : "none" }}>{h.name}</div>
                <div style={{ fontSize: 11, color: "#5b6472" }}>{pointsPerHabit} pts</div>
                <Trash2 size={14} color="#5b6472" style={{ cursor: "pointer" }} onClick={() => removeHabit(h.id)} />
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <select value={newIcon} onChange={(e) => setNewIcon(e.target.value)} style={{ background: "#0d1117", border: "1px solid #232a35", color: "#e7e9ec", borderRadius: 8, padding: "8px" }}>
              {ICONS.map((i) => <option key={i.key} value={i.key}>{i.key}</option>)}
            </select>
            <input type="text" placeholder="Add a habit..." value={newHabit} onChange={(e) => setNewHabit(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addHabit()} style={{ flex: 1, minWidth: 160 }} />
            <button className="btn" onClick={addHabit}><Plus size={14} /></button>
          </div>
        </div>
      )}

      {tab === "calendar" && (
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <button className="btn" onClick={() => shiftViewMonth(-1)}><ChevronLeft size={14} /></button>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{monthLabel(viewYear, viewMonth)}</div>
            <button className="btn" onClick={() => shiftViewMonth(1)}><ChevronRight size={14} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, fontSize: 11, color: "#5b6472", marginBottom: 6, textAlign: "center" }}>
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {monthDays.map((day, i) => {
              if (day === null) return <div key={i} />;
              const iso = isoOf(viewYear, viewMonth, day);
              const pct = hasAnyEntry(iso) ? completionForDate(iso) : null;
              const isToday = iso === todayISO();
              return (
                <div
                  key={i}
                  onClick={() => { setSelectedDate(iso); setTab("today"); }}
                  style={{
                    aspectRatio: "1", borderRadius: 8, background: heatColor(pct), display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 12, cursor: "pointer", border: isToday ? "1.5px solid #fff" : "1px solid transparent", color: "#e7e9ec"
                  }}
                  title={pct === null ? "No data" : `${pct}% complete`}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 14, fontSize: 11, color: "#8b93a1" }}>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#5a1f1f", borderRadius: 3, marginRight: 4 }} />0%</span>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#6b3a1a", borderRadius: 3, marginRight: 4 }} />1-39%</span>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#5a5a1a", borderRadius: 3, marginRight: 4 }} />40-69%</span>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#1f4d3a", borderRadius: 3, marginRight: 4 }} />70-99%</span>
            <span><span style={{ display: "inline-block", width: 10, height: 10, background: "#1d9e75", borderRadius: 3, marginRight: 4 }} />100%</span>
          </div>
        </div>
      )}

      {tab === "review" && (
        <div>
          <div className="card" style={{ padding: 18, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <button className="btn" onClick={() => shiftReviewMonth(-1)}><ChevronLeft size={14} /></button>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{monthLabel(reviewYear, reviewMonth)}</div>
              <button className="btn" onClick={() => shiftReviewMonth(1)}><ChevronRight size={14} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#34d399" }}>{reviewStats.perfect}</div>
                <div style={{ fontSize: 11, color: "#8b93a1" }}>Perfect days</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#e2555a" }}>{reviewStats.missed}</div>
                <div style={{ fontSize: 11, color: "#8b93a1" }}>Missed days (0%)</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{reviewStats.attempted}</div>
                <div style={{ fontSize: 11, color: "#8b93a1" }}>Days logged</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#60a5fa" }}>{reviewStats.accuracy}%</div>
                <div style={{ fontSize: 11, color: "#8b93a1" }}>Accuracy (avg completion)</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, color: "#8b93a1", marginBottom: 14 }}>Task consistency this month</div>
            {perHabitConsistency.map(({ habit, pct, done, total }) => {
              const Icon = iconFor(habit.icon);
              return (
                <div key={habit.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#c7ccd3" }}><Icon size={13} /> {habit.name}</span>
                    <span style={{ color: "#5b6472" }}>{done}/{total} · {pct}%</span>
                  </div>
                  <div style={{ height: 6, background: "#1c222c", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#34d399" : pct >= 60 ? "#60a5fa" : "#e2555a" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 12, color: "#5b6472", marginBottom: 8 }}>Last 30 days</div>
        <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 60 }}>
          {last30.map((d, i) => (
            <div key={i} title={`${d.iso}: ${d.pct === null ? "no data" : d.pct + "%"}`}
              style={{ flex: 1, height: d.pct === null ? 4 : Math.max(4, (d.pct / 100) * 60), background: d.pct === null ? "#1c222c" : heatColor(d.pct), borderRadius: 2 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
