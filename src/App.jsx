import { useState, useEffect } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const DAILY_RATE = 500;
const MONTHLY_SALARY = 15000;
const STORAGE_KEY = "cafe_attendance_all_v1";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function App() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [allAttendance, setAllAttendance] = useState({});
  const [justToggled, setJustToggled] = useState(null);
  const [view, setView] = useState("calendar");

  // Load saved data from browser on first open
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setAllAttendance(JSON.parse(saved));
    } catch (e) {
      console.error("Could not load data", e);
    }
  }, []);

  // Save data to browser whenever attendance changes
  const saveAll = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Could not save data", e);
    }
  };

  const toggleDay = (day) => {
    const key = `${currentYear}-${String(currentMonth).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const updated = { ...allAttendance, [key]: !allAttendance[key] };
    setAllAttendance(updated);
    saveAll(updated);
    setJustToggled(key);
    setTimeout(() => setJustToggled(null), 400);
  };

  const isPresent = (day) => {
    const key = `${currentYear}-${String(currentMonth).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return !!allAttendance[key];
  };

  const getMonthCount = (year, month) => {
    const prefix = `${year}-${String(month).padStart(2,"0")}-`;
    return Object.entries(allAttendance).filter(([k, v]) => k.startsWith(prefix) && v).length;
  };

  const presentCount = getMonthCount(currentYear, currentMonth);
  const salary = presentCount * DAILY_RATE;
  const remaining = MONTHLY_SALARY - salary;
  const progress = Math.min((salary / MONTHLY_SALARY) * 100, 100);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const isToday = (day) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const getHistoryMonths = () => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      let m = today.getMonth() - i;
      let y = today.getFullYear();
      if (m < 0) { m += 12; y -= 1; }
      const count = getMonthCount(y, m);
      months.push({ year: y, month: m, count, salary: count * DAILY_RATE });
    }
    return months;
  };

  const historyMonths = getHistoryMonths();
  const totalDays = historyMonths.reduce((s, m) => s + m.count, 0);
  const totalSalary = totalDays * DAILY_RATE;
  const last3 = historyMonths.slice(-3);
  const last3Days = last3.reduce((s, m) => s + m.count, 0);
  const last3Salary = last3Days * DAILY_RATE;

  const btnStyle = (active) => ({
    flex: 1,
    padding: "9px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1px",
    textTransform: "uppercase",
    transition: "all 0.2s",
    background: active ? "#f5c842" : "rgba(245,200,66,0.08)",
    color: active ? "#1a0a00" : "#8a5a2a",
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1a0a00",
      backgroundImage: "radial-gradient(ellipse at 20% 20%, #3d1a00 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #1a0800 0%, transparent 60%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Georgia', serif",
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "6px" }}>
          <span style={{ fontSize: "26px" }}>☕</span>
          <h1 style={{ fontSize: "clamp(20px, 5vw, 30px)", fontWeight: "700", color: "#f5c842", letterSpacing: "2px", margin: 0, textTransform: "uppercase" }}>
            Café Attendance
          </h1>
          <span style={{ fontSize: "26px" }}>☕</span>
        </div>
        <p style={{ color: "#c8935a", fontSize: "12px", margin: 0, letterSpacing: "3px", textTransform: "uppercase" }}>
          Staff Presence Tracker
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: "linear-gradient(145deg, #2a1200, #1f0d00)",
        border: "1px solid #6b3a10",
        borderRadius: "20px",
        padding: "24px",
        width: "100%",
        maxWidth: "480px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(245,200,66,0.1)",
      }}>

        {/* Tab Toggle */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "22px" }}>
          <button style={btnStyle(view === "calendar")} onClick={() => setView("calendar")}>📅 Calendar</button>
          <button style={btnStyle(view === "history")} onClick={() => setView("history")}>📊 History</button>
        </div>

        {/* CALENDAR VIEW */}
        {view === "calendar" && <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <button onClick={prevMonth} style={{ background: "rgba(245,200,66,0.1)", border: "1px solid #6b3a10", color: "#f5c842", borderRadius: "10px", width: "38px", height: "38px", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#f5c842", fontSize: "20px", fontWeight: "700", letterSpacing: "1px" }}>{MONTHS[currentMonth]}</div>
              <div style={{ color: "#8a5a2a", fontSize: "13px" }}>{currentYear}</div>
            </div>
            <button onClick={nextMonth} style={{ background: "rgba(245,200,66,0.1)", border: "1px solid #6b3a10", color: "#f5c842", borderRadius: "10px", width: "38px", height: "38px", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: "center", color: "#8a5a2a", fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px", padding: "4px 0", textTransform: "uppercase" }}>{d}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px" }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} />;
              const key = `${currentYear}-${String(currentMonth).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const present = isPresent(day);
              const todayCell = isToday(day);
              const toggled = justToggled === key;
              return (
                <button key={day} onClick={() => toggleDay(day)} style={{
                  aspectRatio: "1", borderRadius: "10px",
                  border: todayCell ? "2px solid #f5c842" : present ? "2px solid #4caf50" : "1px solid #3d1a00",
                  background: present ? "linear-gradient(135deg, #1a4a1a, #2d6e2d)" : "rgba(255,255,255,0.03)",
                  cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: "2px", transition: "all 0.2s", transform: toggled ? "scale(1.15)" : "scale(1)",
                  boxShadow: present ? "0 0 12px rgba(76,175,80,0.3)" : "none", padding: "4px",
                }}>
                  <span style={{ fontSize: "clamp(11px, 2.5vw, 13px)", color: present ? "#a8e6a8" : todayCell ? "#f5c842" : "#c8935a", fontWeight: todayCell ? "700" : "400", lineHeight: 1 }}>{day}</span>
                  {present && <span style={{ fontSize: "clamp(9px, 2vw, 12px)", lineHeight: 1 }}>✓</span>}
                </button>
              );
            })}
          </div>

          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #6b3a10, transparent)", margin: "20px 0" }} />

          <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
            <div style={{ flex: 1, background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
              <div style={{ color: "#4caf50", fontSize: "26px", fontWeight: "700", lineHeight: 1 }}>{presentCount}</div>
              <div style={{ color: "#6b9e6b", fontSize: "10px", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>Days Present</div>
            </div>
            <div style={{ flex: 1, background: "rgba(245,200,66,0.08)", border: "1px solid rgba(245,200,66,0.2)", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
              <div style={{ color: "#f5c842", fontSize: "20px", fontWeight: "700", lineHeight: 1 }}>₹{salary.toLocaleString()}</div>
              <div style={{ color: "#8a7a2a", fontSize: "10px", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>Salary Due</div>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "#8a5a2a", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Monthly Progress</span>
              <span style={{ color: "#c8935a", fontSize: "11px" }}>₹{salary.toLocaleString()} / ₹{MONTHLY_SALARY.toLocaleString()}</span>
            </div>
            <div style={{ background: "#2a1200", borderRadius: "99px", height: "8px", overflow: "hidden", border: "1px solid #3d1a00" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: progress >= 100 ? "linear-gradient(90deg, #4caf50, #81c784)" : "linear-gradient(90deg, #f5c842, #e6a820)", borderRadius: "99px", transition: "width 0.4s ease" }} />
            </div>
            <div style={{ color: "#5a3a1a", fontSize: "11px", marginTop: "6px", textAlign: "right" }}>
              {remaining > 0 ? `₹${remaining.toLocaleString()} remaining to full salary` : "🎉 Full monthly salary reached!"}
            </div>
          </div>

          <p style={{ color: "#5a3a1a", fontSize: "11px", textAlign: "center", margin: "12px 0 0", letterSpacing: "0.5px" }}>
            ₹500/day · Full month = ₹15,000 · Tap a date to mark attendance
          </p>
        </>}

        {/* HISTORY VIEW */}
        {view === "history" && <>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <div style={{ flex: 1, background: "rgba(245,200,66,0.08)", border: "1px solid rgba(245,200,66,0.2)", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
              <div style={{ color: "#f5c842", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Last 3 Months</div>
              <div style={{ color: "#f5c842", fontSize: "22px", fontWeight: "700" }}>{last3Days} <span style={{ fontSize: "12px", color: "#8a7a2a" }}>days</span></div>
              <div style={{ color: "#c8935a", fontSize: "13px", marginTop: "2px" }}>₹{last3Salary.toLocaleString()}</div>
            </div>
            <div style={{ flex: 1, background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.2)", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
              <div style={{ color: "#4caf50", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>All Time</div>
              <div style={{ color: "#4caf50", fontSize: "22px", fontWeight: "700" }}>{totalDays} <span style={{ fontSize: "12px", color: "#6b9e6b" }}>days</span></div>
              <div style={{ color: "#a8e6a8", fontSize: "13px", marginTop: "2px" }}>₹{totalSalary.toLocaleString()}</div>
            </div>
          </div>

          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #6b3a10, transparent)", marginBottom: "16px" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[...historyMonths].reverse().map(({ year, month, count, salary: mSalary }) => {
              const isCurrent = year === today.getFullYear() && month === today.getMonth();
              const pct = Math.min((count / 30) * 100, 100);
              return (
                <div key={`${year}-${month}`}
                  onClick={() => { setCurrentMonth(month); setCurrentYear(year); setView("calendar"); }}
                  style={{ background: isCurrent ? "rgba(245,200,66,0.06)" : "rgba(255,255,255,0.02)", border: isCurrent ? "1px solid rgba(245,200,66,0.3)" : "1px solid #2a1200", borderRadius: "12px", padding: "12px 14px", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.background = "rgba(245,200,66,0.08)"}
                  onMouseOut={e => e.currentTarget.style.background = isCurrent ? "rgba(245,200,66,0.06)" : "rgba(255,255,255,0.02)"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: isCurrent ? "#f5c842" : "#c8935a", fontSize: "14px", fontWeight: "700" }}>{MONTHS_SHORT[month]} {year}</span>
                      {isCurrent && <span style={{ background: "#f5c842", color: "#1a0a00", fontSize: "9px", padding: "2px 6px", borderRadius: "99px", fontWeight: "700", letterSpacing: "0.5px" }}>NOW</span>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: count > 0 ? "#4caf50" : "#5a3a1a", fontSize: "13px", fontWeight: "700" }}>{count} days</span>
                      <span style={{ color: "#6b3a10", fontSize: "12px" }}> · </span>
                      <span style={{ color: count > 0 ? "#c8935a" : "#5a3a1a", fontSize: "12px" }}>₹{mSalary.toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ background: "#1a0a00", borderRadius: "99px", height: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: count > 0 ? "linear-gradient(90deg, #4caf50, #81c784)" : "transparent", borderRadius: "99px", transition: "width 0.3s" }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ color: "#5a3a1a", fontSize: "11px", textAlign: "center", margin: "14px 0 0" }}>
            Tap any month to view its calendar
          </p>
        </>}
      </div>

      <p style={{ color: "#3d2010", fontSize: "11px", marginTop: "16px", letterSpacing: "1px" }}>DATA SAVED AUTOMATICALLY</p>
    </div>
  );
}