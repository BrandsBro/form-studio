"use client";
import { getForms, saveForms } from "@/lib/sheets";
import { useState, useEffect } from "react";
import { Plus, Trash2, X, ArrowRight, ArrowLeft, Copy, Check } from "lucide-react";

const THEMES = { amber:"#F59E0B", blue:"#3B82F6", green:"#10B981", rose:"#F43F5E", violet:"#8B5CF6", cyan:"#06B6D4" };
const EF = { name:"New Form", description:"", active:true, badgeLabel:"Monthly Performance Review", quote:"As a team you have the right to measure your team leader wisely.", theme:"amber", customColor:"", fields:[], connections:[] };

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=34}){const color=gc(name);return <div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}

// ── Beautiful Modal Shell ─────────────────────────────────────────────────────
function Modal({ onClose, children, width = 500 }) {
  useEffect(() => {
    const handler = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)" }}/>
      <div style={{ position:"relative", width:`min(${width}px,100%)`, background:"linear-gradient(180deg,#12181F 0%,#0D1117 100%)", border:"1px solid #21262D", borderRadius:20, overflow:"hidden", boxShadow:"0 32px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset" }}>
        {children}
      </div>
    </div>
  );
}




// ── Rename Modal ──────────────────────────────────────────────────────────────
function RenameModal({ form, onSave, onClose }) {
  const [name, setName] = useState(form.name);
  const [desc, setDesc] = useState(form.description || "");
  const color = THEMES[form.theme] || form.customColor || "#F59E0B";
  const canSave = name.trim().length > 0;

  return (
    <Modal onClose={onClose} width={480}>
      {/* Gradient top bar */}
      <div style={{ height:3, background:`linear-gradient(90deg,${color},${color}66,transparent)` }}/>

      {/* Header */}
      <div style={{ padding:"22px 24px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:color+"18", border:`1px solid ${color}33`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:18 }}>✏️</span>
          </div>
          <div>
            <h3 style={{ color:"white", fontWeight:700, margin:0, fontSize:15 }}>Rename Form</h3>
            <p style={{ color:"#4b5563", fontSize:12, margin:"2px 0 0" }}>Update name and description</p>
          </div>
        </div>
        <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, background:"#161B22", border:"1px solid #21262D", cursor:"pointer", color:"#6b7280", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}
          onMouseOver={e=>e.currentTarget.style.color="white"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>✕</button>
      </div>

      {/* Body */}
      <div style={{ padding:"22px 24px", display:"flex", flexDirection:"column", gap:16 }}>
        <div>
          <label style={{ fontSize:11, color:"#6b7280", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:500 }}>
            Form Name <span style={{ color:color }}>*</span>
          </label>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&canSave&&onSave({...form,name:name.trim(),description:desc.trim()})}
            autoFocus placeholder="e.g. Leadership Performance Review"
            style={{ width:"100%", background:"#161B22", border:`1px solid #21262D`, borderRadius:10, padding:"11px 14px", color:"white", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit", transition:"border-color 0.2s, box-shadow 0.2s" }}
            onFocus={e=>{ e.target.style.borderColor=color; e.target.style.boxShadow=`0 0 0 3px ${color}18`; }}
            onBlur={e=>{ e.target.style.borderColor="#21262D"; e.target.style.boxShadow="none"; }}
          />
        </div>
        <div>
          <label style={{ fontSize:11, color:"#6b7280", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:500 }}>
            Description <span style={{ color:"#374151", textTransform:"none", letterSpacing:0, fontSize:10 }}>optional</span>
          </label>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3}
            placeholder="Brief description of this form's purpose..."
            style={{ width:"100%", background:"#161B22", border:"1px solid #21262D", borderRadius:10, padding:"11px 14px", color:"white", fontSize:13, outline:"none", resize:"none", boxSizing:"border-box", fontFamily:"inherit", transition:"border-color 0.2s, box-shadow 0.2s" }}
            onFocus={e=>{ e.target.style.borderColor=color; e.target.style.boxShadow=`0 0 0 3px ${color}18`; }}
            onBlur={e=>{ e.target.style.borderColor="#21262D"; e.target.style.boxShadow="none"; }}
          />
        </div>

        {/* Live preview */}
        <div style={{ background:"#0D1117", border:`1px solid ${color}22`, borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0, boxShadow:`0 0 6px ${color}` }}/>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ color:"white", fontSize:13, fontWeight:600, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name || <span style={{ color:"#374151" }}>Form Name</span>}</p>
            {desc && <p style={{ color:"#6b7280", fontSize:11, margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{desc}</p>}
          </div>
          <span style={{ fontSize:10, color:form.active?"#22c55e":"#6b7280", background:form.active?"rgba(34,197,94,0.1)":"#21262D", padding:"2px 8px", borderRadius:999, whiteSpace:"nowrap" }}>
            {form.active?"Active":"Inactive"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:"0 24px 22px", display:"flex", gap:10 }}>
        <button onClick={onClose}
          style={{ flex:1, padding:"11px 0", borderRadius:10, border:"1px solid #21262D", background:"transparent", color:"#6b7280", fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}
          onMouseOver={e=>{ e.currentTarget.style.background="#161B22"; e.currentTarget.style.color="white"; }}
          onMouseOut={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#6b7280"; }}>
          Cancel
        </button>
        <button onClick={()=>canSave&&onSave({...form,name:name.trim(),description:desc.trim()})} disabled={!canSave}
          style={{ flex:2, padding:"11px 0", borderRadius:10, border:"none", background:canSave?`linear-gradient(135deg,${color}cc,${color})`:"#161B22", color:canSave?"#000":"#374151", fontSize:13, fontWeight:700, cursor:canSave?"pointer":"not-allowed", fontFamily:"inherit", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <Check size={14}/> Save Changes
        </button>
      </div>
    </Modal>
  );
}

// ── Connection Modal ──────────────────────────────────────────────────────────
function ConnModal({ employees, executives, existing, onSave, onClose }) {
  const [rName, setRName] = useState("");
  const [eeNames, setEeNames] = useState([]);
  const all = [
    ...employees.map(e=>({ name:e.name, role:e.role, tag:"Staff" })),
    ...executives.map(e=>({ name:e.name, role:e.role, tag:"Executive" })),
  ];
  const toggle = n => setEeNames(p=>p.includes(n)?p.filter(x=>x!==n):[...p,n]);

  function doSave() {
    if (!rName || !eeNames.length) return alert("Select reviewer and at least one reviewee.");
    const ex = existing.find(c=>c.reviewerName===rName);
    if (ex) { const m=[...new Set([...ex.revieweeNames,...eeNames])]; onSave({...ex,revieweeNames:m}); }
    else onSave({ id:"c"+Date.now(), reviewerName:rName, revieweeNames:eeNames, type:eeNames.length>1?"multi":"single" });
  }

  return (
    <Modal onClose={onClose} width={560}>
      <div style={{ height:3, background:"linear-gradient(90deg,#F59E0B,#F59E0B66,transparent)" }}/>

      {/* Header */}
      <div style={{ padding:"22px 24px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🔗</div>
          <div>
            <h3 style={{ color:"white", fontWeight:700, margin:0, fontSize:15 }}>Add Connection</h3>
            <p style={{ color:"#4b5563", fontSize:12, margin:"2px 0 0" }}>Set who reviews whom for this form</p>
          </div>
        </div>
        <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, background:"#161B22", border:"1px solid #21262D", cursor:"pointer", color:"#6b7280", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}
          onMouseOver={e=>e.currentTarget.style.color="white"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>✕</button>
      </div>

      <div style={{ padding:"22px 24px", overflowY:"auto", maxHeight:"55vh", display:"flex", flexDirection:"column", gap:22 }}>

        {/* Step 1 */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#F59E0B", flexShrink:0 }}>1</div>
            <p style={{ fontSize:12, color:"#9ca3af", margin:0, fontWeight:500 }}>Who is the <span style={{ color:"white" }}>reviewer</span>?</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:8 }}>
            {all.map(p => {
              const sel = rName===p.name; const c = gc(p.name);
              return (
                <button key={p.name} onClick={()=>{ setRName(p.name); setEeNames([]); }}
                  style={{ padding:"10px 10px", borderRadius:12, border:`2px solid ${sel?c+"99":"#1C2333"}`, background:sel?c+"15":"#161B22", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}
                  onMouseOver={e=>!sel&&(e.currentTarget.style.borderColor="#21262D")}
                  onMouseOut={e=>!sel&&(e.currentTarget.style.borderColor="#1C2333")}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <Av name={p.name} size={28}/>
                    <div>
                      <p style={{ color:"white", fontSize:11, fontWeight:600, margin:0 }}>{p.name.split(" ")[0]}</p>
                      <p style={{ color:"#4b5563", fontSize:9, margin:0 }}>{p.tag}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 */}
        {rName && (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#F59E0B", flexShrink:0 }}>2</div>
              <p style={{ fontSize:12, color:"#9ca3af", margin:0 }}>Who can <span style={{ color:"#F59E0B", fontWeight:600 }}>{rName.split(" ")[0]}</span> review? <span style={{ color:"#4b5563" }}>(select multiple)</span></p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:8 }}>
              {all.filter(p=>p.name!==rName).map(p => {
                const sel = eeNames.includes(p.name); const c = gc(p.name);
                return (
                  <button key={p.name} onClick={()=>toggle(p.name)}
                    style={{ padding:"10px 10px", borderRadius:12, border:`2px solid ${sel?c+"99":"#1C2333"}`, background:sel?c+"15":"#161B22", cursor:"pointer", textAlign:"left", transition:"all 0.15s", position:"relative" }}>
                    {sel && (
                      <div style={{ position:"absolute", top:6, right:6, width:16, height:16, borderRadius:"50%", background:c, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Check size={9} color="#000"/>
                      </div>
                    )}
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <Av name={p.name} size={28}/>
                      <div>
                        <p style={{ color:"white", fontSize:11, fontWeight:600, margin:0 }}>{p.name.split(" ")[0]}</p>
                        <p style={{ color:"#4b5563", fontSize:9, margin:0 }}>{p.tag}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Preview */}
        {rName && eeNames.length > 0 && (
          <div style={{ background:"#0D1117", border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:"14px 16px" }}>
            <p style={{ fontSize:11, color:"#6b7280", margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Connection Preview</p>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}><Av name={rName} size={32}/><p style={{ color:"white", fontSize:13, fontWeight:600, margin:0 }}>{rName}</p></div>
              <div style={{ display:"flex", alignItems:"center", gap:5, color:"#F59E0B", fontSize:12, fontWeight:600 }}>
                <ArrowRight size={14}/><span style={{ color:"#4b5563", fontWeight:400 }}>reviews</span><ArrowRight size={14}/>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {eeNames.map(n=><div key={n} style={{ display:"flex", alignItems:"center", gap:6 }}><Av name={n} size={26}/><p style={{ color:"white", fontSize:12, margin:0 }}>{n.split(" ")[0]}</p></div>)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding:"0 24px 22px", display:"flex", gap:10 }}>
        <button onClick={onClose}
          style={{ flex:1, padding:"11px 0", borderRadius:10, border:"1px solid #21262D", background:"transparent", color:"#6b7280", fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}
          onMouseOver={e=>{ e.currentTarget.style.background="#161B22"; e.currentTarget.style.color="white"; }}
          onMouseOut={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#6b7280"; }}>
          Cancel
        </button>
        <button onClick={doSave}
          style={{ flex:2, padding:"11px 0", borderRadius:10, border:"none", background:"linear-gradient(135deg,#D97706,#F59E0B)", color:"#000", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <Check size={14}/> Save Connection
        </button>
      </div>
    </Modal>
  );
}

// ── Form Connections View ─────────────────────────────────────────────────────
function FormConnections({ form, onUpdate, onBack, employees, executives }) {
  const [showConn, setShowConn] = useState(false);
  const pc = THEMES[form.theme] || form.customColor || "#F59E0B";

  function sc(conn) { const ex=form.connections.find(c=>c.reviewerName===conn.reviewerName); const cs=ex?form.connections.map(c=>c.reviewerName===conn.reviewerName?conn:c):[...form.connections,conn]; onUpdate({...form,connections:cs}); setShowConn(false); }
  function rc(id) { onUpdate({...form,connections:form.connections.filter(c=>c.id!==id)}); }
  function rr(cid,name) { const conn=form.connections.find(c=>c.id===cid); if(!conn)return; const ns=conn.revieweeNames.filter(n=>n!==name); if(!ns.length){rc(cid);return;} onUpdate({...form,connections:form.connections.map(c=>c.id===cid?{...c,revieweeNames:ns,type:ns.length>1?"multi":"single"}:c)}); }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:"#6b7280", fontSize:13, display:"flex", alignItems:"center", gap:6, padding:0 }}
          onMouseOver={e=>e.currentTarget.style.color="#F59E0B"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>
          <ArrowLeft size={15}/> Back
        </button>
        <span style={{ color:"#21262D" }}>|</span>
        <div style={{ width:10, height:10, borderRadius:"50%", background:pc, boxShadow:`0 0 6px ${pc}` }}/>
        <h2 style={{ color:"white", fontSize:15, fontWeight:700, margin:0 }}>{form.name}</h2>
        <span style={{ fontSize:10, color:form.active?"#22c55e":"#6b7280", background:form.active?"rgba(34,197,94,0.12)":"#21262D", padding:"2px 8px", borderRadius:999 }}>{form.active?"Active":"Inactive"}</span>
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, background:"#161B22", border:"1px solid #21262D", borderRadius:12, padding:"14px 18px" }}>
        <div>
          <p style={{ color:"white", fontWeight:600, fontSize:14, margin:0 }}>Connections ({form.connections.length})</p>
          <p style={{ color:"#6b7280", fontSize:12, margin:"3px 0 0" }}>Staff and executives can be assigned as reviewees.</p>
        </div>
        <button onClick={()=>setShowConn(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#D97706,#F59E0B)", color:"#000", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          <Plus size={14}/> Add Connection
        </button>
      </div>

      {form.connections.length===0 ? (
        <div style={{ textAlign:"center", padding:"52px 0", color:"#4b5563", background:"#161B22", borderRadius:12, border:"1px solid #21262D" }}>
          <p style={{ fontSize:32, margin:"0 0 10px" }}>🔗</p>
          <p style={{ margin:0, fontSize:14 }}>No connections yet.</p>
          <p style={{ margin:"4px 0 0", fontSize:12 }}>Click "Add Connection" to assign reviewers.</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {form.connections.map(conn=>(
            <div key={conn.id} style={{ background:"#161B22", border:"1px solid #21262D", borderRadius:12, padding:18, display:"flex", alignItems:"flex-start", gap:14, flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:150 }}>
                <Av name={conn.reviewerName} size={40}/>
                <div>
                  <p style={{ color:"white", fontSize:13, fontWeight:700, margin:0 }}>{conn.reviewerName}</p>
                  <span style={{ fontSize:10, color:conn.type==="multi"?"#8B5CF6":"#3B82F6", background:conn.type==="multi"?"rgba(139,92,246,0.12)":"rgba(59,130,246,0.12)", padding:"2px 8px", borderRadius:999, fontWeight:600 }}>
                    {conn.type==="multi"?"One → Many":"One → One"}
                  </span>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, color:"#F59E0B", fontSize:12, paddingTop:10 }}>
                <ArrowRight size={14}/> reviews <ArrowRight size={14}/>
              </div>
              <div style={{ flex:1, display:"flex", flexWrap:"wrap", gap:8 }}>
                {conn.revieweeNames.map(name=>{
                  const nc=gc(name);
                  return (
                    <div key={name} style={{ display:"flex", alignItems:"center", gap:7, background:"#0D1117", border:`1px solid ${nc}33`, borderRadius:9, padding:"7px 10px" }}>
                      <Av name={name} size={26}/>
                      <p style={{ color:"white", fontSize:12, fontWeight:600, margin:0 }}>{name}</p>
                      <button onClick={()=>rr(conn.id,name)} style={{ background:"none", border:"none", cursor:"pointer", color:"#374151", padding:2, marginLeft:2, display:"flex" }}
                        onMouseOver={e=>e.currentTarget.style.color="#ef4444"} onMouseOut={e=>e.currentTarget.style.color="#374151"}>
                        <X size={11}/>
                      </button>
                    </div>
                  );
                })}
              </div>
              <button onClick={()=>rc(conn.id)} style={{ background:"none", border:"1px solid #21262D", borderRadius:7, cursor:"pointer", color:"#6b7280", padding:"6px 10px", display:"flex" }}
                onMouseOver={e=>{ e.currentTarget.style.borderColor="rgba(239,68,68,0.4)"; e.currentTarget.style.color="#ef4444"; }}
                onMouseOut={e=>{ e.currentTarget.style.borderColor="#21262D"; e.currentTarget.style.color="#6b7280"; }}>
                <Trash2 size={13}/>
              </button>
            </div>
          ))}
        </div>
      )}
      {showConn && <ConnModal employees={employees} executives={executives} existing={form.connections} onSave={sc} onClose={()=>setShowConn(false)}/>}
    </div>
  );
}

// ── Forms List ────────────────────────────────────────────────────────────────


function Skeleton({w="100%",h=20,r=8}){
  return <div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#161B22,#21262D,#161B22)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}} />;
}

export default function FormsList({ onEdit, onOpenConnections }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [renamingForm, setRenamingForm] = useState(null);
    const [employees, setEmployees] = useState([]);
  const [executives, setExecutives] = useState([]);

  useEffect(() => {
    const sf=localStorage.getItem("forms_list");
    const se=localStorage.getItem("employees");
    const sx=localStorage.getItem("executives");
    if(se){try{setEmployees(JSON.parse(se));}catch{}}
    if(sx){try{setExecutives(JSON.parse(sx));}catch{}}
    if(sf){try{setForms(JSON.parse(sf));}catch{}}
    else {
      const def=[{...EF,id:"form_"+Date.now(),name:"Leadership Performance Review",description:"Monthly leadership assessment",createdAt:new Date().toISOString().slice(0,10),fields:[]}];
      setForms(def); 
    }
  }, []);

  function persistForms(list) { setForms(list); saveForms(list); }
  function handleUpdate(updated) { const list = forms.map(f=>f.id===updated.id?updated:f); saveForms(list); setSelected(updated); }
  function handleRename(updated) { persistForms(forms.map(f=>f.id===updated.id?updated:f)); setRenamingForm(null); }
  function createForm() { const nf={...EF,id:"form_"+Date.now(),name:"New Form "+(forms.length+1),description:"",createdAt:new Date().toISOString().slice(0,10),fields:[]}; persistForms([...forms,nf]); }
  function dupForm(form) { persistForms([...forms,{...form,id:"form_"+Date.now(),name:form.name+" (Copy)",createdAt:new Date().toISOString().slice(0,10)}]); }
  function delForm(id) { persistForms(forms.filter(f=>f.id!==id)); }
  function toggleActive(id) { persistForms(forms.map(f=>f.id===id?{...f,active:!f.active}:f)); }

  if (selected) {
    const fresh = forms.find(f=>f.id===selected.id)||selected;
    return <FormConnections form={fresh} onUpdate={handleUpdate} onBack={()=>setSelected(null)} employees={employees} executives={executives}/>;
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ color:"white", fontSize:18, fontWeight:700, margin:0, fontFamily:"var(--font-playfair)" }}>Forms</h2>
          <p style={{ color:"#6b7280", fontSize:13, margin:"3px 0 0" }}>{forms.length} form{forms.length!==1?"s":""} · Edit to build questions, Connections to assign reviewers</p>
        </div>
        <button onClick={createForm} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#D97706,#F59E0B)", color:"#000", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          <Plus size={16}/> New Form
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:16 }}>
        {forms.map(form => {
          const color = THEMES[form.theme]||form.customColor||"#F59E0B";
          return (
            <div key={form.id} style={{ background:"#161B22", border:"1px solid #21262D", borderRadius:16, overflow:"hidden", transition:"all 0.2s" }}
              onMouseOver={e=>{ e.currentTarget.style.borderColor=color+"55"; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow=`0 8px 32px ${color}12`; }}
              onMouseOut={e=>{ e.currentTarget.style.borderColor="#21262D"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>

              {/* Color bar */}
              <div style={{ height:3, background:`linear-gradient(90deg,${color},${color}44)` }}/>

              <div style={{ padding:20 }}>
                {/* Name row */}
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:14 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <p style={{ color:"white", fontSize:15, fontWeight:700, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{form.name}</p>
                      <button onClick={()=>setRenamingForm(form)}
                        style={{ background:"none", border:"none", cursor:"pointer", color:"#374151", padding:"2px 4px", borderRadius:4, flexShrink:0, display:"flex", transition:"color 0.15s" }}
                        onMouseOver={e=>e.currentTarget.style.color=color} onMouseOut={e=>e.currentTarget.style.color="#374151"}
                        title="Rename form">
                        ✏️
                      </button>
                    </div>
                    {form.description && <p style={{ color:"#6b7280", fontSize:12, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{form.description}</p>}
                  </div>
                  <span style={{ fontSize:10, color:form.active?"#22c55e":"#6b7280", background:form.active?"rgba(34,197,94,0.1)":"#21262D", padding:"3px 10px", borderRadius:999, whiteSpace:"nowrap", flexShrink:0 }}>
                    {form.active?"● Active":"○ Inactive"}
                  </span>
                </div>

                {/* Stats */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
                  {[
                    { l:"Questions", v:form.fields?.length||0 },
                    { l:"Connections", v:form.connections?.length||0 },
                    { l:"Reviewees", v:form.connections?.reduce((a,c)=>a+c.revieweeNames.length,0)||0 },
                  ].map(s=>(
                    <div key={s.l} style={{ background:"#0D1117", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
                      <p style={{ color, fontSize:18, fontWeight:700, margin:0 }}>{s.v}</p>
                      <p style={{ color:"#4b5563", fontSize:10, margin:"2px 0 0" }}>{s.l}</p>
                    </div>
                  ))}
                </div>
                <p style={{ color:"#374151", fontSize:10, margin:0 }}>Created {form.createdAt}</p>
              </div>

              {/* Action buttons */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto auto", gap:6, padding:"0 16px 16px" }}>
                <button onClick={()=>onEdit&&onEdit(form)}
                  style={{ padding:"8px 0", borderRadius:9, border:"none", background:`linear-gradient(135deg,${color}cc,${color})`, color:"#000", fontSize:12, fontWeight:700, cursor:"pointer", transition:"opacity 0.2s" }}
                  onMouseOver={e=>e.currentTarget.style.opacity="0.85"} onMouseOut={e=>e.currentTarget.style.opacity="1"}>
                  ✏️ Edit
                </button>
                <button onClick={()=>onOpenConnections&&onOpenConnections(form.id)}
                  style={{ padding:"8px 0", borderRadius:9, border:`1px solid ${color}44`, background:color+"10", color, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  🔗 Connections
                </button>
                <button onClick={()=>toggleActive(form.id)} title={form.active?"Deactivate":"Activate"}
                  style={{ padding:"8px 10px", borderRadius:9, border:"1px solid #21262D", background:"transparent", color:"#6b7280", fontSize:12, cursor:"pointer" }}
                  onMouseOver={e=>{ e.currentTarget.style.borderColor="#30363D"; e.currentTarget.style.color="white"; }}
                  onMouseOut={e=>{ e.currentTarget.style.borderColor="#21262D"; e.currentTarget.style.color="#6b7280"; }}>
                  {form.active?"⊘":"✓"}
                </button>
                <button onClick={()=>delForm(form.id)} title="Delete"
                  style={{ padding:"8px 10px", borderRadius:9, border:"1px solid #21262D", background:"transparent", color:"#6b7280", fontSize:12, cursor:"pointer" }}
                  onMouseOver={e=>{ e.currentTarget.style.borderColor="rgba(239,68,68,0.4)"; e.currentTarget.style.color="#ef4444"; }}
                  onMouseOut={e=>{ e.currentTarget.style.borderColor="#21262D"; e.currentTarget.style.color="#6b7280"; }}>
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {forms.length===0 && (
        <div style={{ textAlign:"center", padding:"60px 0", color:"#4b5563", background:"#161B22", borderRadius:12, border:"1px solid #21262D" }}>
          <p style={{ fontSize:32, margin:"0 0 12px" }}>📄</p>
          <p style={{ margin:0, fontSize:14 }}>No forms yet.</p>
          <p style={{ margin:"4px 0 0", fontSize:12 }}>Click "New Form" to get started.</p>
        </div>
      )}

      {renamingForm && <RenameModal form={renamingForm} onSave={handleRename} onClose={()=>setRenamingForm(null)}/>}
    </div>
  );
}useEffect(()=>{
    setLoading(true);
    getForms().then(data=>{
      setForms(data);
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);client";
import { getForms, saveForms } from "@/lib/sheets";
import { useState, useEffect } from "react";
import { Plus, Trash2, X, ArrowRight, ArrowLeft, Copy, Check } from "lucide-react";

const THEMES = { amber:"#F59E0B", blue:"#3B82F6", green:"#10B981", rose:"#F43F5E", violet:"#8B5CF6", cyan:"#06B6D4" };
const EF = { name:"New Form", description:"", active:true, badgeLabel:"Monthly Performance Review", quote:"As a team you have the right to measure your team leader wisely.", theme:"amber", customColor:"", fields:[], connections:[] };

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=34}){const color=gc(name);return <div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}

// ── Beautiful Modal Shell ─────────────────────────────────────────────────────
function Modal({ onClose, children, width = 500 }) {
  useEffect(() => {
    const handler = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)" }}/>
      <div style={{ position:"relative", width:`min(${width}px,100%)`, background:"linear-gradient(180deg,#12181F 0%,#0D1117 100%)", border:"1px solid #21262D", borderRadius:20, overflow:"hidden", boxShadow:"0 32px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset" }}>
        {children}
      </div>
    </div>
  );
}




// ── Rename Modal ──────────────────────────────────────────────────────────────
function RenameModal({ form, onSave, onClose }) {
  const [name, setName] = useState(form.name);
  const [desc, setDesc] = useState(form.description || "");
  const color = THEMES[form.theme] || form.customColor || "#F59E0B";
  const canSave = name.trim().length > 0;

  return (
    <Modal onClose={onClose} width={480}>
      {/* Gradient top bar */}
      <div style={{ height:3, background:`linear-gradient(90deg,${color},${color}66,transparent)` }}/>

      {/* Header */}
      <div style={{ padding:"22px 24px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:color+"18", border:`1px solid ${color}33`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:18 }}>✏️</span>
          </div>
          <div>
            <h3 style={{ color:"white", fontWeight:700, margin:0, fontSize:15 }}>Rename Form</h3>
            <p style={{ color:"#4b5563", fontSize:12, margin:"2px 0 0" }}>Update name and description</p>
          </div>
        </div>
        <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, background:"#161B22", border:"1px solid #21262D", cursor:"pointer", color:"#6b7280", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}
          onMouseOver={e=>e.currentTarget.style.color="white"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>✕</button>
      </div>

      {/* Body */}
      <div style={{ padding:"22px 24px", display:"flex", flexDirection:"column", gap:16 }}>
        <div>
          <label style={{ fontSize:11, color:"#6b7280", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:500 }}>
            Form Name <span style={{ color:color }}>*</span>
          </label>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&canSave&&onSave({...form,name:name.trim(),description:desc.trim()})}
            autoFocus placeholder="e.g. Leadership Performance Review"
            style={{ width:"100%", background:"#161B22", border:`1px solid #21262D`, borderRadius:10, padding:"11px 14px", color:"white", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit", transition:"border-color 0.2s, box-shadow 0.2s" }}
            onFocus={e=>{ e.target.style.borderColor=color; e.target.style.boxShadow=`0 0 0 3px ${color}18`; }}
            onBlur={e=>{ e.target.style.borderColor="#21262D"; e.target.style.boxShadow="none"; }}
          />
        </div>
        <div>
          <label style={{ fontSize:11, color:"#6b7280", display:"block", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:500 }}>
            Description <span style={{ color:"#374151", textTransform:"none", letterSpacing:0, fontSize:10 }}>optional</span>
          </label>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3}
            placeholder="Brief description of this form's purpose..."
            style={{ width:"100%", background:"#161B22", border:"1px solid #21262D", borderRadius:10, padding:"11px 14px", color:"white", fontSize:13, outline:"none", resize:"none", boxSizing:"border-box", fontFamily:"inherit", transition:"border-color 0.2s, box-shadow 0.2s" }}
            onFocus={e=>{ e.target.style.borderColor=color; e.target.style.boxShadow=`0 0 0 3px ${color}18`; }}
            onBlur={e=>{ e.target.style.borderColor="#21262D"; e.target.style.boxShadow="none"; }}
          />
        </div>

        {/* Live preview */}
        <div style={{ background:"#0D1117", border:`1px solid ${color}22`, borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0, boxShadow:`0 0 6px ${color}` }}/>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ color:"white", fontSize:13, fontWeight:600, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name || <span style={{ color:"#374151" }}>Form Name</span>}</p>
            {desc && <p style={{ color:"#6b7280", fontSize:11, margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{desc}</p>}
          </div>
          <span style={{ fontSize:10, color:form.active?"#22c55e":"#6b7280", background:form.active?"rgba(34,197,94,0.1)":"#21262D", padding:"2px 8px", borderRadius:999, whiteSpace:"nowrap" }}>
            {form.active?"Active":"Inactive"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding:"0 24px 22px", display:"flex", gap:10 }}>
        <button onClick={onClose}
          style={{ flex:1, padding:"11px 0", borderRadius:10, border:"1px solid #21262D", background:"transparent", color:"#6b7280", fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}
          onMouseOver={e=>{ e.currentTarget.style.background="#161B22"; e.currentTarget.style.color="white"; }}
          onMouseOut={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#6b7280"; }}>
          Cancel
        </button>
        <button onClick={()=>canSave&&onSave({...form,name:name.trim(),description:desc.trim()})} disabled={!canSave}
          style={{ flex:2, padding:"11px 0", borderRadius:10, border:"none", background:canSave?`linear-gradient(135deg,${color}cc,${color})`:"#161B22", color:canSave?"#000":"#374151", fontSize:13, fontWeight:700, cursor:canSave?"pointer":"not-allowed", fontFamily:"inherit", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <Check size={14}/> Save Changes
        </button>
      </div>
    </Modal>
  );
}

// ── Connection Modal ──────────────────────────────────────────────────────────
function ConnModal({ employees, executives, existing, onSave, onClose }) {
  const [rName, setRName] = useState("");
  const [eeNames, setEeNames] = useState([]);
  const all = [
    ...employees.map(e=>({ name:e.name, role:e.role, tag:"Staff" })),
    ...executives.map(e=>({ name:e.name, role:e.role, tag:"Executive" })),
  ];
  const toggle = n => setEeNames(p=>p.includes(n)?p.filter(x=>x!==n):[...p,n]);

  function doSave() {
    if (!rName || !eeNames.length) return alert("Select reviewer and at least one reviewee.");
    const ex = existing.find(c=>c.reviewerName===rName);
    if (ex) { const m=[...new Set([...ex.revieweeNames,...eeNames])]; onSave({...ex,revieweeNames:m}); }
    else onSave({ id:"c"+Date.now(), reviewerName:rName, revieweeNames:eeNames, type:eeNames.length>1?"multi":"single" });
  }

  return (
    <Modal onClose={onClose} width={560}>
      <div style={{ height:3, background:"linear-gradient(90deg,#F59E0B,#F59E0B66,transparent)" }}/>

      {/* Header */}
      <div style={{ padding:"22px 24px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🔗</div>
          <div>
            <h3 style={{ color:"white", fontWeight:700, margin:0, fontSize:15 }}>Add Connection</h3>
            <p style={{ color:"#4b5563", fontSize:12, margin:"2px 0 0" }}>Set who reviews whom for this form</p>
          </div>
        </div>
        <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, background:"#161B22", border:"1px solid #21262D", cursor:"pointer", color:"#6b7280", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}
          onMouseOver={e=>e.currentTarget.style.color="white"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>✕</button>
      </div>

      <div style={{ padding:"22px 24px", overflowY:"auto", maxHeight:"55vh", display:"flex", flexDirection:"column", gap:22 }}>

        {/* Step 1 */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#F59E0B", flexShrink:0 }}>1</div>
            <p style={{ fontSize:12, color:"#9ca3af", margin:0, fontWeight:500 }}>Who is the <span style={{ color:"white" }}>reviewer</span>?</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:8 }}>
            {all.map(p => {
              const sel = rName===p.name; const c = gc(p.name);
              return (
                <button key={p.name} onClick={()=>{ setRName(p.name); setEeNames([]); }}
                  style={{ padding:"10px 10px", borderRadius:12, border:`2px solid ${sel?c+"99":"#1C2333"}`, background:sel?c+"15":"#161B22", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}
                  onMouseOver={e=>!sel&&(e.currentTarget.style.borderColor="#21262D")}
                  onMouseOut={e=>!sel&&(e.currentTarget.style.borderColor="#1C2333")}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <Av name={p.name} size={28}/>
                    <div>
                      <p style={{ color:"white", fontSize:11, fontWeight:600, margin:0 }}>{p.name.split(" ")[0]}</p>
                      <p style={{ color:"#4b5563", fontSize:9, margin:0 }}>{p.tag}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 */}
        {rName && (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#F59E0B", flexShrink:0 }}>2</div>
              <p style={{ fontSize:12, color:"#9ca3af", margin:0 }}>Who can <span style={{ color:"#F59E0B", fontWeight:600 }}>{rName.split(" ")[0]}</span> review? <span style={{ color:"#4b5563" }}>(select multiple)</span></p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:8 }}>
              {all.filter(p=>p.name!==rName).map(p => {
                const sel = eeNames.includes(p.name); const c = gc(p.name);
                return (
                  <button key={p.name} onClick={()=>toggle(p.name)}
                    style={{ padding:"10px 10px", borderRadius:12, border:`2px solid ${sel?c+"99":"#1C2333"}`, background:sel?c+"15":"#161B22", cursor:"pointer", textAlign:"left", transition:"all 0.15s", position:"relative" }}>
                    {sel && (
                      <div style={{ position:"absolute", top:6, right:6, width:16, height:16, borderRadius:"50%", background:c, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Check size={9} color="#000"/>
                      </div>
                    )}
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <Av name={p.name} size={28}/>
                      <div>
                        <p style={{ color:"white", fontSize:11, fontWeight:600, margin:0 }}>{p.name.split(" ")[0]}</p>
                        <p style={{ color:"#4b5563", fontSize:9, margin:0 }}>{p.tag}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Preview */}
        {rName && eeNames.length > 0 && (
          <div style={{ background:"#0D1117", border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:"14px 16px" }}>
            <p style={{ fontSize:11, color:"#6b7280", margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Connection Preview</p>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}><Av name={rName} size={32}/><p style={{ color:"white", fontSize:13, fontWeight:600, margin:0 }}>{rName}</p></div>
              <div style={{ display:"flex", alignItems:"center", gap:5, color:"#F59E0B", fontSize:12, fontWeight:600 }}>
                <ArrowRight size={14}/><span style={{ color:"#4b5563", fontWeight:400 }}>reviews</span><ArrowRight size={14}/>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {eeNames.map(n=><div key={n} style={{ display:"flex", alignItems:"center", gap:6 }}><Av name={n} size={26}/><p style={{ color:"white", fontSize:12, margin:0 }}>{n.split(" ")[0]}</p></div>)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding:"0 24px 22px", display:"flex", gap:10 }}>
        <button onClick={onClose}
          style={{ flex:1, padding:"11px 0", borderRadius:10, border:"1px solid #21262D", background:"transparent", color:"#6b7280", fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}
          onMouseOver={e=>{ e.currentTarget.style.background="#161B22"; e.currentTarget.style.color="white"; }}
          onMouseOut={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#6b7280"; }}>
          Cancel
        </button>
        <button onClick={doSave}
          style={{ flex:2, padding:"11px 0", borderRadius:10, border:"none", background:"linear-gradient(135deg,#D97706,#F59E0B)", color:"#000", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <Check size={14}/> Save Connection
        </button>
      </div>
    </Modal>
  );
}

// ── Form Connections View ─────────────────────────────────────────────────────
function FormConnections({ form, onUpdate, onBack, employees, executives }) {
  const [showConn, setShowConn] = useState(false);
  const pc = THEMES[form.theme] || form.customColor || "#F59E0B";

  function sc(conn) { const ex=form.connections.find(c=>c.reviewerName===conn.reviewerName); const cs=ex?form.connections.map(c=>c.reviewerName===conn.reviewerName?conn:c):[...form.connections,conn]; onUpdate({...form,connections:cs}); setShowConn(false); }
  function rc(id) { onUpdate({...form,connections:form.connections.filter(c=>c.id!==id)}); }
  function rr(cid,name) { const conn=form.connections.find(c=>c.id===cid); if(!conn)return; const ns=conn.revieweeNames.filter(n=>n!==name); if(!ns.length){rc(cid);return;} onUpdate({...form,connections:form.connections.map(c=>c.id===cid?{...c,revieweeNames:ns,type:ns.length>1?"multi":"single"}:c)}); }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", color:"#6b7280", fontSize:13, display:"flex", alignItems:"center", gap:6, padding:0 }}
          onMouseOver={e=>e.currentTarget.style.color="#F59E0B"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>
          <ArrowLeft size={15}/> Back
        </button>
        <span style={{ color:"#21262D" }}>|</span>
        <div style={{ width:10, height:10, borderRadius:"50%", background:pc, boxShadow:`0 0 6px ${pc}` }}/>
        <h2 style={{ color:"white", fontSize:15, fontWeight:700, margin:0 }}>{form.name}</h2>
        <span style={{ fontSize:10, color:form.active?"#22c55e":"#6b7280", background:form.active?"rgba(34,197,94,0.12)":"#21262D", padding:"2px 8px", borderRadius:999 }}>{form.active?"Active":"Inactive"}</span>
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, background:"#161B22", border:"1px solid #21262D", borderRadius:12, padding:"14px 18px" }}>
        <div>
          <p style={{ color:"white", fontWeight:600, fontSize:14, margin:0 }}>Connections ({form.connections.length})</p>
          <p style={{ color:"#6b7280", fontSize:12, margin:"3px 0 0" }}>Staff and executives can be assigned as reviewees.</p>
        </div>
        <button onClick={()=>setShowConn(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#D97706,#F59E0B)", color:"#000", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          <Plus size={14}/> Add Connection
        </button>
      </div>

      {form.connections.length===0 ? (
        <div style={{ textAlign:"center", padding:"52px 0", color:"#4b5563", background:"#161B22", borderRadius:12, border:"1px solid #21262D" }}>
          <p style={{ fontSize:32, margin:"0 0 10px" }}>🔗</p>
          <p style={{ margin:0, fontSize:14 }}>No connections yet.</p>
          <p style={{ margin:"4px 0 0", fontSize:12 }}>Click "Add Connection" to assign reviewers.</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {form.connections.map(conn=>(
            <div key={conn.id} style={{ background:"#161B22", border:"1px solid #21262D", borderRadius:12, padding:18, display:"flex", alignItems:"flex-start", gap:14, flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:150 }}>
                <Av name={conn.reviewerName} size={40}/>
                <div>
                  <p style={{ color:"white", fontSize:13, fontWeight:700, margin:0 }}>{conn.reviewerName}</p>
                  <span style={{ fontSize:10, color:conn.type==="multi"?"#8B5CF6":"#3B82F6", background:conn.type==="multi"?"rgba(139,92,246,0.12)":"rgba(59,130,246,0.12)", padding:"2px 8px", borderRadius:999, fontWeight:600 }}>
                    {conn.type==="multi"?"One → Many":"One → One"}
                  </span>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, color:"#F59E0B", fontSize:12, paddingTop:10 }}>
                <ArrowRight size={14}/> reviews <ArrowRight size={14}/>
              </div>
              <div style={{ flex:1, display:"flex", flexWrap:"wrap", gap:8 }}>
                {conn.revieweeNames.map(name=>{
                  const nc=gc(name);
                  return (
                    <div key={name} style={{ display:"flex", alignItems:"center", gap:7, background:"#0D1117", border:`1px solid ${nc}33`, borderRadius:9, padding:"7px 10px" }}>
                      <Av name={name} size={26}/>
                      <p style={{ color:"white", fontSize:12, fontWeight:600, margin:0 }}>{name}</p>
                      <button onClick={()=>rr(conn.id,name)} style={{ background:"none", border:"none", cursor:"pointer", color:"#374151", padding:2, marginLeft:2, display:"flex" }}
                        onMouseOver={e=>e.currentTarget.style.color="#ef4444"} onMouseOut={e=>e.currentTarget.style.color="#374151"}>
                        <X size={11}/>
                      </button>
                    </div>
                  );
                })}
              </div>
              <button onClick={()=>rc(conn.id)} style={{ background:"none", border:"1px solid #21262D", borderRadius:7, cursor:"pointer", color:"#6b7280", padding:"6px 10px", display:"flex" }}
                onMouseOver={e=>{ e.currentTarget.style.borderColor="rgba(239,68,68,0.4)"; e.currentTarget.style.color="#ef4444"; }}
                onMouseOut={e=>{ e.currentTarget.style.borderColor="#21262D"; e.currentTarget.style.color="#6b7280"; }}>
                <Trash2 size={13}/>
              </button>
            </div>
          ))}
        </div>
      )}
      {showConn && <ConnModal employees={employees} executives={executives} existing={form.connections} onSave={sc} onClose={()=>setShowConn(false)}/>}
    </div>
  );
}

// ── Forms List ────────────────────────────────────────────────────────────────

}