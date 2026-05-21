"use client";
import { getForms, getPeople, getSubmissions, getMarkingConfig, getReReview, saveReReview, deleteReReview, getFlagged, saveFlagged, deleteFlagged, getMarkingGroups } from "@/lib/sheets";
import { useState, useEffect } from "react";
import { Settings, Save, Trash2, RotateCcw, X } from "lucide-react";

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=36}){const color=gc(name);return<div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}
function Skel({w="100%",h=20,r=8}){return<div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#161B22 25%,#21262D 50%,#161B22 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>;}
function Spinner(){return<svg style={{width:12,height:12,animation:"spin 1s linear infinite"}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>;}

function getReviewerScore(reviewerEmail,personName,formId,formFields,allSubs){
  const sub=(allSubs[formId]||[]).find(s=>s.personName===personName&&s.reviewerEmail===reviewerEmail);
  if(!sub) return null;
  const rFields=formFields.filter(f=>f.type==="rating");
  if(!rFields.length) return null;
  return rFields.map(f=>sub.values?.[f.id]||0).reduce((a,b)=>a+b,0)/rFields.length;
}

// Per-person config panel — dynamic replacement forms
function PersonConfigPanel({personName,groupForms,allForms,existingRR,onSave,onDelete}){
  const [flaggedFormId,setFlaggedFormId]=useState(existingRR?.flaggedFormId||"");
  const [replacements,setReplacements]=useState(
    existingRR?.replace1Id?[
      {formId:existingRR.replace1Id,pct:Number(existingRR.replace1Pct)},
      {formId:existingRR.replace2Id,pct:Number(existingRR.replace2Pct)},
    ].filter(r=>r.formId):
    [{formId:"",pct:0}]
  );
  const [saving,setSaving]=useState(false);

  const flaggedWeight=groupForms.find(f=>f.formId===flaggedFormId)?.weight||0;
  const totalPct=replacements.reduce((a,r)=>a+r.pct,0);
  const usedIds=new Set(replacements.map(r=>r.formId).filter(Boolean));
  const valid=flaggedFormId&&replacements.every(r=>r.formId)&&totalPct===flaggedWeight;

  function updateR(i,key,val){ setReplacements(prev=>prev.map((r,idx)=>idx===i?{...r,[key]:val}:r)); }
  function addR(){ setReplacements(prev=>[...prev,{formId:"",pct:0}]); }
  function removeR(i){ setReplacements(prev=>prev.filter((_,idx)=>idx!==i)); }

  async function doSave(){
    setSaving(true);
    const ff=allForms.find(f=>f.id===flaggedFormId);
    const data={
      flaggedFormId,flaggedFormName:ff?.name||"",
      replace1Id:replacements[0]?.formId||"",
      replace1Name:allForms.find(f=>f.id===replacements[0]?.formId)?.name||"",
      replace1Pct:replacements[0]?.pct||0,
      replace2Id:replacements[1]?.formId||"",
      replace2Name:allForms.find(f=>f.id===replacements[1]?.formId)?.name||"",
      replace2Pct:replacements[1]?.pct||0,
    };
    await onSave(data);
    setSaving(false);
  }

  const replaceOptions=groupForms.filter(f=>f.formId!==flaggedFormId);

  return(
    <div style={{background:"#0D1117",border:"1px solid #21262D",borderRadius:10,padding:14,display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
      {/* Flagged form */}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{color:"#ef4444",fontSize:12,fontWeight:600,minWidth:90,flexShrink:0}}>Flag Form:</span>
        <select value={flaggedFormId} onChange={e=>setFlaggedFormId(e.target.value)}
          style={{flex:1,background:"#161B22",border:"1px solid #21262D",borderRadius:7,padding:"7px 10px",color:flaggedFormId?"white":"#6b7280",fontSize:12,outline:"none"}}>
          <option value="">Select form to flag</option>
          {groupForms.map(f=><option key={f.formId} value={f.formId} style={{background:"#161B22"}}>{f.name} ({f.weight}%)</option>)}
        </select>
      </div>
      {/* Dynamic replacements */}
      {replacements.map((r,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{color:"#22c55e",fontSize:12,fontWeight:600,minWidth:90,flexShrink:0}}>Replace {i+1}:</span>
          <select value={r.formId} onChange={e=>updateR(i,"formId",e.target.value)}
            style={{flex:1,background:"#161B22",border:"1px solid #21262D",borderRadius:7,padding:"7px 10px",color:r.formId?"white":"#6b7280",fontSize:12,outline:"none"}}>
            <option value="">Select form</option>
            {replaceOptions.filter(f=>!usedIds.has(f.formId)||f.formId===r.formId).map(f=><option key={f.formId} value={f.formId} style={{background:"#161B22"}}>{f.name} ({f.weight}%)</option>)}
          </select>
          <input type="number" value={r.pct} min="0" max="100"
            onChange={e=>updateR(i,"pct",Math.min(100,Math.max(0,parseInt(e.target.value)||0)))}
            style={{width:52,background:"#161B22",border:"1px solid #21262D",borderRadius:6,padding:"7px",color:"white",fontSize:12,outline:"none",textAlign:"center"}}/>
          <span style={{color:"#6b7280",fontSize:12}}>%</span>
          {replacements.length>1&&<button onClick={()=>removeR(i)}
            style={{background:"none",border:"none",cursor:"pointer",color:"#374151",padding:2,display:"flex"}}
            onMouseOver={e=>e.currentTarget.style.color="#ef4444"} onMouseOut={e=>e.currentTarget.style.color="#374151"}>
            <X size={12}/>
          </button>}
        </div>
      ))}
      {/* Add replacement */}
      {replaceOptions.length>replacements.length&&(
        <button onClick={addR}
          style={{padding:"6px 0",borderRadius:7,border:"1px dashed #30363D",background:"transparent",color:"#6b7280",fontSize:11,cursor:"pointer"}}
          onMouseOver={e=>e.currentTarget.style.color="#F59E0B"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>
          + Add Replacement Form
        </button>
      )}
      {/* Validation */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
        {flaggedFormId&&(
          <span style={{fontSize:12,color:valid?"#22c55e":totalPct>flaggedWeight?"#ef4444":"#F59E0B"}}>
            {valid?`✓ ${totalPct}% = ${flaggedWeight}%`:totalPct>flaggedWeight?`${totalPct}% over`:`${totalPct}% / ${flaggedWeight}% needed`}
          </span>
        )}
        <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
          {existingRR&&<button onClick={onDelete}
            style={{padding:"6px 12px",borderRadius:7,border:"1px solid rgba(239,68,68,0.3)",background:"transparent",color:"#ef4444",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
            <Trash2 size={11}/> Remove
          </button>}
          <button onClick={doSave} disabled={!valid||saving}
            style={{padding:"6px 14px",borderRadius:7,border:"none",background:valid&&!saving?"linear-gradient(135deg,#D97706,#F59E0B)":"#21262D",color:valid&&!saving?"#000":"#4b5563",fontSize:11,fontWeight:700,cursor:valid&&!saving?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:4}}>
            {saving?<Spinner/>:<Save size={11}/>}
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
  const [markingConfig,setMarkingConfig]=useState({groups:[]});
  const [markingGroups,setMarkingGroups]=useState([]);
  const [rrData,setRrData]=useState([]);
  const [flaggedData,setFlaggedData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [threshold,setThreshold]=useState(60);
  const [editThreshold,setEditThreshold]=useState(false);
  const [invalidated,setInvalidated]=useState({});
  const [invalidating,setInvalidating]=useState(null);
  const [expandedPerson,setExpandedPerson]=useState(null);
  const [expandedMissing,setExpandedMissing]=useState(null);

  useEffect(()=>{
    getForms().then(async fl=>{
      setForms(fl);
      const [p,cfg,mg,rr,fl2]=await Promise.all([
        getPeople().catch(()=>[]),
        getMarkingConfig().catch(()=>({groups:[]})),
        getMarkingGroups().catch(()=>[]),
        getReReview().catch(()=>[]),
        getFlagged().catch(()=>[]),
      ]);
      setPeople(p||[]);
      setMarkingConfig(cfg||{groups:[]});
      setMarkingGroups(mg||[]);
      setRrData(rr||[]);
      setFlaggedData(fl2||[]);
      // Restore invalidated state
      const inv={};
      (fl2||[]).filter(f=>f.reviewerEmail).forEach(f=>{ inv[`${f.reviewerEmail}_${f.personName}_${f.formId}`]=true; });
      setInvalidated(inv);
      // Load submissions
      const subsMap={};
      await Promise.all(fl.map(async f=>{ try{ subsMap[f.id]=await getSubmissions(f.id); }catch{ subsMap[f.id]=[]; } }));
      setAllSubs(subsMap);
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  // Get group for a person
  function getPersonGroup(personName){
    const mg=markingGroups.find(mg=>mg.personName===personName);
    if(!mg) return null;
    return (markingConfig.groups||[]).find(g=>g.groupId===mg.groupId)||null;
  }

  function getGroupForms(personName){
    const group=getPersonGroup(personName);
    return group?.forms||[];
  }

  // Threshold flags — check all people across all forms
  const thresholdFlags=[];
  people.forEach(person=>{
    const groupForms=getGroupForms(person.name);
    groupForms.forEach(cf=>{
      const form=forms.find(f=>f.id===cf.formId);
      if(!form) return;
      const subs=allSubs[cf.formId]||[];
      const personSubs=subs.filter(s=>s.personName===person.name);
      personSubs.forEach(sub=>{
        const score=getReviewerScore(sub.reviewerEmail,person.name,cf.formId,form.fields||[],allSubs);
        if(score===null) return;
        const pct=(score/5)*100;
        if(pct<=threshold){
          thresholdFlags.push({personName:person.name,formId:cf.formId,formName:form.name,formWeight:cf.weight,reviewerEmail:sub.reviewerEmail,score,pct:pct.toFixed(1)});
        }
      });
    });
  });

  // Missing persons — only 1 reviewer on any form in their group
  const missingPersons=[];
  people.forEach(person=>{
    const groupForms=getGroupForms(person.name);
    groupForms.forEach(cf=>{
      const subs=(allSubs[cf.formId]||[]).filter(s=>s.personName===person.name);
      if(subs.length===1){
        const existing=missingPersons.find(m=>m.personName===person.name);
        if(!existing) missingPersons.push({personName:person.name,forms:[{formId:cf.formId,formName:cf.name,reviewerCount:1}]});
        else existing.forms.push({formId:cf.formId,formName:cf.name,reviewerCount:1});
      }
    });
  });

  async function toggleInvalidate(key,personName,formId,formName,reviewerEmail){
    const isInv=!!invalidated[key];
    setInvalidating(key);
    setInvalidated(prev=>({...prev,[key]:!isInv}));
    if(!isInv){
      await saveFlagged({personName,type:"threshold",formId,formName,reviewerEmail,groupId:getPersonGroup(personName)?.groupId||""});
      setFlaggedData(prev=>[...prev,{personName,type:"threshold",formId,formName,reviewerEmail}]);
    } else {
      await deleteFlagged({personName,formId,reviewerEmail});
      setFlaggedData(prev=>prev.filter(f=>!(f.personName===personName&&f.formId===formId&&f.reviewerEmail===reviewerEmail)));
    }
    setInvalidating(null);
  }

  async function handleSaveRR(personName,data){
    const group=getPersonGroup(personName);
    await saveReReview({personName,type:"threshold",groupId:group?.groupId||"",...data});
    setRrData(prev=>[...prev.filter(r=>!(r.personName===personName&&r.flaggedFormId===data.flaggedFormId)),{personName,type:"threshold",groupId:group?.groupId||"",...data}]);
  }

  async function handleDeleteRR(personName,flaggedFormId){
    await deleteReReview({personName,flaggedFormId});
    setRrData(prev=>prev.filter(r=>!(r.personName===personName&&r.flaggedFormId===flaggedFormId)));
  }

  async function handleSaveMissingRR(personName,data){
    const group=getPersonGroup(personName);
    await saveReReview({personName,type:"missing",groupId:group?.groupId||"",...data});
    setRrData(prev=>[...prev.filter(r=>!(r.personName===personName&&r.flaggedFormId===data.flaggedFormId)),{personName,type:"missing",groupId:group?.groupId||"",...data}]);
  }

  if(loading) return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style>
      <div style={{display:"flex",justifyContent:"space-between"}}><Skel w={150} h={24}/><Skel w={160} h={36} r={9}/></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>{[1,2,3,4].map(i=>(<div key={i} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}><Skel w="40%" h={24}/><div style={{marginTop:6}}><Skel w="60%" h={12}/></div></div>))}</div>
      {[1,2].map(i=>(<div key={i} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:18}}><Skel w="40%" h={16}/><div style={{marginTop:12}}><Skel h={100} r={10}/></div></div>))}
    </div>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>⚠️ Re-Review</h2>
          <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>Flag reviewers below threshold · detect missing reviewers · recalculate scores</p>
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
          {l:"Below Threshold",v:thresholdFlags.length,c:"#ef4444"},
          {l:"Invalidated",v:flaggedData.filter(f=>f.reviewerEmail).length,c:"#F59E0B"},
          {l:"Missing Reviewer",v:missingPersons.length,c:"#8B5CF6"},
          {l:"Saved RR",v:rrData.length,c:"#22c55e"},
        ].map(s=>(
          <div key={s.l} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}>
            <p style={{color:s.c,fontSize:20,fontWeight:800,margin:0}}>{s.v}</p>
            <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* ── SECTION 1: THRESHOLD FLAGS ── */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:8,borderBottom:"1px solid #21262D"}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:"#ef4444"}}/>
          <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>Threshold Flags</p>
          <span style={{fontSize:11,color:"#6b7280",background:"#21262D",padding:"2px 10px",borderRadius:999}}>reviewers below {threshold}%</span>
        </div>

        {thresholdFlags.length===0?(
          <div style={{textAlign:"center",padding:"24px",background:"#161B22",border:"1px solid rgba(34,197,94,0.2)",borderRadius:12,color:"#22c55e",fontSize:13,fontWeight:600}}>
            ✓ No reviewers below threshold
          </div>
        ):(
          // Group by person
          [...new Set(thresholdFlags.map(f=>f.personName))].map(personName=>{
            const personFlags=thresholdFlags.filter(f=>f.personName===personName);
            const group=getPersonGroup(personName);
            const groupForms=getGroupForms(personName);
            const isExpanded=expandedPerson===personName;
            const existingRR=rrData.find(r=>r.personName===personName&&r.type==="threshold");
            return(
              <div key={personName} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:16,display:"flex",flexDirection:"column",gap:12}}>
                {/* Person header */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <Av name={personName} size={40}/>
                    <div>
                      <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{personName}</p>
                      {group&&<p style={{color:gc(group.groupName),fontSize:11,margin:"2px 0 0"}}>Group: {group.groupName}</p>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    {existingRR&&<span style={{fontSize:11,color:"#22c55e",background:"rgba(34,197,94,0.1)",padding:"3px 10px",borderRadius:999,fontWeight:600}}>✓ RR Saved</span>}
                    <button onClick={()=>setExpandedPerson(isExpanded?null:personName)}
                      style={{padding:"6px 14px",borderRadius:8,border:"1px solid #21262D",background:isExpanded?"#21262D":"transparent",color:"#9ca3af",fontSize:12,cursor:"pointer"}}>
                      {isExpanded?"Hide":"Set Replacement"}
                    </button>
                  </div>
                </div>

                {/* Reviewers */}
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {personFlags.map(flag=>{
                    const key=`${flag.reviewerEmail}_${flag.personName}_${flag.formId}`;
                    const isInv=!!invalidated[key];
                    const isInvalidating2=invalidating===key;
                    return(
                      <div key={key} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#0D1117",borderRadius:8,border:"1px solid "+(isInv?"rgba(239,68,68,0.3)":"rgba(245,158,11,0.2)")}}>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{color:"#9ca3af",fontSize:12,margin:0}}>{flag.reviewerEmail}</p>
                          <p style={{color:"#6b7280",fontSize:11,margin:"2px 0 0"}}>Form: <span style={{color:"#F59E0B"}}>{flag.formName}</span></p>
                        </div>
                        <span style={{fontSize:12,fontWeight:700,color:"#ef4444",background:"rgba(239,68,68,0.1)",padding:"2px 8px",borderRadius:999}}>{flag.pct}%</span>
                        <button onClick={()=>toggleInvalidate(key,personName,flag.formId,flag.formName,flag.reviewerEmail)}
                          disabled={!!invalidating}
                          style={{padding:"5px 12px",borderRadius:7,border:"1px solid "+(isInv?"rgba(34,197,94,0.4)":"#21262D"),background:isInv?"rgba(34,197,94,0.1)":"transparent",color:isInv?"#22c55e":"#9ca3af",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                          {isInvalidating2&&<Spinner/>}
                          {isInvalidating2?"...":(isInv?"Restore":"Invalidate")}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Replacement config */}
                {isExpanded&&groupForms.length>0&&(
                  <PersonConfigPanel
                    personName={personName}
                    groupForms={groupForms}
                    allForms={forms}
                    existingRR={existingRR}
                    onSave={data=>handleSaveRR(personName,data)}
                    onDelete={()=>handleDeleteRR(personName,existingRR?.flaggedFormId)}
                  />
                )}
                {isExpanded&&groupForms.length===0&&(
                  <p style={{color:"#ef4444",fontSize:12,margin:0}}>⚠️ This person has no group assigned. Go to Groups tab first.</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── SECTION 2: MISSING REVIEWERS ── */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:8,borderBottom:"1px solid #21262D"}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:"#8B5CF6"}}/>
          <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>Missing Reviewers</p>
          <span style={{fontSize:11,color:"#6b7280",background:"#21262D",padding:"2px 10px",borderRadius:999}}>only 1 reviewer on a form</span>
        </div>

        {missingPersons.length===0?(
          <div style={{textAlign:"center",padding:"24px",background:"#161B22",border:"1px solid rgba(139,92,246,0.2)",borderRadius:12,color:"#8B5CF6",fontSize:13,fontWeight:600}}>
            ✓ No missing reviewers
          </div>
        ):(
          missingPersons.map(({personName,forms:missingForms})=>{
            const group=getPersonGroup(personName);
            const groupForms=getGroupForms(personName);
            const isExpanded=expandedMissing===personName;
            const existingRR=rrData.find(r=>r.personName===personName&&r.type==="missing");
            return(
              <div key={personName} style={{background:"#161B22",border:"1px solid rgba(139,92,246,0.3)",borderRadius:12,padding:16,display:"flex",flexDirection:"column",gap:12}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <Av name={personName} size={40}/>
                    <div>
                      <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{personName}</p>
                      {group&&<p style={{color:gc(group.groupName),fontSize:11,margin:"2px 0 0"}}>Group: {group.groupName}</p>}
                      <div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>
                        {missingForms.map(f=>(
                          <span key={f.formId} style={{fontSize:10,color:"#8B5CF6",background:"rgba(139,92,246,0.1)",padding:"2px 8px",borderRadius:999}}>
                            ⚠️ {f.formName} — 1 reviewer
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    {existingRR&&<span style={{fontSize:11,color:"#22c55e",background:"rgba(34,197,94,0.1)",padding:"3px 10px",borderRadius:999,fontWeight:600}}>✓ RR Saved</span>}
                    <button onClick={()=>setExpandedMissing(isExpanded?null:personName)}
                      style={{padding:"6px 14px",borderRadius:8,border:"1px solid #21262D",background:isExpanded?"#21262D":"transparent",color:"#9ca3af",fontSize:12,cursor:"pointer"}}>
                      {isExpanded?"Hide":"Set Replacement"}
                    </button>
                  </div>
                </div>

                {isExpanded&&groupForms.length>0&&(
                  <PersonConfigPanel
                    personName={personName}
                    groupForms={groupForms}
                    allForms={forms}
                    existingRR={existingRR}
                    onSave={data=>handleSaveMissingRR(personName,data)}
                    onDelete={()=>handleDeleteRR(personName,existingRR?.flaggedFormId)}
                  />
                )}
                {isExpanded&&groupForms.length===0&&(
                  <p style={{color:"#ef4444",fontSize:12,margin:0}}>⚠️ This person has no group assigned. Go to Groups tab first.</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── FLAGGED REVIEWERS LIST ── */}
      {flaggedData.filter(f=>f.reviewerEmail).length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:8,borderBottom:"1px solid #21262D"}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:"#ef4444"}}/>
            <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>Invalidated Reviewers ({flaggedData.filter(f=>f.reviewerEmail).length})</p>
          </div>
          {flaggedData.filter(f=>f.reviewerEmail).map((f,i)=>(
            <div key={i} style={{background:"#161B22",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,padding:14,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Av name={f.personName} size={36}/>
                <div>
                  <p style={{color:"white",fontSize:13,fontWeight:700,margin:0}}>{f.personName}</p>
                  <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>
                    Reviewer: <span style={{color:"#ef4444"}}>{f.reviewerEmail}</span> · <span style={{color:"#F59E0B"}}>{f.formName}</span>
                  </p>
                </div>
              </div>
              <button onClick={async()=>{
                const key=`${f.reviewerEmail}_${f.personName}_${f.formId}`;
                setInvalidating(key);
                await deleteFlagged({personName:f.personName,formId:f.formId,reviewerEmail:f.reviewerEmail});
                setFlaggedData(prev=>prev.filter((_,idx)=>idx!==i));
                setInvalidated(prev=>({...prev,[key]:false}));
                setInvalidating(null);
              }} disabled={invalidating===`${f.reviewerEmail}_${f.personName}_${f.formId}`}
              style={{padding:"6px 12px",borderRadius:8,border:"1px solid #21262D",background:"transparent",color:"#9ca3af",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                {invalidating===`${f.reviewerEmail}_${f.personName}_${f.formId}`?<Spinner/>:<RotateCcw size={12}/>}
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
