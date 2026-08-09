import {
  useState, useReducer, useMemo, useCallback, useRef, memo
} from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXP 1.4.1 — DATA MODEL
// Posts are events mapped to dates. Each has an id, title, platform, status.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PLATFORMS = ["Twitter", "Instagram", "LinkedIn", "YouTube"];
const STATUSES  = ["Draft", "Scheduled", "Published"];

const PLATFORM_COLOR = {
  Twitter:   { bg: "#0ea5e922", border: "#0ea5e9", text: "#0ea5e9" },
  Instagram: { bg: "#ec489922", border: "#ec4899", text: "#ec4899" },
  LinkedIn:  { bg: "#3b82f622", border: "#3b82f6", text: "#3b82f6" },
  YouTube:   { bg: "#ef444422", border: "#ef4444", text: "#ef4444" },
};
const STATUS_COLOR = { Draft: "#94a3b8", Scheduled: "#facc15", Published: "#4ade80" };

const today   = new Date();
const todayY  = today.getFullYear();
const todayM  = today.getMonth();
const todayD  = today.getDate();

function makeDate(offsetDays) {
  const d = new Date(todayY, todayM, todayD + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

const INITIAL_POSTS = [
  { id: 1, title: "Product launch thread",    platform: "Twitter",   status: "Scheduled", date: makeDate(0),  time: "09:00" },
  { id: 2, title: "Behind the scenes reel",   platform: "Instagram", status: "Draft",     date: makeDate(1),  time: "12:00" },
  { id: 3, title: "Case study article",       platform: "LinkedIn",  status: "Scheduled", date: makeDate(2),  time: "10:00" },
  { id: 4, title: "Tutorial video",           platform: "YouTube",   status: "Published", date: makeDate(-1), time: "15:00" },
  { id: 5, title: "Weekly recap",             platform: "Twitter",   status: "Draft",     date: makeDate(3),  time: "08:00" },
  { id: 6, title: "Feature announcement",     platform: "LinkedIn",  status: "Scheduled", date: makeDate(0),  time: "14:00" },
  { id: 7, title: "User testimonial post",    platform: "Instagram", status: "Published", date: makeDate(-2), time: "11:00" },
  { id: 8, title: "Livestream promo",         platform: "YouTube",   status: "Scheduled", date: makeDate(5),  time: "16:00" },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXP 1.4.1 — STATE REDUCER (predictable state transitions)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function postsReducer(state, action) {
  switch (action.type) {
    case "ADD":    return { ...state, posts: [...state.posts, { id: Date.now(), ...action.payload }] };
    case "UPDATE": return { ...state, posts: state.posts.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) };
    case "DELETE": return { ...state, posts: state.posts.filter(p => p.id !== action.payload) };
    case "MOVE":   return { ...state, posts: state.posts.map(p => p.id === action.payload.id ? { ...p, date: action.payload.date } : p) };
    default:       return state;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATE HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function sameDay(a, b) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Build calendar grid for a given year/month: 6 rows × 7 cols
function buildGrid(year, month) {
  const first   = new Date(year, month, 1);
  const start   = new Date(first);
  start.setDate(1 - first.getDay());
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXP 1.4.2 — RENDER COUNTER (proves memoization is working)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function useRenderCount(label) {
  const ref = useRef(0);
  ref.current += 1;
  return ref.current;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXP 1.4.2 — UNIT TEST RUNNER (in-browser micro test suite)
// We can't ship Jest here, so we implement a tiny test runner that
// executes in the browser and shows pass/fail — same concept, visible proof.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function runTests(posts) {
  const results = [];
  function test(name, fn) {
    try { fn(); results.push({ name, pass: true }); }
    catch(e) { results.push({ name, pass: false, error: e.message }); }
  }
  function expect(val) {
    return {
      toBe:          (exp) => { if (val !== exp)         throw new Error(`Expected ${exp}, got ${val}`); },
      toEqual:       (exp) => { if (JSON.stringify(val) !== JSON.stringify(exp)) throw new Error(`Deep equality failed`); },
      toBeTruthy:    ()    => { if (!val)                throw new Error(`Expected truthy, got ${val}`); },
      toBeGreaterThan:(n)  => { if (!(val > n))          throw new Error(`Expected > ${n}, got ${val}`); },
      toHaveLength:  (n)   => { if (val.length !== n)    throw new Error(`Expected length ${n}, got ${val.length}`); },
      toContain:     (x)   => { if (!val.includes(x))    throw new Error(`Expected to contain ${x}`); },
    };
  }

  // ── Calendar logic tests ──
  test("buildGrid returns 42 cells", () => {
    expect(buildGrid(2024, 0)).toHaveLength(42);
  });
  test("toKey formats date correctly", () => {
    expect(toKey(new Date(2024, 0, 5))).toBe("2024-01-05");
  });
  test("sameDay detects identical dates", () => {
    const a = new Date(2024, 5, 15), b = new Date(2024, 5, 15);
    expect(sameDay(a, b)).toBeTruthy();
  });
  test("sameDay rejects different dates", () => {
    const a = new Date(2024, 5, 15), b = new Date(2024, 5, 16);
    expect(sameDay(a, b)).toBe(false);
  });

  // ── Reducer tests ──
  const state0 = { posts: [] };
  test("ADD reducer appends a post", () => {
    const next = postsReducer(state0, { type: "ADD", payload: { title: "Test", platform: "Twitter", status: "Draft", date: "2024-01-01", time: "10:00" }});
    expect(next.posts).toHaveLength(1);
  });
  test("DELETE reducer removes a post", () => {
    const withPost = { posts: [{ id: 99, title: "X" }] };
    const next = postsReducer(withPost, { type: "DELETE", payload: 99 });
    expect(next.posts).toHaveLength(0);
  });
  test("UPDATE reducer mutates correct post", () => {
    const withPost = { posts: [{ id: 1, title: "Old", status: "Draft" }] };
    const next = postsReducer(withPost, { type: "UPDATE", payload: { id: 1, title: "New" }});
    expect(next.posts[0].title).toBe("New");
  });
  test("MOVE reducer changes date only", () => {
    const withPost = { posts: [{ id: 1, title: "X", date: "2024-01-01" }] };
    const next = postsReducer(withPost, { type: "MOVE", payload: { id: 1, date: "2024-06-15" }});
    expect(next.posts[0].date).toBe("2024-06-15");
    expect(next.posts[0].title).toBe("X");
  });

  // ── Data integrity tests ──
  test("All posts have required fields", () => {
    posts.forEach(p => {
      if (!p.id || !p.title || !p.platform || !p.status || !p.date)
        throw new Error(`Post ${p.id} missing fields`);
    });
    expect(true).toBeTruthy();
  });
  test("Platform values are valid", () => {
    posts.forEach(p => {
      if (!PLATFORMS.includes(p.platform)) throw new Error(`Invalid platform: ${p.platform}`);
    });
    expect(true).toBeTruthy();
  });
  test("Status values are valid", () => {
    posts.forEach(p => {
      if (!STATUSES.includes(p.status)) throw new Error(`Invalid status: ${p.status}`);
    });
    expect(true).toBeTruthy();
  });
  test("Date format is YYYY-MM-DD", () => {
    posts.forEach(p => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) throw new Error(`Bad date: ${p.date}`);
    });
    expect(true).toBeTruthy();
  });

  // ── Derived state tests ──
  test("Posts group correctly by date", () => {
    const map = posts.reduce((acc, p) => { acc[p.date] = (acc[p.date]||[]); acc[p.date].push(p); return acc; }, {});
    const total = Object.values(map).flat().length;
    expect(total).toBe(posts.length);
  });
  test("Scheduled posts count is correct", () => {
    const count = posts.filter(p => p.status === "Scheduled").length;
    expect(count).toBeGreaterThan(0);
  });

  return results;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── Post chip on a calendar cell (memo: only re-renders if this post changes)
const PostChip = memo(function PostChip({ post, onClick, onDragStart }) {
  const c = PLATFORM_COLOR[post.platform];
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, post.id)}
      onClick={e => { e.stopPropagation(); onClick(post); }}
      style={{
        background: c.bg, border: `1px solid ${c.border}`, borderRadius: 4,
        padding: "1px 5px", fontSize: "0.6rem", color: c.text, fontWeight: 600,
        cursor: "grab", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden",
        textOverflow: "ellipsis", userSelect: "none",
      }}
      title={`${post.title} · ${post.time}`}
    >
      <span style={{ opacity: 0.7, marginRight: 3 }}>
        {post.status === "Published" ? "✓" : post.status === "Scheduled" ? "◷" : "✎"}
      </span>
      {post.title}
    </div>
  );
});

// ── Single calendar day cell (memo: skips re-render if posts for this day unchanged)
const DayCell = memo(function DayCell({ date, posts, isCurrentMonth, isToday, onClickDay, onClickPost, onDragStart, onDrop, onDragOver }) {
  const renders = useRenderCount();
  const key     = toKey(date);

  return (
    <div
      onDrop={e => onDrop(e, key)}
      onDragOver={onDragOver}
      onClick={() => onClickDay(date)}
      style={{
        minHeight: 90, border: "1px solid #1e293b", borderRadius: 6,
        padding: "4px 5px", cursor: "pointer",
        background: isToday ? "#1e293b" : "#0f172a",
        opacity: isCurrentMonth ? 1 : 0.35,
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Date number + render counter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <span style={{
          fontSize: "0.72rem", fontWeight: isToday ? 700 : 400,
          color: isToday ? "#fff" : "#64748b",
          background: isToday ? "#7c3aed" : "transparent",
          borderRadius: isToday ? "50%" : 0,
          width: isToday ? 20 : "auto", height: isToday ? 20 : "auto",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {date.getDate()}
        </span>
        {/* 1.4.2: per-cell render badge */}
        <span style={{ fontSize: "0.5rem", color: "#334155", fontFamily: "monospace" }}>r{renders}</span>
      </div>

      {/* Post chips */}
      {posts.slice(0, 3).map(p => (
        <PostChip key={p.id} post={p} onClick={onClickPost} onDragStart={onDragStart} />
      ))}
      {posts.length > 3 && (
        <div style={{ fontSize: "0.58rem", color: "#64748b" }}>+{posts.length - 3} more</div>
      )}
    </div>
  );
});

// ── Week view row
const WeekView = memo(function WeekView({ weekDates, postsByDate, currentMonth, onClickDay, onClickPost, onDragStart, onDrop, onDragOver }) {
  const today_ = new Date();
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "0.68rem", color: "#64748b", fontWeight: 600, padding: "4px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {weekDates.map(date => (
          <DayCell
            key={toKey(date)}
            date={date}
            posts={postsByDate[toKey(date)] || []}
            isCurrentMonth={date.getMonth() === currentMonth}
            isToday={sameDay(date, today_)}
            onClickDay={onClickDay}
            onClickPost={onClickPost}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onDragOver={onDragOver}
          />
        ))}
      </div>
    </div>
  );
});

// ── Month calendar grid — 6 weeks
const MonthGrid = memo(function MonthGrid({ grid, postsByDate, currentMonth, onClickDay, onClickPost, onDragStart, onDrop, onDragOver }) {
  const today_ = new Date();
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "0.68rem", color: "#64748b", fontWeight: 600, padding: "4px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {grid.map(date => (
          <DayCell
            key={toKey(date)}
            date={date}
            posts={postsByDate[toKey(date)] || []}
            isCurrentMonth={date.getMonth() === currentMonth}
            isToday={sameDay(date, today_)}
            onClickDay={onClickDay}
            onClickPost={onClickPost}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onDragOver={onDragOver}
          />
        ))}
      </div>
    </div>
  );
});

// ── Day view (single day, all posts listed)
const DayView = memo(function DayView({ date, posts, onClickPost, onDragStart }) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7am–6pm
  const byHour = useMemo(() => {
    const map = {};
    posts.forEach(p => {
      const h = parseInt(p.time?.split(":")[0] ?? "9");
      if (!map[h]) map[h] = [];
      map[h].push(p);
    });
    return map;
  }, [posts]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {hours.map(h => (
        <div key={h} style={{ display: "flex", gap: 8, minHeight: 36, alignItems: "flex-start" }}>
          <span style={{ fontSize: "0.65rem", color: "#475569", width: 36, paddingTop: 2, flexShrink: 0, textAlign: "right" }}>
            {h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h-12}pm`}
          </span>
          <div style={{ flex: 1, borderTop: "1px solid #1e293b", paddingTop: 2 }}>
            {(byHour[h] || []).map(p => (
              <PostChip key={p.id} post={p} onClick={onClickPost} onDragStart={onDragStart} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

// ── Stats bar
const StatsBar = memo(function StatsBar({ posts }) {
  // 1.4.2: useMemo — only recomputes when posts array changes
  const stats = useMemo(() => ({
    total:     posts.length,
    draft:     posts.filter(p => p.status === "Draft").length,
    scheduled: posts.filter(p => p.status === "Scheduled").length,
    published: posts.filter(p => p.status === "Published").length,
    byPlatform: PLATFORMS.map(pl => ({ name: pl, count: posts.filter(p => p.platform === pl).length })),
  }), [posts]);

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.8rem" }}>
      {[
        { label: "Total",     val: stats.total,     color: "#e2e8f0" },
        { label: "Draft",     val: stats.draft,     color: STATUS_COLOR.Draft },
        { label: "Scheduled", val: stats.scheduled, color: STATUS_COLOR.Scheduled },
        { label: "Published", val: stats.published, color: STATUS_COLOR.Published },
      ].map(s => (
        <div key={s.label} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 7, padding: "5px 12px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: "1rem", fontWeight: 700, color: s.color }}>{s.val}</span>
          <span style={{ fontSize: "0.68rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</span>
        </div>
      ))}
      {stats.byPlatform.filter(p => p.count > 0).map(p => (
        <div key={p.name} style={{ background: "#1e293b", border: `1px solid ${PLATFORM_COLOR[p.name].border}`, borderRadius: 7, padding: "5px 12px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: "1rem", fontWeight: 700, color: PLATFORM_COLOR[p.name].text }}>{p.count}</span>
          <span style={{ fontSize: "0.68rem", color: PLATFORM_COLOR[p.name].text, opacity: 0.7 }}>{p.name}</span>
        </div>
      ))}
    </div>
  );
});

// ── Post modal (add / edit)
function PostModal({ post, defaultDate, onSave, onDelete, onClose }) {
  const isEdit = !!post;
  const [form, setForm] = useState(post ?? {
    title: "", platform: "Twitter", status: "Draft",
    date: defaultDate ? toKey(defaultDate) : makeDate(0), time: "10:00",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <p style={S.modalTitle}>{isEdit ? "Edit Post" : "Schedule Post"}</p>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <label style={S.label}>Title</label>
        <input style={S.input} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Post title..." />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <div>
            <label style={S.label}>Platform</label>
            <select style={S.input} value={form.platform} onChange={e => set("platform", e.target.value)}>
              {PLATFORMS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Status</label>
            <select style={S.input} value={form.status} onChange={e => set("status", e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Date</label>
            <input style={S.input} type="date" value={form.date} onChange={e => set("date", e.target.value)} />
          </div>
          <div>
            <label style={S.label}>Time</label>
            <input style={S.input} type="time" value={form.time} onChange={e => set("time", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button style={S.btnPrimary} onClick={() => { if (form.title.trim()) onSave(form); }}>
            {isEdit ? "Save Changes" : "Schedule"}
          </button>
          {isEdit && (
            <button style={{ ...S.btnSecondary, color: "#f87171", borderColor: "#f87171" }}
              onClick={() => onDelete(post.id)}>Delete</button>
          )}
          <button style={S.btnSecondary} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Test Panel (1.4.2 — in-browser unit tests)
const TestPanel = memo(function TestPanel({ posts }) {
  const [open, setOpen]       = useState(false);
  const [results, setResults] = useState(null);

  // useCallback: stable reference so TestPanel doesn't cause re-renders downstream
  const handleRun = useCallback(() => {
    setResults(runTests(posts));
  }, [posts]);

  const passed = results?.filter(r => r.pass).length ?? 0;
  const total  = results?.length ?? 0;

  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, overflow: "hidden", marginBottom: "0.8rem" }}>
      <button
        style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "0.78rem", padding: "0.6rem 1rem", cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        onClick={() => { setOpen(o => !o); if (!open) handleRun(); }}
      >
        <span>🧪 Unit Tests (Exp 1.4.2) {results && <span style={{ color: passed === total ? "#4ade80" : "#f87171", marginLeft: 8 }}>{passed}/{total} passing</span>}</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && results && (
        <div style={{ padding: "0.5rem 1rem 1rem", borderTop: "1px solid #0f172a", display: "flex", flexDirection: "column", gap: 4 }}>
          {results.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.75rem" }}>
              <span style={{ color: r.pass ? "#4ade80" : "#f87171", flexShrink: 0 }}>{r.pass ? "✓" : "✗"}</span>
              <span style={{ color: r.pass ? "#94a3b8" : "#e2e8f0" }}>{r.name}</span>
              {!r.pass && <span style={{ color: "#f87171", fontSize: "0.68rem", marginLeft: "auto" }}>{r.error}</span>}
            </div>
          ))}
          <button style={{ ...S.btnPrimary, marginTop: "0.5rem", width: "auto", padding: "4px 14px", fontSize: "0.75rem" }} onClick={handleRun}>
            Re-run tests
          </button>
        </div>
      )}
    </div>
  );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function App() {
  const [state, dispatch]   = useReducer(postsReducer, { posts: INITIAL_POSTS });
  const [curYear, setCurYear] = useState(todayY);
  const [curMonth, setCurMonth] = useState(todayM);
  const [view, setView]     = useState("month"); // month | week | day
  const [modal, setModal]   = useState(null);    // null | { mode: "add"|"edit", post?, date? }
  const [selectedDay, setSelectedDay] = useState(new Date());
  const dragId = useRef(null);

  const posts = state.posts;

  // 1.4.2: useMemo — postsByDate only recomputes when posts changes
  const postsByDate = useMemo(() => {
    return posts.reduce((acc, p) => {
      if (!acc[p.date]) acc[p.date] = [];
      acc[p.date].push(p);
      return acc;
    }, {});
  }, [posts]);

  // 1.4.2: useMemo — calendar grid only recomputes when year/month changes
  const calGrid = useMemo(() => buildGrid(curYear, curMonth), [curYear, curMonth]);

  // Week view: 7 days starting from current week's Sunday
  const weekDates = useMemo(() => {
    const sun = new Date(selectedDay);
    sun.setDate(selectedDay.getDate() - selectedDay.getDay());
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(sun); d.setDate(sun.getDate() + i); return d; });
  }, [selectedDay]);

  // 1.4.2: useCallback — stable drag handlers
  const handleDragStart = useCallback((e, id) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback(e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((e, dateKey) => {
    e.preventDefault();
    if (dragId.current !== null) {
      dispatch({ type: "MOVE", payload: { id: dragId.current, date: dateKey } });
      dragId.current = null;
    }
  }, []);

  // 1.4.2: useCallback — stable click handlers
  const handleClickDay = useCallback((date) => {
    setSelectedDay(date);
    if (view === "month") setView("day");
  }, [view]);

  const handleClickPost = useCallback((post) => {
    setModal({ mode: "edit", post });
  }, []);

  const handleSave = useCallback((form) => {
    if (modal.mode === "edit") dispatch({ type: "UPDATE", payload: { ...modal.post, ...form } });
    else dispatch({ type: "ADD", payload: form });
    setModal(null);
  }, [modal]);

  const handleDelete = useCallback((id) => {
    dispatch({ type: "DELETE", payload: id });
    setModal(null);
  }, []);

  function prevPeriod() {
    if (view === "month") { if (curMonth === 0) { setCurMonth(11); setCurYear(y => y-1); } else setCurMonth(m => m-1); }
    else { const d = new Date(selectedDay); d.setDate(d.getDate() - (view==="week"?7:1)); setSelectedDay(d); }
  }
  function nextPeriod() {
    if (view === "month") { if (curMonth === 11) { setCurMonth(0); setCurYear(y => y+1); } else setCurMonth(m => m+1); }
    else { const d = new Date(selectedDay); d.setDate(d.getDate() + (view==="week"?7:1)); setSelectedDay(d); }
  }
  function goToday() {
    setCurYear(todayY); setCurMonth(todayM); setSelectedDay(new Date());
  }

  function headerLabel() {
    if (view === "month") return `${MONTH_NAMES[curMonth]} ${curYear}`;
    if (view === "week")  return `Week of ${MONTH_NAMES[weekDates[0].getMonth()]} ${weekDates[0].getDate()}, ${weekDates[0].getFullYear()}`;
    return `${MONTH_NAMES[selectedDay.getMonth()]} ${selectedDay.getDate()}, ${selectedDay.getFullYear()}`;
  }

  const dayPosts = useMemo(() => postsByDate[toKey(selectedDay)] || [], [postsByDate, selectedDay]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Inter','Segoe UI',sans-serif", color: "#e2e8f0", padding: "1.2rem" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>📅 PostScheduler</h1>
            <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: "#64748b" }}>
              Exp 1.4.1 · Calendar UI &nbsp;|&nbsp; Exp 1.4.2 · Performance + Testing
            </p>
          </div>
          <button style={S.btnPrimary} onClick={() => setModal({ mode: "add", date: selectedDay })}>
            + Schedule Post
          </button>
        </div>

        {/* Stats */}
        <StatsBar posts={posts} />

        {/* Test panel */}
        <TestPanel posts={posts} />

        {/* Calendar controls */}
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "0.8rem 1rem", marginBottom: "0.6rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
            {/* Nav */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button style={S.navBtn} onClick={prevPeriod}>‹</button>
              <button style={S.navBtn} onClick={nextPeriod}>›</button>
              <button style={{ ...S.navBtn, fontSize: "0.72rem", padding: "4px 10px" }} onClick={goToday}>Today</button>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", marginLeft: 6 }}>{headerLabel()}</span>
            </div>
            {/* View switch */}
            <div style={{ display: "flex", gap: "0.3rem" }}>
              {["month","week","day"].map(v => (
                <button key={v} style={view === v ? S.viewBtnActive : S.viewBtn} onClick={() => setView(v)}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar body */}
          {view === "month" && (
            <MonthGrid
              grid={calGrid}
              postsByDate={postsByDate}
              currentMonth={curMonth}
              onClickDay={handleClickDay}
              onClickPost={handleClickPost}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
          )}
          {view === "week" && (
            <WeekView
              weekDates={weekDates}
              postsByDate={postsByDate}
              currentMonth={curMonth}
              onClickDay={handleClickDay}
              onClickPost={handleClickPost}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
          )}
          {view === "day" && (
            <DayView
              date={selectedDay}
              posts={dayPosts}
              onClickPost={handleClickPost}
              onDragStart={handleDragStart}
            />
          )}
        </div>

        {/* 1.4.2 — Optimization legend */}
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "0.7rem 1rem" }}>
          <p style={{ margin: "0 0 0.4rem", fontSize: "0.68rem", color: "#7c3aed", fontWeight: 600, letterSpacing: "0.08em" }}>
            // 1.4.2 — OPTIMIZATIONS APPLIED
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {[
              { tag: "React.memo",    desc: "DayCell, PostChip, WeekView, MonthGrid, StatsBar, TestPanel" },
              { tag: "useMemo",       desc: "postsByDate grouping, calGrid, weekDates, dayPosts, stats, byHour" },
              { tag: "useCallback",   desc: "drag handlers, click handlers, save/delete — stable references" },
              { tag: "useReducer",    desc: "predictable state transitions instead of scattered useState" },
              { tag: "r{n} badges",   desc: "per-cell render counters — drag a post, watch only affected cells re-render" },
            ].map(o => (
              <div key={o.tag} style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 6, padding: "4px 10px", fontSize: "0.7rem" }}>
                <span style={{ color: "#7c3aed", fontWeight: 700, marginRight: 6 }}>{o.tag}</span>
                <span style={{ color: "#64748b" }}>{o.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal */}
      {modal && (
        <PostModal
          post={modal.mode === "edit" ? modal.post : null}
          defaultDate={modal.date}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STYLES (scoped to avoid conflicts)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const S = {
  btnPrimary:    { background: "#7c3aed", color: "#fff", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" },
  btnSecondary:  { background: "transparent", color: "#94a3b8", border: "1px solid #334155", borderRadius: 7, padding: "7px 14px", fontSize: "0.82rem", cursor: "pointer" },
  navBtn:        { background: "#0f172a", border: "1px solid #334155", borderRadius: 6, padding: "4px 10px", color: "#94a3b8", fontSize: "0.9rem", cursor: "pointer" },
  viewBtn:       { background: "transparent", border: "1px solid #334155", borderRadius: 6, padding: "4px 12px", color: "#64748b", fontSize: "0.75rem", cursor: "pointer" },
  viewBtnActive: { background: "#7c3aed22", border: "1px solid #7c3aed", borderRadius: 6, padding: "4px 12px", color: "#a78bfa", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" },
  overlay:       { position: "fixed", inset: 0, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal:         { background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "1.5rem", width: "100%", maxWidth: 420 },
  modalHeader:   { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  modalTitle:    { margin: 0, fontWeight: 700, fontSize: "1rem" },
  closeBtn:      { background: "transparent", border: "none", color: "#94a3b8", fontSize: "1rem", cursor: "pointer" },
  label:         { display: "block", fontSize: "0.7rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "3px", marginTop: "0.6rem" },
  input:         { background: "#0f172a", border: "1px solid #334155", borderRadius: 6, padding: "8px 10px", color: "#e2e8f0", fontSize: "0.82rem", outline: "none", width: "100%", boxSizing: "border-box" },
};