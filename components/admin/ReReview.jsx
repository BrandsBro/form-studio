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

// Replacement config — shows flagged forms auto, admin picks replacements
function ReplacementPanel({personName,flaggedForms,groupForms,existingRR,onSave,onDelete}){
  const totalFlaggedWeight=flaggedForms.reduce((a,f)=>a+f.weight,0);
  const availForms=groupForms.filter(f=>!flaggedForms.find(ff=>ff.formId===f.formId));
  const [replacements,setReplacements]=useState(()=>{
    if(existingRR?.replacements?.length) return existingRR.replacements;
    if(existingRR?.replace1Id) return [
      {formId:existingRR.replace1Id,pct:Number(existingRR.replace1Pct)||0},
      existingRR.replace2Id?{formId:existingRR.replace2Id,pct:Number(existingRR.replace2Pct)||0}:null
    ].filter(Boolean);
    return [{formId:"",pct:0}];
  });
  const [saving,setSaving]=useState(false);

  const totalReplacePct=replacements.reduce((a,r)=>a+r.pct,0);
  const usedIds=new Set(replacements.map(r=>r.formId).filter(Boolean));
  const valid=replacements.every(r=>r.formId&&r.pct>0)&&totalReplacePct===totalFlaggedWeight;

  function updateR(i,key,val){setReplacements(prev=>prev.map((r,idx)=>idx===i?{...r,[key]:val}:r));}
  function addR(){setReplacements(prev=>[...prev,{formId:"",pct:0}]);}
  function removeR(i){setReplacements(prev=>prev.filter((_,idx)=>idx!==i));}

  async function doSave(){
    setSaving(true);
    await onSave({replacements,replace1Id:replacements[0]?.formId||"",replace1Pct:replacements[0]?.pct||0,replace2Id:replacements[1]?.formId||"",replace2Pct:replacements[1]?.pct||0});
    setSaving(false);
  }

  return(
    <div style={{background:"#0D1117",border:"1px solid #21262D",borderRadius:10,padding:14,display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
      {/* Flagged forms — read only */}
      <div>
        <p style={{color:"#6b7280",fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 6px"}}>Flagged Forms (auto-detected)</p>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {flaggedForms.map(f=>(
            <div key={f.formId} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:7}}>
              <span style={{fontSize:11,color:"#ef4444",fontWeight:600}}>⚠️ {f.name}</span>
              <span style={{marginLeft:"auto",fontSize:11,color:"#ef4444",background:"rgba(239,68,68,0.1)",padding:"2px 8px",borderRadius:999}}>{f.weight}%</span>
            </div>
          ))}
        </div>
        <p style={{color:"#6b7280",fontSize:11,margin:"6px 0 0"}}>Total flagged weight: <span style={{color:"#ef4444",fontWeight:600}}>{totalFlaggedWeight}%</span> → must be redistributed</p>
      </div>

      {/* Replacement forms */}
      <div>
        <p style={{color:"#6b7280",fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 6px"}}>Replacement Forms</p>
        {replacements.map((r,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <select value={r.formId} onChange={e=>updateR(i,"formId",e.target.value)}
              style={{flex:1,background:"#161B22",border:"1px solid #21262D",borderRadius:7,padding:"7px 10px",color:r.formId?"white":"#6b7280",fontSize:12,outline:"none"}}>
              <option value="">Select form</option>
              {availForms.filter(f=>!usedIds.has(f.formId)||f.formId===r.formId).map(f=>(
                <option key={f.formId} value={f.formId} style={{background:"#161B22"}}>{f.name} ({f.weight}%)</option>
              ))}
            </select>
            <input type="number" value={r.pct} min="0" max="100"
              onChange={e=>updateR(i,"pct",Math.min(100,Math.max(0,parseInt(e.target.value)||0)))}
              style={{width:52,background:"#161B22",border:"1px solid #21262D",borderRadius:6,padding:"7px",color:"white",fontSize:12,outline:"none",textAlign:"center"}}/>
            <span style={{color:"#6b7280",fontSize:12}}>%</span>
            {replacements.length>1&&(
              <button onClick={()=>removeR(i)} style={{background:"none",border:"none",cursor:"pointer",color:"#374151",padding:2,display:"flex"}}
                onMouseOver={e=>e.currentTarget.style.color="#ef4444"} onMouseOut={e=>e.currentTarget.style.color="#374151"}>
                <X size={12}/>
              </button>
            )}
          </div>
        ))}
        {availForms.length>replacements.length&&(
          <button onClick={addR}
            style={{width:"100%",padding:"6px 0",borderRadius:7,border:"1px dashed #30363D",background:"transparent",color:"#6b7280",fontSize:11,cursor:"pointer",marginTop:4}}
            onMouseOver={e=>e.currentTarget.style.color="#F59E0B"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>
            + Add Replacement Form
          </button>
        )}
      </div>

      {/* Validation + save */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:12,color:valid?"#22c55e":totalReplacePct>totalFlaggedWeight?"#ef4444":"#F59E0B"}}>
          {valid?`✓ ${totalReplacePct}% = ${totalFlaggedWeight}%`:totalReplacePct>totalFlaggedWeight?`${totalReplacePct}% over by ${totalReplacePct-totalFlaggedWeight}%`:`${totalReplacePct}% / ${totalFlaggedWeight}% needed`}
        </span>
        <div style={{display:"flex",gap:8}}>
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
    async function load(){
      const [fl,p,cfg,mg,rr,fl2]=await Promise.all([
        getForms().catch(()=>[]),
        getPeople().catch(()=>[]),
        getMarkingConfig().catch(()=>({groups:[]})),
        getMarkingGroups().catch(()=>[]),
        getReReview().catch(()=>[]),
        getFlagged().catch(()=>[]),
      ]);
      setForms(fl||[]);
      setPeople(p||[]);
      setMarkingConfig(cfg||{groups:[]});
      setMarkingGroups(mg||[]);
      setRrData(rr||[]);
      setFlaggedData(fl2||[]);
      // Restore invalidated
      const inv={};
      (fl2||[]).filter(f=>f.reviewerEmail).forEach(f=>{inv[`${f.reviewerEmail}_${f.personName}_${f.formId}`]=true;});
      setInvalidated(inv);
      // Load submissions
      const subsMap={};
      await Promise.all((fl||[]).map(async f=>{try{subsMap[f.id]=await getSubmissions(f.id);}catch{subsMap[f.id]=[];}}));
      setAllSubs(subsMap);
      setLoading(false);
    }
    load();
  },[]);

  function getPersonGroup(personName){
    const mg=markingGroups.find(mg=>mg.personName===personName);
    if(!mg) return null;
    return (markingConfig.groups||[]).find(g=>g.groupId===mg.groupId)||null;
  }
  function getGroupForms(personName){return getPersonGroup(personName)?.forms||[];}

  // Section 1: Threshold flags — find reviewers below threshold
  const thresholdFlags=[];
  people.forEach(person=>{
    const groupForms=getGroupForms(person.name);
    if(!groupForms.length) return;
    groupForms.forEach(cf=>{
      const form=forms.find(f=>f.id===cf.formId);
      if(!form) return;
      const subs=(allSubs[cf.formId]||[]).filter(s=>s.personName===person.name);
      subs.forEach(sub=>{
        const score=getReviewerScore(sub.reviewerEmail,person.name,cf.formId,form.fields||[],allSubs);
        if(score===null) return;
        const pct=(score/5)*100;
        if(pct<=threshold){
          const existing=thresholdFlags.find(t=>t.personName===person.name);
          const flag={formId:cf.formId,formName:form.name,formWeight:cf.weight,reviewerEmail:sub.reviewerEmail,pct:pct.toFixed(1)};
          if(existing) existing.flags.push(flag);
          else thresholdFlags.push({personName:person.name,flags:[flag]});
        }
      });
    });
  });

  // Section 2: Missing — 0 submissions on any group form
  const missingPersons=[];
  const peopleInGroups=people.filter(p=>markingGroups.some(mg=>mg.personName===p.name));
  peopleInGroups.forEach(person=>{
    const groupForms=getGroupForms(person.name);
    const missingForms=groupForms.filter(cf=>{
      const subs=(allSubs[cf.formId]||[]).filter(s=>s.personName===person.name);
      return subs.length===0;
    });
    if(missingForms.length>0) missingPersons.push({personName:person.name,missingForms});
  });

  async function toggleInvalidate(key,personName,formId,formName,reviewerEmail){
    const isInv=!!invalidated[key];
    setInvalidating(key);
    setInvalidated(prev=>({...prev,[key]:!isInv}));
    const group=getPersonGroup(personName);
    if(!isInv){
      await saveFlagged({personName,type:"threshold",formId,formName,reviewerEmail,groupId:group?.groupId||""});
      setFlaggedData(prev=>[...prev,{personName,type:"threshold",formId,formName,reviewerEmail,groupId:group?.groupId||""}]);
    } else {
      await deleteFlagged({personName,formId,reviewerEmail});
      setFlaggedData(prev=>prev.filter(f=>!(f.personName===personName&&f.formId===formId&&f.reviewerEmail===reviewerEmail)));
    }
    setInvalidating(null);
  }

  async function handleSaveRR(personName,type,flaggedForms,data){
    const group=getPersonGroup(personName);
    const payload={
      personName,type,groupId:group?.groupId||"",
      flaggedFormId:flaggedForms[0]?.formId||"",
      flaggedFormName:flaggedForms[0]?.formName||"",
      ...data
    };
    await saveReReview(payload);
    setRrData(prev=>[...prev.filter(r=>!(r.personName===personName&&r.type===type)),{...payload}]);
  }

  async function handleDeleteRR(personName,type){
    await deleteReReview({personName,type});
    setRrData(prev=>prev.filter(r=>!(r.personName===personName&&r.type===type)));
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
          <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>Flag reviewers · detect missing · set replacements</p>
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
          {l:"RR Configs",v:rrData.length,c:"#22c55e"},
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
          thresholdFlags.map(({personName,flags})=>{
            const group=getPersonGroup(personName);
            const groupForms=getGroupForms(personName);
            const isExpanded=expandedPerson===personName;
            const existingRR=rrData.find(r=>r.personName===personName&&r.type==="threshold");
            // Auto-detect flagged forms from invalidated reviewers
            const invalidatedFlags=flaggedData.filter(f=>f.personName===personName&&f.reviewerEmail);
            const flaggedFormIds=[...new Set(invalidatedFlags.map(f=>f.formId))];
            const flaggedForms=flaggedFormIds.map(fid=>{
              const gf=groupForms.find(f=>f.formId===fid);
              return{formId:fid,name:gf?.name||fid,weight:gf?.weight||0};
            });
            return(
              <div key={personName} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:16,display:"flex",flexDirection:"column",gap:12}}>
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
                    {flaggedForms.length>0&&(
                      <button onClick={()=>setExpandedPerson(isExpanded?null:personName)}
                        style={{padding:"6px 14px",borderRadius:8,border:"1px solid #21262D",background:isExpanded?"#21262D":"transparent",color:"#9ca3af",fontSize:12,cursor:"pointer"}}>
                        {isExpanded?"Hide":"Set Replacement"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Reviewers */}
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {flags.map(flag=>{
                    const key=`${flag.reviewerEmail}_${personName}_${flag.formId}`;
                    const isInv=!!invalidated[key];
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
                          {invalidating===key&&<Spinner/>}
                          {invalidating===key?"...":(isInv?"Restore":"Invalidate")}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Replacement panel */}
                {isExpanded&&flaggedForms.length>0&&groupForms.length>0&&(
                  <ReplacementPanel
                    personName={personName}
                    flaggedForms={flaggedForms}
                    groupForms={groupForms}
                    existingRR={existingRR}
                    onSave={data=>handleSaveRR(personName,"threshold",flaggedForms,data)}
                    onDelete={()=>handleDeleteRR(personName,"threshold")}
                  />
                )}
                {isExpanded&&groupForms.length===0&&(
                  <p style={{color:"#ef4444",fontSize:12,margin:0}}>⚠️ Person has no group assigned. Go to Groups tab first.</p>
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
          <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>Missing Submissions</p>
          <span style={{fontSize:11,color:"#6b7280",background:"#21262D",padding:"2px 10px",borderRadius:999}}>0 submissions on a group form</span>
        </div>

        {missingPersons.length===0?(
          <div style={{textAlign:"center",padding:"24px",background:"#161B22",border:"1px solid rgba(139,92,246,0.2)",borderRadius:12,color:"#8B5CF6",fontSize:13,fontWeight:600}}>
            ✓ No missing submissions
          </div>
        ):(
          missingPersons.map(({personName,missingForms})=>{
            const group=getPersonGroup(personName);
            const groupForms=getGroupForms(personName);
            const isExpanded=expandedMissing===personName;
            const existingRR=rrData.find(r=>r.personName===personName&&r.type==="missing");
            const flaggedForms=missingForms.map(f=>({
              formId:f.formId,
              name:groupForms.find(gf=>gf.formId===f.formId)?.name||f.formId,
              weight:groupForms.find(gf=>gf.formId===f.formId)?.weight||0,
            }));
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
                            ⚠️ {groupForms.find(gf=>gf.formId===f.formId)?.name||f.formId} — no submissions
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
                  <ReplacementPanel
                    personName={personName}
                    flaggedForms={flaggedForms}
                    groupForms={groupForms}
                    existingRR={existingRR}
                    onSave={data=>handleSaveRR(personName,"missing",flaggedForms,data)}
                    onDelete={()=>handleDeleteRR(personName,"missing")}
                  />
                )}
                {isExpanded&&groupForms.length===0&&(
                  <p style={{color:"#ef4444",fontSize:12,margin:0}}>⚠️ Person has no group assigned. Go to Groups tab first.</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── INVALIDATED REVIEWERS LIST ── */}
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
