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
import { Trash2, PlusCircle, GripVertical, Save } from "lucide-react";

const PRESET_THEMES = {
  amber:  { name:"Amber Gold", primary:"#F59E0B" },
  blue:   { name:"Ocean Blue", primary:"#3B82F6" },
  green:  { name:"Emerald",    primary:"#10B981" },
  rose:   { name:"Rose",       primary:"#F43F5E" },
  violet: { name:"Violet",     primary:"#8B5CF6" },
  cyan:   { name:"Cyan",       primary:"#06B6D4" },
  orange: { name:"Orange",     primary:"#F97316" },
  lime:   { name:"Lime",       primary:"#84CC16" },
};

const FIELD_TYPES = [
  { type:"rating",   label:"Rating 1–5", icon:"⭐" },
  { type:"text",     label:"Short Text", icon:"✏️" },
  { type:"textarea", label:"Long Text",  icon:"📝" },
  { type:"yesno",    label:"Yes / No",   icon:"🔘" },
];

export const DEFAULT_CONFIG = {
  title: "Leadership Performance Review",
  description: "Monthly team performance review",
  quote: "As a team you have the right to measure your team leader wisely.",
  badgeLabel: "Monthly Performance Review",
  theme: "amber",
  customColor: "",
  fields: [
    { id:"f1",  type:"rating",   label:"The manager communicates clearly and effectively, ensuring expectations and goals are well understood.", required:true },
    { id:"f2",  type:"rating",   label:"The manager provides the necessary support and guidance, helping team members succeed in their roles.", required:true },
    { id:"f3",  type:"rating",   label:"The manager provides regular, constructive feedback that helps with professional development.", required:true },
    { id:"f4",  type:"rating",   label:"The manager is approachable, open to listening, and receptive to concerns or new ideas.", required:true },
    { id:"f5",  type:"rating",   label:"The manager motivates the team, keeping them engaged and fostering a positive work environment.", required:true },
    { id:"f6",  type:"rating",   label:"The manager handles challenges effectively, providing practical solutions and taking action when needed.", required:true },
    { id:"f7",  type:"rating",   label:"The manager treats all team members fairly, respecting diverse opinions and perspectives.", required:true },
    { id:"f8",  type:"rating",   label:"The manager recognizes and appreciates individual contributions, acknowledging efforts and achievements.", required:true },
    { id:"f9",  type:"rating",   label:"The manager empowers team members to take ownership of their tasks and make decisions within their roles.", required:true },
    { id:"f10", type:"rating",   label:"The manager supports professional growth, providing opportunities for learning and career advancement.", required:true },
    { id:"f11", type:"textarea", label:"Any comments or suggestions to improve?", required:false },
  ],
};

let dragSrcIndex = null;

function hexToRgb(hex) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}


const SHEETS_URL = process.env.NEXT_PUBLIC_SHEETS_URL;
async function sheetSaveForms(forms) {
  try {
    await fetch(SHEETS_URL, {
      method:"POST",
      headers:{"Content-Type":"text/plain"},
      body:JSON.stringify({action:"saveForms", forms}),
      redirect:"follow",
    });
  } catch(e) { console.error("Sheets forms error:", e); }
}

export default function FormBuilder({ editForm, onSaved }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState("fields");
  const [saved, setSaved] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [formsList, setFormsList] = useState([]);
  const [targetFormId, setTargetFormId] = useState(null);
  const [addingType, setAddingType] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activePanel, setActivePanel] = useState("builder");

  useEffect(() => {
    // Load forms list for the selector
    try {
      const fl = JSON.parse(localStorage.getItem("forms_list") || "[]");
      setFormsList(fl);
      if (fl.length > 0 && !editForm) setTargetFormId(fl[0].id);
    } catch(e) {}

    if (editForm) {
      setConfig(prev => ({
        ...prev,
        title: editForm.name || "",
        description: editForm.description || "",
        quote: editForm.quote || prev.quote,
        badgeLabel: editForm.badgeLabel || prev.badgeLabel,
        theme: editForm.theme || "amber",
        customColor: editForm.customColor || "",
        fields: editForm.fields?.length ? editForm.fields : prev.fields,
      }));
    } else {
      const stored = localStorage.getItem("form_config");
      if (stored) { try { setConfig(JSON.parse(stored)); } catch {} }
    }
  }, [editForm?.id]);

  const primaryColor = config.customColor || PRESET_THEMES[config.theme]?.primary || "#F59E0B";
  const rgb = primaryColor.startsWith("#") ? hexToRgb(primaryColor) : "245,158,11";
  const theme = { primary:primaryColor, light:`rgba(${rgb},0.12)`, border:`rgba(${rgb},0.3)`, glow:`rgba(${rgb},0.2)` };

  function save() {
    if (editForm) {
      try {
        const fl = JSON.parse(localStorage.getItem("forms_list") || "[]");
        const updated = fl.map(f => f.id === editForm.id ? {
          ...f,
          name: config.title,
          description: config.description,
          quote: config.quote,
          badgeLabel: config.badgeLabel,
          theme: config.theme,
          customColor: config.customColor,
          fields: config.fields,
        } : f);
        localStorage.setItem("forms_list", JSON.stringify(updated));
      } catch(e) { console.error(e); }
      setSaved(true);
      setTimeout(() => { setSaved(false); if (onSaved) onSaved(); }, 1200);
    } else {
      // Save to form_config (legacy)
      localStorage.setItem("form_config", JSON.stringify(config));
      // Also update the target form in forms_list
      if (targetFormId) {
        try {
          const fl = JSON.parse(localStorage.getItem("forms_list") || "[]");
          const updated = fl.map(f => f.id === targetFormId ? {
            ...f,
            name: config.title,
            description: config.description,
            quote: config.quote,
            badgeLabel: config.badgeLabel,
            theme: config.theme,
            customColor: config.customColor,
            fields: config.fields,
          } : f);
          localStorage.setItem("forms_list", JSON.stringify(updated));
          setFormsList(updated);
        } catch(e) {}
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }
  function reset(){ setConfig(DEFAULT_CONFIG); localStorage.removeItem("form_config"); }
  function updateMeta(key, value) { setConfig(c=>({...c,[key]:value})); }
  function addField(type) { const id=`f${Date.now()}`; setConfig(c=>({...c,fields:[...c.fields,{id,type,label:"New question — click to edit.",required:false}]})); setAddingType(false); }
  function updateField(id, key, value) { setConfig(c=>({...c,fields:c.fields.map(f=>f.id===id?{...f,[key]:value}:f)})); }
  function deleteField(id) { setConfig(c=>({...c,fields:c.fields.filter(f=>f.id!==id)})); }
  function onDragStart(e,i){ dragSrcIndex=i; e.dataTransfer.effectAllowed="move"; }
  function onDragOver(e,i){ e.preventDefault(); if(dragSrcIndex===null||dragSrcIndex===i)return; const fields=[...config.fields]; const[r]=fields.splice(dragSrcIndex,1); fields.splice(i,0,r); dragSrcIndex=i; setConfig(c=>({...c,fields})); }
  function onDragEnd(){ dragSrcIndex=null; }

  const inp = { width:"100%", background:"#0D1117", border:"1px solid #21262D", borderRadius:8, padding:"9px 12px", color:"white", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" };
  const lbl = { fontSize:11, color:"#6b7280", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" };

  const Builder = (
    <div style={{ display:"flex", flexDirection:"column", gap:10, height:"100%" }}>
      {/* Tabs */}
      <div style={{ display:"flex", background:"#0D1117", borderRadius:10, padding:3 }}>
        {[{id:"fields",label:"📋 Fields"},{id:"settings",label:"⚙️ Settings"}].map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{ flex:1, padding:"8px 0", fontSize:13, fontWeight:500, borderRadius:8, border:"none", cursor:"pointer", background:activeTab===t.id?"#161B22":"transparent", color:activeTab===t.id?"white":"#6b7280", transition:"all 0.2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:8 }}>

        {/* FIELDS TAB */}
        {activeTab==="fields" && (
          <>
            {config.fields.map((field,index)=>(
              <div key={field.id} draggable onDragStart={e=>onDragStart(e,index)} onDragOver={e=>onDragOver(e,index)} onDragEnd={onDragEnd}
                style={{ background:"#0D1117", border:"1px solid #21262D", borderRadius:10, padding:"12px 10px", display:"flex", alignItems:"flex-start", gap:8, cursor:"grab" }}>
                <GripVertical size={14} color="#374151" style={{ marginTop:10, flexShrink:0 }}/>
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <select value={field.type} onChange={e=>updateField(field.id,"type",e.target.value)}
                      style={{ fontSize:11, background:theme.light, color:theme.primary, border:`1px solid ${theme.border}`, borderRadius:5, padding:"3px 7px", cursor:"pointer", outline:"none" }}>
                      {FIELD_TYPES.map(o=><option key={o.type} value={o.type} style={{ background:"#161B22", color:"white" }}>{o.icon} {o.label}</option>)}
                    </select>
                    <label style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#6b7280", cursor:"pointer" }}>
                      <input type="checkbox" checked={field.required} onChange={e=>updateField(field.id,"required",e.target.checked)} style={{ accentColor:theme.primary }}/>
                      Required
                    </label>
                  </div>
                  <textarea value={field.label} onChange={e=>updateField(field.id,"label",e.target.value)} rows={2}
                    style={{ background:"transparent", border:"none", outline:"none", color:"#d1d5db", fontSize:12, resize:"none", lineHeight:1.5, width:"100%", fontFamily:"inherit" }}/>
                </div>
                <button onClick={()=>deleteField(field.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#374151", padding:4, marginTop:4, flexShrink:0 }}
                  onMouseOver={e=>e.currentTarget.style.color="#ef4444"}
                  onMouseOut={e=>e.currentTarget.style.color="#374151"}>
                  <Trash2 size={13}/>
                </button>
              </div>
            ))}

            {addingType ? (
              <div style={{ background:"#0D1117", border:"1px solid #21262D", borderRadius:10, padding:14 }}>
                <p style={{ color:"#9ca3af", fontSize:12, margin:"0 0 10px" }}>Choose question type:</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {FIELD_TYPES.map(o=>(
                    <button key={o.type} onClick={()=>addField(o.type)}
                      style={{ padding:"10px 12px", fontSize:12, background:"#161B22", border:"1px solid #21262D", borderRadius:8, color:"white", cursor:"pointer", textAlign:"left" }}
                      onMouseOver={e=>e.currentTarget.style.borderColor=theme.primary}
                      onMouseOut={e=>e.currentTarget.style.borderColor="#21262D"}>
                      {o.icon} {o.label}
                    </button>
                  ))}
                </div>
                <button onClick={()=>setAddingType(false)} style={{ marginTop:10, fontSize:11, color:"#6b7280", background:"none", border:"none", cursor:"pointer" }}>Cancel</button>
              </div>
            ) : (
              <button onClick={()=>setAddingType(true)}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 0", border:"1px dashed #30363D", borderRadius:10, color:"#6b7280", background:"transparent", cursor:"pointer", fontSize:13 }}
                onMouseOver={e=>{ e.currentTarget.style.color=theme.primary; e.currentTarget.style.borderColor=theme.border; }}
                onMouseOut={e=>{ e.currentTarget.style.color="#6b7280"; e.currentTarget.style.borderColor="#30363D"; }}>
                <PlusCircle size={15}/> Add Question
              </button>
            )}
          </>
        )}

        {/* SETTINGS TAB */}
        {activeTab==="settings" && (
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

            {/* ── Badge / Tag ── */}
            <div style={{ background:"#0D1117", border:`1px solid ${theme.border}`, borderRadius:10, padding:14 }}>
              <p style={{ ...lbl, color:theme.primary, marginBottom:10 }}>🏷️ Top Badge / Tag</p>
              <label style={lbl}>Badge Text</label>
              <input value={config.badgeLabel || ""} onChange={e=>updateMeta("badgeLabel",e.target.value)}
                placeholder="e.g. Monthly Performance Review"
                style={inp}/>
              <p style={{ fontSize:11, color:"#4b5563", margin:"6px 0 0" }}>
                The date is added automatically → <span style={{ color:theme.primary }}>"{config.badgeLabel || "Monthly Performance Review"} · May 2026"</span>
              </p>
            </div>

            {/* ── Form Content ── */}
            <div style={{ background:"#0D1117", border:"1px solid #21262D", borderRadius:10, padding:14 }}>
              <p style={{ ...lbl, color:"#9ca3af", marginBottom:12 }}>📄 Form Content</p>
              {[
                { key:"title",       label:"Form Title",    multiline:false },
                { key:"description", label:"Description",   multiline:false },
                { key:"quote",       label:"Header Quote",  multiline:true  },
              ].map(({key,label,multiline})=>(
                <div key={key} style={{ marginBottom:14 }}>
                  <label style={lbl}>{label}</label>
                  {multiline
                    ? <textarea value={config[key]} onChange={e=>updateMeta(key,e.target.value)} rows={3} style={{ ...inp, resize:"none" }}/>
                    : <input    value={config[key]} onChange={e=>updateMeta(key,e.target.value)} style={inp}/>
                  }
                </div>
              ))}
            </div>

            {/* ── Color Theme ── */}
            <div style={{ background:"#0D1117", border:"1px solid #21262D", borderRadius:10, padding:14 }}>
              <p style={{ ...lbl, color:"#9ca3af", marginBottom:12 }}>🎨 Accent Color</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
                {Object.entries(PRESET_THEMES).map(([key,t])=>(
                  <button key={key} onClick={()=>{ updateMeta("theme",key); updateMeta("customColor",""); }} title={t.name}
                    style={{ width:30, height:30, borderRadius:"50%", border:config.theme===key&&!config.customColor?"3px solid white":"3px solid transparent", background:t.primary, cursor:"pointer", outline:"none", transform:config.theme===key&&!config.customColor?"scale(1.25)":"scale(1)", transition:"transform 0.2s" }}/>
                ))}
              </div>
              <label style={lbl}>Custom Hex Color</label>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <input type="color" value={config.customColor||PRESET_THEMES[config.theme]?.primary||"#F59E0B"} onChange={e=>updateMeta("customColor",e.target.value)}
                  style={{ width:42, height:42, borderRadius:8, border:"1px solid #21262D", cursor:"pointer", background:"transparent", padding:2, flexShrink:0 }}/>
                <input value={config.customColor} onChange={e=>updateMeta("customColor",e.target.value)} placeholder="#F59E0B"
                  style={{ ...inp, fontFamily:"monospace" }}/>
                {config.customColor && (
                  <button onClick={()=>updateMeta("customColor","")} style={{ fontSize:11, color:"#6b7280", background:"none", border:"none", cursor:"pointer", whiteSpace:"nowrap" }}>Clear</button>
                )}
              </div>
              <div style={{ marginTop:10, padding:"8px 12px", borderRadius:8, border:`1px solid ${theme.border}`, background:theme.light, display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:14, height:14, borderRadius:"50%", background:theme.primary }}/>
                <span style={{ fontSize:12, color:theme.primary }}>Active: {theme.primary}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const Preview = (
    <div style={{ background:"#080C10", border:"1px solid #21262D", borderRadius:14, overflow:"hidden", display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ padding:"10px 16px", borderBottom:"1px solid #21262D", display:"flex", alignItems:"center", gap:10, background:"#0D1117" }}>
        <div style={{ display:"flex", gap:5 }}>
          {["#ff5f57","#febc2e","#28c840"].map(c=><div key={c} style={{ width:10, height:10, borderRadius:"50%", background:c }}/>)}
        </div>
        <div style={{ flex:1, background:"#161B22", borderRadius:5, padding:"3px 10px", fontSize:11, color:"#4b5563" }}>form.yoursite.com</div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"28px 20px", background:"#0D1117", position:"relative" }}>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:"70%", height:180, background:`radial-gradient(ellipse,${theme.glow} 0%,transparent 70%)`, pointerEvents:"none" }}/>
        <div style={{ textAlign:"center", marginBottom:22, position:"relative" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 14px", borderRadius:999, background:theme.light, border:`1px solid ${theme.border}`, marginBottom:12 }}>
            <span style={{ fontSize:10, color:theme.primary, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase" }}>
              {config.badgeLabel || "Monthly Performance Review"} · {new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"})}
            </span>
          </div>
          <h2 style={{ color:"white", fontSize:20, fontWeight:"bold", margin:"0 0 8px", fontFamily:"var(--font-playfair)" }}>{config.title||"Untitled Form"}</h2>
          {config.quote && <p style={{ color:"#6b7280", fontSize:11, fontStyle:"italic", margin:0 }}>"{config.quote}"</p>}
          <div style={{ margin:"12px auto 0", width:48, height:1, background:`linear-gradient(90deg,transparent,${theme.primary},transparent)` }}/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
          {["Your Name *","Team Leader Name *"].map(l=>(
            <div key={l}>
              <p style={{ fontSize:10, color:"#9ca3af", margin:"0 0 4px" }}>{l}</p>
              <div style={{ background:"#161B22", border:"1px solid #21262D", borderRadius:7, padding:"6px 10px", color:"#374151", fontSize:11 }}>—</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, margin:"14px 0" }}>
          <div style={{ flex:1, height:1, background:"#21262D" }}/>
          <span style={{ fontSize:9, color:"#4b5563", textTransform:"uppercase", letterSpacing:"0.1em" }}>Questions</span>
          <div style={{ flex:1, height:1, background:"#21262D" }}/>
        </div>
        {config.fields.map((field,i)=>(
          <div key={field.id} style={{ background:"#161B22", border:"1px solid #21262D", borderRadius:9, padding:"10px 12px", marginBottom:7 }}>
            <p style={{ color:"#d1d5db", fontSize:11, margin:"0 0 7px", lineHeight:1.5 }}>
              <span style={{ color:theme.primary, fontWeight:700, marginRight:5 }}>{i+1}.</span>
              {field.label}
              {field.required && <span style={{ color:theme.primary, marginLeft:3 }}>*</span>}
            </p>
            {field.type==="rating"   && <div style={{ display:"flex", gap:5 }}>{[1,2,3,4,5].map(n=><div key={n} style={{ width:24,height:24,borderRadius:"50%",border:"1px solid #2d333b",background:"#0D1117",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#6b7280" }}>{n}</div>)}</div>}
            {field.type==="text"     && <div style={{ background:"#0D1117",border:"1px solid #21262D",borderRadius:5,padding:"5px 8px",color:"#374151",fontSize:10 }}>Short answer...</div>}
            {field.type==="textarea" && <div style={{ background:"#0D1117",border:"1px solid #21262D",borderRadius:5,padding:"7px 8px",color:"#374151",fontSize:10,minHeight:30 }}>Long answer...</div>}
            {field.type==="yesno"   && <div style={{ display:"flex",gap:6 }}>{["Yes","No"].map(o=><div key={o} style={{ padding:"3px 14px",border:"1px solid #21262D",borderRadius:999,fontSize:10,color:"#6b7280",background:"#0D1117" }}>{o}</div>)}</div>}
          </div>
        ))}
        <button style={{ width:"100%",padding:"10px 0",borderRadius:9,border:"none",background:theme.primary,color:"#000",fontSize:13,fontWeight:700,cursor:"default",marginTop:8 }}>Submit Review</button>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", gap:16 }}>
      
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div>
          <h3 style={{ color:"white", fontWeight:700, margin:0, fontSize:16 }}>Form Builder</h3>
          <p style={{ color:"#6b7280", fontSize:12, margin:"3px 0 0" }}>Drag to reorder · Click to edit · Live preview updates instantly</p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {isMobile && (
            <div style={{ display:"flex", background:"#0D1117", borderRadius:8, padding:2 }}>
              {[{id:"builder",label:"Builder"},{id:"preview",label:"Preview"}].map(p=>(
                <button key={p.id} onClick={()=>setActivePanel(p.id)} style={{ padding:"5px 12px", fontSize:11, borderRadius:6, border:"none", cursor:"pointer", background:activePanel===p.id?"#161B22":"transparent", color:activePanel===p.id?"white":"#6b7280" }}>{p.label}</button>
              ))}
            </div>
          )}
          <button onClick={reset} style={{ padding:"7px 14px", fontSize:12, color:"#6b7280", background:"transparent", border:"1px solid #21262D", borderRadius:9, cursor:"pointer" }}>Reset</button>
          <button onClick={save} style={{ padding:"7px 18px", fontSize:13, fontWeight:600, color:"#000", background:saved?"#16a34a":theme.primary, border:"none", borderRadius:9, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <Save size={14}/> {saved ? "Saved!" : editForm ? "Save & Return to Forms" : "Save & Publish"}
          </button>
        </div>
      </div>

      
      {!editForm && formsList.length > 0 && (
        <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <span style={{fontSize:13,color:"#9ca3af",fontWeight:500,whiteSpace:"nowrap"}}>📄 Editing:</span>
          <select
            value={targetFormId||""}
            onChange={e=>{
              setTargetFormId(e.target.value);
              const form=formsList.find(f=>f.id===e.target.value);
              if(form) setConfig({
                ...DEFAULT_CONFIG,
                title:form.name||"",
                description:form.description||"",
                quote:form.quote||DEFAULT_CONFIG.quote,
                badgeLabel:form.badgeLabel||DEFAULT_CONFIG.badgeLabel,
                theme:form.theme||"amber",
                customColor:form.customColor||"",
                fields:form.fields?.length?form.fields:DEFAULT_CONFIG.fields,
              });
            }}
            style={{flex:1,minWidth:220,background:"#0D1117",border:"1px solid #30363D",borderRadius:9,padding:"9px 14px",color:"white",fontSize:14,fontWeight:500,outline:"none",cursor:"pointer"}}>
            {formsList.map(f=>(
              <option key={f.id} value={f.id} style={{background:"#0D1117"}}>{f.name}{f.active?"":" (inactive)"}</option>
            ))}
          </select>
          <span style={{fontSize:11,color:"#4b5563",whiteSpace:"nowrap"}}>Switch forms without going back ✓</span>
        </div>
      )}

      {editForm && (
        <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:10,padding:"12px 18px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <p style={{color:"#F59E0B",fontSize:13,margin:0}}>✏️ Editing: <strong style={{color:"white"}}>{editForm.name}</strong></p>
          <button onClick={()=>onSaved&&onSaved()} style={{background:"none",border:"1px solid #21262D",borderRadius:8,cursor:"pointer",color:"#9ca3af",fontSize:12,padding:"5px 14px"}}>← Back to Forms</button>
        </div>
      )}
      {isMobile ? (
        <div style={{ flex:1, minHeight:500 }}>{activePanel==="builder" ? Builder : Preview}</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"400px 1fr", gap:20, flex:1, minHeight:0 }}>
          <div style={{ overflowY:"auto" }}>{Builder}</div>
          {Preview}
        </div>
      )}
    </div>
  );
}
