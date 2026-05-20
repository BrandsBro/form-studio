"use client";
import { getForms, getPeople, getSubmissions, getMarkingConfig, getReReview, saveReReview, deleteReReview } from "@/lib/sheets";
import { useState, useEffect } from "react";
import { Settings, Save, Trash2, ChevronDown, ChevronUp } from "lucide-react";

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=36}){const color=gc(name);return<div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}
function Skel({w="100%",h=20,r=8}){return<div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#161B22 25%,#21262D 50%,#161B22 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>;}

function getReviewerScore(reviewerEmail,personName,formId,formFields,allSubs){
  const sub=(allSubs[formId]||[]).find(s=>s.personName===personName&&s.reviewerEmail===reviewerEmail);
  if(!sub) return null;
  const rFields=formFields.filter(f=>f.type==="rating");
  if(!rFields.length) return null;
  return rFields.map(f=>sub.values?.[f.id]||0).reduce((a,b)=>a+b,0)/rFields.length;
}

// Replacement form selector - used by both TL and TM
function ReplacementSelector({personName,type,flaggedFormId,flaggedFormName,flaggedWeight,allForms,existingSave,onSave,onDelete}){
  const [r1,setR1]=useState(existingSave?.replace1Id||"");
  const [r1pct,setR1pct]=useState(existingSave?.replace1Pct||0);
  const [r2,setR2]=useState(existingSave?.replace2Id||"");
  const [r2pct,setR2pct]=useState(existingSave?.replace2Pct||0);
  const [saving,setSaving]=useState(false);
  const total=r1pct+r2pct;
  const valid=r1&&r2&&r1!==r2&&total===flaggedWeight;
  const avail=allForms.filter(f=>f.id!==flaggedFormId);

  async function doSave(){
    setSaving(true);
    await onSave({personName,type,flaggedFormId,flaggedFormName,
      replace1Id:r1,replace1Name:allForms.find(f=>f.id===r1)?.name||"",replace1Pct:r1pct,
      replace2Id:r2,replace2Name:allForms.find(f=>f.id===r2)?.name||"",replace2Pct:r2pct});
    setSaving(false);
  }

  return(
    <div style={{background:"#0D1117",border:"1px solid #21262D",borderRadius:12,padding:16,display:"flex",flexDirection:"column",gap:12}}>
      <p style={{color:"#9ca3af",fontSize:12,margin:0}}>
        Split <span style={{color:"#F59E0B",fontWeight:700}}>{flaggedWeight}%</span> weight of <span style={{color:"#ef4444",fontWeight:600}}>{flaggedFormName}</span> into 2 replacement forms:
      </p>
      {/* Replace Form 1 */}
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <select value={r1} onChange={e=>setR1(e.target.value)}
          style={{flex:1,background:"#161B22",border:"1px solid #21262D",borderRadius:8,padding:"8px 12px",color:r1?"white":"#6b7280",fontSize:13,outline:"none"}}>
          <option value="">Replacement form 1</option>
          {avail.filter(f=>f.id!==r2).map(f=><option key={f.id} value={f.id} style={{background:"#161B22"}}>{f.name}</option>)}
        </select>
        <input type="number" value={r1pct} min="0" max="100"
          onChange={e=>setR1pct(Math.min(100,Math.max(0,parseInt(e.target.value)||0)))}
          style={{width:56,background:"#161B22",border:"1px solid #21262D",borderRadius:7,padding:"8px",color:"white",fontSize:13,outline:"none",textAlign:"center"}}/>
        <span style={{color:"#6b7280",fontSize:13}}>%</span>
      </div>
      {/* Replace Form 2 */}
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <select value={r2} onChange={e=>setR2(e.target.value)}
          style={{flex:1,background:"#161B22",border:"1px solid #21262D",borderRadius:8,padding:"8px 12px",color:r2?"white":"#6b7280",fontSize:13,outline:"none"}}>
          <option value="">Replacement form 2</option>
          {avail.filter(f=>f.id!==r1).map(f=><option key={f.id} value={f.id} style={{background:"#161B22"}}>{f.name}</option>)}
        </select>
        <input type="number" value={r2pct} min="0" max="100"
          onChange={e=>setR2pct(Math.min(100,Math.max(0,parseInt(e.target.value)||0)))}
          style={{width:56,background:"#161B22",border:"1px solid #21262D",borderRadius:7,padding:"8px",color:"white",fontSize:13,outline:"none",textAlign:"center"}}/>
        <span style={{color:"#6b7280",fontSize:13}}>%</span>
      </div>
      {/* Footer */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <span style={{fontSize:12,color:total===flaggedWeight?"#22c55e":total>flaggedWeight?"#ef4444":"#F59E0B"}}>
          {total===flaggedWeight?`✓ ${total}% = ${flaggedWeight}% `:total>flaggedWeight?`${total}% over by ${total-flaggedWeight}%`:`${total}% / ${flaggedWeight}% needed`}
        </span>
        <div style={{display:"flex",gap:8}}>
          {existingSave&&(
            <button onClick={()=>onDelete({personName,flaggedFormId})}
              style={{padding:"7px 12px",borderRadius:8,border:"1px solid rgba(239,68,68,0.3)",background:"transparent",color:"#ef4444",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
              <Trash2 size={12}/> Remove
            </button>
          )}
          <button onClick={doSave} disabled={!valid||saving}
            style={{padding:"7px 16px",borderRadius:8,border:"none",background:valid&&!saving?"linear-gradient(135deg,#D97706,#F59E0B)":"#21262D",color:valid&&!saving?"#000":"#4b5563",fontSize:12,fontWeight:700,cursor:valid&&!saving?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:5}}>
            {saving?<svg style={{width:12,height:12,animation:"spin 1s linear infinite"}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>:<Save size={12}/>}
            {saving?"Saving...":"Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReReview(){
  const [forms,setForms]=useState([]);
  const [allSubs,setAllSubs]=useState({});
  const [people,setPeople]=useState([]);
  const [config,setConfig]=useState({teamMembers:{forms:[]},teamLeaders:{forms:[]}});
  const [rrData,setRrData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [threshold,setThreshold]=useState(60);
  const [editThreshold,setEditThreshold]=useState(false);
  const [selectedFormId,setSelectedFormId]=useState("");
  const [flagged,setFlagged]=useState({});
  const [expanded,setExpanded]=useState({});

  useEffect(()=>{
    Promise.all([getForms(),getPeople(),getMarkingConfig(),getReReview()]).then(async([fl,p,cfg,rr])=>{
      setForms(fl); setPeople(p);
      if(cfg) setConfig(cfg);
      setRrData(rr||[]);
      const subsMap={};
      await Promise.all(fl.map(async f=>{
        try{ subsMap[f.id]=await getSubmissions(f.id); }catch{ subsMap[f.id]=[]; }
      }));
      setAllSubs(subsMap);
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  async function handleSave(data){
    await saveReReview(data);
    setRrData(prev=>[...prev.filter(r=>!(r.personName===data.personName&&r.flaggedFormId===data.flaggedFormId)),data]);
  }
  async function handleDelete(data){
    await deleteReReview(data);
    setRrData(prev=>prev.filter(r=>!(r.personName===data.personName&&r.flaggedFormId===data.flaggedFormId)));
  }
  function toggleFlag(key){ setFlagged(prev=>({...prev,[key]:!prev[key]})); }
  function toggleExpand(key){ setExpanded(prev=>({...prev,[key]:!prev[key]})); }

  // TL: find reviewers below threshold on selected form
  const tlConfig=config.teamLeaders.forms;
  const tlFlags=[];
  if(selectedFormId){
    const cf=tlConfig.find(f=>f.formId===selectedFormId);
    const form=forms.find(f=>f.id===selectedFormId);
    const formWeight=cf?.weight||0;
    if(form){
      const subs=allSubs[selectedFormId]||[];
      [...new Set(subs.map(s=>s.personName))].forEach(personName=>{
        subs.filter(s=>s.personName===personName).forEach(sub=>{
          const score=getReviewerScore(sub.reviewerEmail,personName,selectedFormId,form.fields||[],allSubs);
          if(score===null) return;
          const pct=(score/5)*100;
          if(pct<=threshold) tlFlags.push({personName,formId:selectedFormId,formName:form.name,formWeight:formWeight,reviewerEmail:sub.reviewerEmail,score,pct:pct.toFixed(1)});
        });
      });
    }
  }

  // TM: auto-detect lone TMs
  const deptGroups={};
  people.forEach(p=>{ const d=p.department||"Unknown"; if(!deptGroups[d])deptGroups[d]=[]; deptGroups[d].push(p); });
  const loneTMs=Object.entries(deptGroups)
    .filter(([,m])=>m.filter(p=>(p.designations||[]).includes("Team Member")).length===1)
    .map(([dept,m])=>({dept,person:m.find(p=>(p.designations||[]).includes("Team Member"))}))
    .filter(x=>x.person);
  const tmConfig=config.teamMembers.forms;

  if(loading) return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style>
      <div style={{display:"flex",justifyContent:"space-between"}}><Skel w={150} h={24}/><Skel w={160} h={36} r={9}/></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>{[1,2,3,4].map(i=>(<div key={i} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}><Skel w="40%" h={24}/><div style={{marginTop:6}}><Skel w="60%" h={12}/></div></div>))}</div>
      {[1,2].map(i=>(<div key={i} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:18}}><Skel w="40%" h={16}/><div style={{marginTop:12}}><Skel h={60} r={10}/></div></div>))}
    </div>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>⚠️ Re-Review</h2>
          <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>Flag reviewers → assign replacement forms → recalculate scores</p>
        </div>
        {editThreshold?(
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#161B22",border:"1px solid rgba(245,158,11,0.4)",borderRadius:9,padding:"6px 14px"}}>
            <span style={{color:"#6b7280",fontSize:12}}>Threshold:</span>
            <input type="number" defaultValue={threshold} min={1} max={100} autoFocus
              onBlur={e=>{setThreshold(Math.min(100,Math.max(1,parseInt(e.target.value)||60)));setEditThreshold(false);}}
              onKeyDown={e=>e.key==="Enter"&&(setThreshold(Math.min(100,Math.max(1,parseInt(e.target.value)||60))),setEditThreshold(false))}
              style={{width:46,background:"transparent",border:"none",color:"#F59E0B",fontSize:15,fontWeight:700,outline:"none",textAlign:"center"}}/>
            <span style={{color:"#6b7280",fontSize:12}}>%</span>
          </div>
        ):(
          <button onClick={()=>setEditThreshold(true)}
            style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:9,border:"1px solid #21262D",background:"#161B22",color:"#9ca3af",fontSize:13,cursor:"pointer"}}>
            <Settings size={14}/> Threshold: <strong style={{color:"#F59E0B"}}>{threshold}%</strong>
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        {[
          {l:"TL Below Threshold",v:tlFlags.length,c:"#ef4444"},
          {l:"TL Flagged",v:Object.values(flagged).filter(Boolean).length,c:"#F59E0B"},
          {l:"Lone TMs",v:loneTMs.length,c:"#8B5CF6"},
          {l:"Saved ReReviews",v:rrData.length,c:"#22c55e"},
        ].map(s=>(
          <div key={s.l} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}>
            <p style={{color:s.c,fontSize:20,fontWeight:800,margin:0}}>{s.v}</p>
            <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* ── TEAM LEADERS ── */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:8,borderBottom:"1px solid #21262D"}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:"#ef4444"}}/>
          <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>Team Leader Flags</p>
          <span style={{fontSize:11,color:"#6b7280",background:"#21262D",padding:"2px 10px",borderRadius:999}}>below {threshold}% threshold</span>
        </div>

        {/* Form selector */}
        <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
          <p style={{color:"#9ca3af",fontSize:13,margin:0,flexShrink:0}}>Select form to check:</p>
          <select value={selectedFormId} onChange={e=>setSelectedFormId(e.target.value)}
            style={{flex:1,background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"8px 12px",color:selectedFormId?"white":"#6b7280",fontSize:13,outline:"none"}}>
            <option value="">-- Pick a form --</option>
            {forms.map(f=>{const cfg=tlConfig.find(cf=>cf.formId===f.id);return(<option key={f.id} value={f.id} style={{background:"#161B22"}}>{f.name}{cfg?" ("+cfg.weight+"% weight)":""}</option>);})}
          </select>
        </div>

        {!selectedFormId?(
          <div style={{textAlign:"center",padding:"24px 0",color:"#4b5563",fontSize:13,background:"#161B22",borderRadius:10,border:"1px solid #21262D"}}>
            Select a form above to see reviewers
          </div>
        ):tlFlags.length===0?(
          <div style={{textAlign:"center",padding:"24px 0",background:"#161B22",border:"1px solid rgba(34,197,94,0.2)",borderRadius:12,color:"#22c55e",fontSize:13,fontWeight:600}}>
            ✓ No reviewers below {threshold}% on this form
          </div>
        ):(
          tlFlags.map((f,i)=>{
            const key=`${f.reviewerEmail}_${f.personName}_${f.formId}`;
            const isFlagged=!!flagged[key];
            const isExpanded=!!expanded[key];
            const existingSave=rrData.find(r=>r.personName===f.personName&&r.flaggedFormId===f.formId);
            return(
              <div key={i} style={{background:"#161B22",border:"1px solid "+(isFlagged?"rgba(239,68,68,0.4)":"#21262D"),borderRadius:12,padding:18,display:"flex",flexDirection:"column",gap:12}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <Av name={f.personName} size={40}/>
                    <div>
                      <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{f.personName}</p>
                      <p style={{color:"#6b7280",fontSize:12,margin:"3px 0 0"}}>Reviewed by <span style={{color:"#9ca3af"}}>{f.reviewerEmail}</span></p>
                      <p style={{color:"#6b7280",fontSize:11,margin:"2px 0 0"}}>Form: <span style={{color:"#F59E0B"}}>{f.formName}</span> · weight {f.formWeight}%</p>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"8px 14px",textAlign:"center"}}>
                      <p style={{color:"#ef4444",fontSize:16,fontWeight:800,margin:0}}>{f.pct}%</p>
                      <p style={{color:"#6b7280",fontSize:9,margin:"2px 0 0"}}>{f.score.toFixed(2)}/5</p>
                    </div>
                    {existingSave&&<span style={{fontSize:11,color:"#22c55e",background:"rgba(34,197,94,0.1)",padding:"3px 10px",borderRadius:999,fontWeight:600}}>✓ Saved</span>}
                    <button onClick={()=>toggleFlag(key)}
                      style={{padding:"8px 16px",borderRadius:8,border:"1px solid "+(isFlagged?"rgba(239,68,68,0.4)":"#21262D"),background:isFlagged?"rgba(239,68,68,0.1)":"transparent",color:isFlagged?"#ef4444":"#9ca3af",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                      {isFlagged?"✓ Flagged":"Flag"}
                    </button>
                    {isFlagged&&(
                      <button onClick={()=>toggleExpand(key)}
                        style={{padding:"8px 12px",borderRadius:8,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                        {isExpanded?<ChevronUp size={14}/>:<ChevronDown size={14}/>}
                        {isExpanded?"Hide":"Set Replacement"}
                      </button>
                    )}
                  </div>
                </div>
                {isFlagged&&isExpanded&&(
                  <ReplacementSelector
                    personName={f.personName} type="TL"
                    flaggedFormId={f.formId} flaggedFormName={f.formName}
                    flaggedWeight={f.formWeight} allForms={forms}
                    existingSave={existingSave} onSave={handleSave} onDelete={handleDelete}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── LONE TEAM MEMBERS ── */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:8,borderBottom:"1px solid #21262D"}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:"#8B5CF6"}}/>
          <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>Lone Team Members</p>
          <span style={{fontSize:11,color:"#6b7280",background:"#21262D",padding:"2px 10px",borderRadius:999}}>Only TM in dept — auto flagged</span>
        </div>

        {loneTMs.length===0?(
          <div style={{textAlign:"center",padding:"24px 0",background:"#161B22",border:"1px solid rgba(139,92,246,0.2)",borderRadius:12,color:"#8B5CF6",fontSize:13,fontWeight:600}}>
            ✓ No lone Team Members
          </div>
        ):(
          loneTMs.map(({dept,person},i)=>{
            const key=`tm_${person.name}`;
            const isExpanded=!!expanded[key];
            return(
              <div key={i} style={{background:"#161B22",border:"1px solid rgba(139,92,246,0.3)",borderRadius:12,padding:18,display:"flex",flexDirection:"column",gap:12}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <Av name={person.name} size={40}/>
                    <div>
                      <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{person.name}</p>
                      <p style={{color:"#8B5CF6",fontSize:12,margin:"3px 0 0"}}>⚠️ Only TM in {dept} · Auto Flagged</p>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:11,color:"#8B5CF6",background:"rgba(139,92,246,0.1)",padding:"3px 10px",borderRadius:999,fontWeight:600}}>Auto Flagged</span>
                    <button onClick={()=>toggleExpand(key)}
                      style={{padding:"8px 12px",borderRadius:8,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                      {isExpanded?<ChevronUp size={14}/>:<ChevronDown size={14}/>}
                      {isExpanded?"Hide":"Set Replacement"}
                    </button>
                  </div>
                </div>

                {isExpanded&&(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <p style={{color:"#9ca3af",fontSize:12,margin:0}}>Select which form to redistribute and pick 2 replacement forms:</p>
                    {tmConfig.map(cf=>{
                      const form=forms.find(f=>f.id===cf.formId);
                      if(!form) return null;
                      const existingSave=rrData.find(r=>r.personName===person.name&&r.flaggedFormId===cf.formId);
                      const cfKey=`tm_${person.name}_${cf.formId}`;
                      const cfExpanded=!!expanded[cfKey];
                      return(
                        <div key={cf.formId} style={{background:"#0D1117",border:"1px solid "+(existingSave?"rgba(34,197,94,0.3)":"#21262D"),borderRadius:10,padding:14}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:cfExpanded?12:0}}>
                            <p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>
                              {cf.name} <span style={{color:"#F59E0B"}}>({cf.weight}%)</span>
                            </p>
                            <div style={{display:"flex",gap:8,alignItems:"center"}}>
                              {existingSave&&<span style={{fontSize:11,color:"#22c55e",background:"rgba(34,197,94,0.1)",padding:"2px 8px",borderRadius:999,fontWeight:600}}>✓ Saved</span>}
                              <button onClick={()=>toggleExpand(cfKey)}
                                style={{padding:"5px 10px",borderRadius:7,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:3}}>
                                {cfExpanded?<ChevronUp size={12}/>:<ChevronDown size={12}/>}
                                {cfExpanded?"Hide":"Select"}
                              </button>
                            </div>
                          </div>
                          {cfExpanded&&(
                            <ReplacementSelector
                              personName={person.name} type="TM"
                              flaggedFormId={cf.formId} flaggedFormName={cf.name}
                              flaggedWeight={cf.weight} allForms={forms}
                              existingSave={existingSave} onSave={handleSave} onDelete={handleDelete}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── SAVED RE-REVIEWS ── */}
      {rrData.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:8,borderBottom:"1px solid #21262D"}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:"#22c55e"}}/>
            <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>Saved Re-Reviews ({rrData.length})</p>
          </div>
          {rrData.map((r,i)=>(
            <div key={i} style={{background:"#161B22",border:"1px solid rgba(34,197,94,0.2)",borderRadius:12,padding:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Av name={r.personName} size={36}/>
                <div>
                  <p style={{color:"white",fontSize:13,fontWeight:700,margin:0}}>{r.personName} <span style={{fontSize:10,color:r.type==="TL"?"#F59E0B":"#8B5CF6",background:r.type==="TL"?"rgba(245,158,11,0.1)":"rgba(139,92,246,0.1)",padding:"1px 6px",borderRadius:999}}>{r.type}</span></p>
                  <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>
                    <span style={{color:"#ef4444"}}>{r.flaggedFormName}</span> →
                    <span style={{color:"#22c55e"}}> {r.replace1Name} ({r.replace1Pct}%) + {r.replace2Name} ({r.replace2Pct}%)</span>
                  </p>
                </div>
              </div>
              <button onClick={()=>handleDelete({personName:r.personName,flaggedFormId:r.flaggedFormId})}
                style={{padding:"6px 12px",borderRadius:8,border:"1px solid rgba(239,68,68,0.3)",background:"transparent",color:"#ef4444",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                <Trash2 size={12}/> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
