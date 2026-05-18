"use client";
import { getForms, getPeople } from "@/lib/sheets";
import { useState, useEffect } from "react";
import { Trophy, Medal, Save, Plus, X, ChevronDown, ChevronUp } from "lucide-react";

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=36}){const color=gc(name);return<div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}

const EMPTY_CONFIG={
  teamMembers:{forms:[],maxForms:3},
  teamLeaders:{forms:[],maxForms:5},
};

function getSubmissionsForForm(formId){
  try{return JSON.parse(localStorage.getItem("submissions_"+formId)||"[]");}catch{return[];}
}

// Calculate average score for a person on a form across all reviewers
function getPersonFormAvg(personName, formId, formFields){
  const subs=getSubmissionsForForm(formId);
  const personSubs=subs.filter(s=>s.personName===personName);
  if(!personSubs.length)return null;
  const ratingFields=formFields.filter(f=>f.type==="rating");
  if(!ratingFields.length)return null;
  const totals=personSubs.map(s=>{
    const vals=ratingFields.map(f=>s.values?.[f.id]||0);
    return vals.reduce((a,b)=>a+b,0)/vals.length;
  });
  return totals.reduce((a,b)=>a+b,0)/totals.length;
}

// Calculate final weighted score for a person
function calcFinalScore(personName, configForms, allForms){
  let totalWeight=0;
  let weightedSum=0;
  let hasData=false;
  configForms.forEach(cf=>{
    const form=allForms.find(f=>f.id===cf.formId);
    if(!form)return;
    const avg=getPersonFormAvg(personName,cf.formId,form.fields||[]);
    if(avg!==null){
      weightedSum+=avg*(cf.weight/100);
      totalWeight+=cf.weight;
      hasData=true;
    }
  });
  if(!hasData)return null;
  return totalWeight>0?(weightedSum/(totalWeight/100))*100/100:null;
}

// ── Form Weight Configurator ──────────────────────────────────────────────────
let dragFormIdx = null;

function FormConfigurator({title,icon,color,configForms,maxForms,allForms,onChange}){
  const [open,setOpen]=useState(true);
  const totalWeight=configForms.reduce((a,f)=>a+f.weight,0);
  const remaining=100-totalWeight;
  const availForms=allForms.filter(f=>!configForms.find(cf=>cf.formId===f.id));

  function addForm(formId){
    if(configForms.length>=maxForms)return;
    const form=allForms.find(f=>f.id===formId);
    if(!form)return;
    const defaultWeight=Math.max(0,Math.floor(remaining/1));
    onChange([...configForms,{formId,name:form.name,weight:defaultWeight}]);
  }

  function removeForm(formId){
    onChange(configForms.filter(f=>f.formId!==formId));
  }

  function updateWeight(formId,w){
    const val=Math.min(100,Math.max(0,parseInt(w)||0));
    onChange(configForms.map(f=>f.formId===formId?{...f,weight:val}:f));
  }

  return(
    <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,overflow:"hidden"}}>
      {/* Header */}
      <div onClick={()=>setOpen(o=>!o)} style={{padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",borderBottom:open?"1px solid #21262D":"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:color+"18",border:"1px solid "+color+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
          <div>
            <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{title}</p>
            <p style={{color:"#6b7280",fontSize:12,margin:"2px 0 0"}}>{configForms.length}/{maxForms} forms · Total weight: <span style={{color:totalWeight===100?"#22c55e":totalWeight>100?"#ef4444":"#F59E0B",fontWeight:600}}>{totalWeight}%</span></p>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {totalWeight===100&&<span style={{fontSize:11,color:"#22c55e",background:"rgba(34,197,94,0.1)",padding:"3px 10px",borderRadius:999,fontWeight:600}}>✓ 100%</span>}
          {totalWeight!==100&&configForms.length>0&&<span style={{fontSize:11,color:"#F59E0B",background:"rgba(245,158,11,0.1)",padding:"3px 10px",borderRadius:999}}>{remaining>0?"+"+remaining+"% remaining":Math.abs(remaining)+"% over"}</span>}
          {open?<ChevronUp size={16} color="#6b7280"/>:<ChevronDown size={16} color="#6b7280"/>}
        </div>
      </div>

      {open&&(
        <div style={{padding:20,display:"flex",flexDirection:"column",gap:12}}>
          {/* Selected forms */}
          {configForms.map((cf,i)=>(
            <div key={cf.formId}
              draggable
              onDragStart={e=>{dragFormIdx=i;e.dataTransfer.effectAllowed="move";}}
              onDragOver={e=>{
                e.preventDefault();
                if(dragFormIdx===null||dragFormIdx===i)return;
                const arr=[...configForms];
                const[r]=arr.splice(dragFormIdx,1);
                arr.splice(i,0,r);
                dragFormIdx=i;
                onChange(arr);
              }}
              onDragEnd={()=>{dragFormIdx=null;}}
              style={{display:"flex",alignItems:"center",gap:12,background:"#0D1117",border:"1px solid #21262D",borderRadius:10,padding:"12px 14px",cursor:"grab"}}>
              <span style={{color:"#374151",fontSize:16,cursor:"grab",flexShrink:0}}>⠿</span>
              <div style={{width:28,height:28,borderRadius:"50%",background:color+"18",border:"1px solid "+color+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color,flexShrink:0}}>{i+1}</div>
              <p style={{color:"white",fontSize:13,fontWeight:500,margin:0,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cf.name}</p>
              <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                <input type="number" value={cf.weight} onChange={e=>updateWeight(cf.formId,e.target.value)} min="0" max="100"
                  style={{width:60,background:"#161B22",border:"1px solid #21262D",borderRadius:7,padding:"5px 8px",color:"white",fontSize:13,outline:"none",textAlign:"center"}}/>
                <span style={{color:"#6b7280",fontSize:13}}>%</span>
              </div>
              <button onClick={()=>removeForm(cf.formId)} style={{background:"none",border:"none",cursor:"pointer",color:"#374151",padding:4,display:"flex",flexShrink:0}}
                onMouseOver={e=>e.currentTarget.style.color="#ef4444"} onMouseOut={e=>e.currentTarget.style.color="#374151"}>
                <X size={14}/>
              </button>
            </div>
          ))}

          {/* Add form */}
          {configForms.length<maxForms&&availForms.length>0&&(
            <select onChange={e=>{if(e.target.value)addForm(e.target.value);e.target.value="";}}
              style={{background:"#0D1117",border:"1px dashed #30363D",borderRadius:10,padding:"10px 14px",color:"#6b7280",fontSize:13,outline:"none",cursor:"pointer",width:"100%"}}
              defaultValue="">
              <option value="">+ Add a form ({maxForms-configForms.length} remaining)</option>
              {availForms.map(f=><option key={f.id} value={f.id} style={{background:"#161B22",color:"white"}}>{f.name}</option>)}
            </select>
          )}

          {configForms.length>=maxForms&&<p style={{color:"#4b5563",fontSize:12,textAlign:"center",margin:0}}>Maximum {maxForms} forms selected</p>}
          {availForms.length===0&&configForms.length<maxForms&&<p style={{color:"#4b5563",fontSize:12,textAlign:"center",margin:0}}>No more forms available</p>}

          {/* Weight distribution helper */}
          {configForms.length>0&&totalWeight!==100&&(
            <button onClick={()=>{
              const equal=Math.floor(100/configForms.length);
              const rem=100-(equal*configForms.length);
              onChange(configForms.map((f,i)=>({...f,weight:equal+(i===0?rem:0)})));
            }} style={{padding:"8px 0",borderRadius:9,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:12,cursor:"pointer",transition:"all 0.2s"}}
              onMouseOver={e=>e.currentTarget.style.color="white"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>
              Auto-distribute equally
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Score Bar ─────────────────────────────────────────────────────────────────
function ScoreBar({score,max=5}){
  const pct=(score/max)*100;
  const color=score>=4?"#22c55e":score>=3?"#F59E0B":score>=2?"#f97316":"#ef4444";
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
      <div style={{flex:1,height:8,background:"#21262D",borderRadius:999,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:999,background:color,width:pct+"%",transition:"width 0.6s ease"}}/>
      </div>
      <span style={{fontSize:13,fontWeight:700,color,minWidth:36,textAlign:"right"}}>{score.toFixed(2)}</span>
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function Leaderboard({title,icon,color,people,configForms,allForms}){
  const scored=people.map(p=>{
    const score=calcFinalScore(p.name,configForms,allForms);
    return{...p,score};
  }).sort((a,b)=>{
    if(a.score===null&&b.score===null)return 0;
    if(a.score===null)return 1;
    if(b.score===null)return -1;
    return b.score-a.score;
  });

  const ranked=scored.filter(p=>p.score!==null);
  const unscored=scored.filter(p=>p.score===null);

  const medals=["🥇","🥈","🥉"];

  return(
    <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,overflow:"hidden"}}>
      <div style={{padding:"16px 20px",borderBottom:"1px solid #21262D",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:10,background:color+"18",border:"1px solid "+color+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
        <div>
          <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{title}</p>
          <p style={{color:"#6b7280",fontSize:12,margin:"2px 0 0"}}>{ranked.length} scored · {unscored.length} pending</p>
        </div>
      </div>

      {configForms.length===0?(
        <div style={{padding:"40px 20px",textAlign:"center",color:"#4b5563"}}>
          <p style={{margin:0,fontSize:13}}>Configure forms and weights above to see scores.</p>
        </div>
      ):(
        <div style={{padding:16,display:"flex",flexDirection:"column",gap:8}}>
          {ranked.map((person,i)=>(
            <div key={person.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:i<3?"#0D1117":"transparent",border:"1px solid "+(i<3?color+"22":"#21262D"),borderRadius:12,transition:"all 0.2s"}}
              onMouseOver={e=>e.currentTarget.style.borderColor=color+"44"}
              onMouseOut={e=>e.currentTarget.style.borderColor=i<3?color+"22":"#21262D"}>

              {/* Rank */}
              <div style={{width:32,textAlign:"center",flexShrink:0}}>
                {i<3
                  ?<span style={{fontSize:20}}>{medals[i]}</span>
                  :<span style={{fontSize:14,fontWeight:700,color:"#4b5563"}}>#{i+1}</span>
                }
              </div>

              <Av name={person.name} size={40}/>

              <div style={{flex:1,minWidth:0}}>
                <p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{person.name}</p>
                <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                  {person.designations?.map(d=>(
                    <span key={d} style={{fontSize:10,color:"#6b7280",background:"#21262D",padding:"1px 6px",borderRadius:999}}>{d}</span>
                  ))}
                </div>
              </div>

              <div style={{minWidth:180,display:"flex",alignItems:"center",gap:10}}>
                <ScoreBar score={person.score}/>
              </div>

              {/* Form breakdown tooltip */}
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                {configForms.map(cf=>{
                  const form=allForms.find(f=>f.id===cf.formId);
                  const avg=form?getPersonFormAvg(person.name,cf.formId,form.fields||[]):null;
                  return(
                    <div key={cf.formId} title={cf.name+": "+(avg!==null?avg.toFixed(2):"N/A")}
                      style={{width:28,height:28,borderRadius:6,background:avg!==null?(avg>=4?"rgba(34,197,94,0.15)":avg>=3?"rgba(245,158,11,0.15)":"rgba(239,68,68,0.15)"):"#21262D",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:avg!==null?(avg>=4?"#22c55e":avg>=3?"#F59E0B":"#ef4444"):"#4b5563"}}>
                      {avg!==null?avg.toFixed(1):"—"}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {unscored.length>0&&(
            <div style={{marginTop:8,paddingTop:12,borderTop:"1px solid #21262D"}}>
              <p style={{color:"#4b5563",fontSize:11,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:"0.06em"}}>Not yet scored</p>
              {unscored.map(person=>(
                <div key={person.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderRadius:10,opacity:0.5}}>
                  <div style={{width:32,textAlign:"center"}}><span style={{color:"#374151",fontSize:13}}>—</span></div>
                  <Av name={person.name} size={32}/>
                  <p style={{color:"#6b7280",fontSize:13,margin:0}}>{person.name}</p>
                  <span style={{marginLeft:"auto",fontSize:11,color:"#374151",background:"#21262D",padding:"3px 10px",borderRadius:999}}>No submissions</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Marking(){
  const [forms,setForms]=useState([]);
  const [people,setPeople]=useState([]);
  const [config,setConfig]=useState(EMPTY_CONFIG);
  const [saved,setSaved]=useState(false);
  const [view,setView]=useState("config");
  
  useEffect(()=>{
    getForms().then(setForms);
    getPeople().then(setPeople);
    const sc=localStorage.getItem("marking_config");
    if(sc){try{setConfig(JSON.parse(sc));}catch{}}
  },[]);

  const teamMembers=people.filter(p=>(p.designations||[]).includes("Team Member"));
  const teamLeaders=people.filter(p=>!(p.designations||[]).includes("Team Member"));

  function saveConfig(){
    localStorage.setItem("marking_config",JSON.stringify(config));
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  }

  const tmTotal=config.teamMembers.forms.reduce((a,f)=>a+f.weight,0);
  const tlTotal=config.teamLeaders.forms.reduce((a,f)=>a+f.weight,0);
  const configValid=tmTotal===100&&tlTotal===100;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>Marking</h2>
          <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>Configure form weights → calculate final scores → leaderboard</p>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          
          <button onClick={saveConfig}
            style={{padding:"8px 18px",borderRadius:9,border:"none",background:saved?"#16a34a":"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            <Save size={14}/>{saved?"Saved!":"Save Config"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
        {[
          {l:"Team Members",v:teamMembers.length,c:"#10B981"},
          {l:"Team Leaders",v:teamLeaders.length,c:"#F59E0B"},
          {l:"TM Forms",v:config.teamMembers.forms.length+"/"+config.teamMembers.maxForms,c:"#3B82F6"},
          {l:"TL Forms",v:config.teamLeaders.forms.length+"/"+config.teamLeaders.maxForms,c:"#8B5CF6"},
        ].map(s=>(
          <div key={s.l} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}>
            <p style={{color:s.c,fontSize:20,fontWeight:800,margin:0}}>{s.v}</p>
            <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Config view */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <FormConfigurator
            title="Team Members" icon="👥" color="#10B981"
            configForms={config.teamMembers.forms}
            maxForms={config.teamMembers.maxForms}
            allForms={forms}
            onChange={forms=>setConfig(c=>({...c,teamMembers:{...c.teamMembers,forms}}))}
          />
          <FormConfigurator
            title="Team Leaders" icon="⭐" color="#F59E0B"
            configForms={config.teamLeaders.forms}
            maxForms={config.teamLeaders.maxForms}
            allForms={forms}
            onChange={forms=>setConfig(c=>({...c,teamLeaders:{...c.teamLeaders,forms}}))}
          />
          {!configValid&&config.teamMembers.forms.length>0&&config.teamLeaders.forms.length>0&&(
            <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"12px 16px",fontSize:13,color:"#F59E0B",textAlign:"center"}}>
              ⚠️ Both sections must total exactly 100% before viewing the leaderboard.
            </div>
          )}
          {configValid&&(
            <button onClick={()=>setView("leaderboard")}
              style={{padding:"12px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:14,fontWeight:700,cursor:"pointer"}}>
              View Leaderboard 🏆
            </button>
          )}
        </div>

      {/* Leaderboard view */}
      {view==="leaderboard"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {!configValid&&(
            <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,padding:"12px 16px",fontSize:13,color:"#ef4444",textAlign:"center"}}>
              ⚠️ Please configure and save form weights (both must total 100%) first.
            </div>
          )}
          <Leaderboard
            title="Team Members Leaderboard" icon="👥" color="#10B981"
            people={teamMembers}
            configForms={config.teamMembers.forms}
            allForms={forms}
          />
          <Leaderboard
            title="Team Leaders Leaderboard" icon="⭐" color="#F59E0B"
            people={teamLeaders}
            configForms={config.teamLeaders.forms}
            allForms={forms}
          />
        </div>
      )}
    </div>
  );
}
