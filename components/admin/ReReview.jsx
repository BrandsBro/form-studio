"use client";
import { getForms, getPeople, getSubmissions, getMarkingConfig, getReReview, saveReReview, deleteReReview } from "@/lib/sheets";
import { useState, useEffect } from "react";
import { Settings, Save, Trash2, RotateCcw } from "lucide-react";

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=36}){const color=gc(name);return<div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}
function Skel({w="100%",h=20,r=8}){return<div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#161B22 25%,#21262D 50%,#161B22 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>;}

function getPersonFormAvg(personName,formId,formFields,allSubs,excludeEmail=null){
  const subs=(allSubs[formId]||[]).filter(s=>s.personName===personName&&(excludeEmail?s.reviewerEmail!==excludeEmail:true));
  if(!subs.length) return null;
  const rFields=formFields.filter(f=>f.type==="rating");
  if(!rFields.length) return null;
  const avgs=subs.map(s=>rFields.map(f=>s.values?.[f.id]||0).reduce((a,b)=>a+b,0)/rFields.length);
  return avgs.reduce((a,b)=>a+b,0)/avgs.length;
}

function getReviewerScore(reviewerEmail,personName,formId,formFields,allSubs){
  const sub=(allSubs[formId]||[]).find(s=>s.personName===personName&&s.reviewerEmail===reviewerEmail);
  if(!sub) return null;
  const rFields=formFields.filter(f=>f.type==="rating");
  if(!rFields.length) return null;
  return rFields.map(f=>sub.values?.[f.id]||0).reduce((a,b)=>a+b,0)/rFields.length;
}

// Header config panel for both TL and TM
function ConfigPanel({title,color,icon,configForms,allForms,config,onConfigChange,onSave,saving,saved,children}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:8,borderBottom:"1px solid #21262D"}}>
        <div style={{width:10,height:10,borderRadius:"50%",background:color}}/>
        <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>{title}</p>
      </div>

      {/* Config header */}
      <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:16,display:"flex",flexDirection:"column",gap:12}}>
        <p style={{color:"#9ca3af",fontSize:12,margin:0,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>Form Configuration</p>

        {/* Flagged form */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{color:"#ef4444",fontSize:12,fontWeight:600,minWidth:100}}>Flagged Form:</span>
          <select value={config.flaggedFormId||""} onChange={e=>onConfigChange({...config,flaggedFormId:e.target.value})}
            style={{flex:1,background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"8px 12px",color:config.flaggedFormId?"white":"#6b7280",fontSize:13,outline:"none"}}>
            <option value="">Select flagged form</option>
            {configForms.map(cf=><option key={cf.formId} value={cf.formId} style={{background:"#161B22"}}>{cf.name} ({cf.weight}%)</option>)}
          </select>
        </div>

        {/* Replace form 1 */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{color:"#22c55e",fontSize:12,fontWeight:600,minWidth:100}}>Replace Form 1:</span>
          <select value={config.r1Id||""} onChange={e=>onConfigChange({...config,r1Id:e.target.value})}
            style={{flex:1,background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"8px 12px",color:config.r1Id?"white":"#6b7280",fontSize:13,outline:"none"}}>
            <option value="">Select replacement form 1</option>
            {configForms.filter(cf=>cf.formId!==config.flaggedFormId&&cf.formId!==config.r2Id).map(cf=><option key={cf.formId} value={cf.formId} style={{background:"#161B22"}}>{cf.name} ({cf.weight}%)</option>)}
          </select>
          <input type="number" value={config.r1Pct||0} min="0" max="100"
            onChange={e=>onConfigChange({...config,r1Pct:Math.min(100,Math.max(0,parseInt(e.target.value)||0))})}
            style={{width:56,background:"#0D1117",border:"1px solid #21262D",borderRadius:7,padding:"8px",color:"white",fontSize:13,outline:"none",textAlign:"center"}}/>
          <span style={{color:"#6b7280",fontSize:13}}>%</span>
        </div>

        {/* Replace form 2 */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{color:"#22c55e",fontSize:12,fontWeight:600,minWidth:100}}>Replace Form 2:</span>
          <select value={config.r2Id||""} onChange={e=>onConfigChange({...config,r2Id:e.target.value})}
            style={{flex:1,background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"8px 12px",color:config.r2Id?"white":"#6b7280",fontSize:13,outline:"none"}}>
            <option value="">Select replacement form 2</option>
            {configForms.filter(cf=>cf.formId!==config.flaggedFormId&&cf.formId!==config.r1Id).map(cf=><option key={cf.formId} value={cf.formId} style={{background:"#161B22"}}>{cf.name} ({cf.weight}%)</option>)}
          </select>
          <input type="number" value={config.r2Pct||0} min="0" max="100"
            onChange={e=>onConfigChange({...config,r2Pct:Math.min(100,Math.max(0,parseInt(e.target.value)||0))})}
            style={{width:56,background:"#0D1117",border:"1px solid #21262D",borderRadius:7,padding:"8px",color:"white",fontSize:13,outline:"none",textAlign:"center"}}/>
          <span style={{color:"#6b7280",fontSize:13}}>%</span>
        </div>

        {/* Validation + save */}
        {config.flaggedFormId&&config.r1Id&&config.r2Id&&(()=>{
          const flaggedWeight=configForms.find(cf=>cf.formId===config.flaggedFormId)?.weight||0;
          const total=(config.r1Pct||0)+(config.r2Pct||0);
          const valid=total===flaggedWeight;
          return(
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <span style={{fontSize:12,color:valid?"#22c55e":total>flaggedWeight?"#ef4444":"#F59E0B"}}>
                {valid?`✓ ${total}% = ${flaggedWeight}% correct`:total>flaggedWeight?`${total}% over by ${total-flaggedWeight}%`:`${total}% / ${flaggedWeight}% needed`}
              </span>
              <button onClick={onSave} disabled={!valid||saving}
                style={{padding:"8px 18px",borderRadius:8,border:"none",background:valid&&!saving?saved?"#16a34a":"linear-gradient(135deg,#D97706,#F59E0B)":"#21262D",color:valid&&!saving?"#000":"#4b5563",fontSize:12,fontWeight:700,cursor:valid&&!saving?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:5}}>
                {saving?<svg style={{width:12,height:12,animation:"spin 1s linear infinite"}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>:<Save size={12}/>}
                {saving?"Saving...":saved?"Saved!":"Save Config"}
              </button>
            </div>
          );
        })()}
      </div>

      {children}
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
  const [invalidated,setInvalidated]=useState({}); // {email_person_formId: true}

  // TL config state
  const [tlConfig,setTlConfig]=useState({flaggedFormId:"",r1Id:"",r1Pct:0,r2Id:"",r2Pct:0});
  const [tlSaving,setTlSaving]=useState(false);
  const [tlSaved,setTlSaved]=useState(false);

  // TM config state
  const [tmConfig,setTmConfig]=useState({flaggedFormId:"",r1Id:"",r1Pct:0,r2Id:"",r2Pct:0});
  const [tmSaving,setTmSaving]=useState(false);
  const [tmSaved,setTmSaved]=useState(false);

  useEffect(()=>{
    getForms().then(async fl=>{
      setForms(fl);
      getPeople().then(setPeople);
      getMarkingConfig().then(cfg=>{ if(cfg) setConfig(cfg); }).catch(()=>{});
      getReReview().then(rr=>setRrData(rr||[])).catch(()=>{});
      const subsMap={};
      await Promise.all(fl.map(async f=>{
        try{ subsMap[f.id]=await getSubmissions(f.id); }catch{ subsMap[f.id]=[]; }
      }));
      setAllSubs(subsMap);
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  async function saveTLConfig(){
    setTlSaving(true);
    const flaggedForm=config.teamLeaders.forms.find(cf=>cf.formId===tlConfig.flaggedFormId);
    await saveReReview({
      personName:"__TL_CONFIG__", type:"TL",
      flaggedFormId:tlConfig.flaggedFormId,
      flaggedFormName:flaggedForm?.name||"",
      replace1Id:tlConfig.r1Id,
      replace1Name:config.teamLeaders.forms.find(cf=>cf.formId===tlConfig.r1Id)?.name||"",
      replace1Pct:tlConfig.r1Pct,
      replace2Id:tlConfig.r2Id,
      replace2Name:config.teamLeaders.forms.find(cf=>cf.formId===tlConfig.r2Id)?.name||"",
      replace2Pct:tlConfig.r2Pct,
    });
    setRrData(prev=>[...prev.filter(r=>r.personName!=="__TL_CONFIG__"),{personName:"__TL_CONFIG__",type:"TL",flaggedFormId:tlConfig.flaggedFormId,replace1Id:tlConfig.r1Id,replace1Pct:tlConfig.r1Pct,replace2Id:tlConfig.r2Id,replace2Pct:tlConfig.r2Pct}]);
    setTlSaving(false); setTlSaved(true);
    setTimeout(()=>setTlSaved(false),2000);
  }

  async function saveTMConfig(personName){
    setTmSaving(true);
    const flaggedForm=config.teamMembers.forms.find(cf=>cf.formId===tmConfig.flaggedFormId);
    await saveReReview({
      personName, type:"TM",
      flaggedFormId:tmConfig.flaggedFormId,
      flaggedFormName:flaggedForm?.name||"",
      replace1Id:tmConfig.r1Id,
      replace1Name:config.teamMembers.forms.find(cf=>cf.formId===tmConfig.r1Id)?.name||"",
      replace1Pct:tmConfig.r1Pct,
      replace2Id:tmConfig.r2Id,
      replace2Name:config.teamMembers.forms.find(cf=>cf.formId===tmConfig.r2Id)?.name||"",
      replace2Pct:tmConfig.r2Pct,
    });
    setRrData(prev=>[...prev.filter(r=>!(r.personName===personName&&r.type==="TM")),{personName,type:"TM",flaggedFormId:tmConfig.flaggedFormId,replace1Id:tmConfig.r1Id,replace1Pct:tmConfig.r1Pct,replace2Id:tmConfig.r2Id,replace2Pct:tmConfig.r2Pct}]);
    setTmSaving(false); setTmSaved(true);
    setTimeout(()=>setTmSaved(false),2000);
  }

  function toggleInvalidate(key){ setInvalidated(prev=>({...prev,[key]:!prev[key]})); }

  // People lists
  const teamLeaders=people.filter(p=>!(p.designations||[]).includes("Team Member"));
  const tlConfigForms=config.teamLeaders.forms;

  // Get reviewers on flagged form below threshold
  const tlFlaggedForm=forms.find(f=>f.id===tlConfig.flaggedFormId);
  const tlSubs=allSubs[tlConfig.flaggedFormId]||[];
  const tlPersons=[...new Set(tlSubs.map(s=>s.personName))];

  // Lone TMs
  const deptGroups={};
  people.forEach(p=>{ const d=p.department||"Unknown"; if(!deptGroups[d])deptGroups[d]=[]; deptGroups[d].push(p); });
  const loneTMs=Object.entries(deptGroups)
    .filter(([,m])=>m.filter(p=>(p.designations||[]).includes("Team Member")).length===1)
    .map(([dept,m])=>({dept,person:m.find(p=>(p.designations||[]).includes("Team Member"))}))
    .filter(x=>x.person);
  const tmConfigForms=config.teamMembers.forms;

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
          {l:"TL Invalidated",v:Object.values(invalidated).filter(Boolean).length,c:"#ef4444"},
          {l:"Lone TMs",v:loneTMs.length,c:"#8B5CF6"},
          {l:"TL Config",v:tlConfig.flaggedFormId?"Set":"Not set",c:tlConfig.flaggedFormId?"#22c55e":"#6b7280"},
          {l:"Saved ReReviews",v:rrData.filter(r=>r.personName!=="__TL_CONFIG__").length,c:"#22c55e"},
        ].map(s=>(
          <div key={s.l} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}>
            <p style={{color:s.c,fontSize:20,fontWeight:800,margin:0}}>{s.v}</p>
            <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* ── TEAM LEADERS ── */}
      <ConfigPanel
        title="Team Leader Re-Review" color="#ef4444" icon="⭐"
        configForms={tlConfigForms} allForms={forms}
        config={tlConfig} onConfigChange={setTlConfig}
        onSave={saveTLConfig} saving={tlSaving} saved={tlSaved}>

        {tlConfig.flaggedFormId&&tlFlaggedForm&&(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <p style={{color:"#9ca3af",fontSize:12,margin:0}}>Reviewers on <span style={{color:"#F59E0B",fontWeight:600}}>{tlFlaggedForm.name}</span> — click Invalidate to flag:</p>
            {tlPersons.length===0?(
              <div style={{textAlign:"center",padding:"20px",background:"#161B22",borderRadius:10,border:"1px solid #21262D",color:"#4b5563",fontSize:13}}>
                No submissions on this form yet
              </div>
            ):(
              tlPersons.map(personName=>{
                const personSubs=tlSubs.filter(s=>s.personName===personName);
                return(
                  <div key={personName} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <Av name={personName} size={32}/>
                      <p style={{color:"white",fontSize:13,fontWeight:700,margin:0}}>{personName}</p>
                    </div>
                    {personSubs.map(sub=>{
                      const score=getReviewerScore(sub.reviewerEmail,personName,tlConfig.flaggedFormId,tlFlaggedForm.fields||[],allSubs);
                      const pct=score!==null?(score/5*100):null;
                      const key=`${sub.reviewerEmail}_${personName}_${tlConfig.flaggedFormId}`;
                      const isInv=!!invalidated[key];
                      const belowThreshold=pct!==null&&pct<=threshold;
                      return(
                        <div key={sub.reviewerEmail} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#0D1117",borderRadius:8,marginBottom:6,border:"1px solid "+(isInv?"rgba(239,68,68,0.3)":belowThreshold?"rgba(245,158,11,0.2)":"#21262D")}}>
                          <p style={{color:"#9ca3af",fontSize:12,margin:0,flex:1}}>{sub.reviewerEmail}</p>
                          {pct!==null&&(
                            <span style={{fontSize:12,fontWeight:700,color:pct<=threshold?"#ef4444":"#22c55e",background:pct<=threshold?"rgba(239,68,68,0.1)":"rgba(34,197,94,0.1)",padding:"2px 8px",borderRadius:999}}>
                              {pct.toFixed(1)}%
                            </span>
                          )}
                          {belowThreshold&&(
                            <button onClick={()=>toggleInvalidate(key)}
                              style={{padding:"5px 12px",borderRadius:7,border:"1px solid "+(isInv?"rgba(239,68,68,0.4)":"#21262D"),background:isInv?"rgba(239,68,68,0.1)":"transparent",color:isInv?"#ef4444":"#9ca3af",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                              {isInv?"✓ Invalidated":"Invalidate"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        )}
      </ConfigPanel>

      {/* ── LONE TEAM MEMBERS ── */}
      <ConfigPanel
        title="Team Member Re-Review (Lone TM)" color="#8B5CF6" icon="👥"
        configForms={tmConfigForms} allForms={forms}
        config={tmConfig} onConfigChange={setTmConfig}
        onSave={()=>{}} saving={false} saved={false}>

        {loneTMs.length===0?(
          <div style={{textAlign:"center",padding:"20px",background:"#161B22",borderRadius:10,border:"1px solid rgba(139,92,246,0.2)",color:"#8B5CF6",fontSize:13,fontWeight:600}}>
            ✓ No lone Team Members found
          </div>
        ):(
          loneTMs.map(({dept,person})=>{
            const existingSave=rrData.find(r=>r.personName===person.name&&r.type==="TM");
            return(
              <div key={person.name} style={{background:"#161B22",border:"1px solid rgba(139,92,246,0.3)",borderRadius:12,padding:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <Av name={person.name} size={40}/>
                  <div>
                    <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{person.name}</p>
                    <p style={{color:"#8B5CF6",fontSize:12,margin:"3px 0 0"}}>⚠️ Only TM in {dept}</p>
                    {existingSave&&<p style={{color:"#22c55e",fontSize:11,margin:"2px 0 0"}}>✓ Config saved</p>}
                  </div>
                </div>
                <button onClick={()=>saveTMConfig(person.name)}
                  disabled={!tmConfig.flaggedFormId||!tmConfig.r1Id||!tmConfig.r2Id||tmSaving}
                  style={{padding:"8px 16px",borderRadius:8,border:"none",background:tmConfig.flaggedFormId&&tmConfig.r1Id&&tmConfig.r2Id&&!tmSaving?"linear-gradient(135deg,#7C3AED,#8B5CF6)":"#21262D",color:tmConfig.flaggedFormId&&tmConfig.r1Id&&tmConfig.r2Id?"white":"#4b5563",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                  {tmSaving?<svg style={{width:12,height:12,animation:"spin 1s linear infinite"}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>:<Save size={12}/>}
                  {tmSaving?"Saving...":existingSave?"Update":"Save for "+person.name}
                </button>
              </div>
            );
          })
        )}
      </ConfigPanel>

      {/* ── SAVED RE-REVIEWS ── */}
      {rrData.filter(r=>r.personName!=="__TL_CONFIG__").length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:8,borderBottom:"1px solid #21262D"}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:"#22c55e"}}/>
            <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>Saved Re-Reviews</p>
          </div>
          {rrData.filter(r=>r.personName!=="__TL_CONFIG__").map((r,i)=>(
            <div key={i} style={{background:"#161B22",border:"1px solid rgba(34,197,94,0.2)",borderRadius:12,padding:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Av name={r.personName} size={36}/>
                <div>
                  <p style={{color:"white",fontSize:13,fontWeight:700,margin:0}}>{r.personName}
                    <span style={{marginLeft:8,fontSize:10,color:r.type==="TL"?"#F59E0B":"#8B5CF6",background:r.type==="TL"?"rgba(245,158,11,0.1)":"rgba(139,92,246,0.1)",padding:"1px 6px",borderRadius:999}}>{r.type}</span>
                  </p>
                  <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>
                    <span style={{color:"#ef4444"}}>{r.flaggedFormName}</span> →
                    <span style={{color:"#22c55e"}}> {r.replace1Name} ({r.replace1Pct}%) + {r.replace2Name} ({r.replace2Pct}%)</span>
                  </p>
                </div>
              </div>
              <button onClick={async()=>{ await deleteReReview({personName:r.personName,flaggedFormId:r.flaggedFormId}); setRrData(prev=>prev.filter(x=>!(x.personName===r.personName&&x.flaggedFormId===r.flaggedFormId))); }}
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
