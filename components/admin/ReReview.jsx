"use client";
import { getForms, getPeople, getSubmissions, getMarkingConfig, getReReview, saveReReview, deleteReReview } from "@/lib/sheets";
import { useState, useEffect } from "react";
import { Settings, Save, Trash2, ChevronDown, ChevronUp } from "lucide-react";

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=36}){const color=gc(name);return<div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}

function Skeleton({w="100%",h=20,r=8}){return<div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#161B22 25%,#21262D 50%,#161B22 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>;}

// Get average score a reviewer gave to a person on a form
function getReviewerScore(reviewerEmail, personName, formId, formFields, allSubs){
  const subs=(allSubs[formId]||[]).filter(s=>s.personName===personName&&s.reviewerEmail===reviewerEmail);
  if(!subs.length) return null;
  const rFields=formFields.filter(f=>f.type==="rating");
  if(!rFields.length) return null;
  const s=subs[0];
  return rFields.map(f=>s.values?.[f.id]||0).reduce((a,b)=>a+b,0)/rFields.length;
}

// Get overall avg for a person on a form (all reviewers)
function getPersonFormAvg(personName, formId, formFields, allSubs){
  const subs=(allSubs[formId]||[]).filter(s=>s.personName===personName);
  if(!subs.length) return null;
  const rFields=formFields.filter(f=>f.type==="rating");
  if(!rFields.length) return null;
  const avgs=subs.map(s=>rFields.map(f=>s.values?.[f.id]||0).reduce((a,b)=>a+b,0)/rFields.length);
  return avgs.reduce((a,b)=>a+b,0)/avgs.length;
}

// Replacement form selector component
function ReplacementSelector({personName, type, flaggedFormId, flaggedFormName, flaggedWeight, allForms, existingSave, onSave, onDelete}){
  const [r1,setR1]=useState(existingSave?.replace1Id||"");
  const [r1pct,setR1pct]=useState(existingSave?.replace1Pct||0);
  const [r2,setR2]=useState(existingSave?.replace2Id||"");
  const [r2pct,setR2pct]=useState(existingSave?.replace2Pct||0);
  const [saving,setSaving]=useState(false);
  const totalPct=r1pct+r2pct;
  const valid=r1&&r2&&r1!==r2&&totalPct===flaggedWeight;
  const availForms=allForms.filter(f=>f.id!==flaggedFormId);

  async function handleSave(){
    setSaving(true);
    await onSave({
      personName, type,
      flaggedFormId, flaggedFormName,
      replace1Id:r1, replace1Name:allForms.find(f=>f.id===r1)?.name||"",
      replace1Pct:r1pct,
      replace2Id:r2, replace2Name:allForms.find(f=>f.id===r2)?.name||"",
      replace2Pct:r2pct,
    });
    setSaving(false);
  }

  return(
    <div style={{background:"#0D1117",border:"1px solid #21262D",borderRadius:12,padding:16,marginTop:10,display:"flex",flexDirection:"column",gap:12}}>
      <p style={{color:"#9ca3af",fontSize:12,margin:0}}>
        Flagged form <span style={{color:"#ef4444",fontWeight:600}}>{flaggedFormName}</span> has weight <span style={{color:"#F59E0B",fontWeight:700}}>{flaggedWeight}%</span> — split into 2 replacement forms:
      </p>

      {/* Form 1 */}
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <select value={r1} onChange={e=>setR1(e.target.value)}
          style={{flex:2,background:"#161B22",border:"1px solid #21262D",borderRadius:8,padding:"8px 12px",color:r1?"white":"#6b7280",fontSize:13,outline:"none"}}>
          <option value="">Select replacement form 1</option>
          {availForms.filter(f=>f.id!==r2).map(f=><option key={f.id} value={f.id} style={{background:"#161B22"}}>{f.name}</option>)}
        </select>
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <input type="number" value={r1pct} onChange={e=>setR1pct(Math.min(100,Math.max(0,parseInt(e.target.value)||0)))}
            style={{width:60,background:"#161B22",border:"1px solid #21262D",borderRadius:7,padding:"8px",color:"white",fontSize:13,outline:"none",textAlign:"center"}}/>
          <span style={{color:"#6b7280",fontSize:13}}>%</span>
        </div>
      </div>

      {/* Form 2 */}
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <select value={r2} onChange={e=>setR2(e.target.value)}
          style={{flex:2,background:"#161B22",border:"1px solid #21262D",borderRadius:8,padding:"8px 12px",color:r2?"white":"#6b7280",fontSize:13,outline:"none"}}>
          <option value="">Select replacement form 2</option>
          {availForms.filter(f=>f.id!==r1).map(f=><option key={f.id} value={f.id} style={{background:"#161B22"}}>{f.name}</option>)}
        </select>
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <input type="number" value={r2pct} onChange={e=>setR2pct(Math.min(100,Math.max(0,parseInt(e.target.value)||0)))}
            style={{width:60,background:"#161B22",border:"1px solid #21262D",borderRadius:7,padding:"8px",color:"white",fontSize:13,outline:"none",textAlign:"center"}}/>
          <span style={{color:"#6b7280",fontSize:13}}>%</span>
        </div>
      </div>

      {/* Validation */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <p style={{margin:0,fontSize:12,color:totalPct===flaggedWeight?"#22c55e":totalPct>flaggedWeight?"#ef4444":"#F59E0B"}}>
          {totalPct===flaggedWeight?`✓ ${totalPct}% = ${flaggedWeight}% (correct)`:
           totalPct>flaggedWeight?`${totalPct}% > ${flaggedWeight}% (over by ${totalPct-flaggedWeight}%)`:
           `${totalPct}% / ${flaggedWeight}% needed`}
        </p>
        <div style={{display:"flex",gap:8}}>
          {existingSave&&(
            <button onClick={()=>onDelete({personName,flaggedFormId})}
              style={{padding:"8px 14px",borderRadius:8,border:"1px solid rgba(239,68,68,0.3)",background:"transparent",color:"#ef4444",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
              <Trash2 size={12}/> Remove
            </button>
          )}
          <button onClick={handleSave} disabled={!valid||saving}
            style={{padding:"8px 18px",borderRadius:8,border:"none",background:valid&&!saving?"linear-gradient(135deg,#D97706,#F59E0B)":"#21262D",color:valid&&!saving?"#000":"#4b5563",fontSize:12,fontWeight:700,cursor:valid&&!saving?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:6}}>
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
  const [flagged,setFlagged]=useState({}); // {reviewerEmail_personName_formId: true}
  const [expanded,setExpanded]=useState({}); // which person's replacement selector is open

  useEffect(()=>{
    Promise.all([getForms(),getPeople(),getMarkingConfig(),getReReview()]).then(async([fl,p,cfg,rr])=>{
      setForms(fl);
      setPeople(p);
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
    setRrData(prev=>{
      const filtered=prev.filter(r=>!(r.personName===data.personName&&r.flaggedFormId===data.flaggedFormId));
      return [...filtered,data];
    });
  }

  async function handleDelete(data){
    await deleteReReview(data);
    setRrData(prev=>prev.filter(r=>!(r.personName===data.personName&&r.flaggedFormId===data.flaggedFormId)));
  }

  function toggleFlag(key){
    setFlagged(prev=>({...prev,[key]:!prev[key]}));
  }

  function toggleExpand(key){
    setExpanded(prev=>({...prev,[key]:!prev[key]}));
  }

  // ── Team Leaders: find reviewers below threshold ───────────────────────────
  const tlConfig=config.teamLeaders.forms;
  const teamLeaders=people.filter(p=>!(p.designations||[]).includes("Team Member"));

  // For each TL config form, find all reviewers who gave below threshold
  const tlFlags=[];
  tlConfig.forEach(cf=>{
    const form=forms.find(f=>f.id===cf.formId);
    if(!form) return;
    const subs=allSubs[cf.formId]||[];
    // Get unique persons reviewed on this form
    const persons=[...new Set(subs.map(s=>s.personName))];
    persons.forEach(personName=>{
      const personSubs=subs.filter(s=>s.personName===personName);
      personSubs.forEach(sub=>{
        const score=getReviewerScore(sub.reviewerEmail,personName,cf.formId,form.fields||[],allSubs);
        if(score===null) return;
        const pct=(score/5)*100;
        if(pct<=threshold){
          tlFlags.push({
            personName, formId:cf.formId, formName:form.name,
            formWeight:cf.weight, reviewerEmail:sub.reviewerEmail,
            score, pct:pct.toFixed(1)
          });
        }
      });
    });
  });

  // ── Team Members: auto-detect lone TMs ────────────────────────────────────
  const deptGroups={};
  people.forEach(p=>{
    const dept=p.department||"Unknown";
    if(!deptGroups[dept]) deptGroups[dept]=[];
    deptGroups[dept].push(p);
  });

  const loneTMs=Object.entries(deptGroups)
    .filter(([,members])=>members.filter(p=>(p.designations||[]).includes("Team Member")).length===1)
    .map(([dept,members])=>({
      dept,
      person:members.find(p=>(p.designations||[]).includes("Team Member"))
    })).filter(x=>x.person);

  const tmConfig=config.teamMembers.forms;

  if(loading) return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",flexDirection:"column",gap:6}}><Skeleton w={120} h={24}/><Skeleton w={220} h={14}/></div>
        <Skeleton w={160} h={36} r={9}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        {[1,2,3,4].map(i=>(<div key={i} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px",display:"flex",flexDirection:"column",gap:6}}><Skeleton w="40%" h={24}/><Skeleton w="60%" h={12}/></div>))}
      </div>
      {[1,2].map(i=>(<div key={i} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:18,display:"flex",flexDirection:"column",gap:12}}><Skeleton w="40%" h={16}/><Skeleton h={60} r={10}/><Skeleton h={60} r={10}/></div>))}
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

      {/* ── Team Leader Flags ── */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:8,borderBottom:"1px solid #21262D"}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:"#ef4444"}}/>
          <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>Team Leader Flags</p>
          <span style={{fontSize:11,color:"#6b7280",background:"#21262D",padding:"2px 10px",borderRadius:999}}>Reviewers below {threshold}% threshold</span>
        </div>

        {tlFlags.length===0?(
          <div style={{textAlign:"center",padding:"28px 0",background:"#161B22",border:"1px solid rgba(34,197,94,0.2)",borderRadius:12,color:"#22c55e",fontSize:13,fontWeight:600}}>
            ✓ No reviewers below threshold
          </div>
        ):(
          tlFlags.map((f,i)=>{
            const key=`${f.reviewerEmail}_${f.personName}_${f.formId}`;
            const isFlagged=flagged[key];
            const existingSave=rrData.find(r=>r.personName===f.personName&&r.flaggedFormId===f.formId);
            const isExpanded=expanded[key];
            return(
              <div key={i} style={{background:"#161B22",border:"1px solid "+(isFlagged?"rgba(239,68,68,0.4)":"#21262D"),borderRadius:12,padding:18}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <Av name={f.personName} size={40}/>
                    <div>
                      <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{f.personName}</p>
                      <p style={{color:"#6b7280",fontSize:12,margin:"3px 0 0"}}>
                        Reviewed by <span style={{color:"#9ca3af"}}>{f.reviewerEmail}</span>
                      </p>
                      <p style={{color:"#6b7280",fontSize:11,margin:"2px 0 0"}}>
                        Form: <span style={{color:"#F59E0B"}}>{f.formName}</span> ({f.formWeight}% weight)
                      </p>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"8px 14px",textAlign:"center"}}>
                      <p style={{color:"#ef4444",fontSize:16,fontWeight:800,margin:0}}>{f.pct}%</p>
                      <p style={{color:"#6b7280",fontSize:9,margin:"2px 0 0"}}>Score ({f.score.toFixed(2)}/5)</p>
                    </div>
                    {existingSave&&(
                      <span style={{fontSize:11,color:"#22c55e",background:"rgba(34,197,94,0.1)",padding:"3px 10px",borderRadius:999,fontWeight:600}}>✓ Saved</span>
                    )}
                    <button onClick={()=>toggleFlag(key)}
                      style={{padding:"8px 16px",borderRadius:8,border:"none",background:isFlagged?"rgba(239,68,68,0.15)":"#21262D",color:isFlagged?"#ef4444":"#9ca3af",fontSize:12,fontWeight:700,cursor:"pointer",border:"1px solid "+(isFlagged?"rgba(239,68,68,0.4)":"#21262D")}}>
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
                    personName={f.personName}
                    type="TL"
                    flaggedFormId={f.formId}
                    flaggedFormName={f.formName}
                    flaggedWeight={f.formWeight}
                    allForms={forms}
                    existingSave={existingSave}
                    onSave={handleSave}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Lone Team Members ── */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:8,borderBottom:"1px solid #21262D"}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:"#8B5CF6"}}/>
          <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>Lone Team Members</p>
          <span style={{fontSize:11,color:"#6b7280",background:"#21262D",padding:"2px 10px",borderRadius:999}}>Only TM in department — auto flagged</span>
        </div>

        {loneTMs.length===0?(
          <div style={{textAlign:"center",padding:"28px 0",background:"#161B22",border:"1px solid rgba(139,92,246,0.2)",borderRadius:12,color:"#8B5CF6",fontSize:13,fontWeight:600}}>
            ✓ No lone Team Members found
          </div>
        ):(
          loneTMs.map(({dept,person},i)=>{
            const key=`tm_${person.name}`;
            const isExpanded=expanded[key];
            // For TM, we flag per config form — show all TM config forms
            return(
              <div key={i} style={{background:"#161B22",border:"1px solid rgba(139,92,246,0.3)",borderRadius:12,padding:18,display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <Av name={person.name} size={40}/>
                    <div>
                      <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{person.name}</p>
                      <p style={{color:"#8B5CF6",fontSize:12,margin:"3px 0 0"}}>⚠️ Only TM in {dept} department</p>
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
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {tmConfig.map(cf=>{
                      const form=forms.find(f=>f.id===cf.formId);
                      if(!form) return null;
                      const existingSave=rrData.find(r=>r.personName===person.name&&r.flaggedFormId===cf.formId);
                      return(
                        <div key={cf.formId} style={{background:"#0D1117",border:"1px solid #21262D",borderRadius:10,padding:14}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                            <p style={{color:"#9ca3af",fontSize:13,margin:0}}>
                              <span style={{color:"white",fontWeight:600}}>{cf.name}</span>
                              <span style={{color:"#F59E0B",fontWeight:700}}> ({cf.weight}% weight)</span>
                            </p>
                            {existingSave&&<span style={{fontSize:11,color:"#22c55e",background:"rgba(34,197,94,0.1)",padding:"3px 10px",borderRadius:999,fontWeight:600}}>✓ Saved</span>}
                          </div>
                          <ReplacementSelector
                            personName={person.name}
                            type="TM"
                            flaggedFormId={cf.formId}
                            flaggedFormName={cf.name}
                            flaggedWeight={cf.weight}
                            allForms={forms}
                            existingSave={existingSave}
                            onSave={handleSave}
                            onDelete={handleDelete}
                          />
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

      {/* Saved ReReviews */}
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
                  <p style={{color:"white",fontSize:13,fontWeight:700,margin:0}}>{r.personName}</p>
                  <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>
                    <span style={{color:"#ef4444"}}>Flagged: {r.flaggedFormName}</span> →
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
