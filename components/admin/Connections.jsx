"use client";
import { getForms, getPeople, saveForms as sheetSaveForms } from "@/lib/sheets";
import { useState, useEffect } from "react";
import { Plus, Trash2, X, ArrowRight, Check } from "lucide-react";

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=34,tag}){
  const color=gc(name);
  return(
    <div style={{position:"relative",flexShrink:0}}>
      <div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color}}>{gi(name)}</div>
      {tag&&tag.length>0&&<span style={{position:"absolute",bottom:-2,right:-4,fontSize:7,background:"#161B22",border:"1px solid #21262D",color:"#9ca3af",padding:"1px 5px",borderRadius:999,fontWeight:600,whiteSpace:"nowrap",maxWidth:60,overflow:"hidden",textOverflow:"ellipsis"}}>{tag.split(",")[0]}</span>}
    </div>
  );
}

function AddConnModal({allPeople,existingPool,existingConns,editingConn,onSave,onClose}){
  const [phase,setPhase]=useState(editingConn?3:existingPool.length>0?2:1);
  const [pool,setPool]=useState(existingPool);
  const [reviewer,setReviewer]=useState(editingConn?allPeople.find(p=>p.name===editingConn.reviewerName)||{name:editingConn.reviewerName,email:editingConn.reviewerEmail||""}:null);
  const [reviewees,setReviewees]=useState(editingConn?(editingConn.reviewees||editingConn.revieweeNames.map(n=>({name:n,email:""}))):[] );
  const [savedConns,setSavedConns]=useState(existingConns);
  useEffect(()=>{const h=e=>e.key==="Escape"&&onClose();window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);
  const togglePool=p=>setPool(prev=>prev.find(x=>x.name===p.name)?prev.filter(x=>x.name!==p.name):[...prev,p]);
  const toggleReviewee=p=>setReviewees(prev=>prev.find(x=>x.name===p.name)?prev.filter(x=>x.name!==p.name):[...prev,p]);
  const isInPool=p=>!!pool.find(x=>x.name===p.name);
  const isReviewee=p=>!!reviewees.find(x=>x.name===p.name);
  const hasConn=name=>!!savedConns.find(c=>c.reviewerName===name);

  function saveConnection(){
    if(!reviewer||!reviewees.length)return;
    const ex=savedConns.find(c=>c.reviewerName===reviewer.name);
    const newNames=reviewees.map(r=>r.name);
    let updated;
    if(ex){
      const merged=[...new Set([...ex.revieweeNames,...newNames])];
      updated=savedConns.map(c=>c.reviewerName===reviewer.name?{...c,revieweeNames:merged,reviewees:[...new Map([...(c.reviewees||[]),...reviewees].map(r=>[r.name,r])).values()],type:merged.length>1?"multi":"single"}:c);
    }else{
      updated=[...savedConns,{id:"conn_"+Date.now(),reviewerName:reviewer.name,reviewerEmail:reviewer.email||"",revieweeNames:newNames,reviewees,type:newNames.length>1?"multi":"single"}];
    }
    setSavedConns(updated);
    setReviewer(null);setReviewees([]);setPhase(2);
  }

  function finish(){onSave({pool,connections:savedConns});}

  const phaseLabels=["1. Form Fillers","2. Pick Reviewer","3. Who They Review"];
  return(
    <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)"}}/>
      <div style={{position:"relative",width:"min(620px,100%)",background:"linear-gradient(180deg,#12181F,#0D1117)",border:"1px solid #21262D",borderRadius:20,overflow:"hidden",boxShadow:"0 32px 100px rgba(0,0,0,0.7)",maxHeight:"92vh",display:"flex",flexDirection:"column"}}>
        <div style={{height:3,background:"linear-gradient(90deg,#F59E0B,#F59E0B66,transparent)"}}/>
        <div style={{padding:"20px 24px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:38,height:38,borderRadius:10,background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🔗</div>
            <div>
              <h3 style={{color:"white",fontWeight:700,margin:0,fontSize:15}}>Set Up Connection</h3>
              <p style={{color:"#4b5563",fontSize:12,margin:"2px 0 0"}}>{phaseLabels[phase-1]}</p>
            </div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,background:"#161B22",border:"1px solid #21262D",cursor:"pointer",color:"#6b7280",display:"flex",alignItems:"center",justifyContent:"center"}} onMouseOver={e=>e.currentTarget.style.color="white"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>✕</button>
        </div>
        <div style={{display:"flex",borderBottom:"1px solid #21262D",flexShrink:0}}>
          {phaseLabels.map((label,i)=>{const p=i+1;const done=p<phase;const active=p===phase;return(<button key={p} onClick={()=>p<=phase&&setPhase(p)} style={{flex:1,padding:"10px 0",fontSize:11,fontWeight:active?600:400,cursor:p<=phase?"pointer":"not-allowed",background:active?"rgba(245,158,11,0.06)":"transparent",color:done?"#22c55e":active?"#F59E0B":"#4b5563",border:"none",borderBottom:active?"2px solid #F59E0B":done?"2px solid #22c55e44":"2px solid transparent"}}>{done?"✓ "+label:label}</button>);})}
        </div>
        <div style={{padding:"20px 24px",overflowY:"auto",flex:1}}>
          {phase===1&&(
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <p style={{color:"#9ca3af",fontSize:13,margin:0}}>Who will fill this form? <span style={{color:"#F59E0B",fontWeight:600}}>{pool.length} selected</span></p>
                {pool.length>0&&<button onClick={()=>setPool([])} style={{fontSize:11,color:"#6b7280",background:"none",border:"none",cursor:"pointer"}}>Clear all</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:10}}>
                {allPeople.map(p=>{const sel=isInPool(p);const c=gc(p.name);return(
                  <button key={p.name} onClick={()=>togglePool(p)} style={{padding:"12px 10px",borderRadius:12,border:"2px solid "+(sel?c+"99":"#1C2333"),background:sel?c+"15":"#161B22",cursor:"pointer",textAlign:"center",transition:"all 0.15s",position:"relative"}}>
                    {sel&&<div style={{position:"absolute",top:6,right:6,width:18,height:18,borderRadius:"50%",background:c,display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={10} color="#000"/></div>}
                    <button onClick={e=>{e.stopPropagation();setPool(prev=>prev.filter(x=>x.name!==p.name));if(reviewer?.name===p.name)setReviewer(null);}} style={{position:"absolute",top:-4,left:-4,width:16,height:16,borderRadius:"50%",background:"#ef4444",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}><X size={9} color="white"/></button>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                      <Av name={p.name} size={38} tag={p.tag}/>
                      <div><p style={{color:"white",fontSize:11,fontWeight:600,margin:0}}>{p.name.split(" ")[0]}</p><span style={{display:"inline-block",marginTop:3,fontSize:9,color:"#6b7280",background:"#21262D",padding:"1px 5px",borderRadius:999}}>{(p.designations||[])[0]||"Staff"}</span></div>
                    </div>
                  </button>
                );})}
              </div>
            </div>
          )}
          {phase===2&&(
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <p style={{color:"#9ca3af",fontSize:13,margin:0}}>Pick one person who will do a review</p>
                <button onClick={()=>setPhase(1)} style={{fontSize:11,color:"#6b7280",background:"none",border:"1px solid #21262D",borderRadius:6,padding:"3px 10px",cursor:"pointer"}}>Edit Pool ({pool.length})</button>
              </div>
              {savedConns.length>0&&(
                <div style={{background:"#0D1117",border:"1px solid #21262D",borderRadius:10,padding:12,marginBottom:16}}>
                  <p style={{fontSize:11,color:"#6b7280",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:"0.06em"}}>Set up ({savedConns.length})</p>
                  {savedConns.map(c=>(
                    <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <Av name={c.reviewerName} size={22}/><p style={{color:"#22c55e",fontSize:12,margin:0}}>{c.reviewerName}</p>
                      <span style={{color:"#4b5563",fontSize:11}}>→</span><p style={{color:"#9ca3af",fontSize:12,margin:0}}>{c.revieweeNames.join(", ")}</p>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:10}}>
                {pool.map(p=>{const sel=reviewer?.name===p.name;const done=hasConn(p.name);const c=gc(p.name);return(
                  <div key={p.name} onClick={()=>setReviewer(p)} style={{padding:"12px 10px",borderRadius:12,border:"2px solid "+(sel?c+"99":done?"#22c55e33":"#1C2333"),background:sel?c+"15":done?"rgba(34,197,94,0.05)":"#161B22",cursor:"pointer",textAlign:"center",transition:"all 0.15s",position:"relative"}}>
                    {sel&&<div style={{position:"absolute",top:6,right:6,width:18,height:18,borderRadius:"50%",background:c,display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={10} color="#000"/></div>}
                    {done&&!sel&&<div style={{position:"absolute",top:6,right:6,width:18,height:18,borderRadius:"50%",background:"#22c55e",display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={10} color="#000"/></div>}
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                      <Av name={p.name} size={38} tag={p.tag}/>
                      <div><p style={{color:"white",fontSize:11,fontWeight:600,margin:0}}>{p.name.split(" ")[0]}</p><span style={{display:"inline-block",marginTop:3,fontSize:9,color:done?"#22c55e":"#4b5563"}}>{done?"✓ Set":"Pending"}</span></div>
                    </div>
                  </div>
                );})}
              </div>
            </div>
          )}
          {phase===3&&reviewer&&(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,padding:"10px 14px",background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10}}>
                <Av name={reviewer.name} size={32}/><div><p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{reviewer.name}</p><p style={{color:"#6b7280",fontSize:11,margin:"2px 0 0"}}>will review the selected people</p></div>
                <span style={{marginLeft:"auto",fontSize:11,color:"#F59E0B",fontWeight:600}}>{reviewees.length} selected</span>
              </div>
              <p style={{color:"#9ca3af",fontSize:13,margin:"0 0 14px"}}>Select who they will review (staff only, not themselves):</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:10}}>
                {allPeople.filter(p=>p.name!==reviewer.name&&!(p.designations||[]).includes&&!((p.designations||[]).some?.(d=>d==="Executive"))).map(p=>{
                  const sel=isReviewee(p);const c=gc(p.name);
                  return(
                    <button key={p.name} onClick={()=>toggleReviewee(p)} style={{padding:"12px 10px",borderRadius:12,border:"2px solid "+(sel?c+"99":"#1C2333"),background:sel?c+"15":"#161B22",cursor:"pointer",textAlign:"center",transition:"all 0.15s",position:"relative"}}>
                      {sel&&<div style={{position:"absolute",top:6,right:6,width:18,height:18,borderRadius:"50%",background:c,display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={10} color="#000"/></div>}
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                        <Av name={p.name} size={38} tag={p.tag}/>
                        <div><p style={{color:"white",fontSize:11,fontWeight:600,margin:0}}>{p.name.split(" ")[0]}</p></div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {reviewees.length>0&&(
                <div style={{marginTop:16,background:"#0D1117",border:"1px solid rgba(245,158,11,0.2)",borderRadius:12,padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}><Av name={reviewer.name} size={30}/><p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{reviewer.name}</p></div>
                    <span style={{color:"#F59E0B",fontSize:12,fontWeight:600}}>→ reviews →</span>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{reviewees.map(r=><div key={r.name} style={{display:"flex",alignItems:"center",gap:5}}><Av name={r.name} size={26}/><p style={{color:"white",fontSize:12,margin:0}}>{r.name.split(" ")[0]}</p></div>)}</div>
                    <span style={{marginLeft:"auto",fontSize:10,color:reviewees.length>1?"#8B5CF6":"#3B82F6",background:reviewees.length>1?"rgba(139,92,246,0.12)":"rgba(59,130,246,0.12)",padding:"2px 8px",borderRadius:999,fontWeight:600}}>{reviewees.length>1?"ONE → MANY":"ONE → ONE"}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{padding:"16px 24px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:10,flexShrink:0}}>
          {phase===1&&(<><button onClick={onClose} style={{flex:1,padding:"11px 0",borderRadius:10,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:13,cursor:"pointer"}}>Cancel</button><button onClick={()=>pool.length>0&&setPhase(2)} disabled={!pool.length} style={{flex:2,padding:"11px 0",borderRadius:10,border:"none",background:pool.length?"linear-gradient(135deg,#D97706,#F59E0B)":"#21262D",color:pool.length?"#000":"#4b5563",fontSize:13,fontWeight:700,cursor:pool.length?"pointer":"not-allowed"}}>Continue →</button></>)}
          {phase===2&&(<><button onClick={()=>setPhase(1)} style={{padding:"11px 20px",borderRadius:10,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:13,cursor:"pointer"}}>← Back</button><button onClick={()=>reviewer&&setPhase(3)} disabled={!reviewer} style={{flex:2,padding:"11px 0",borderRadius:10,border:"none",background:reviewer?"linear-gradient(135deg,#D97706,#F59E0B)":"#21262D",color:reviewer?"#000":"#4b5563",fontSize:13,fontWeight:700,cursor:reviewer?"pointer":"not-allowed"}}>Select Who They Review →</button><button onClick={finish} style={{flex:1,padding:"11px 0",borderRadius:10,border:"none",background:"#22c55e",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>Finish ✓</button></>)}
          {phase===3&&(<><button onClick={()=>setPhase(2)} style={{padding:"11px 20px",borderRadius:10,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:13,cursor:"pointer"}}>← Back</button><button onClick={()=>reviewees.length&&saveConnection()} disabled={!reviewees.length} style={{flex:2,padding:"11px 0",borderRadius:10,border:"none",background:reviewees.length?"linear-gradient(135deg,#D97706,#F59E0B)":"#21262D",color:reviewees.length?"#000":"#4b5563",fontSize:13,fontWeight:700,cursor:reviewees.length?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Check size={14}/> Save Connection</button></>)}
        </div>
      </div>
    </div>
  );
}

export default function Connections({defaultFormId}){
  const [forms,setForms]=useState([]);
  const [people,setPeople]=useState([]);
  const [selectedFormId,setSelectedFormId]=useState(null);
  const [showModal,setShowModal]=useState(false);
  const [editingConn,setEditingConn]=useState(null);

  useEffect(()=>{
    getForms().then(fl=>{
      setForms(fl);
      if(defaultFormId&&fl.find(f=>f.id===defaultFormId))setSelectedFormId(defaultFormId);
      else if(fl.length)setSelectedFormId(fl[0].id);
    });
    getPeople().then(p=>setPeople(p));
  },[defaultFormId]);

  const selectedForm=forms.find(f=>f.id===selectedFormId);
  const connections=selectedForm?.connections||[];
  const fillerPool=selectedForm?.fillerPool||[];
  const allPeople=people.map(p=>({name:p.name,email:p.email||"",designations:p.designations||[],tag:(p.designations||[]).join(", ")||""}));

  async function persistForms(updated){
    setForms(updated);
    await sheetSaveForms(updated);
  }

  function handleSave({pool,connections:conns}){
    const updated=forms.map(f=>f.id===selectedFormId?{...f,fillerPool:pool,connections:conns}:f);
    persistForms(updated);
    setShowModal(false);
    setEditingConn(null);
  }

  function handleEditConn(conn){setShowModal(true);setEditingConn(conn);}

  function handleDeleteConn(id){
    const updated=forms.map(f=>f.id===selectedFormId?{...f,connections:connections.filter(c=>c.id!==id)}:f);
    persistForms(updated);
  }

  function handleRemoveReviewee(connId,name){
    const conn=connections.find(c=>c.id===connId);if(!conn)return;
    const newNames=conn.revieweeNames.filter(n=>n!==name);
    const newReviewees=(conn.reviewees||[]).filter(r=>r.name!==name);
    if(!newNames.length){handleDeleteConn(connId);return;}
    const updated=forms.map(f=>f.id===selectedFormId?{...f,connections:connections.map(c=>c.id===connId?{...c,revieweeNames:newNames,reviewees:newReviewees,type:newNames.length>1?"multi":"single"}:c)}:f);
    persistForms(updated);
  }

  const totalConns=forms.reduce((a,f)=>a+(f.connections?.length||0),0);
  const totalReviewees=forms.reduce((a,f)=>a+(f.connections?.reduce((b,c)=>b+c.revieweeNames.length,0)||0),0);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>Review Connections</h2>
          <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>3-phase setup: pick form fillers → assign reviewer → pick who they evaluate</p>
        </div>
        <button onClick={()=>setShowModal(true)} disabled={!selectedForm} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,border:"none",background:selectedForm?"linear-gradient(135deg,#D97706,#F59E0B)":"#21262D",color:selectedForm?"#000":"#4b5563",fontSize:13,fontWeight:700,cursor:selectedForm?"pointer":"not-allowed"}}>
          <Plus size={16}/> {fillerPool.length>0?"Add Connection":"Set Up Connections"}
        </button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
        {[{l:"Forms",v:forms.length,c:"#F59E0B"},{l:"Connections",v:totalConns,c:"#3B82F6"},{l:"Reviewees",v:totalReviewees,c:"#10B981"},{l:"People",v:allPeople.length,c:"#8B5CF6"}].map(s=>(
          <div key={s.l} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}>
            <p style={{color:s.c,fontSize:22,fontWeight:800,margin:0}}>{s.v}</p>
            <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>{s.l}</p>
          </div>
        ))}
      </div>
      {forms.length>0&&(
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {forms.map(form=>{
            const color=form.customColor||{amber:"#F59E0B",blue:"#3B82F6",green:"#10B981",rose:"#F43F5E",violet:"#8B5CF6",cyan:"#06B6D4"}[form.theme]||"#F59E0B";
            const isSel=selectedFormId===form.id;
            return(
              <button key={form.id} onClick={()=>setSelectedFormId(form.id)} style={{padding:"8px 18px",borderRadius:10,border:"2px solid "+(isSel?color+"88":"#21262D"),background:isSel?color+"15":"#161B22",color:isSel?color:"#6b7280",fontSize:13,fontWeight:isSel?600:400,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",gap:8}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:isSel?color:"#374151",display:"inline-block"}}/>
                {form.name}
                <span style={{fontSize:10,color:isSel?color+"99":"#374151",background:"#0D1117",padding:"1px 7px",borderRadius:999}}>{form.connections?.length||0}</span>
              </button>
            );
          })}
        </div>
      )}
      {selectedForm&&(
        <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,overflow:"hidden"}}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid #21262D",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{selectedForm.name}</p>
              <p style={{color:"#6b7280",fontSize:12,margin:"3px 0 0"}}>{connections.length} connection{connections.length!==1?"s":""} · Pool: {fillerPool.length} filler{fillerPool.length!==1?"s":""}</p>
            </div>
            {fillerPool.length>0&&<div style={{display:"flex",gap:6}}>{fillerPool.map(p=><Av key={p.name} name={p.name} size={28} tag={p.tag}/>)}</div>}
          </div>
          {connections.length===0?(
            <div style={{textAlign:"center",padding:"52px 0",color:"#4b5563"}}>
              <p style={{fontSize:36,margin:"0 0 12px"}}>🔗</p>
              <p style={{fontSize:14,margin:0}}>No connections yet. Click "Set Up Connections" to begin.</p>
            </div>
          ):(
            <div style={{padding:16,display:"flex",flexDirection:"column",gap:12}}>
              {connections.map(conn=>{
                return(
                  <div key={conn.id} onClick={()=>handleEditConn(conn)} style={{position:"relative",display:"flex",alignItems:"flex-start",gap:14,padding:16,background:"#0D1117",border:"1px solid #21262D",borderRadius:12,flexWrap:"wrap",transition:"all 0.2s",cursor:"pointer"}}
                    onMouseOver={e=>{e.currentTarget.style.borderColor="#F59E0B44";}} onMouseOut={e=>{e.currentTarget.style.borderColor="#21262D";}}>
                    <div style={{position:"absolute",top:10,right:48,fontSize:10,color:"#4b5563"}}>click to edit</div>
                    <div style={{display:"flex",alignItems:"center",gap:10,minWidth:160}}>
                      <Av name={conn.reviewerName} size={44}/>
                      <div>
                        <p style={{color:"white",fontSize:13,fontWeight:700,margin:0}}>{conn.reviewerName}</p>
                        {conn.reviewerEmail&&<p style={{color:"#4b5563",fontSize:11,margin:"2px 0 0"}}>{conn.reviewerEmail}</p>}
                        <span style={{fontSize:10,color:conn.type==="multi"?"#8B5CF6":"#3B82F6",background:conn.type==="multi"?"rgba(139,92,246,0.12)":"rgba(59,130,246,0.12)",padding:"2px 8px",borderRadius:999,fontWeight:600}}>{conn.type==="multi"?"ONE → MANY":"ONE → ONE"}</span>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,color:"#F59E0B",fontSize:12,paddingTop:10}}><ArrowRight size={14}/> reviews <ArrowRight size={14}/></div>
                    <div style={{flex:1,display:"flex",flexWrap:"wrap",gap:8}}>
                      {conn.revieweeNames.map((name,i)=>{
                        const nc=gc(name);const nt=conn.reviewees?.[i]?.tag||"Staff";
                        return(
                          <div key={name} style={{display:"flex",alignItems:"center",gap:8,background:"#161B22",border:"1px solid "+nc+"33",borderRadius:10,padding:"8px 12px"}}>
                            <Av name={name} size={28} tag={nt}/>
                            <div><p style={{color:"white",fontSize:12,fontWeight:600,margin:0}}>{name}</p></div>
                            <button onClick={e=>{e.stopPropagation();handleRemoveReviewee(conn.id,name);}} style={{background:"none",border:"none",cursor:"pointer",color:"#374151",padding:2,marginLeft:2,display:"flex",transition:"color 0.15s"}} onMouseOver={e=>e.currentTarget.style.color="#ef4444"} onMouseOut={e=>e.currentTarget.style.color="#374151"}><X size={12}/></button>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={e=>{e.stopPropagation();handleDeleteConn(conn.id);}} style={{background:"none",border:"1px solid #21262D",borderRadius:8,cursor:"pointer",color:"#6b7280",padding:"7px 10px",display:"flex",alignItems:"center",gap:5,fontSize:12,transition:"all 0.2s"}} onMouseOver={e=>{e.currentTarget.style.borderColor="rgba(239,68,68,0.4)";e.currentTarget.style.color="#ef4444";}} onMouseOut={e=>{e.currentTarget.style.borderColor="#21262D";e.currentTarget.style.color="#6b7280";}}><Trash2 size={13}/> Remove</button>
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
      {showModal&&<AddConnModal allPeople={allPeople} existingPool={fillerPool} existingConns={connections} editingConn={editingConn} onSave={handleSave} onClose={()=>{setShowModal(false);setEditingConn(null);}}/>}
    </div>
  );
}