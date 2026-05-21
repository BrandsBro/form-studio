"use client";
import { getForms, getPeople, getSubmissions, getMarkingConfig, getMarkingGroups } from "@/lib/sheets";
import { useState, useEffect } from "react";

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=36}){const color=gc(name);return<div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}
function Skel({w="100%",h=20,r=8}){return<div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#161B22 25%,#21262D 50%,#161B22 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>;}

function ScoreBar({score}){
  const color=score>=4?"#22c55e":score>=3?"#F59E0B":score>=2?"#f97316":"#ef4444";
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
      <div style={{flex:1,height:8,background:"#21262D",borderRadius:999,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:999,background:color,width:((score/5)*100)+"%",transition:"width 0.8s ease"}}/>
      </div>
      <span style={{fontSize:14,fontWeight:800,color,minWidth:40,textAlign:"right"}}>{score.toFixed(2)}</span>
    </div>
  );
}

// Get average score for a person on a form
function getFormAvg(personName, formId, formFields, allSubs){
  const subs=(allSubs[formId]||[]).filter(s=>s.personName===personName);
  if(!subs.length) return null;
  const rFields=formFields.filter(f=>f.type==="rating");
  if(!rFields.length) return null;
  const reviewerAvgs=subs.map(s=>
    rFields.map(f=>s.values?.[f.id]||0).reduce((a,b)=>a+b,0)/rFields.length
  );
  return reviewerAvgs.reduce((a,b)=>a+b,0)/reviewerAvgs.length;
}

// Calculate final weighted score for a person
function calcPersonScore(personName, groupForms, allForms, allSubs){
  let weightedSum=0, hasData=false;
  groupForms.forEach(cf=>{
    const form=allForms.find(f=>f.id===cf.formId);
    if(!form) return;
    const avg=getFormAvg(personName, cf.formId, form.fields||[], allSubs);
    if(avg!==null){
      weightedSum+=avg*(cf.weight/100);
      hasData=true;
    }
  });
  return hasData?weightedSum:null;
}

const MEDALS=["🥇","🥈","🥉"];

export default function Leaderboard(){
  const [forms,setForms]=useState([]);
  const [people,setPeople]=useState([]);
  const [allSubs,setAllSubs]=useState({});
  const [markingConfig,setMarkingConfig]=useState({groups:[]});
  const [markingGroups,setMarkingGroups]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    async function load(){
      try{
        // Step 1: Load all base data
        const [fl,p,cfg,mg]=await Promise.all([
          getForms(),
          getPeople(),
          getMarkingConfig(),
          getMarkingGroups(),
        ]);
        setForms(fl||[]);
        setPeople(p||[]);
        setMarkingConfig(cfg||{groups:[]});
        setMarkingGroups(mg||[]);

        // Step 2: Load submissions for all forms
        const subsMap={};
        await Promise.all((fl||[]).map(async f=>{
          try{ subsMap[f.id]=await getSubmissions(f.id); }
          catch{ subsMap[f.id]=[]; }
        }));
        setAllSubs(subsMap);
      }catch(e){
        console.error("Leaderboard load error:",e);
      }
      setLoading(false);
    }
    load();
  },[]);

  if(loading) return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style>
      <Skel w={200} h={28}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[1,2,3,4].map(i=><div key={i} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}><Skel w="40%" h={24}/><div style={{marginTop:6}}><Skel w="60%" h={12}/></div></div>)}
      </div>
      <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,overflow:"hidden"}}>
        {[1,2,3,4,5].map(i=>(
          <div key={i} style={{display:"flex",gap:14,alignItems:"center",padding:16,borderBottom:"1px solid #21262D"}}>
            <Skel w={36} h={36} r={6}/><Skel w={44} h={44} r={50}/>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}><Skel w="40%" h={14}/><Skel w="25%" h={10}/></div>
            <Skel w={200} h={8} r={999}/>
          </div>
        ))}
      </div>
    </div>
  );

  const groups=markingConfig.groups||[];
  const noConfig=groups.length===0;
  const noGroups=markingGroups.length===0;

  // Build scored people per group
  const groupScores=groups.map(group=>{
    // Get people in this group from markingGroups sheet
    const groupMemberNames=markingGroups
      .filter(mg=>mg.groupId===group.groupId)
      .map(mg=>mg.personName);

    const groupPeople=people.filter(p=>groupMemberNames.includes(p.name));

    // Score each person
    const scored=groupPeople.map(p=>({
      ...p,
      score:calcPersonScore(p.name, group.forms||[], forms, allSubs),
      groupForms:group.forms||[],
    })).sort((a,b)=>{
      if(a.score===null&&b.score===null) return 0;
      if(a.score===null) return 1;
      if(b.score===null) return -1;
      return b.score-a.score;
    });

    return{group, scored};
  });

  // Overall ranking — all scored people across all groups
  const allScored=groupScores
    .flatMap(({scored})=>scored)
    .filter(p=>p.score!==null)
    .sort((a,b)=>b.score-a.score);

  const allPending=groupScores
    .flatMap(({scored})=>scored)
    .filter(p=>p.score===null);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style>

      {/* Header */}
      <div>
        <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>🏆 Leaderboard</h2>
        <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>Weighted score per person based on group forms</p>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        {[
          {l:"Groups",v:groups.length,c:"#F59E0B"},
          {l:"Ranked",v:allScored.length,c:"#22c55e"},
          {l:"Pending",v:allPending.length,c:"#6b7280"},
          {l:"Top Score",v:allScored[0]?allScored[0].score.toFixed(2)+"/5":"—",c:"#8B5CF6"},
        ].map(s=>(
          <div key={s.l} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}>
            <p style={{color:s.c,fontSize:20,fontWeight:800,margin:0}}>{s.v}</p>
            <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>{s.l}</p>
          </div>
        ))}
      </div>

      {noConfig&&(
        <div style={{textAlign:"center",padding:"48px 0",background:"#161B22",border:"1px solid #21262D",borderRadius:12,color:"#4b5563"}}>
          <p style={{fontSize:32,margin:"0 0 12px"}}>📊</p>
          <p style={{fontSize:14,margin:0}}>No marking config yet.</p>
          <p style={{fontSize:12,margin:"6px 0 0"}}>Go to Marking tab to configure groups and weights first.</p>
        </div>
      )}

      {!noConfig&&noGroups&&(
        <div style={{textAlign:"center",padding:"48px 0",background:"#161B22",border:"1px solid #21262D",borderRadius:12,color:"#4b5563"}}>
          <p style={{fontSize:32,margin:"0 0 12px"}}>👥</p>
          <p style={{fontSize:14,margin:0}}>No people assigned to groups yet.</p>
          <p style={{fontSize:12,margin:"6px 0 0"}}>Go to Groups tab to assign people first.</p>
        </div>
      )}

      {/* Per group leaderboards */}
      {!noConfig&&!noGroups&&groupScores.map(({group,scored})=>{
        const color=gc(group.groupName);
        const ranked=scored.filter(p=>p.score!==null);
        const pending=scored.filter(p=>p.score===null);
        return(
          <div key={group.groupId} style={{background:"#161B22",border:"1px solid "+color+"33",borderRadius:14,overflow:"hidden"}}>
            {/* Group header */}
            <div style={{padding:"16px 20px",borderBottom:"1px solid #21262D",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:10,background:color+"18",border:"1px solid "+color+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color}}>
                {group.groupName.charAt(0)}
              </div>
              <div>
                <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{group.groupName}</p>
                <p style={{color:"#6b7280",fontSize:12,margin:"2px 0 0"}}>
                  {ranked.length} scored · {pending.length} pending · {group.forms?.length||0} forms
                </p>
              </div>
            </div>

            {group.forms?.length===0?(
              <div style={{padding:"24px",textAlign:"center",color:"#4b5563",fontSize:13}}>
                No forms configured for this group. Go to Marking tab.
              </div>
            ):ranked.length===0&&pending.length===0?(
              <div style={{padding:"24px",textAlign:"center",color:"#4b5563",fontSize:13}}>
                No people assigned to this group yet.
              </div>
            ):(
              <div style={{padding:16,display:"flex",flexDirection:"column",gap:8}}>
                {/* Ranked */}
                {ranked.map((person,i)=>(
                  <div key={person.id||person.name}
                    style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:i<3?"#0D1117":"transparent",border:"1px solid "+(i<3?color+"22":"#21262D"),borderRadius:12,transition:"border-color 0.2s"}}
                    onMouseOver={e=>e.currentTarget.style.borderColor=color+"66"}
                    onMouseOut={e=>e.currentTarget.style.borderColor=i<3?color+"22":"#21262D"}>
                    {/* Rank */}
                    <div style={{width:32,textAlign:"center",flexShrink:0}}>
                      {i<3?<span style={{fontSize:20}}>{MEDALS[i]}</span>:<span style={{fontSize:14,fontWeight:700,color:"#4b5563"}}>#{i+1}</span>}
                    </div>
                    {/* Avatar */}
                    <Av name={person.name} size={40}/>
                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{color:"white",fontSize:13,fontWeight:700,margin:0}}>{person.name}</p>
                      <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                        {(person.designations||[]).map(d=>(
                          <span key={d} style={{fontSize:10,color:"#6b7280",background:"#21262D",padding:"1px 6px",borderRadius:999}}>{d}</span>
                        ))}
                      </div>
                    </div>
                    {/* Score bar */}
                    <div style={{minWidth:160}}><ScoreBar score={person.score}/></div>
                    {/* Per-form scores */}
                    <div style={{display:"flex",gap:4,flexShrink:0}}>
                      {(person.groupForms||[]).map(cf=>{
                        const form=forms.find(f=>f.id===cf.formId);
                        const avg=form?getFormAvg(person.name,cf.formId,form.fields||[],allSubs):null;
                        const c=avg!==null?(avg>=4?"#22c55e":avg>=3?"#F59E0B":"#ef4444"):"#4b5563";
                        return(
                          <div key={cf.formId}
                            title={`${cf.name} (${cf.weight}%): ${avg!==null?avg.toFixed(2):"N/A"}`}
                            style={{width:28,height:28,borderRadius:6,background:avg!==null?(avg>=4?"rgba(34,197,94,0.15)":avg>=3?"rgba(245,158,11,0.15)":"rgba(239,68,68,0.15)"):"#21262D",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:c}}>
                            {avg!==null?avg.toFixed(1):"—"}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Pending */}
                {pending.length>0&&(
                  <div style={{marginTop:8,paddingTop:12,borderTop:"1px solid #21262D"}}>
                    <p style={{color:"#4b5563",fontSize:11,margin:"0 0 8px",textTransform:"uppercase",letterSpacing:"0.06em"}}>No submissions yet</p>
                    {pending.map(person=>(
                      <div key={person.id||person.name} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderRadius:10,opacity:0.5}}>
                        <div style={{width:32,textAlign:"center"}}><span style={{color:"#374151",fontSize:13}}>—</span></div>
                        <Av name={person.name} size={32}/>
                        <p style={{color:"#6b7280",fontSize:13,margin:0}}>{person.name}</p>
                        <span style={{marginLeft:"auto",fontSize:11,color:"#374151",background:"#21262D",padding:"3px 10px",borderRadius:999}}>Pending</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
