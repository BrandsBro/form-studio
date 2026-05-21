"use client";
import { getForms, getPeople, getSubmissions, getMarkingConfig, saveMarkingConfig, getGroups, getDesignations } from "@/lib/sheets";
import { useState, useEffect } from "react";
import { Save, X, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=36}){const color=gc(name);return<div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}
function Skel({w="100%",h=20,r=8}){return<div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#161B22 25%,#21262D 50%,#161B22 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>;}

function getPersonFormAvg(personName,formId,formFields,allSubs={}){
  const subs=(allSubs[formId]||[]).filter(s=>s.personName===personName);
  if(!subs.length) return null;
  const rFields=formFields.filter(f=>f.type==="rating");
  if(!rFields.length) return null;
  const reviewerAvgs=subs.map(s=>rFields.map(f=>s.values?.[f.id]||0).reduce((a,b)=>a+b,0)/rFields.length);
  return reviewerAvgs.reduce((a,b)=>a+b,0)/reviewerAvgs.length;
}

function calcFinalScore(personName,configForms,allForms,allSubs={}){
  let weightedSum=0,hasData=false;
  configForms.forEach(cf=>{
    const form=allForms.find(f=>f.id===cf.formId);
    if(!form) return;
    const avg=getPersonFormAvg(personName,cf.formId,form.fields||[],allSubs);
    if(avg!==null){weightedSum+=avg*(cf.weight/100);hasData=true;}
  });
  return hasData?weightedSum:null;
}

let dragIdx=null;

function GroupConfigurator({group,allForms,designations,onChange,onDelete}){
  const [open,setOpen]=useState(true);
  const totalWeight=group.forms.reduce((a,f)=>a+f.weight,0);
  const avail=allForms.filter(f=>!group.forms.find(cf=>cf.formId===f.id));
  const color=gc(group.groupName);

  function addForm(formId){
    const form=allForms.find(f=>f.id===formId);
    if(!form) return;
    onChange({...group,forms:[...group.forms,{formId,name:form.name,weight:0}]});
  }
  function removeForm(formId){ onChange({...group,forms:group.forms.filter(f=>f.formId!==formId)}); }
  function updateWeight(formId,w){
    const val=Math.min(100,Math.max(0,parseInt(w)||0));
    onChange({...group,forms:group.forms.map(f=>f.formId===formId?{...f,weight:val}:f)});
  }
  function autoDistribute(){
    const eq=Math.floor(100/group.forms.length);
    const rem=100-(eq*group.forms.length);
    onChange({...group,forms:group.forms.map((f,i)=>({...f,weight:eq+(i===0?rem:0)}))});
  }

  return(
    <div style={{background:"#161B22",border:"1px solid "+color+"33",borderRadius:14,overflow:"hidden"}}>
      {/* Header */}
      <div style={{padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",borderBottom:open?"1px solid #21262D":"none"}}
        onClick={()=>setOpen(o=>!o)}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:color+"18",border:"1px solid "+color+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
            {group.groupName.charAt(0)}
          </div>
          <div>
            <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{group.groupName}</p>
            <p style={{color:"#6b7280",fontSize:12,margin:"2px 0 0"}}>
              {group.designation&&<span style={{color:color,fontWeight:600}}>{group.designation} · </span>}
              {group.forms.length} forms ·
              <span style={{color:totalWeight===100?"#22c55e":totalWeight>100?"#ef4444":"#F59E0B",fontWeight:600}}> {totalWeight}%</span>
            </p>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {totalWeight===100&&<span style={{fontSize:11,color:"#22c55e",background:"rgba(34,197,94,0.1)",padding:"3px 10px",borderRadius:999,fontWeight:600}}>✓ 100%</span>}
          <button onClick={e=>{e.stopPropagation();onDelete(group.groupId);}}
            style={{background:"none",border:"none",cursor:"pointer",color:"#374151",padding:4,display:"flex"}}
            onMouseOver={e=>e.currentTarget.style.color="#ef4444"} onMouseOut={e=>e.currentTarget.style.color="#374151"}>
            <Trash2 size={14}/>
          </button>
          {open?<ChevronUp size={16} color="#6b7280"/>:<ChevronDown size={16} color="#6b7280"/>}
        </div>
      </div>

      {open&&(
        <div style={{padding:20,display:"flex",flexDirection:"column",gap:12}}>
          {/* Designation selector */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:"#9ca3af",fontSize:12,minWidth:90}}>Designation:</span>
            <select value={group.designation||""} onChange={e=>onChange({...group,designation:e.target.value})}
              style={{flex:1,background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"7px 12px",color:group.designation?"white":"#6b7280",fontSize:13,outline:"none"}}>
              <option value="">-- Select designation --</option>
              {designations.map(d=><option key={d.designationId} value={d.designationName} style={{background:"#161B22"}}>{d.designationName}</option>)}
            </select>
          </div>

          {/* Forms */}
          {group.forms.map((cf,i)=>(
            <div key={cf.formId} draggable
              onDragStart={e=>{dragIdx=i;e.dataTransfer.effectAllowed="move";}}
              onDragOver={e=>{e.preventDefault();if(dragIdx===null||dragIdx===i)return;const arr=[...group.forms];const[r]=arr.splice(dragIdx,1);arr.splice(i,0,r);dragIdx=i;onChange({...group,forms:arr});}}
              onDragEnd={()=>{dragIdx=null;}}
              style={{display:"flex",alignItems:"center",gap:12,background:"#0D1117",border:"1px solid #21262D",borderRadius:10,padding:"12px 14px",cursor:"grab"}}>
              <span style={{color:"#374151",fontSize:16,flexShrink:0}}>⠿</span>
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
          {avail.length>0&&(
            <select onChange={e=>{if(e.target.value)addForm(e.target.value);e.target.value="";}} defaultValue=""
              style={{background:"#0D1117",border:"1px dashed #30363D",borderRadius:10,padding:"10px 14px",color:"#6b7280",fontSize:13,outline:"none",cursor:"pointer",width:"100%"}}>
              <option value="">+ Add a form</option>
              {avail.map(f=><option key={f.id} value={f.id} style={{background:"#161B22",color:"white"}}>{f.name}{f.description?" — "+f.description:""} ({f.fields?.filter(x=>x.type==="rating").length||0} rating fields)</option>)}
            </select>
          )}

          {/* Auto-distribute */}
          {group.forms.length>0&&totalWeight!==100&&(
            <button onClick={autoDistribute}
              style={{padding:"8px 0",borderRadius:9,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:12,cursor:"pointer"}}
              onMouseOver={e=>e.currentTarget.style.color="white"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>
              Auto-distribute equally
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreBar({score}){
  const color=score>=4?"#22c55e":score>=3?"#F59E0B":score>=2?"#f97316":"#ef4444";
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
      <div style={{flex:1,height:8,background:"#21262D",borderRadius:999,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:999,background:color,width:((score/5)*100)+"%",transition:"width 0.6s"}}/>
      </div>
      <span style={{fontSize:13,fontWeight:700,color,minWidth:36,textAlign:"right"}}>{score.toFixed(2)}</span>
    </div>
  );
}

function GroupLeaderboard({group,people,allForms,allSubs}){
  const color=gc(group.groupName);
  const groupPeople=people.filter(p=>(p.designations||[]).includes(group.designation));
  const scored=groupPeople.map(p=>({...p,score:calcFinalScore(p.name,group.forms,allForms,allSubs)}))
    .sort((a,b)=>{
      if(a.score===null&&b.score===null)return 0;
      if(a.score===null)return 1;
      if(b.score===null)return -1;
      return b.score-a.score;
    });
  const ranked=scored.filter(p=>p.score!==null);
  const unscored=scored.filter(p=>p.score===null);
  const medals=["🥇","🥈","🥉"];

  return(
    <div style={{background:"#161B22",border:"1px solid "+color+"33",borderRadius:14,overflow:"hidden"}}>
      <div style={{padding:"16px 20px",borderBottom:"1px solid #21262D",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:10,background:color+"18",border:"1px solid "+color+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
          {group.groupName.charAt(0)}
        </div>
        <div>
          <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{group.groupName}</p>
          <p style={{color:"#6b7280",fontSize:12,margin:"2px 0 0"}}>{ranked.length} scored · {unscored.length} pending</p>
        </div>
      </div>
      {group.forms.length===0?(
        <div style={{padding:"40px 20px",textAlign:"center",color:"#4b5563",fontSize:13}}>Configure forms and weights above to see scores.</div>
      ):(
        <div style={{padding:16,display:"flex",flexDirection:"column",gap:8}}>
          {ranked.map((person,i)=>(
            <div key={person.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:i<3?"#0D1117":"transparent",border:"1px solid "+(i<3?color+"22":"#21262D"),borderRadius:12}}
              onMouseOver={e=>e.currentTarget.style.borderColor=color+"44"}
              onMouseOut={e=>e.currentTarget.style.borderColor=i<3?color+"22":"#21262D"}>
              <div style={{width:32,textAlign:"center",flexShrink:0}}>
                {i<3?<span style={{fontSize:20}}>{medals[i]}</span>:<span style={{fontSize:14,fontWeight:700,color:"#4b5563"}}>#{i+1}</span>}
              </div>
              <Av name={person.name} size={40}/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{person.name}</p>
                <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                  {(person.designations||[]).map(d=><span key={d} style={{fontSize:10,color:"#6b7280",background:"#21262D",padding:"1px 6px",borderRadius:999}}>{d}</span>)}
                </div>
              </div>
              <div style={{minWidth:180}}><ScoreBar score={person.score}/></div>
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                {group.forms.map(cf=>{
                  const form=allForms.find(f=>f.id===cf.formId);
                  const avg=form?getPersonFormAvg(person.name,cf.formId,form.fields||[],allSubs):null;
                  const c=avg!==null?(avg>=4?"#22c55e":avg>=3?"#F59E0B":"#ef4444"):"#4b5563";
                  return(
                    <div key={cf.formId} title={`${cf.name} (${cf.weight}%): ${avg!==null?avg.toFixed(2):"N/A"}`}
                      style={{width:28,height:28,borderRadius:6,background:avg!==null?(avg>=4?"rgba(34,197,94,0.15)":avg>=3?"rgba(245,158,11,0.15)":"rgba(239,68,68,0.15)"):"#21262D",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:c}}>
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

export default function Marking(){
  const [forms,setForms]=useState([]);
  const [allSubs,setAllSubs]=useState({});
  const [people,setPeople]=useState([]);
  const [designations,setDesignations]=useState([]);
  const [groups,setGroups]=useState([]); // [{groupId,groupName,designation,forms:[]}]
  const [saved,setSaved]=useState(false);
  const [saving,setSaving]=useState(false);
  const [loading,setLoading]=useState(true);
  const [subsLoaded,setSubsLoaded]=useState(false);
  const [view,setView]=useState("config");
  const [newGroupName,setNewGroupName]=useState("");
  const [addingGroup,setAddingGroup]=useState(false);

  useEffect(()=>{
    Promise.all([getForms(),getPeople(),getDesignations()]).then(([fl,p,d])=>{
      setForms(fl);
      setPeople(p);
      setDesignations(d||[]);
      setLoading(false);
      // Load marking config
      getMarkingConfig().then(cfg=>{
        if(cfg){
          if(cfg.groups&&cfg.groups.length>0){
            // New format - validate form IDs
            const validIds=fl.map(f=>f.id);
            const validated=cfg.groups.map(g=>({...g,forms:(g.forms||[]).filter(f=>validIds.includes(f.formId))}));
            setGroups(validated);
          } else if(cfg.teamMembers||cfg.teamLeaders){
            // Migrate old format
            const migrated=[];
            if(cfg.teamMembers?.forms?.length>0) migrated.push({groupId:"grp_tm",groupName:"Team Members",designation:"Team Member",forms:cfg.teamMembers.forms||[]});
            if(cfg.teamLeaders?.forms?.length>0) migrated.push({groupId:"grp_tl",groupName:"Team Leaders",designation:"Team Leader",forms:cfg.teamLeaders.forms||[]});
            setGroups(migrated);
          }
        }
      }).catch(()=>{});
      // Load submissions
      Promise.all(fl.map(f=>
        getSubmissions(f.id).then(subs=>setAllSubs(prev=>({...prev,[f.id]:subs}))).catch(()=>{})
      )).then(()=>setSubsLoaded(true));
    }).catch(()=>setLoading(false));
  },[]);

  function addGroup(){
    if(!newGroupName.trim()) return;
    const newGroup={groupId:"grp_"+Date.now(),groupName:newGroupName.trim(),designation:"",forms:[]};
    setGroups(prev=>[...prev,newGroup]);
    setNewGroupName("");
    setAddingGroup(false);
  }

  function updateGroup(groupId,updated){
    setGroups(prev=>prev.map(g=>g.groupId===groupId?updated:g));
  }

  function deleteGroup(groupId){
    setGroups(prev=>prev.filter(g=>g.groupId!==groupId));
  }

  async function saveConfig(){
    setSaving(true);
    await saveMarkingConfig({groups});
    setSaving(false);
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  }

  const allValid=groups.length>0&&groups.every(g=>g.forms.reduce((a,f)=>a+f.weight,0)===100);

  if(loading||!subsLoaded) return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <div style={{display:"flex",flexDirection:"column",gap:6}}><Skel w={120} h={24}/><Skel w={200} h={14}/></div>
        <Skel w={120} h={36} r={9}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
        {[1,2,3,4].map(i=>(<div key={i} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}><Skel w="40%" h={24}/><div style={{marginTop:6}}><Skel w="60%" h={12}/></div></div>))}
      </div>
      {[1,2].map(i=>(<div key={i} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,padding:20,display:"flex",flexDirection:"column",gap:12}}><Skel w="50%" h={18}/>{[1,2,3].map(j=>(<Skel key={j} h={48} r={10}/>))}</div>))}
    </div>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>Marking</h2>
          <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>Create groups → assign designation → configure form weights → leaderboard</p>
        </div>
        <button onClick={saveConfig}
          style={{padding:"8px 18px",borderRadius:9,border:"none",background:saving?"#374151":saved?"#16a34a":"linear-gradient(135deg,#D97706,#F59E0B)",color:saving||saved?"white":"#000",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
          {saving?<svg style={{width:14,height:14,animation:"spin 1s linear infinite"}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>:<Save size={14}/>}
          {saving?"Saving...":saved?"Saved!":"Save Config"}
        </button>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        {[
          {l:"Groups",v:groups.length,c:"#F59E0B"},
          {l:"Total People",v:people.length,c:"#3B82F6"},
          {l:"Forms",v:forms.length,c:"#10B981"},
          {l:"Ready",v:groups.filter(g=>g.forms.reduce((a,f)=>a+f.weight,0)===100).length+"/"+groups.length,c:allValid?"#22c55e":"#6b7280"},
        ].map(s=>(
          <div key={s.l} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}>
            <p style={{color:s.c,fontSize:20,fontWeight:800,margin:0}}>{s.v}</p>
            <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>{s.l}</p>
          </div>
        ))}
      </div>

      {view==="config"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Groups */}
          {groups.map((group,i)=>(
            <div key={group.groupId} style={{marginBottom:8}}>
            <GroupConfigurator group={group} allForms={forms}
              designations={designations}
              onChange={updated=>updateGroup(group.groupId,updated)}
              onDelete={deleteGroup}/>
            </div>
          ))}

          {/* Add group */}
          {addingGroup?(
            <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:16,display:"flex",gap:10}}>
              <input value={newGroupName} onChange={e=>setNewGroupName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addGroup()}
                placeholder="Group name (e.g. Managers, Seniors...)" autoFocus
                style={{flex:1,background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"9px 12px",color:"white",fontSize:13,outline:"none"}}/>
              <button onClick={addGroup} disabled={!newGroupName.trim()}
                style={{padding:"9px 18px",borderRadius:8,border:"none",background:newGroupName.trim()?"linear-gradient(135deg,#D97706,#F59E0B)":"#21262D",color:newGroupName.trim()?"#000":"#4b5563",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                Create
              </button>
              <button onClick={()=>{setAddingGroup(false);setNewGroupName("");}}
                style={{padding:"9px 12px",borderRadius:8,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:13,cursor:"pointer"}}>
                <X size={14}/>
              </button>
            </div>
          ):(
            <button onClick={()=>setAddingGroup(true)}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"12px 0",border:"1px dashed #30363D",borderRadius:12,color:"#6b7280",background:"transparent",cursor:"pointer",fontSize:13}}
              onMouseOver={e=>{e.currentTarget.style.color="#F59E0B";e.currentTarget.style.borderColor="rgba(245,158,11,0.4)";}}
              onMouseOut={e=>{e.currentTarget.style.color="#6b7280";e.currentTarget.style.borderColor="#30363D";}}>
              <Plus size={15}/> Add Group
            </button>
          )}

          {/* Warnings */}
          {groups.length>0&&!allValid&&(
            <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"12px 16px",fontSize:13,color:"#F59E0B",textAlign:"center"}}>
              ⚠️ All groups must total exactly 100% before viewing the leaderboard.
            </div>
          )}

          {/* View leaderboard */}
          {allValid&&(
            <button onClick={()=>setView("leaderboard")}
              style={{padding:"12px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:14,fontWeight:700,cursor:"pointer"}}>
              View Leaderboard 🏆
            </button>
          )}
        </div>
      )}

      {view==="leaderboard"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <button onClick={()=>setView("config")}
            style={{alignSelf:"flex-start",padding:"8px 16px",borderRadius:9,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:13,cursor:"pointer"}}>
            ← Back to Config
          </button>
          {groups.map(group=>(
            <GroupLeaderboard key={group.groupId} group={group}
              people={people} allForms={forms} allSubs={allSubs}/>
          ))}
        </div>
      )}
    </div>
  );
}
