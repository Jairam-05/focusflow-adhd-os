import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlarmClock, ArrowRight, BarChart3, Bell, CalendarDays, Check, ChevronLeft, ChevronRight,
  CircleHelp, Clock3, Flame, FolderKanban, Goal, Heart, Home, Lightbulb, ListChecks,
  Menu, MessageCircleQuestion, Moon, Pause, Play, Plus, RotateCcw, Settings, Sparkles,
  Target, Timer, Trophy, X, Zap
} from 'lucide-react';
import './styles.css';

const uid = () => Math.random().toString(36).slice(2, 10);
const todayKey = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => d.toISOString().slice(0, 10);
const startOfWeek = (d) => { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); x.setHours(0,0,0,0); return x; };
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const seed = {
  mode: 'simple',
  energy: 'medium',
  values: ['Growth', 'Independence', 'Health'],
  daily: {},
  tasks: [
    { id: uid(), title: 'Solve 2 DP problems', priority: 'must', project: 'Interview Prep', estimate: 45, actual: 0, completed: false, due: todayKey() },
    { id: uid(), title: 'Revise SQL window functions', priority: 'should', project: 'Interview Prep', estimate: 30, actual: 0, completed: false, due: todayKey() },
    { id: uid(), title: 'Read one ML paper section', priority: 'could', project: 'ML Project', estimate: 25, actual: 0, completed: false, due: todayKey() }
  ],
  habits: [
    { id: uid(), name: '10 min reading', target: 5, color: 'violet', history: {} },
    { id: uid(), name: 'Move for 15 min', target: 4, color: 'green', history: {} },
    { id: uid(), name: 'Sleep before 12', target: 6, color: 'amber', history: {} }
  ],
  projects: [
    { id: uid(), name: 'Interview Prep', goalId: 'g1', color: 'violet' },
    { id: uid(), name: 'ML Project', goalId: 'g2', color: 'blue' }
  ],
  goals: [
    { id: 'g1', name: 'Land a software role', value: 'Independence' },
    { id: 'g2', name: 'Finish ML project', value: 'Growth' }
  ],
  events: [],
  sessions: [],
  points: 40,
  settings: { notifications: true, dailyReminder: '09:00', sound: true, reduceMotion: false }
};

function loadState() {
  try { return JSON.parse(localStorage.getItem('focusflow-state')) || seed; } catch { return seed; }
}
function saveState(s) { localStorage.setItem('focusflow-state', JSON.stringify(s)); }

function App() {
  const [state, setState] = useState(loadState);
  const [page, setPage] = useState('today');
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  useEffect(() => saveState(state), [state]);
  useEffect(() => {
    if (!state.settings.reduceMotion) document.documentElement.classList.remove('reduce-motion');
    else document.documentElement.classList.add('reduce-motion');
  }, [state.settings.reduceMotion]);
  useEffect(() => {
    const checkReminder = () => {
      if (!state.settings.notifications || !('Notification' in window) || Notification.permission !== 'granted') return;
      const now = new Date();
      const hhmm = now.toTimeString().slice(0,5);
      const key = `focusflow-reminded-${todayKey()}`;
      if (hhmm === state.settings.dailyReminder && localStorage.getItem(key) !== '1') {
        new Notification('FocusFlow', { body: 'Pick one highlight for today. Tiny is enough.' });
        localStorage.setItem(key, '1');
      }
    };
    checkReminder();
    const id = setInterval(checkReminder, 30000);
    return () => clearInterval(id);
  }, [state.settings.notifications, state.settings.dailyReminder]);
  const patch = (p) => setState(s => ({ ...s, ...p }));
  const addPoints = (n) => patch({ points: state.points + n });
  const toast = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 2200); };

  const todays = state.daily[todayKey()] || { brainDump: '', highlight: '', micro: '', highlightDone: false, microDone: false };
  const updateToday = (data) => patch({ daily: { ...state.daily, [todayKey()]: { ...todays, ...data } } });

  const nav = [
    ['today', 'Today', Home], ['tasks', 'Tasks', ListChecks], ['calendar', 'Calendar', CalendarDays],
    ['focus', 'Focus', Timer], ['habits', 'Habits', Zap], ['projects', 'Projects', FolderKanban],
    ['goals', 'Goals', Target], ['analytics', 'Insights', BarChart3], ['settings', 'Settings', Settings]
  ];
  const title = nav.find(x => x[0] === page)?.[1] || 'Today';

  return <div className="app-shell">
    <aside className={mobileNav ? 'sidebar mobile-open' : 'sidebar'}>
      <div className="brand"><div className="brand-mark"><Sparkles size={17}/></div><div><b>FocusFlow</b><small>ADHD OS</small></div></div>
      <div className="mode-card">
        <div className="mode-label"><span>{state.mode === 'simple' ? 'Simple Mode' : 'Advanced Mode'}</span><span className="pill">{state.mode === 'simple' ? 'LOW FRICTION' : 'FULL'}</span></div>
        <p>{state.mode === 'simple' ? 'Just the essentials. No guilt.' : 'Projects, planning and data are visible.'}</p>
        <button className="ghost-btn full" onClick={() => patch({ mode: state.mode === 'simple' ? 'advanced' : 'simple' })}>{state.mode === 'simple' ? 'Switch to Advanced' : 'Drop to Simple'}</button>
      </div>
      <nav>{nav.map(([id, label, Icon]) => <button key={id} className={page===id?'nav-item active':'nav-item'} onClick={() => {setPage(id);setMobileNav(false)}}><Icon size={18}/><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><div className="streak"><Flame size={16}/><div><b>{currentStreak(state)} day streak</b><small>Keep the promise small.</small></div></div><div className="xp"><span>XP</span><b>{state.points}</b><div className="xp-bar"><i style={{width:`${state.points%100}%`}}/></div></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="header-left"><button className="mobile-menu" onClick={()=>setMobileNav(v=>!v)}><Menu size={20}/></button><div><div className="eyebrow">{new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</div><h1>{title}</h1></div></div><div className="top-actions"><button className="icon-btn" title="Notifications" onClick={() => requestNotifications(state, toast)}><Bell size={18}/></button><div className="energy"><span>Energy</span><select value={state.energy} onChange={e=>patch({energy:e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div></div></header>
      {page==='today' && <Today state={state} todays={todays} updateToday={updateToday} patch={patch} addPoints={addPoints} setPage={setPage} toast={toast}/>} 
      {page==='tasks' && <Tasks state={state} patch={patch} addPoints={addPoints} toast={toast}/>} 
      {page==='calendar' && <Calendar state={state} patch={patch} toast={toast}/>} 
      {page==='focus' && <Focus state={state} patch={patch} toast={toast}/>} 
      {page==='habits' && <Habits state={state} patch={patch} addPoints={addPoints}/>} 
      {page==='projects' && <Projects state={state} patch={patch}/>} 
      {page==='goals' && <Goals state={state} patch={patch}/>} 
      {page==='analytics' && <Analytics state={state} />} 
      {page==='settings' && <SettingsPage state={state} patch={patch} toast={toast}/>} 
    </main>
    {notice && <div className="toast"><Check size={16}/>{notice}</div>}
  </div>
}

function Today({state,todays,updateToday,patch,addPoints,setPage,toast}) {
  const must = state.tasks.filter(t => !t.completed && t.priority==='must');
  const should = state.tasks.filter(t => !t.completed && t.priority==='should');
  const could = state.tasks.filter(t => !t.completed && t.priority==='could');
  const done = state.tasks.filter(t => t.completed).length;
  const total = state.tasks.length;
  const toggle = (field, reward=5) => { const next = !todays[field]; updateToday({[field]:next}); if(next) addPoints(reward); };
  return <div className="content stack">
    <div className="welcome"><div><span className="kicker">A calmer way to get moving</span><h2>{state.energy==='low'?'Low energy is still a day.':'One useful thing is enough.'}</h2><p>Don't optimize your life today. Just make the next action obvious.</p></div><div className="welcome-actions"><button className="primary" onClick={()=>setPage('focus')}><Play size={16}/> Start focus</button><button className="soft" onClick={()=>setPage('tasks')}><Plus size={16}/> Add task</button></div></div>
    {state.mode==='simple' ? <>
      <section className="hero-grid">
        <Card title="Brain dump" icon={<Lightbulb size={18}/>} action="Clear" onAction={()=>updateToday({brainDump:''})}>
          <textarea className="brain-dump" value={todays.brainDump} onChange={e=>updateToday({brainDump:e.target.value})} placeholder="Everything noisy in your head goes here. No sorting required…"/>
          <div className="hint">Get it out first. Organize later.</div>
        </Card>
        <Card title="Today's highlight" icon={<Heart size={18}/>} badge="ONE THING">
          <input className="big-input" value={todays.highlight} onChange={e=>updateToday({highlight:e.target.value})} placeholder="The one thing that would make today feel successful"/>
          <button className={todays.highlightDone?'done-row selected':'done-row'} onClick={()=>toggle('highlightDone',10)}><span className="checkbox">{todays.highlightDone && <Check size={14}/>}</span><span>{todays.highlightDone?'Done — you showed up.':'Mark highlight complete'}</span></button>
        </Card>
        <Card title="Micro-commitment" icon={<Zap size={18}/>} badge="~2 MIN">
          <input className="big-input" value={todays.micro} onChange={e=>updateToday({micro:e.target.value})} placeholder="Make the habit tiny: open the book, write one line…"/>
          <button className={todays.microDone?'done-row selected':'done-row'} onClick={()=>toggle('microDone',5)}><span className="checkbox">{todays.microDone && <Check size={14}/>}</span><span>{todays.microDone?'Done — momentum counts.':'Mark micro-commitment complete'}</span></button>
        </Card>
      </section>
      <section className="quote-card"><div className="quote-icon"><Sparkles size={18}/></div><div><b>Feeling stuck?</b><p>Pick the smallest possible next action. You do not need to feel ready before you begin.</p></div><button className="soft" onClick={()=>setPage('focus')}>Help me start <ArrowRight size={15}/></button></section>
    </> : <>
      <section className="dashboard-grid">
        <div className="panel highlight-panel"><div className="panel-title"><span>⭐ Today's highlight</span><span className="tiny-muted">{todays.highlightDone?'complete':'one thing'}</span></div><input className="big-input" value={todays.highlight} onChange={e=>updateToday({highlight:e.target.value})} placeholder="The one thing that matters most today"/><button className={todays.highlightDone?'primary full':'soft full'} onClick={()=>toggle('highlightDone',10)}>{todays.highlightDone?'Completed':'Complete highlight'}</button></div>
        <div className="panel"><div className="panel-title"><span>Progress</span><span>{total?Math.round(done/total*100):0}%</span></div><div className="progress-large"><i style={{width:`${total?done/total*100:0}%`}}/></div><div className="stat-row"><span>{done} completed</span><span>{total-done} open</span></div><button className="soft full" onClick={()=>setPage('analytics')}>View week</button></div>
      </section>
      <section className="three-col"><Priority title="MUST" tone="must" items={must}/><Priority title="SHOULD" tone="should" items={should}/><Priority title="COULD" tone="could" items={could}/></section>
      <section className="split"><Card title="Brain dump" icon={<Lightbulb size={18}/>}><textarea className="brain-dump" value={todays.brainDump} onChange={e=>updateToday({brainDump:e.target.value})} placeholder="Dump thoughts, then turn the useful ones into tasks."/></Card><Card title="Quick focus" icon={<Timer size={18}/>}><div className="focus-callout"><div className="timer-mini">25:00</div><p>Pomodoro or flexible sprint — choose what your brain needs.</p><button className="primary" onClick={()=>setPage('focus')}>Open focus room</button></div></Card></section>
    </>}
    <section className="today-bottom"><div className="mini-stat"><span>Tasks</span><b>{done}/{total}</b></div><div className="mini-stat"><span>Highlight</span><b>{todays.highlightDone?'✓':'—'}</b></div><div className="mini-stat"><span>Micro</span><b>{todays.microDone?'✓':'—'}</b></div><div className="mini-stat"><span>Energy</span><b>{state.energy}</b></div></section>
  </div>
}

function Card({title,icon,badge,action,onAction,children}) { return <div className="card"><div className="card-head"><div className="card-title"><span className="icon-wrap">{icon}</span><b>{title}</b>{badge&&<span className="pill subtle">{badge}</span>}</div>{action&&<button className="link-btn" onClick={onAction}>{action}</button>}</div>{children}</div> }
function Priority({title,tone,items}) { return <div className="panel priority"><div className="panel-title"><span className={`priority-label ${tone}`}>{title}</span><span className="tiny-muted">{items.length}</span></div>{items.length?items.slice(0,4).map(t=><div className="task-line" key={t.id}><span className="dot"></span><span>{t.title}</span></div>):<div className="empty-mini">Nothing here. Nice.</div>}</div>}

function Tasks({state,patch,addPoints,toast}) {
  const [filter,setFilter]=useState('all'); const [q,setQ]=useState(''); const [draft,setDraft]=useState('');
  const list=state.tasks.filter(t => (filter==='all'||t.priority===filter) && t.title.toLowerCase().includes(q.toLowerCase()));
  const add=()=>{ if(!draft.trim()) return; patch({tasks:[...state.tasks,{id:uid(),title:draft.trim(),priority:'should',project:'',estimate:25,actual:0,completed:false,due:todayKey()}]});setDraft('');toast('Task added'); };
  const toggle=id=>{ const t=state.tasks.find(x=>x.id===id); patch({tasks:state.tasks.map(x=>x.id===id?{...x,completed:!x.completed,actual:x.completed?x.actual:(x.actual||x.estimate)}:x)}); if(!t.completed)addPoints(8); };
  const remove=id=>patch({tasks:state.tasks.filter(x=>x.id!==id)});
  return <div className="content stack"><section className="toolbar"><div className="search"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tasks…"/></div><div className="segmented">{['all','must','should','could'].map(x=><button className={filter===x?'selected':''} key={x} onClick={()=>setFilter(x)}>{x[0].toUpperCase()+x.slice(1)}</button>)}</div></section>
    <section className="add-task"><input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Add a task. Keep the wording concrete."/><button className="primary" onClick={add}><Plus size={16}/> Add</button></section>
    <section className="task-table panel"><div className="table-head"><span>Task</span><span>Priority</span><span>Project</span><span>Time</span><span></span></div>{list.map(t=><div className="table-row" key={t.id}><button className={t.completed?'checkbox checked':'checkbox'} onClick={()=>toggle(t.id)}>{t.completed&&<Check size={14}/>}</button><span className={t.completed?'strike':''}>{t.title}</span><select value={t.priority} onChange={e=>patch({tasks:state.tasks.map(x=>x.id===t.id?{...x,priority:e.target.value}:x)})}><option value="must">Must</option><option value="should">Should</option><option value="could">Could</option></select><span className="muted">{t.project||'—'}</span><span className="muted">{t.estimate}m / {t.actual||0}m</span><button className="icon-btn" onClick={()=>remove(t.id)}><X size={15}/></button></div>)}{!list.length&&<div className="empty-state">No tasks here. A clean slate is allowed.</div>}</section>
    <div className="insight-note"><Clock3 size={16}/><span><b>Reality check:</b> after a task is completed, compare actual time to your estimate. Better planning starts with honest data.</span></div>
  </div>
}

function Calendar({state,patch,toast}) {
  const [date,setDate]=useState(new Date()); const [draft,setDraft]=useState({title:'',date:todayKey(),time:'10:00'});
  const y=date.getFullYear(), m=date.getMonth(); const first=new Date(y,m,1); const days=new Date(y,m+1,0).getDate(); const offset=(first.getDay()+6)%7;
  const cells=[...Array(offset).fill(null),...Array.from({length:days},(_,i)=>new Date(y,m,i+1))];
  const add=()=>{if(!draft.title.trim())return;patch({events:[...state.events,{id:uid(),...draft,title:draft.title.trim()}]});setDraft({...draft,title:''});toast('Calendar event added');};
  return <div className="content stack"><section className="calendar-head"><div><span className="kicker">Time blocking without time pressure</span><h2>{date.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</h2></div><div className="cal-nav"><button className="icon-btn" onClick={()=>setDate(new Date(y,m-1,1))}><ChevronLeft size={18}/></button><button className="soft" onClick={()=>setDate(new Date())}>Today</button><button className="icon-btn" onClick={()=>setDate(new Date(y,m+1,1))}><ChevronRight size={18}/></button></div></section>
    <section className="calendar-grid panel">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><div className="cal-dow" key={d}>{d}</div>)}{cells.map((d,i)=>{const key=d?fmtDate(d):`blank-${i}`;const ev=d?state.events.filter(e=>e.date===fmtDate(d)):[];return <div className={d&&fmtDate(d)===todayKey()?'cal-cell today-cell':'cal-cell'} key={key}>{d&&<><div className="cal-date">{d.getDate()}</div>{ev.map(e=><div className="event-chip" key={e.id}>{e.time} · {e.title}</div>)}<button className="cal-plus" onClick={()=>d&&setDraft({...draft,date:fmtDate(d)})}><Plus size={12}/></button></>}</div>})}</section>
    <section className="split"><Card title="Schedule something" icon={<CalendarDays size={18}/>}><div className="form-grid"><input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="Event / study block / appointment"/><input type="date" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})}/><input type="time" value={draft.time} onChange={e=>setDraft({...draft,time:e.target.value})}/><button className="primary" onClick={add}><Plus size={16}/> Add to calendar</button></div></Card><Card title="Upcoming" icon={<Clock3 size={18}/>}><div className="upcoming-list">{state.events.filter(e=>e.date>=todayKey()).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,6).map(e=><div className="upcoming" key={e.id}><b>{e.title}</b><span>{e.date} · {e.time}</span></div>)}{!state.events.length&&<div className="empty-mini">Nothing scheduled yet.</div>}</div></Card></section>
  </div>
}

function Focus({state,patch,toast}) {
  const [type,setType]=useState('pomodoro'); const [running,setRunning]=useState(false); const [mode,setMode]=useState('focus'); const [seconds,setSeconds]=useState(1500); const started=useRef(null);
  useEffect(()=>{ if(!running)return; const id=setInterval(()=>setSeconds(s=>{if(s<=1){setRunning(false);toast(type==='pomodoro'?(mode==='focus'?'Focus block complete — take a break.':'Break complete — back to it.'):'Sprint ended');return 0;}return s-1}),1000);return()=>clearInterval(id)},[running,toast,type,mode]);
  const presets=type==='pomodoro'?(mode==='focus'?[1500,2700,3600]:[300,600,900]):[900,1800,2700];
  useEffect(()=>{ if(!running) setSeconds(presets[0])},[type,mode]);
  const start=()=>{if(seconds===0)setSeconds(presets[0]);setRunning(true);started.current=Date.now();};
  const stop=()=>{setRunning(false); if(started.current){const mins=Math.max(1,Math.round((Date.now()-started.current)/60000));patch({sessions:[...state.sessions,{id:uid(),date:todayKey(),type,minutes:mins,mode}]});started.current=null;toast(`${mins} min logged`);}};
  const mm=String(Math.floor(seconds/60)).padStart(2,'0'), ss=String(seconds%60).padStart(2,'0');
  return <div className="content stack"><section className="focus-layout"><div className="focus-card panel"><div className="mode-tabs"><button className={type==='pomodoro'?'selected':''} onClick={()=>{setType('pomodoro');setMode('focus');}}>Pomodoro</button><button className={type==='sprint'?'selected':''} onClick={()=>{setType('sprint');setMode('focus');setSeconds(0);}}>Flexible Sprint</button></div>{type==='pomodoro'&&<div className="mode-tabs slim"><button className={mode==='focus'?'selected':''} onClick={()=>{setMode('focus');setSeconds(1500)}}>Focus</button><button className={mode==='break'?'selected':''} onClick={()=>{setMode('break');setSeconds(300)}}>Break</button></div>}<div className="timer-wrap"><div className="timer-ring"><div><small>{type==='pomodoro'?(mode==='focus'?'FOCUS':'BREAK'):'FLOW'}</small><b>{mm}:{ss}</b><span>{running?'in progress':'ready when you are'}</span></div></div></div><div className="timer-actions">{running?<button className="soft" onClick={()=>setRunning(false)}><Pause size={18}/> Pause</button>:<button className="primary" onClick={start}><Play size={18}/> Start</button>}<button className="icon-btn" onClick={()=>{setRunning(false);setSeconds(presets[0]);}}><RotateCcw size={18}/></button>{running&&<button className="soft" onClick={stop}>Finish & log</button>}</div><div className="timer-options">{type==='pomodoro'?<div className="preset-row">{[25,45,60].map(v=><button key={v} className={Math.floor(seconds/60)===v?'selected':''} onClick={()=>setSeconds(v*60)}>{v} min</button>)}</div>:<p className="muted">No finish line. Stay in flow while you're focused; stop when your energy changes.</p>}</div></div>
    <div className="focus-side"><Card title="Energy match" icon={<Zap size={18}/>}><div className="energy-option-list">{[['low','Low','Admin, review, cleanup'],['medium','Medium','Normal study & coding'],['high','High','Hard problems & deep work']].map(([k,l,d])=><button key={k} className={state.energy===k?'energy-option selected':'energy-option'} onClick={()=>patch({energy:k})}><span>{l}</span><small>{d}</small></button>)}</div></Card><Card title="Focus history" icon={<Clock3 size={18}/>}><div className="session-total"><b>{state.sessions.reduce((a,s)=>a+s.minutes,0)} min</b><span>logged all-time</span></div><div className="session-list">{state.sessions.slice(-5).reverse().map(s=><div key={s.id}><span>{s.type==='pomodoro'?'Pomodoro':'Sprint'}</span><b>{s.minutes}m</b></div>)}</div></Card></div></section></div>
}

function Habits({state,patch,addPoints}) {
  const [draft,setDraft]=useState('');
  const add=()=>{if(!draft.trim())return;patch({habits:[...state.habits,{id:uid(),name:draft.trim(),target:5,history:{}}]});setDraft('');};
  const toggle=(h)=>{const key=todayKey();const next={...(h.history||{})};next[key]=!next[key];patch({habits:state.habits.map(x=>x.id===h.id?{...x,history:next}:x)});if(next[key])addPoints(4)};
  const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return fmtDate(d)});
  return <div className="content stack"><div className="section-intro"><div><span className="kicker">Consistency without perfection</span><h2>Build habits with less friction.</h2><p>Missed days are data, not failure. Come back without resetting your identity.</p></div><div className="add-inline"><input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="New habit"/><button className="primary" onClick={add}><Plus size={15}/></button></div></div><section className="habit-grid">{state.habits.map(h=><div className="habit-card panel" key={h.id}><div className="habit-head"><div><b>{h.name}</b><span>{countHabit(h)} this week · target {h.target}</span></div><div className="habit-streak"><Flame size={14}/>{habitStreak(h)}</div></div><div className="habit-week">{last7.map(k=><button key={k} className={h.history?.[k]?'habit-day done':''} onClick={()=>toggle(h)} title={k}>{new Date(k).toLocaleDateString(undefined,{weekday:'narrow'})}</button>)}</div><div className="progress-small"><i style={{width:`${clamp(countHabit(h)/h.target*100,0,100)}%`}}/></div><div className="habit-actions"><button className={h.history?.[todayKey()]?'primary full':'soft full'} onClick={()=>toggle(h)}>{h.history?.[todayKey()]?'Done today':'Complete today'}</button></div></div>)}</section></div>
}
function countHabit(h){const wk=startOfWeek(new Date());return Object.entries(h.history||{}).filter(([k,v])=>v&&new Date(k)>=wk).length}
function habitStreak(h){let n=0;let d=new Date();while(h.history?.[fmtDate(d)]){n++;d.setDate(d.getDate()-1)}return n}
function currentStreak(state){let n=0,d=new Date();while(true){const k=fmtDate(d);const x=state.daily[k];if(!x||(!x.highlightDone&&!x.microDone))break;n++;d.setDate(d.getDate()-1)}return n}

function Projects({state,patch}){const [draft,setDraft]=useState('');const add=()=>{if(!draft.trim())return;patch({projects:[...state.projects,{id:uid(),name:draft.trim(),goalId:state.goals[0]?.id||'',color:'blue'}]});setDraft('')};const progress=p=>{const ids=state.tasks.filter(t=>t.project===p.name);return ids.length?Math.round(ids.filter(t=>t.completed).length/ids.length*100):0};return <div className="content stack"><div className="section-intro"><div><span className="kicker">Work that rolls up</span><h2>Projects</h2><p>Daily tasks become visible progress instead of an endless list.</p></div><div className="add-inline"><input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="New project"/><button className="primary" onClick={add}><Plus size={15}/></button></div></div><section className="project-grid">{state.projects.map(p=><div className="project-card panel" key={p.id}><div className="project-head"><div className="project-icon"><FolderKanban size={18}/></div><div><b>{p.name}</b><span>{state.goals.find(g=>g.id===p.goalId)?.name||'No goal linked'}</span></div></div><div className="project-progress"><div><span>Progress</span><b>{progress(p)}%</b></div><div className="progress-large"><i style={{width:`${progress(p)}%`}}/></div></div><div className="project-tasks">{state.tasks.filter(t=>t.project===p.name).slice(0,3).map(t=><div key={t.id}><span className={t.completed?'checkbox checked':'checkbox'}>{t.completed&&<Check size={12}/>}</span><span>{t.title}</span></div>)}</div></div>)}</section></div>}

function Goals({state,patch}){const [draft,setDraft]=useState('');const add=()=>{if(!draft.trim())return;patch({goals:[...state.goals,{id:uid(),name:draft.trim(),value:state.values[0]||'Growth'}]});setDraft('')};return <div className="content stack"><div className="section-intro"><div><span className="kicker">Why behind the what</span><h2>Goals & values</h2><p>Connect projects to something you actually care about.</p></div><div className="add-inline"><input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="New goal"/><button className="primary" onClick={add}><Plus size={15}/></button></div></div><section className="value-strip">{state.values.map(v=><span key={v}><Heart size={14}/> {v}</span>)}</section><section className="goal-grid">{state.goals.map(g=>{const ps=state.projects.filter(p=>p.goalId===g.id);const tasks=state.tasks.filter(t=>ps.some(p=>p.name===t.project));const pct=tasks.length?Math.round(tasks.filter(t=>t.completed).length/tasks.length*100):0;return <div className="goal-card panel" key={g.id}><div className="goal-top"><div className="goal-icon"><Goal size={18}/></div><div><b>{g.name}</b><span>Value: {g.value}</span></div></div><div className="goal-pct">{pct}%</div><div className="progress-large"><i style={{width:`${pct}%`}}/></div><div className="goal-meta"><span>{ps.length} project{ps.length!==1?'s':''}</span><span>{tasks.filter(t=>t.completed).length}/{tasks.length} tasks</span></div></div>})}</section></div>}

function Analytics({state}){const week=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);week.push(fmtDate(d))};const high=week.filter(k=>state.daily[k]?.highlightDone).length,micro=week.filter(k=>state.daily[k]?.microDone).length;const mins=state.sessions.filter(s=>week.includes(s.date)).reduce((a,s)=>a+s.minutes,0);const must=state.tasks.filter(t=>t.priority==='must').reduce((a,t)=>a+(t.actual||0),0);const should=state.tasks.filter(t=>t.priority==='should').reduce((a,t)=>a+(t.actual||0),0);const could=state.tasks.filter(t=>t.priority==='could').reduce((a,t)=>a+(t.actual||0),0);const urgent=(must+should+could)?Math.round((must/(must+should+could))*100):0;return <div className="content stack"><div className="section-intro"><div><span className="kicker">Weekly review</span><h2>Your week, without the guilt.</h2><p>Use patterns to make next week easier — not to judge this one.</p></div><div className="review-badge"><Trophy size={17}/><b>{high}/7</b><span>highlights</span></div></div><section className="metrics"><div className="metric"><span>Highlights</span><b>{high}/7</b><small>{high>=5?'Nice consistency.':'One day is enough to restart.'}</small></div><div className="metric"><span>Micro-commitments</span><b>{micro}/7</b><small>{micro>=5?'Tiny actions are adding up.':'Shrink the next action.'}</small></div><div className="metric"><span>Focus logged</span><b>{mins}m</b><small>{mins?'You showed up.':'Start with 10 minutes.'}</small></div><div className="metric"><span>Must-task share</span><b>{urgent}%</b><small>{urgent>60?'Too much urgency? Protect important work.':'Healthy enough. Keep watching.'}</small></div></section><section className="analytics-grid"><div className="panel chart-card"><div className="panel-title"><span>7-day momentum</span></div><div className="bar-chart">{week.map(k=><div className="bar-col" key={k}><div className="bar"><i style={{height:`${(state.daily[k]?.highlightDone?100:10)+(state.daily[k]?.microDone?0:0)}%`}}/></div><small>{new Date(k).toLocaleDateString(undefined,{weekday:'narrow'})}</small></div>)}</div></div><div className="panel"><div className="panel-title"><span>Time reality</span></div><div className="time-breakdown"><Row label="Must" value={must} max={Math.max(must,should,could,1)}/><Row label="Should" value={should} max={Math.max(must,should,could,1)}/><Row label="Could" value={could} max={Math.max(must,should,could,1)}/></div><div className="insight-note compact"><MessageCircleQuestion size={16}/><span>{urgent>60?'A lot of your tracked time is landing on urgent tasks. Try scheduling one goal task before the urgent queue grows.':'Your urgency mix looks reasonable. Protect the time you spend on meaningful projects.'}</span></div></div></section></div>}
function Row({label,value,max}){return <div className="break-row"><div><span>{label}</span><b>{value}m</b></div><div className="progress-small"><i style={{width:`${value/max*100}%`}}/></div></div>}

function SettingsPage({state,patch,toast}){const enable=()=>requestNotifications(state,toast);return <div className="content stack"><div className="section-intro"><div><span className="kicker">Make the system fit you</span><h2>Settings</h2><p>Notifications are intentionally gentle and browser-based in this version.</p></div></div><section className="settings-grid"><div className="panel settings-card"><div className="setting-row"><div><b>Browser notifications</b><span>Pomodoro, reminders, and gentle nudges.</span></div><button className="soft" onClick={enable}>Enable</button></div><div className="setting-row"><div><b>Daily reminder</b><span>When should the app remind you to pick your highlight?</span></div><input type="time" value={state.settings.dailyReminder} onChange={e=>patch({settings:{...state.settings,dailyReminder:e.target.value}})}/></div><div className="setting-row"><div><b>Sound cues</b><span>Play a small cue when a timer ends.</span></div><input type="checkbox" checked={state.settings.sound} onChange={e=>patch({settings:{...state.settings,sound:e.target.checked}})}/></div><div className="setting-row"><div><b>Reduce motion</b><span>Use calmer animations.</span></div><input type="checkbox" checked={state.settings.reduceMotion} onChange={e=>patch({settings:{...state.settings,reduceMotion:e.target.checked}})}/></div></div><div className="panel philosophy"><div className="panel-title"><span><Sparkles size={16}/> Design principles</span></div>{[['Energy > time','Choose work that fits your current battery.'],['Small is successful','A two-minute action is still progress.'],['Allow mistakes','Missing a day never deletes your progress.'],['Anti-clutter','The app should disappear into the background.']].map(([a,b])=><div className="principle" key={a}><b>{a}</b><span>{b}</span></div>)}</div></section><section className="danger panel"><div><b>Reset demo data</b><span>Useful if you want a completely blank workspace before deploying.</span></div><button className="soft" onClick={()=>{localStorage.removeItem('focusflow-state');location.reload()}}>Reset</button></section></div>}

function requestNotifications(state,toast){if(!('Notification' in window)){toast('Browser notifications are not supported here');return;}Notification.requestPermission().then(p=>toast(p==='granted'?'Notifications enabled':'Notifications not enabled'));}

createRoot(document.getElementById('root')).render(<App/>);
