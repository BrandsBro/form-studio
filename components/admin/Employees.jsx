"use client";

function ConfirmModal({ title, message, confirmLabel="Delete", confirmColor="#ef4444", icon="🗑️", onConfirm, onClose }) {
  useEffect(() => {
    const h = e => e.key==="Escape"&&onClose();
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)"}}/>
      <div style={{position:"relative",width:"min(400px,100%)",background:"linear-gradient(180deg,#12181F,#0D1117)",border:"1px solid #21262D",borderRadius:20,overflow:"hidden",boxShadow:"0 32px 100px rgba(0,0,0,0.7)"}}>
        <div style={{height:3,background:"linear-gradient(90deg,"+confirmColor+","+confirmColor+"44,transparent)"}}/>
        <div style={{padding:"28px 28px 20px",textAlign:"center"}}>
          <div style={{width:52,height:52,borderRadius:14,background:confirmColor+"15",border:"1px solid "+confirmColor+"33",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:24}}>{icon}</div>
          <h3 style={{color:"white",fontWeight:700,margin:"0 0 8px",fontSize:17}}>{title}</h3>
          <p style={{color:"#6b7280",fontSize:13,margin:0,lineHeight:1.6}}>{message}</p>
        </div>
        <div style={{padding:"0 24px 24px",display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"11px 0",borderRadius:10,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:13,cursor:"pointer",transition:"all 0.2s"}}
            onMouseOver={e=>{e.currentTarget.style.background="#161B22";e.currentTarget.style.color="white";}}
            onMouseOut={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#6b7280";}}>Cancel</button>
          <button onClick={()=>{onConfirm();onClose();}} style={{flex:1,padding:"11px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,"+confirmColor+"cc,"+confirmColor+")",color:"white",fontSize:13,fontWeight:700,cursor:"pointer",transition:"opacity 0.2s"}}
            onMouseOver={e=>e.currentTarget.style.opacity="0.85"} onMouseOut={e=>e.currentTarget.style.opacity="1"}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}


import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, Mail, Building, Shield, ArrowLeft, Award, TrendingUp, Users } from "lucide-react";
import { ROLES, LEADER_ROLES } from "@/lib/roles";

const MOCK_SUBMISSIONS = [
  { id:1, submittedAt:"2026-05-14", name:"Alice Johnson",  leaderName:"Bob Smith",  q1:5,q2:4,q3:4,q4:5,q5:4,q6:3,q7:5,q8:4,q9:4,q10:5, comments:"Great communicator." },
  { id:2, submittedAt:"2026-05-14", name:"Carlos Mendez",  leaderName:"Bob Smith",  q1:3,q2:4,q3:3,q4:4,q5:3,q6:4,q7:3,q8:3,q9:4,q10:3, comments:"Could improve feedback." },
  { id:3, submittedAt:"2026-05-13", name:"Diana Lee",      leaderName:"Sarah Chen", q1:5,q2:5,q3:5,q4:5,q5:5,q6:5,q7:5,q8:5,q9:5,q10:5, comments:"Exceptional leader!" },
  { id:4, submittedAt:"2026-05-13", name:"Ethan Brown",    leaderName:"Sarah Chen", q1:4,q2:3,q3:4,q4:3,q5:4,q6:4,q7:4,q8:3,q9:3,q10:4, comments:"" },
  { id:5, submittedAt:"2026-05-12", name:"Fiona Kim",      leaderName:"Bob Smith",  q1:2,q2:3,q3:2,q4:3,q5:2,q6:3,q7:2,q8:2,q9:3,q10:2, comments:"Needs more support." },
  { id:6, submittedAt:"2026-05-12", name:"George Tan",     leaderName:"Sarah Chen", q1:4,q2:4,q3:5,q4:4,q5:5,q6:4,q7:4,q8:5,q9:4,q10:4, comments:"Very supportive." },
];

const RATING_KEYS = ["q1","q2","q3","q4","q5","q6","q7","q8","q9","q10"];
const Q_SHORT = ["Communication","Support & Guidance","Feedback","Approachability","Motivation","Problem Solving","Fairness","Recognition","Empowerment","Growth Support"];
const DEPARTMENTS = ["Engineering","Design","Marketing","Sales","HR","Finance","Operations","Product","Legal","Executive"];

const DEFAULT_EMPLOYEES = [
  { id:"e1", name:"Bob Smith",    email:"bob@company.com",   department:"Engineering", role:"Manager", leaderName:"",         photoUrl:"", joinDate:"2022-03-01", employeeId:"EMP001" },
  { id:"e2", name:"Sarah Chen",   email:"sarah@company.com", department:"Design",      role:"Manager", leaderName:"",         photoUrl:"", joinDate:"2021-07-15", employeeId:"EMP002" },
  { id:"e3", name:"Alice Johnson",email:"alice@company.com", department:"Engineering", role:"Team Member", leaderName:"Bob Smith",  photoUrl:"", joinDate:"2023-01-10", employeeId:"EMP003" },
  { id:"e4", name:"Carlos Mendez",email:"carlos@company.com",department:"Engineering", role:"Team Member", leaderName:"Bob Smith",  photoUrl:"", joinDate:"2023-06-01", employeeId:"EMP004" },
  { id:"e5", name:"Diana Lee",    email:"diana@company.com", department:"Design",      role:"Team Member", leaderName:"Sarah Chen", photoUrl:"", joinDate:"2022-11-20", employeeId:"EMP005" },
];

const EMPTY = { id:"", name:"", email:"", department:"", role:"", leaderName:"", photoUrl:"", joinDate:"", employeeId:"" };

function getInitials(name="") { return name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)||"?"; }
function getAvatarColor(name="") {
  const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316","#84CC16"];
  return c[(name.charCodeAt(0)||0)%c.length];
}

function Avatar({ emp, size=42 }) {
  const color = getAvatarColor(emp.name);
  if (emp.photoUrl) return <img src={emp.photoUrl} alt={emp.name} style={{ width:size,height:size,borderRadius:"50%",objectFit:"cover",border:`2px solid ${color}44`,flexShrink:0 }}/>;
  return (
    <div style={{ width:size,height:size,borderRadius:"50%",background:`${color}18`,border:`2px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.34,fontWeight:700,color,flexShrink:0 }}>
      {getInitials(emp.name)}
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = score>=4?"#22c55e":score>=3?"#F59E0B":"#ef4444";
  return <span style={{ fontSize:11,fontWeight:700,color,background:`${color}18`,padding:"2px 8px",borderRadius:999 }}>{score.toFixed(1)}/5</span>;
}

function EmployeeProfile({ emp, onBack, employees }) {
  const color = getAvatarColor(emp.name);
  const reviews = MOCK_SUBMISSIONS.filter(s=>s.leaderName===emp.name);
  const submitted = MOCK_SUBMISSIONS.filter(s=>s.name===emp.name);
  const isLeader = reviews.length > 0;
  const teamMembers = employees.filter(e=>e.leaderName===emp.name);

  const avgPerQ = RATING_KEYS.map((k,i)=>{
    const vals = reviews.map(s=>s[k]).filter(Boolean);
    const avg = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
    return { label:Q_SHORT[i], avg };
  });

  const overallAvg = isLeader && reviews.length
    ? avgPerQ.reduce((a,q)=>a+q.avg,0)/avgPerQ.length : 0;

  const gc = v => v>=4?"#22c55e":v>=3?"#F59E0B":"#ef4444";

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <button onClick={onBack} style={{ display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:13,padding:0,width:"fit-content" }}
        onMouseOver={e=>e.currentTarget.style.color="#F59E0B"}
        onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>
        ← Back to Employees
      </button>

      <div style={{ background:"#161B22",border:"1px solid #21262D",borderRadius:14,padding:24,display:"flex",alignItems:"flex-start",gap:20,flexWrap:"wrap" }}>
        <Avatar emp={emp} size={72}/>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:4 }}>
            <h2 style={{ color:"white",fontSize:20,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)" }}>{emp.name}</h2>
            <span style={{ fontSize:11,color,background:`${color}18`,border:`1px solid ${color}33`,padding:"2px 10px",borderRadius:999 }}>{emp.role}</span>
          </div>
          <div style={{ display:"flex",gap:16,flexWrap:"wrap",marginTop:8 }}>
            {[
              { text:emp.email },
              { text:emp.department },
              { text:emp.employeeId },
              emp.leaderName && { text:"Reports to: "+emp.leaderName },
            ].filter(Boolean).map((item,i)=>(
              <span key={i} style={{ fontSize:12,color:"#9ca3af" }}>{item.text}</span>
            ))}
          </div>
          {emp.joinDate && <p style={{ color:"#4b5563",fontSize:11,margin:"8px 0 0" }}>Joined {new Date(emp.joinDate).toLocaleDateString("en-US",{month:"long",year:"numeric"})}</p>}
        </div>
        {isLeader && overallAvg>0 && (
          <div style={{ textAlign:"center",background:"#0D1117",border:"1px solid #21262D",borderRadius:12,padding:"16px 24px" }}>
            <p style={{ fontSize:11,color:"#6b7280",margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"0.06em" }}>Avg Score</p>
            <p style={{ fontSize:32,fontWeight:800,color:gc(overallAvg),margin:0 }}>{overallAvg.toFixed(2)}</p>
            <p style={{ fontSize:11,color:"#4b5563",margin:"2px 0 0" }}>out of 5.00</p>
          </div>
        )}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12 }}>
        {[
          { label:"Reviews Received",  value:reviews.length,      color:"#F59E0B" },
          { label:"Reviews Submitted", value:submitted.length,     color:"#3B82F6" },
          { label:"Team Members",      value:teamMembers.length,   color:"#10B981" },
        ].map(card=>(
          <div key={card.label} style={{ background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:16 }}>
            <p style={{ color:card.color,fontSize:22,fontWeight:700,margin:0 }}>{card.value}</p>
            <p style={{ color:"#6b7280",fontSize:11,margin:"3px 0 0" }}>{card.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16 }}>
        {isLeader && (
          <div style={{ background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:20 }}>
            <h3 style={{ color:"white",fontSize:14,fontWeight:600,margin:"0 0 16px" }}>Score Breakdown</h3>
            {avgPerQ.map(({label,avg})=>(
              <div key={label} style={{ marginBottom:12 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                  <span style={{ fontSize:12,color:"#9ca3af" }}>{label}</span>
                  <span style={{ fontSize:12,fontWeight:600,color:gc(avg) }}>{avg.toFixed(2)}</span>
                </div>
                <div style={{ height:6,background:"#21262D",borderRadius:999,overflow:"hidden" }}>
                  <div style={{ height:"100%",borderRadius:999,background:gc(avg),width:(avg/5*100)+"%" }}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLeader && reviews.length>0 && (
          <div style={{ background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:20 }}>
            <h3 style={{ color:"white",fontSize:14,fontWeight:600,margin:"0 0 16px" }}>Reviews Received ({reviews.length})</h3>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {reviews.map(r=>{
                const avg=(RATING_KEYS.reduce((a,k)=>a+r[k],0)/10);
                return (
                  <div key={r.id} style={{ background:"#0D1117",border:"1px solid #21262D",borderRadius:10,padding:12 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                      <div>
                        <p style={{ color:"white",fontSize:13,fontWeight:500,margin:0 }}>{r.name}</p>
                        <p style={{ color:"#4b5563",fontSize:11,margin:"2px 0 0" }}>{r.submittedAt}</p>
                      </div>
                      <ScoreBadge score={avg}/>
                    </div>
                    <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
                      {RATING_KEYS.map((k,i)=>(
                        <div key={k} title={Q_SHORT[i]} style={{ width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,background:`${gc(r[k])}18`,color:gc(r[k]) }}>{r[k]}</div>
                      ))}
                    </div>
                    {r.comments && <p style={{ color:"#6b7280",fontSize:11,margin:"8px 0 0",fontStyle:"italic" }}>"{r.comments}"</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {teamMembers.length>0 && (
          <div style={{ background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:20 }}>
            <h3 style={{ color:"white",fontSize:14,fontWeight:600,margin:"0 0 16px" }}>Direct Reports ({teamMembers.length})</h3>
            {teamMembers.map(m=>(
              <div key={m.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #21262D" }}>
                <Avatar emp={m} size={32}/>
                <div>
                  <p style={{ color:"white",fontSize:13,margin:0 }}>{m.name}</p>
                  <p style={{ color:"#4b5563",fontSize:11,margin:0 }}>{m.role} · {m.department}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmployeeModal({ emp, employees, onSave, onClose }) {
  const [form, setForm] = useState(emp || { ...EMPTY, id:"e"+Date.now() });
  const u = (k,v) => setForm(f=>({...f,[k]:v}));
  const inp = { width:"100%",background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"9px 12px",color:"white",fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit" };
  const lbl = { fontSize:11,color:"#6b7280",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em" };
  const leaders = employees.filter(e=>e.id!==form.id && LEADER_ROLES.includes(e.role)).map(e=>e.name);

  return (
    <div style={{ position:"fixed",inset:0,zIndex:100,display:"flex" }}>
      <div onClick={onClose} style={{ flex:1,background:"rgba(0,0,0,0.6)" }}/>
      <div style={{ width:"min(440px,100%)",background:"#0D1117",borderLeft:"1px solid #21262D",display:"flex",flexDirection:"column",overflowY:"auto" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:"1px solid #21262D",position:"sticky",top:0,background:"#0D1117",zIndex:1 }}>
          <div>
            <h3 style={{ color:"white",fontWeight:700,margin:0,fontSize:16 }}>{emp?.id?"Edit Employee":"Add Employee"}</h3>
            <p style={{ color:"#6b7280",fontSize:12,margin:"3px 0 0" }}>Fill in the employee details</p>
          </div>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:20 }}>✕</button>
        </div>

        <div style={{ padding:24,display:"flex",flexDirection:"column",gap:16,flex:1 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,padding:16,background:"#161B22",borderRadius:12,border:"1px solid #21262D" }}>
            <Avatar emp={form} size={52}/>
            <div>
              <p style={{ color:"white",fontSize:14,fontWeight:600,margin:0 }}>{form.name||"Employee Name"}</p>
              <p style={{ color:"#6b7280",fontSize:12,margin:"3px 0 0" }}>{form.role||"Role"} · {form.department||"Department"}</p>
            </div>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={lbl}>Full Name *</label>
              <input value={form.name} onChange={e=>u("name",e.target.value)} placeholder="e.g. Alice Johnson" style={inp}/>
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={lbl}>Email Address *</label>
              <input value={form.email} onChange={e=>u("email",e.target.value)} placeholder="alice@company.com" type="email" style={inp}/>
            </div>
            <div>
              <label style={lbl}>Employee ID</label>
              <input value={form.employeeId} onChange={e=>u("employeeId",e.target.value)} placeholder="EMP001" style={inp}/>
            </div>
            <div>
              <label style={lbl}>Join Date</label>
              <input value={form.joinDate} onChange={e=>u("joinDate",e.target.value)} type="date" style={{ ...inp,colorScheme:"dark" }}/>
            </div>
            <div>
              <label style={lbl}>Department</label>
              <select value={form.department} onChange={e=>u("department",e.target.value)} style={{ ...inp,cursor:"pointer" }}>
                <option value="">Select...</option>
                {DEPARTMENTS.map(d=><option key={d} value={d} style={{ background:"#161B22" }}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Role / Position</label>
              <select value={form.role} onChange={e=>u("role",e.target.value)} style={{ ...inp,cursor:"pointer" }}>
                <option value="">Select...</option>
                {ROLES.map(r=><option key={r} value={r} style={{ background:"#161B22" }}>{r}</option>)}
              </select>
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={lbl}>Team Leader</label>
              <select value={form.leaderName} onChange={e=>u("leaderName",e.target.value)} style={{ ...inp,cursor:"pointer" }}>
                <option value="">None / Is a leader</option>
                {leaders.map(l=><option key={l} value={l} style={{ background:"#161B22" }}>{l}</option>)}
              </select>
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={lbl}>Profile Photo URL</label>
              <input value={form.photoUrl} onChange={e=>u("photoUrl",e.target.value)} placeholder="https://..." style={inp}/>
              <p style={{ color:"#4b5563",fontSize:11,margin:"5px 0 0" }}>Leave blank to use initials avatar.</p>
            </div>
          </div>
        </div>

        <div style={{ padding:"16px 24px",borderTop:"1px solid #21262D",display:"flex",gap:10,position:"sticky",bottom:0,background:"#0D1117" }}>
          <button onClick={onClose} style={{ flex:1,padding:"10px 0",borderRadius:9,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:13,cursor:"pointer" }}>Cancel</button>
          <button onClick={()=>{ if(!form.name||!form.email)return alert("Name and email are required."); onSave(form); }}
            style={{ flex:2,padding:"10px 0",borderRadius:9,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer" }}>
            {emp?.id?"Save Changes":"Add Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState(DEFAULT_EMPLOYEES);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [modalEmp, setModalEmp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("employees");
    if (stored) {
      try { setEmployees(JSON.parse(stored)); } catch {}
    } else {
      // Save defaults to localStorage on first load
      localStorage.setItem("employees", JSON.stringify(DEFAULT_EMPLOYEES));
    }
  }, []);

  function save(list) { setEmployees(list); localStorage.setItem("employees", JSON.stringify(list)); }
  function handleSave(emp) {
    const exists = employees.find(e=>e.id===emp.id);
    save(exists ? employees.map(e=>e.id===emp.id?emp:e) : [...employees, emp]);
    setShowModal(false);
  }
  function handleDelete(id) { setConfirmState({ title:"Delete Employee", message:"This employee will be permanently removed from the directory.", confirmLabel:"Delete", onConfirm:()=>save(employees.filter(e=>e.id!==id)) }); }

  const depts = ["All",...Array.from(new Set(employees.map(e=>e.department).filter(Boolean)))];
  const filtered = employees
    .filter(e=>deptFilter==="All"||e.department===deptFilter)
    .filter(e=>e.name.toLowerCase().includes(search.toLowerCase())||e.email.toLowerCase().includes(search.toLowerCase())||e.role.toLowerCase().includes(search.toLowerCase()));

  if (selectedEmp) return <EmployeeProfile emp={selectedEmp} onBack={()=>setSelectedEmp(null)} employees={employees}/>;

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
        <div>
          <h2 style={{ color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)" }}>Employees</h2>
          <p style={{ color:"#6b7280",fontSize:13,margin:"3px 0 0" }}>{employees.length} total · Click any card to view profile</p>
        </div>
        <button onClick={()=>{ setModalEmp(null); setShowModal(true); }}
          style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer" }}>
          + Add Employee
        </button>
      </div>

      <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
        <div style={{ position:"relative",flex:1,minWidth:200 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, email, role..."
            style={{ width:"100%",background:"#161B22",border:"1px solid #21262D",borderRadius:9,padding:"10px 14px",color:"white",fontSize:13,outline:"none",boxSizing:"border-box" }}/>
        </div>
        <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}
          style={{ background:"#161B22",border:"1px solid #21262D",borderRadius:9,padding:"10px 14px",color:"white",fontSize:13,outline:"none" }}>
          {depts.map(d=><option key={d}>{d}</option>)}
        </select>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10 }}>
        {[
          { label:"Total Employees",   value:employees.length,                                              color:"#F59E0B" },
          { label:"Leaders",           value:employees.filter(e=>LEADER_ROLES.includes(e.role)).length,     color:"#8B5CF6" },
          { label:"Departments",       value:new Set(employees.map(e=>e.department).filter(Boolean)).size,  color:"#3B82F6" },
          { label:"Reviewed",          value:new Set(MOCK_SUBMISSIONS.map(s=>s.leaderName)).size,           color:"#10B981" },
        ].map(s=>(
          <div key={s.label} style={{ background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px" }}>
            <p style={{ color:s.color,fontSize:22,fontWeight:800,margin:0 }}>{s.value}</p>
            <p style={{ color:"#6b7280",fontSize:11,margin:"3px 0 0" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14 }}>
        {filtered.map(emp=>{
          const color = getAvatarColor(emp.name);
          const reviews = MOCK_SUBMISSIONS.filter(s=>s.leaderName===emp.name);
          const avg = reviews.length ? (reviews.flatMap(s=>RATING_KEYS.map(k=>s[k])).reduce((a,b)=>a+b,0)/(reviews.length*10)).toFixed(2) : null;
          const scoreColor = avg ? (avg>=4?"#22c55e":avg>=3?"#F59E0B":"#ef4444") : "#4b5563";

          return (
            <div key={emp.id} onClick={()=>setSelectedEmp(emp)}
              style={{ background:"#161B22",border:"1px solid #21262D",borderRadius:14,padding:18,cursor:"pointer",transition:"all 0.2s",position:"relative",overflow:"hidden" }}
              onMouseOver={e=>{ e.currentTarget.style.borderColor=color+"44"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px "+color+"18"; }}
              onMouseOut={e=>{ e.currentTarget.style.borderColor="#21262D"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
              <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,"+color+","+color+"44)",borderRadius:"14px 14px 0 0" }}/>
              <div style={{ display:"flex",alignItems:"flex-start",gap:12,marginTop:8 }}>
                <Avatar emp={emp} size={48}/>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ color:"white",fontSize:14,fontWeight:700,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{emp.name}</p>
                  <p style={{ color:"#6b7280",fontSize:12,margin:"3px 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{emp.email}</p>
                  <div style={{ display:"flex",gap:6,marginTop:6,flexWrap:"wrap" }}>
                    <span style={{ fontSize:10,color,background:color+"18",padding:"2px 8px",borderRadius:999,fontWeight:500 }}>{emp.role}</span>
                    <span style={{ fontSize:10,color:"#6b7280",background:"#21262D",padding:"2px 8px",borderRadius:999 }}>{emp.department}</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop:14,paddingTop:12,borderTop:"1px solid #21262D",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div>
                  {emp.leaderName
                    ? <p style={{ color:"#4b5563",fontSize:11,margin:0 }}>Reports to: <span style={{ color:"#9ca3af" }}>{emp.leaderName}</span></p>
                    : <p style={{ color:"#4b5563",fontSize:11,margin:0 }}>🏆 {emp.role}</p>
                  }
                  {emp.employeeId && <p style={{ color:"#4b5563",fontSize:10,margin:"2px 0 0" }}>{emp.employeeId}</p>}
                </div>
                {avg
                  ? <span style={{ fontSize:12,fontWeight:700,color:scoreColor,background:scoreColor+"18",padding:"3px 10px",borderRadius:999 }}>{avg}/5</span>
                  : <span style={{ fontSize:11,color:"#374151",background:"#21262D",padding:"3px 10px",borderRadius:999 }}>Not reviewed</span>
                }
              </div>
              <div style={{ display:"flex",gap:6,marginTop:12 }} onClick={e=>e.stopPropagation()}>
                <button onClick={()=>{ setModalEmp(emp); setShowModal(true); }}
                  style={{ flex:1,padding:"7px 0",borderRadius:8,border:"1px solid #21262D",background:"transparent",color:"#9ca3af",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5 }}
                  onMouseOver={e=>{ e.currentTarget.style.borderColor="#F59E0B44"; e.currentTarget.style.color="#F59E0B"; }}
                  onMouseOut={e=>{ e.currentTarget.style.borderColor="#21262D"; e.currentTarget.style.color="#9ca3af"; }}>
                  ✏️ Edit
                </button>
                <button onClick={()=>handleDelete(emp.id)}
                  style={{ padding:"7px 12px",borderRadius:8,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:12,cursor:"pointer" }}
                  onMouseOver={e=>{ e.currentTarget.style.borderColor="rgba(239,68,68,0.4)"; e.currentTarget.style.color="#ef4444"; }}
                  onMouseOut={e=>{ e.currentTarget.style.borderColor="#21262D"; e.currentTarget.style.color="#6b7280"; }}>
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length===0 && (
        <div style={{ textAlign:"center",padding:"60px 0",color:"#4b5563" }}>
          <p style={{ margin:0,fontSize:14 }}>No employees found.</p>
        </div>
      )}

      {confirmState && <ConfirmModal {...confirmState} onClose={()=>setConfirmState(null)}/>}
      {showModal && <EmployeeModal emp={modalEmp} employees={employees} onSave={handleSave} onClose={()=>setShowModal(false)}/>}
    </div>
  );
}
