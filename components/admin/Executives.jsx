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

const EXEC_ROLES = ["CEO","CMO","Chairman","MD","COO","CFO","CTO","CHRO"];

const DEFAULT_EXECS = [
  { id:"ex1", name:"James Thornton", role:"CEO",     email:"james@company.com",  photoUrl:"", phone:"" },
  { id:"ex2", name:"Linda Park",     role:"Chairman", email:"linda@company.com",  photoUrl:"", phone:"" },
  { id:"ex3", name:"Ray Nguyen",     role:"MD",       email:"ray@company.com",    photoUrl:"", phone:"" },
];

function getInitials(name="") { return name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)||"?"; }
function getColor(name="") {
  const c=["#F59E0B","#8B5CF6","#F43F5E","#06B6D4","#10B981","#F97316","#3B82F6","#EC4899"];
  return c[(name.charCodeAt(0)||0)%c.length];
}

function Avatar({ emp, size=56 }) {
  const color = getColor(emp.name);
  if (emp.photoUrl) return <img src={emp.photoUrl} alt={emp.name} style={{ width:size,height:size,borderRadius:"50%",objectFit:"cover",border:`3px solid ${color}55`,flexShrink:0 }}/>;
  return (
    <div style={{ width:size,height:size,borderRadius:"50%",background:`${color}15`,border:`3px solid ${color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.32,fontWeight:800,color,flexShrink:0 }}>
      {getInitials(emp.name)}
    </div>
  );
}

function Modal({ exec, onSave, onClose }) {
  const [form, setForm] = useState(exec || { id:"ex"+Date.now(), name:"", role:"", email:"", photoUrl:"", phone:"" });
  const u = (k,v) => setForm(f=>({...f,[k]:v}));
  const inp = { width:"100%",background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"9px 12px",color:"white",fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit" };
  const lbl = { fontSize:11,color:"#6b7280",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em" };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:100,display:"flex" }}>
      <div onClick={onClose} style={{ flex:1,background:"rgba(0,0,0,0.65)" }}/>
      <div style={{ width:"min(400px,100%)",background:"#0D1117",borderLeft:"1px solid #21262D",display:"flex",flexDirection:"column",overflowY:"auto" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:"1px solid #21262D",position:"sticky",top:0,background:"#0D1117" }}>
          <div>
            <h3 style={{ color:"white",fontWeight:700,margin:0 }}>{exec?.id?"Edit Executive":"Add Executive"}</h3>
            <p style={{ color:"#6b7280",fontSize:12,margin:"3px 0 0" }}>Senior leadership profile</p>
          </div>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:20 }}>✕</button>
        </div>

        <div style={{ padding:24,display:"flex",flexDirection:"column",gap:14,flex:1 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14,padding:16,background:"#161B22",borderRadius:12,border:"1px solid #21262D" }}>
            <Avatar emp={form} size={52}/>
            <div>
              <p style={{ color:"white",fontSize:15,fontWeight:700,margin:0 }}>{form.name||"Executive Name"}</p>
              <p style={{ color:getColor(form.name),fontSize:12,margin:"3px 0 0",fontWeight:600 }}>{form.role||"Role"}</p>
            </div>
          </div>
          <div>
            <label style={lbl}>Full Name *</label>
            <input value={form.name} onChange={e=>u("name",e.target.value)} placeholder="e.g. James Thornton" style={inp}/>
          </div>
          <div>
            <label style={lbl}>Role *</label>
            <select value={form.role} onChange={e=>u("role",e.target.value)} style={{ ...inp,cursor:"pointer" }}>
              <option value="">Select role...</option>
              {EXEC_ROLES.map(r=><option key={r} value={r} style={{ background:"#161B22" }}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Email</label>
            <input value={form.email} onChange={e=>u("email",e.target.value)} placeholder="exec@company.com" style={inp}/>
          </div>
          <div>
            <label style={lbl}>Phone</label>
            <input value={form.phone} onChange={e=>u("phone",e.target.value)} placeholder="+1 000 000 0000" style={inp}/>
          </div>
          <div>
            <label style={lbl}>Profile Photo URL</label>
            <input value={form.photoUrl} onChange={e=>u("photoUrl",e.target.value)} placeholder="https://..." style={inp}/>
          </div>
        </div>

        <div style={{ padding:"16px 24px",borderTop:"1px solid #21262D",display:"flex",gap:10,position:"sticky",bottom:0,background:"#0D1117" }}>
          <button onClick={onClose} style={{ flex:1,padding:"10px 0",borderRadius:9,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:13,cursor:"pointer" }}>Cancel</button>
          <button onClick={()=>{ if(!form.name||!form.role)return alert("Name and role required."); onSave(form); }}
            style={{ flex:2,padding:"10px 0",borderRadius:9,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer" }}>
            {exec?.id?"Save Changes":"Add Executive"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Executives() {
  const [execs, setExecs] = useState(DEFAULT_EXECS);
  const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("executives");
    if (stored) {
      try { setExecs(JSON.parse(stored)); } catch {}
    } else {
      localStorage.setItem("executives", JSON.stringify(DEFAULT_EXECS));
    }
  }, []);

  function save(list) { setExecs(list); localStorage.setItem("executives", JSON.stringify(list)); }
  function handleSave(exec) {
    const exists = execs.find(e=>e.id===exec.id);
    save(exists ? execs.map(e=>e.id===exec.id?exec:e) : [...execs,exec]);
    setShowModal(false); setEditing(null);
  }
  function handleDelete(id) { setConfirmState({ title:"Remove Executive", message:"This executive will be removed from the leadership directory.", confirmLabel:"Remove", onConfirm:()=>save(execs.filter(e=>e.id!==id)) }); }

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>

      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
        <div>
          <h2 style={{ color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)" }}>Executive Leadership</h2>
          <p style={{ color:"#6b7280",fontSize:13,margin:"3px 0 0" }}>CEO, CMO, Chairman, MD and senior leaders</p>
        </div>
        <button onClick={()=>{ setEditing(null); setShowModal(true); }}
          style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer" }}>
          + Add Executive
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10 }}>
        {EXEC_ROLES.map(role=>{
          const count = execs.filter(e=>e.role===role).length;
          if(!count) return null;
          const color = getColor(role);
          return (
            <div key={role} style={{ background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px" }}>
              <p style={{ color,fontSize:20,fontWeight:800,margin:0 }}>{count}</p>
              <p style={{ color:"#6b7280",fontSize:11,margin:"3px 0 0" }}>{role}</p>
            </div>
          );
        })}
      </div>

      {/* Executive Cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16 }}>
        {execs.map(exec=>{
          const color = getColor(exec.name);
          return (
            <div key={exec.id}
              style={{ background:"#161B22",border:"1px solid #21262D",borderRadius:16,padding:24,position:"relative",overflow:"hidden",transition:"all 0.2s" }}
              onMouseOver={e=>{ e.currentTarget.style.borderColor=color+"55"; e.currentTarget.style.boxShadow="0 8px 32px "+color+"15"; }}
              onMouseOut={e=>{ e.currentTarget.style.borderColor="#21262D"; e.currentTarget.style.boxShadow="none"; }}>

              {/* Top gradient bar */}
              <div style={{ position:"absolute",top:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${color},${color}33)`,borderRadius:"16px 16px 0 0" }}/>

              {/* Faded role watermark */}
              <div style={{ position:"absolute",bottom:-10,right:-10,fontSize:80,fontWeight:900,color:color,opacity:0.04,lineHeight:1,userSelect:"none",pointerEvents:"none" }}>
                {exec.role}
              </div>

              <div style={{ display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:12,position:"relative" }}>
                <Avatar emp={exec} size={72}/>
                <div>
                  <p style={{ color:"white",fontSize:16,fontWeight:700,margin:0 }}>{exec.name}</p>
                  <span style={{ display:"inline-block",marginTop:6,fontSize:12,color,background:color+"18",border:`1px solid ${color}33`,padding:"3px 14px",borderRadius:999,fontWeight:700,letterSpacing:"0.04em" }}>
                    {exec.role}
                  </span>
                </div>
                <div style={{ width:"100%",display:"flex",flexDirection:"column",gap:6,borderTop:"1px solid #21262D",paddingTop:12 }}>
                  {exec.email && <p style={{ color:"#9ca3af",fontSize:12,margin:0 }}>✉️ {exec.email}</p>}
                  {exec.phone && <p style={{ color:"#9ca3af",fontSize:12,margin:0 }}>📞 {exec.phone}</p>}
                </div>
                <div style={{ display:"flex",gap:8,width:"100%" }}>
                  <button onClick={()=>{ setEditing(exec); setShowModal(true); }}
                    style={{ flex:1,padding:"7px 0",borderRadius:8,border:"1px solid #21262D",background:"transparent",color:"#9ca3af",fontSize:12,cursor:"pointer" }}
                    onMouseOver={e=>{ e.currentTarget.style.borderColor=color+"55"; e.currentTarget.style.color=color; }}
                    onMouseOut={e=>{ e.currentTarget.style.borderColor="#21262D"; e.currentTarget.style.color="#9ca3af"; }}>
                    ✏️ Edit
                  </button>
                  <button onClick={()=>handleDelete(exec.id)}
                    style={{ padding:"7px 14px",borderRadius:8,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:12,cursor:"pointer" }}
                    onMouseOver={e=>{ e.currentTarget.style.borderColor="rgba(239,68,68,0.4)"; e.currentTarget.style.color="#ef4444"; }}
                    onMouseOut={e=>{ e.currentTarget.style.borderColor="#21262D"; e.currentTarget.style.color="#6b7280"; }}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {execs.length===0 && (
        <div style={{ textAlign:"center",padding:"60px 0",color:"#4b5563" }}>
          <p style={{ fontSize:40,margin:"0 0 12px" }}>👔</p>
          <p style={{ margin:0,fontSize:14 }}>No executives added yet.</p>
        </div>
      )}

      {showModal && <Modal exec={editing} onSave={handleSave} onClose={()=>{ setShowModal(false); setEditing(null); }}/>}
    </div>
  );
}
