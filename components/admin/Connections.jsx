"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, X, ArrowRight, Check, Users } from "lucide-react";

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=34,tag}){
  const color=gc(name);
  return(
    <div style={{position:"relative",flexShrink:0}}>
      <div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color}}>
        {gi(name)}
      </div>
      {tag&&<span style={{position:"absolute",bottom:-2,right:-2,fontSize:8,background:tag==="Executive"?"#8B5CF6":"#3B82F6",color:"white",padding:"1px 4px",borderRadius:999,fontWeight:600,whiteSpace:"nowrap"}}>{tag==="Executive"?"EX":"ST"}</span>}
    </div>
  );
}

function ConfirmModal({title,message,confirmLabel="Delete",confirmColor="#ef4444",onConfirm,onClose}){
  useEffect(()=>{const h=e=>e.key==="Escape"&&onClose();window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)"}}/>
      <div style={{position:"relative",width:"min(400px,100%)",background:"linear-gradient(180deg,#12181F,#0D1117)",border:"1px solid #21262D",borderRadius:20,overflow:"hidden",boxShadow:"0 32px 100px rgba(0,0,0,0.7)"}}>
        <div style={{height:3,background:`linear-gradient(90deg,${confirmColor},${confirmColor}44,transparent)`}}/>
        <div style={{padding:"28px 28px 20px",textAlign:"center"}}>
          <div style={{width:52,height:52,borderRadius:14,background:confirmColor+"15",border:"1px solid "+confirmColor+"33",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:24}}>⚠️</div>
          <h3 style={{color:"white",fontWeight:700,margin:"0 0 8px",fontSize:17}}>{title}</h3>
          <p style={{color:"#6b7280",fontSize:13,margin:0,lineHeight:1.6}}>{message}</p>
        </div>
        <div style={{padding:"0 24px 24px",display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"11px 0",borderRadius:10,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:13,cursor:"pointer",transition:"all 0.2s"}} onMouseOver={e=>{e.currentTarget.style.background="#161B22";e.currentTarget.style.color="white";}} onMouseOut={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#6b7280";}}>Cancel</button>
          <button onClick={()=>{onConfirm();onClose();}} style={{flex:1,padding:"11px 0",borderRadius:10,border:"none",background:`linear-gradient(135deg,${confirmColor}cc,${confirmColor})`,color:"white",fontSize:13,fontWeight:700,cursor:"pointer"}}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Connection Modal ──────────────────────────────────────────────────────
function AddConnModal({allPeople,existing,onSave,onClose}){
  const [step,setStep]=useState(1);
  const [reviewer,setReviewer]=useState(null);
  const [reviewees,setReviewees]=useState([]);

  const toggle=p=>setReviewees(prev=>prev.find(x=>x.name===p.name)?prev.filter(x=>x.name!==p.name):[...prev,p]);
  const isSelected=p=>!!reviewees.find(x=>x.name===p.name);

  function doSave(){
    if(!reviewer||!reviewees.length)return;
    const ex=existing.find(c=>c.reviewerName===reviewer.name);
    const newNames=reviewees.map(r=>r.name);
    if(ex){
      const merged=[...new Set([...ex.revieweeNames,...newNames])];
      onSave({...ex,revieweeNames:merged,type:merged.length>1?"multi":"single"});
    } else {
      onSave({id:"conn_"+Date.now(),reviewerName:reviewer.name,reviewerTag:reviewer.tag,revieweeNames:newNames,reviewees:reviewees.map(r=>({name:r.name,tag:r.tag})),type:newNames.length>1?"multi":"single"});
    }
  }

  useEffect(()=>{const h=e=>e.key==="Escape"&&onClose();window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);

  return(
    <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)"}}/>
      <div style={{position:"relative",width:"min(580px,100%)",background:"linear-gradient(180deg,#12181F,#0D1117)",border:"1px solid #21262D",borderRadius:20,overflow:"hidden",boxShadow:"0 32px 100px rgba(0,0,0,0.7)",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
        <div style={{height:3,background:"linear-gradient(90deg,#F59E0B,#F59E0B44,transparent)"}}/>

        {/* Header */}
        <div style={{padding:"22px 24px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:38,height:38,borderRadius:10,background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🔗</div>
            <div>
              <h3 style={{color:"white",fontWeight:700,margin:0,fontSize:15}}>Add Connection</h3>
              <p style={{color:"#4b5563",fontSize:12,margin:"2px 0 0"}}>
                {step===1?"Step 1 of 2 — Select reviewer":"Step 2 of 2 — Select who they review"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,background:"#161B22",border:"1px solid #21262D",cursor:"pointer",color:"#6b7280",display:"flex",alignItems:"center",justifyContent:"center"}} onMouseOver={e=>e.currentTarget.style.color="white"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>✕</button>
        </div>

        {/* Progress */}
        <div style={{display:"flex",gap:0,borderBottom:"1px solid #21262D",flexShrink:0}}>
          {[{n:1,l:"Reviewer"},{n:2,l:"Reviewees"}].map(s=>(
            <div key={s.n} style={{flex:1,padding:"8px 0",textAlign:"center",background:step===s.n?"rgba(245,158,11,0.08)":"transparent",borderBottom:step===s.n?"2px solid #F59E0B":"2px solid transparent"}}>
              <span style={{fontSize:12,color:step===s.n?"#F59E0B":"#4b5563",fontWeight:step===s.n?600:400}}>{s.n}. {s.l}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{padding:"20px 24px",overflowY:"auto",flex:1}}>

          {/* Step 1: Pick reviewer */}
          {step===1&&(
            <div>
              <p style={{color:"#6b7280",fontSize:13,margin:"0 0 16px"}}>Who will be doing the review?</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
                {allPeople.map(p=>{
                  const sel=reviewer?.name===p.name;
                  const c=gc(p.name);
                  return(
                    <button key={p.name} onClick={()=>setReviewer(p)}
                      style={{padding:"12px 10px",borderRadius:12,border:`2px solid ${sel?c+"99":"#1C2333"}`,background:sel?c+"15":"#161B22",cursor:"pointer",textAlign:"left",transition:"all 0.15s",position:"relative"}}>
                      {sel&&<div style={{position:"absolute",top:8,right:8,width:18,height:18,borderRadius:"50%",background:c,display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={10} color="#000"/></div>}
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,textAlign:"center"}}>
                        <Av name={p.name} size={40} tag={p.tag}/>
                        <div>
                          <p style={{color:"white",fontSize:12,fontWeight:600,margin:0}}>{p.name.split(" ")[0]}</p>
                          <p style={{color:"#4b5563",fontSize:10,margin:"2px 0 0"}}>{p.name.split(" ")[1]||""}</p>
                          <span style={{display:"inline-block",marginTop:4,fontSize:9,color:p.tag==="Executive"?"#8B5CF6":"#3B82F6",background:p.tag==="Executive"?"rgba(139,92,246,0.12)":"rgba(59,130,246,0.12)",padding:"1px 6px",borderRadius:999,fontWeight:600}}>{p.tag}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Pick reviewees */}
          {step===2&&reviewer&&(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,padding:"10px 14px",background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10}}>
                <Av name={reviewer.name} size={32} tag={reviewer.tag}/>
                <div>
                  <p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{reviewer.name}</p>
                  <p style={{color:"#6b7280",fontSize:11,margin:"2px 0 0"}}>will review the selected people below</p>
                </div>
              </div>
              <p style={{color:"#6b7280",fontSize:13,margin:"0 0 14px"}}>
                Select one or multiple — <span style={{color:"#F59E0B"}}>currently selected: {reviewees.length}</span>
              </p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
                {allPeople.filter(p=>p.name!==reviewer.name).map(p=>{
                  const sel=isSelected(p);
                  const c=gc(p.name);
                  return(
                    <button key={p.name} onClick={()=>toggle(p)}
                      style={{padding:"12px 10px",borderRadius:12,border:`2px solid ${sel?c+"99":"#1C2333"}`,background:sel?c+"15":"#161B22",cursor:"pointer",textAlign:"left",transition:"all 0.15s",position:"relative"}}>
                      {sel&&<div style={{position:"absolute",top:8,right:8,width:18,height:18,borderRadius:"50%",background:c,display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={10} color="#000"/></div>}
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,textAlign:"center"}}>
                        <Av name={p.name} size={40} tag={p.tag}/>
                        <div>
                          <p style={{color:"white",fontSize:12,fontWeight:600,margin:0}}>{p.name.split(" ")[0]}</p>
                          <p style={{color:"#4b5563",fontSize:10,margin:"2px 0 0"}}>{p.name.split(" ")[1]||""}</p>
                          <span style={{display:"inline-block",marginTop:4,fontSize:9,color:p.tag==="Executive"?"#8B5CF6":"#3B82F6",background:p.tag==="Executive"?"rgba(139,92,246,0.12)":"rgba(59,130,246,0.12)",padding:"1px 6px",borderRadius:999,fontWeight:600}}>{p.tag}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Preview */}
              {reviewees.length>0&&(
                <div style={{marginTop:16,background:"#0D1117",border:"1px solid rgba(245,158,11,0.2)",borderRadius:12,padding:"14px 16px"}}>
                  <p style={{fontSize:11,color:"#6b7280",margin:"0 0 10px",textTransform:"uppercase",letterSpacing:"0.06em"}}>Connection Preview</p>
                  <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <Av name={reviewer.name} size={32} tag={reviewer.tag}/>
                      <p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{reviewer.name}</p>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,color:"#F59E0B",fontSize:12,fontWeight:600}}>
                      <ArrowRight size={14}/> reviews <ArrowRight size={14}/>
                    </div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {reviewees.map(r=>(
                        <div key={r.name} style={{display:"flex",alignItems:"center",gap:6}}>
                          <Av name={r.name} size={28} tag={r.tag}/>
                          <p style={{color:"white",fontSize:12,margin:0}}>{r.name.split(" ")[0]}</p>
                        </div>
                      ))}
                    </div>
                    <span style={{marginLeft:"auto",fontSize:11,color:reviewees.length>1?"#8B5CF6":"#3B82F6",background:reviewees.length>1?"rgba(139,92,246,0.12)":"rgba(59,130,246,0.12)",padding:"3px 10px",borderRadius:999,fontWeight:600}}>
                      {reviewees.length>1?"One → Many":"One → One"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:"16px 24px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:10,flexShrink:0}}>
          {step===2&&<button onClick={()=>setStep(1)} style={{padding:"11px 20px",borderRadius:10,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:13,cursor:"pointer",transition:"all 0.2s"}} onMouseOver={e=>{e.currentTarget.style.background="#161B22";e.currentTarget.style.color="white";}} onMouseOut={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#6b7280";}}>← Back</button>}
          <button onClick={onClose} style={{flex:1,padding:"11px 0",borderRadius:10,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:13,cursor:"pointer",transition:"all 0.2s"}} onMouseOver={e=>{e.currentTarget.style.background="#161B22";e.currentTarget.style.color="white";}} onMouseOut={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#6b7280";}}>Cancel</button>
          {step===1&&(
            <button onClick={()=>reviewer&&setStep(2)} disabled={!reviewer}
              style={{flex:2,padding:"11px 0",borderRadius:10,border:"none",background:reviewer?"linear-gradient(135deg,#D97706,#F59E0B)":"#21262D",color:reviewer?"#000":"#4b5563",fontSize:13,fontWeight:700,cursor:reviewer?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              Next: Select Reviewees →
            </button>
          )}
          {step===2&&(
            <button onClick={()=>reviewees.length&&doSave()} disabled={!reviewees.length}
              style={{flex:2,padding:"11px 0",borderRadius:10,border:"none",background:reviewees.length?"linear-gradient(135deg,#D97706,#F59E0B)":"#21262D",color:reviewees.length?"#000":"#4b5563",fontSize:13,fontWeight:700,cursor:reviewees.length?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <Check size={14}/> Save Connection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Connections Component ────────────────────────────────────────────────
export default function Connections({ defaultFormId }){
  const [forms,setForms]=useState([]);
  const [employees,setEmployees]=useState([]);
  const [executives,setExecutives]=useState([]);
  const [selectedFormId,setSelectedFormId]=useState(null);
  const [showModal,setShowModal]=useState(false);
  const [confirmState,setConfirmState]=useState(null);

  useEffect(()=>{
    const sf=localStorage.getItem("forms_list");
    const se=localStorage.getItem("employees");
    const sx=localStorage.getItem("executives");
    if(sf){try{const fl=JSON.parse(sf);setForms(fl);if(defaultFormId&&fl.find(f=>f.id===defaultFormId))setSelectedFormId(defaultFormId);else if(fl.length)setSelectedFormId(fl[0].id);}catch{}}
    if(se){try{setEmployees(JSON.parse(se));}catch{}}
    else{
      // Fallback defaults if employees not set up yet
      const defEmps=[
        {id:"e1",name:"Bob Smith",role:"Manager",department:"Engineering"},
        {id:"e2",name:"Sarah Chen",role:"Manager",department:"Design"},
        {id:"e3",name:"Alice Johnson",role:"Team Member",department:"Engineering"},
        {id:"e4",name:"Carlos Mendez",role:"Team Member",department:"Engineering"},
        {id:"e5",name:"Diana Lee",role:"Team Member",department:"Design"},
      ];
      setEmployees(defEmps);
    }
    if(sx){try{setExecutives(JSON.parse(sx));}catch{}}
  },[]);

  const selectedForm=forms.find(f=>f.id===selectedFormId);
  const connections=selectedForm?.connections||[];

  const allPeople=[
    ...employees.map(e=>({name:e.name,role:e.role,tag:"Staff"})),
    ...executives.map(e=>({name:e.name,role:e.role,tag:"Executive"})),
  ];

  function saveForms(updated){setForms(updated);localStorage.setItem("forms_list",JSON.stringify(updated));}

  function updateFormConns(conns){
    saveForms(forms.map(f=>f.id===selectedFormId?{...f,connections:conns}:f));
  }

  function handleSaveConn(conn){
    const ex=connections.find(c=>c.reviewerName===conn.reviewerName);
    updateFormConns(ex?connections.map(c=>c.reviewerName===conn.reviewerName?conn:c):[...connections,conn]);
    setShowModal(false);
  }

  function handleDeleteConn(id){
    setConfirmState({title:"Remove Connection",message:"This reviewer will no longer be assigned to review anyone on this form.",confirmLabel:"Remove",onConfirm:()=>updateFormConns(connections.filter(c=>c.id!==id))});
  }

  function handleRemoveReviewee(connId,name){
    const conn=connections.find(c=>c.id===connId);
    if(!conn)return;
    const newNames=conn.revieweeNames.filter(n=>n!==name);
    const newReviewees=(conn.reviewees||[]).filter(r=>r.name!==name);
    if(!newNames.length){updateFormConns(connections.filter(c=>c.id!==connId));return;}
    updateFormConns(connections.map(c=>c.id===connId?{...c,revieweeNames:newNames,reviewees:newReviewees,type:newNames.length>1?"multi":"single"}:c));
  }

  const totalConnections=forms.reduce((a,f)=>a+(f.connections?.length||0),0);
  const totalReviewees=forms.reduce((a,f)=>a+(f.connections?.reduce((b,c)=>b+c.revieweeNames.length,0)||0),0);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>Review Connections</h2>
          <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>Assign who reviews whom — per form. Staff and executives both supported.</p>
        </div>
        <button onClick={()=>setShowModal(true)} disabled={!selectedForm}
          style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,border:"none",background:selectedForm?"linear-gradient(135deg,#D97706,#F59E0B)":"#21262D",color:selectedForm?"#000":"#4b5563",fontSize:13,fontWeight:700,cursor:selectedForm?"pointer":"not-allowed"}}>
          <Plus size={16}/> Add Connection
        </button>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
        {[
          {l:"Total Forms",v:forms.length,c:"#F59E0B"},
          {l:"Connections",v:totalConnections,c:"#3B82F6"},
          {l:"Reviewees",v:totalReviewees,c:"#10B981"},
          {l:"People",v:allPeople.length,c:"#8B5CF6"},
        ].map(s=>(
          <div key={s.l} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}>
            <p style={{color:s.c,fontSize:22,fontWeight:800,margin:0}}>{s.v}</p>
            <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Form Tabs */}
      {forms.length>0&&(
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {forms.map(form=>{
            const color=form.customColor||{amber:"#F59E0B",blue:"#3B82F6",green:"#10B981",rose:"#F43F5E",violet:"#8B5CF6",cyan:"#06B6D4"}[form.theme]||"#F59E0B";
            const isSel=selectedFormId===form.id;
            return(
              <button key={form.id} onClick={()=>setSelectedFormId(form.id)}
                style={{padding:"8px 18px",borderRadius:10,border:`2px solid ${isSel?color+"88":"#21262D"}`,background:isSel?color+"15":"#161B22",color:isSel?color:"#6b7280",fontSize:13,fontWeight:isSel?600:400,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",gap:8}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:isSel?color:"#374151",display:"inline-block",boxShadow:isSel?`0 0 6px ${color}`:"none"}}/>
                {form.name}
                <span style={{fontSize:10,color:isSel?color+"99":"#374151",background:"#0D1117",padding:"1px 7px",borderRadius:999}}>{form.connections?.length||0}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Connections for selected form */}
      {selectedForm&&(
        <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,overflow:"hidden"}}>
          {/* Form header */}
          <div style={{padding:"16px 20px",borderBottom:"1px solid #21262D",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{selectedForm.name}</p>
              <p style={{color:"#6b7280",fontSize:12,margin:"3px 0 0"}}>{connections.length} connection{connections.length!==1?"s":""} · {connections.reduce((a,c)=>a+c.revieweeNames.length,0)} total reviewees</p>
            </div>
            <span style={{fontSize:11,color:selectedForm.active?"#22c55e":"#6b7280",background:selectedForm.active?"rgba(34,197,94,0.1)":"#21262D",padding:"4px 12px",borderRadius:999}}>{selectedForm.active?"Active":"Inactive"}</span>
          </div>

          {connections.length===0?(
            <div style={{textAlign:"center",padding:"52px 0",color:"#4b5563"}}>
              <p style={{fontSize:36,margin:"0 0 12px"}}>🔗</p>
              <p style={{fontSize:14,margin:0}}>No connections for this form yet.</p>
              <p style={{fontSize:12,margin:"4px 0 0"}}>Click "Add Connection" to assign reviewers.</p>
            </div>
          ):(
            <div style={{padding:16,display:"flex",flexDirection:"column",gap:12}}>
              {connections.map(conn=>{
                const rc=gc(conn.reviewerName);
                return(
                  <div key={conn.id} style={{background:"#0D1117",border:"1px solid #21262D",borderRadius:12,padding:16,display:"flex",alignItems:"flex-start",gap:14,flexWrap:"wrap",transition:"border-color 0.2s"}}
                    onMouseOver={e=>e.currentTarget.style.borderColor="#30363D"} onMouseOut={e=>e.currentTarget.style.borderColor="#21262D"}>

                    {/* Reviewer */}
                    <div style={{display:"flex",alignItems:"center",gap:10,minWidth:160}}>
                      <Av name={conn.reviewerName} size={44} tag={conn.reviewerTag}/>
                      <div>
                        <p style={{color:"white",fontSize:13,fontWeight:700,margin:0}}>{conn.reviewerName}</p>
                        <span style={{fontSize:10,color:conn.reviewerTag==="Executive"?"#8B5CF6":"#3B82F6",background:conn.reviewerTag==="Executive"?"rgba(139,92,246,0.1)":"rgba(59,130,246,0.1)",padding:"2px 8px",borderRadius:999,fontWeight:600}}>{conn.reviewerTag||"Staff"}</span>
                      </div>
                    </div>

                    {/* Arrow + type */}
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,paddingTop:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,color:"#F59E0B",fontSize:11,fontWeight:600}}>
                        <ArrowRight size={14}/>
                        <span style={{color:"#4b5563",fontWeight:400}}>reviews</span>
                        <ArrowRight size={14}/>
                      </div>
                      <span style={{fontSize:9,color:conn.type==="multi"?"#8B5CF6":"#3B82F6",background:conn.type==="multi"?"rgba(139,92,246,0.12)":"rgba(59,130,246,0.12)",padding:"2px 7px",borderRadius:999,fontWeight:600}}>
                        {conn.type==="multi"?"ONE → MANY":"ONE → ONE"}
                      </span>
                    </div>

                    {/* Reviewees */}
                    <div style={{flex:1,display:"flex",flexWrap:"wrap",gap:8}}>
                      {conn.revieweeNames.map((name,i)=>{
                        const nt=conn.reviewees?.[i]?.tag||"Staff";
                        const nc=gc(name);
                        return(
                          <div key={name} style={{display:"flex",alignItems:"center",gap:8,background:"#161B22",border:`1px solid ${nc}33`,borderRadius:10,padding:"8px 12px"}}>
                            <Av name={name} size={28} tag={nt}/>
                            <div>
                              <p style={{color:"white",fontSize:12,fontWeight:600,margin:0}}>{name}</p>
                              <p style={{color:"#4b5563",fontSize:9,margin:0}}>{nt}</p>
                            </div>
                            <button onClick={()=>handleRemoveReviewee(conn.id,name)} style={{background:"none",border:"none",cursor:"pointer",color:"#374151",padding:2,marginLeft:2,display:"flex",transition:"color 0.15s"}}
                              onMouseOver={e=>e.currentTarget.style.color="#ef4444"} onMouseOut={e=>e.currentTarget.style.color="#374151"}>
                              <X size={12}/>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Delete */}
                    <button onClick={()=>handleDeleteConn(conn.id)}
                      style={{background:"none",border:"1px solid #21262D",borderRadius:8,cursor:"pointer",color:"#6b7280",padding:"7px 10px",display:"flex",alignItems:"center",gap:5,fontSize:12,transition:"all 0.2s"}}
                      onMouseOver={e=>{e.currentTarget.style.borderColor="rgba(239,68,68,0.4)";e.currentTarget.style.color="#ef4444";}}
                      onMouseOut={e=>{e.currentTarget.style.borderColor="#21262D";e.currentTarget.style.color="#6b7280";}}>
                      <Trash2 size={13}/> Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {forms.length===0&&(
        <div style={{textAlign:"center",padding:"60px 0",color:"#4b5563",background:"#161B22",borderRadius:12,border:"1px solid #21262D"}}>
          <p style={{fontSize:32,margin:"0 0 12px"}}>📄</p>
          <p style={{fontSize:14,margin:0}}>No forms yet. Create a form first in the Forms tab.</p>
        </div>
      )}

      {showModal&&<AddConnModal allPeople={allPeople} existing={connections} onSave={handleSaveConn} onClose={()=>setShowModal(false)}/>}
      {confirmState&&<ConfirmModal {...confirmState} onClose={()=>setConfirmState(null)}/>}
    </div>
  );
}
