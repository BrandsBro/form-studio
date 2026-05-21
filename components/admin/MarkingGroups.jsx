"use client";
import { useState, useEffect } from "react";
import { getPeople, getMarkingConfig, getMarkingGroups, saveMarkingGroup, deleteMarkingGroup, deleteMarkingGroupAll } from "@/lib/sheets";
import { Plus, Trash2, Search, Check } from "lucide-react";

function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function Av({name="",size=36}){const color=gc(name);return<div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}
function Skel({w="100%",h=20,r=8}){return<div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#161B22 25%,#21262D 50%,#161B22 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>;}
function Spinner(){return<svg style={{width:12,height:12,animation:"spin 1s linear infinite"}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>;}

export default function MarkingGroupsTab(){
  const [people,setPeople]=useState([]);
  const [groups,setGroups]=useState([]);
  const [markingGroups,setMarkingGroups]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selectedGroup,setSelectedGroup]=useState(null);
  const [search,setSearch]=useState("");
  const [adding,setAdding]=useState(null); // personName being added
  const [removing,setRemoving]=useState(null); // personName being removed

  useEffect(()=>{
    Promise.all([getPeople(),getMarkingConfig(),getMarkingGroups()]).then(([p,cfg,mg])=>{
      setPeople(p||[]);
      // Extract groups from marking config
      const grps=cfg?.groups||[];
      setGroups(grps);
      if(grps.length>0) setSelectedGroup(grps[0]);
      setMarkingGroups(mg||[]);
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  // People in selected group
  const groupMembers=markingGroups.filter(mg=>mg.groupId===selectedGroup?.groupId).map(mg=>mg.personName);

  // People NOT in selected group
  const filtered=people
    .filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.email.toLowerCase().includes(search.toLowerCase()));

  async function handleAdd(person){
    if(!selectedGroup) return;
    setAdding(person.name);
    await saveMarkingGroup({groupId:selectedGroup.groupId,groupName:selectedGroup.groupName,personName:person.name});
    setMarkingGroups(prev=>[...prev,{groupId:selectedGroup.groupId,groupName:selectedGroup.groupName,personName:person.name}]);
    setAdding(null);
  }

  async function handleRemove(personName){
    if(!selectedGroup) return;
    setRemoving(personName);
    await deleteMarkingGroup({groupId:selectedGroup.groupId,personName});
    setMarkingGroups(prev=>prev.filter(mg=>!(mg.groupId===selectedGroup.groupId&&mg.personName===personName)));
    setRemoving(null);
  }

  async function handleClearGroup(){
    if(!selectedGroup) return;
    await deleteMarkingGroupAll({groupId:selectedGroup.groupId});
    setMarkingGroups(prev=>prev.filter(mg=>mg.groupId!==selectedGroup.groupId));
  }

  if(loading) return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style>
      <Skel w={180} h={28}/>
      <div style={{display:"flex",gap:8}}>{[1,2,3].map(i=><Skel key={i} w={120} h={36} r={10}/>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Skel h={400} r={14}/>
        <Skel h={400} r={14}/>
      </div>
    </div>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>

      {/* Header */}
      <div>
        <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>Marking Groups</h2>
        <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>Assign people to marking groups for score calculation</p>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        {[
          {l:"Groups",v:groups.length,c:"#F59E0B"},
          {l:"Total People",v:people.length,c:"#3B82F6"},
          {l:"Assigned",v:new Set(markingGroups.map(mg=>mg.personName)).size,c:"#22c55e"},
          {l:"Unassigned",v:people.length-new Set(markingGroups.map(mg=>mg.personName)).size,c:"#ef4444"},
        ].map(s=>(
          <div key={s.l} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}>
            <p style={{color:s.c,fontSize:20,fontWeight:800,margin:0}}>{s.v}</p>
            <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>{s.l}</p>
          </div>
        ))}
      </div>

      {groups.length===0?(
        <div style={{textAlign:"center",padding:"48px 0",background:"#161B22",border:"1px solid #21262D",borderRadius:12,color:"#4b5563"}}>
          <p style={{fontSize:32,margin:"0 0 12px"}}>📊</p>
          <p style={{fontSize:14,margin:0}}>No groups yet.</p>
          <p style={{fontSize:12,margin:"6px 0 0"}}>Create groups in the Marking tab first.</p>
        </div>
      ):(
        <>
          {/* Group tabs */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {groups.map(g=>{
              const color=gc(g.groupName);
              const count=markingGroups.filter(mg=>mg.groupId===g.groupId).length;
              const isSel=selectedGroup?.groupId===g.groupId;
              return(
                <button key={g.groupId} onClick={()=>{setSelectedGroup(g);setSearch("");}}
                  style={{padding:"8px 18px",borderRadius:10,border:"2px solid "+(isSel?color+"88":"#21262D"),background:isSel?color+"15":"#161B22",color:isSel?color:"#6b7280",fontSize:13,fontWeight:isSel?600:400,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:isSel?color:"#374151"}}/>
                  {g.groupName}
                  <span style={{fontSize:10,background:"#0D1117",color:isSel?color:"#4b5563",padding:"1px 7px",borderRadius:999}}>{count}</span>
                </button>
              );
            })}
          </div>

          {selectedGroup&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

              {/* Left — Group Members */}
              <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,overflow:"hidden"}}>
                <div style={{padding:"14px 18px",borderBottom:"1px solid #21262D",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{selectedGroup.groupName}</p>
                    <p style={{color:"#6b7280",fontSize:12,margin:"2px 0 0"}}>{groupMembers.length} members</p>
                  </div>
                  {groupMembers.length>0&&(
                    <button onClick={handleClearGroup}
                      style={{padding:"5px 10px",borderRadius:7,border:"1px solid rgba(239,68,68,0.3)",background:"transparent",color:"#ef4444",fontSize:11,cursor:"pointer"}}>
                      Clear All
                    </button>
                  )}
                </div>
                <div style={{padding:12,display:"flex",flexDirection:"column",gap:8,maxHeight:400,overflowY:"auto"}}>
                  {groupMembers.length===0?(
                    <div style={{textAlign:"center",padding:"32px 0",color:"#4b5563",fontSize:13}}>
                      No members yet. Add from the right →
                    </div>
                  ):(
                    groupMembers.map(name=>{
                      const person=people.find(p=>p.name===name);
                      const color=gc(name);
                      return(
                        <div key={name} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#0D1117",borderRadius:10,border:"1px solid "+color+"22"}}>
                          <Av name={name} size={32}/>
                          <div style={{flex:1,minWidth:0}}>
                            <p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{name}</p>
                            {person?.department&&<p style={{color:"#6b7280",fontSize:11,margin:"2px 0 0"}}>{person.department}</p>}
                          </div>
                          <button onClick={()=>handleRemove(name)} disabled={removing===name}
                            style={{padding:"4px 8px",borderRadius:6,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}
                            onMouseOver={e=>{e.currentTarget.style.borderColor="rgba(239,68,68,0.4)";e.currentTarget.style.color="#ef4444";}}
                            onMouseOut={e=>{e.currentTarget.style.borderColor="#21262D";e.currentTarget.style.color="#6b7280";}}>
                            {removing===name?<Spinner/>:<Trash2 size={11}/>}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right — All People */}
              <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,overflow:"hidden"}}>
                <div style={{padding:"14px 18px",borderBottom:"1px solid #21262D"}}>
                  <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>All People</p>
                  <p style={{color:"#6b7280",fontSize:12,margin:"2px 0 0"}}>Click + to add to {selectedGroup.groupName}</p>
                </div>
                <div style={{padding:12,display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{position:"relative"}}>
                    <Search size={13} color="#6b7280" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}}/>
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
                      style={{width:"100%",background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"8px 10px 8px 30px",color:"white",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:340,overflowY:"auto"}}>
                    {filtered.map(person=>{
                      const isInGroup=groupMembers.includes(person.name);
                      const color=gc(person.name);
                      return(
                        <div key={person.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:isInGroup?"rgba(34,197,94,0.05)":getPersonGroup(person.name)?"rgba(245,158,11,0.03)":"#0D1117",borderRadius:10,border:"1px solid "+(isInGroup?"rgba(34,197,94,0.2)":getPersonGroup(person.name)?"rgba(245,158,11,0.15)":"#21262D")}}>
                          <Av name={person.name} size={32}/>
                          <div style={{flex:1,minWidth:0}}>
                            <p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{person.name}</p>
                            <div style={{display:"flex",gap:4,marginTop:2,flexWrap:"wrap"}}>
                              {(person.designations||[]).map(d=><span key={d} style={{fontSize:9,color:"#6b7280",background:"#21262D",padding:"1px 5px",borderRadius:999}}>{d}</span>)}
                              {person.department&&<span style={{fontSize:9,color:"#4b5563",background:"#161B22",padding:"1px 5px",borderRadius:999}}>🏢{person.department}</span>}
                            </div>
                          </div>
                          {(()=>{
                            const personGroup=getPersonGroup(person.name);
                            if(isInGroup) return <span style={{fontSize:11,color:"#22c55e",background:"rgba(34,197,94,0.1)",padding:"3px 8px",borderRadius:999,fontWeight:600}}>✓ In this group</span>;
                            if(personGroup) return <span style={{fontSize:10,color:"#F59E0B",background:"rgba(245,158,11,0.1)",padding:"3px 8px",borderRadius:999,fontWeight:600}} title={"In: "+personGroup.groupName}>In {personGroup.groupName}</span>;
                            return(
                              <button onClick={()=>handleAdd(person)} disabled={adding===person.name}
                                style={{width:28,height:28,borderRadius:"50%",border:"1px solid "+color+"44",background:color+"18",color,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}
                                onMouseOver={e=>{e.currentTarget.style.background=color+"33";e.currentTarget.style.borderColor=color;}}
                                onMouseOut={e=>{e.currentTarget.style.background=color+"18";e.currentTarget.style.borderColor=color+"44";}}>
                                {adding===person.name?<Spinner/>:"+"}
                              </button>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
