"use client";
import { getForms, getPeople } from "@/lib/sheets";
import { useState, useEffect } from "react";

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=36}){const color=gc(name);return<div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}

function getSubmissionsForForm(formId){
  try{return JSON.parse(localStorage.getItem("submissions_"+formId)||"[]");}catch{return[];}
}

function getPersonFormAvg(personName,formId,formFields){
  const subs=getSubmissionsForForm(formId).filter(s=>s.personName===personName);
  if(!subs.length)return null;
  const rFields=formFields.filter(f=>f.type==="rating");
  if(!rFields.length)return null;
  const totals=subs.map(s=>rFields.map(f=>s.values?.[f.id]||0).reduce((a,b)=>a+b,0)/rFields.length);
  return totals.reduce((a,b)=>a+b,0)/totals.length;
}

function calcScore(personName,configForms,allForms){
  let weightedSum=0,totalWeight=0,hasData=false;
  configForms.forEach(cf=>{
    const form=allForms.find(f=>f.id===cf.formId);
    if(!form)return;
    const avg=getPersonFormAvg(personName,cf.formId,form.fields||[]);
    if(avg!==null){weightedSum+=avg*(cf.weight/100);totalWeight+=cf.weight;hasData=true;}
  });
  if(!hasData)return null;
  return totalWeight>0?(weightedSum/(totalWeight/100))*100/100:null;
}

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

function Board({title,icon,color,people}){
  const ranked=people.filter(p=>p.score!==null).sort((a,b)=>b.score-a.score);
  const pending=people.filter(p=>p.score===null);
  return(
    <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,overflow:"hidden"}}>
      <div style={{padding:"16px 20px",borderBottom:"1px solid #21262D",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:10,background:color+"18",border:"1px solid "+color+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{icon}</div>
        <div>
          <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{title}</p>
          <p style={{color:"#6b7280",fontSize:12,margin:"2px 0 0"}}>{ranked.length} scored · {pending.length} pending</p>
        </div>
      </div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:8}}>
        {ranked.map((person,i)=>(
          <div key={person.id||person.name} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:i<3?"#0D1117":"transparent",border:"1px solid "+(i<3?color+"22":"#21262D"),borderRadius:12,transition:"all 0.2s"}}>
            <div style={{width:32,textAlign:"center",flexShrink:0}}>
              {i<3
                ?<span style={{fontSize:20}}>{["🥇","🥈","🥉"][i]}</span>
                :<span style={{fontSize:14,fontWeight:700,color:"#4b5563"}}>#{i+1}</span>
              }
            </div>
            <Av name={person.name} size={36}/>
            <div style={{flex:1,minWidth:0}}>
              <p style={{color:"white",fontSize:13,fontWeight:700,margin:0}}>{person.name}</p>
              <p style={{color:"#6b7280",fontSize:11,margin:"4px 0 0"}}>{person.designations?.filter(d=>d!=="Team Member").join(", ")}</p>
            </div>
            <div style={{minWidth:120}}>
              <ScoreBar score={person.score}/>
            </div>
          </div>
        ))}
        {pending.length>0&&(
          <div style={{marginTop:12,padding:14,borderRadius:12,background:"#0D1117",border:"1px solid #21262D"}}>
            <p style={{color:"#6b7280",fontSize:12,margin:"0 0 8px"}}>Pending scores</p>
            {pending.map(person=>(
              <div key={person.id||person.name} style={{padding:"8px 0",borderTop:"1px solid #21262D"}}>
                <p style={{color:"white",fontSize:13,margin:0}}>{person.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const MEDALS=["🥇","🥈","🥉"];

export default function Leaderboard(){
  const [forms,setForms]=useState([]);
  const [people,setPeople]=useState([]);
  const [config,setConfig]=useState({teamMembers:{forms:[]},teamLeaders:{forms:[]}});

  useEffect(()=>{
    getForms().then(setForms);
    getPeople().then(setPeople);
    const sc=localStorage.getItem("marking_config");
    if(sc){try{setConfig(JSON.parse(sc));}catch{}}
  },[]);

  // Combine all people with their scores
  // Team Members use teamMembers config, Team Leaders use teamLeaders config
  const allScored = people.map(p=>{
    const isTM=(p.designations||[]).includes("Team Member");
    const configForms=isTM?config.teamMembers.forms:config.teamLeaders.forms;
    const score=calcScore(p.name,configForms,forms);
    return{...p,score,isTM,configForms};
  }).sort((a,b)=>{
    if(a.score===null&&b.score===null)return 0;
    if(a.score===null)return 1;
    if(b.score===null)return -1;
    return b.score-a.score;
  });

  const ranked=allScored.filter(p=>p.score!==null);
  const pending=allScored.filter(p=>p.score===null);
  const teamLeaders=allScored.filter(p=>!p.isTM);
  const teamMembers=allScored.filter(p=>p.isTM);
  const noConfig=config.teamMembers.forms.length===0&&config.teamLeaders.forms.length===0;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>

      {/* Header */}
      <div>
        <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>🏆 Leaderboard</h2>
        <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>Overall ranking — all people combined by weighted score</p>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
        {[
          {l:"Total People",   v:people.length,         c:"#F59E0B"},
          {l:"Ranked",         v:ranked.length,          c:"#22c55e"},
          {l:"Pending",        v:pending.length,         c:"#6b7280"},
          {l:"Top Score",      v:ranked[0]?ranked[0].score.toFixed(2)+"/5":"—", c:"#8B5CF6"},
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
          <p style={{fontSize:12,margin:"6px 0 0"}}>Go to the Marking tab to configure form weights first.</p>
        </div>
      )}

      {/* Combined leaderboard */}
      {!noConfig&&(
        <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,overflow:"hidden"}}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid #21262D"}}>
            <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>Overall Rankings</p>
            <p style={{color:"#6b7280",fontSize:12,margin:"3px 0 0"}}>{ranked.length} people scored · sorted by final weighted score</p>
          </div>

          <div style={{padding:16,display:"flex",flexDirection:"column",gap:8}}>
            {ranked.map((person,i)=>{
              const color=gc(person.name);
              const isTop3=i<3;
              return(
                <div key={person.id}
                  style={{display:"flex",alignItems:"center",gap:14,padding:"16px",background:i===0?"linear-gradient(90deg,rgba(245,158,11,0.08),transparent)":isTop3?"#0D1117":"transparent",border:"1px solid "+(isTop3?"rgba(245,158,11,0.2)":"#21262D"),borderRadius:12,transition:"all 0.2s"}}
                  onMouseOver={e=>e.currentTarget.style.borderColor=color+"55"}
                  onMouseOut={e=>e.currentTarget.style.borderColor=isTop3?"rgba(245,158,11,0.2)":"#21262D"}>

                  {/* Rank */}
                  <div style={{width:36,textAlign:"center",flexShrink:0}}>
                    {isTop3
                      ?<span style={{fontSize:22}}>{MEDALS[i]}</span>
                      :<span style={{fontSize:15,fontWeight:800,color:"#374151"}}>#{i+1}</span>
                    }
                  </div>

                  <Av name={person.name} size={44}/>

                  {/* Info */}
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{person.name}</p>
                    <div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap",alignItems:"center"}}>
                      <span style={{fontSize:10,color:person.isTM?"#10B981":"#F59E0B",background:person.isTM?"rgba(16,185,129,0.12)":"rgba(245,158,11,0.12)",padding:"2px 8px",borderRadius:999,fontWeight:600}}>
                        {person.isTM?"Team Member":"Team Leader"}
                      </span>
                      {person.designations?.filter(d=>d!=="Team Member").map(d=>(
                        <span key={d} style={{fontSize:10,color:"#6b7280",background:"#21262D",padding:"2px 6px",borderRadius:999}}>{d}</span>
                      ))}
                    </div>
                  </div>

                  {/* Score bar */}
                  <div style={{minWidth:200}}>
                    <ScoreBar score={person.score}/>
                  </div>

                  {/* Per-form scores */}
                  <div style={{display:"flex",gap:4,flexShrink:0}}>
                    {(person.configForms||[]).map(cf=>{
                      const form=forms.find(f=>f.id===cf.formId);
                      const avg=form?getPersonFormAvg(person.name,cf.formId,form.fields||[]):null;
                      const c=avg!==null?(avg>=4?"#22c55e":avg>=3?"#F59E0B":"#ef4444"):"#4b5563";
                      return(
                        <div key={cf.formId} title={form?form.name:""}
                          style={{width:28,height:28,borderRadius:6,background:avg!==null?(avg>=4?"rgba(34,197,94,0.15)":avg>=3?"rgba(245,158,11,0.15)":"rgba(239,68,68,0.15)"):"#21262D",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:c}}>
                          {avg!==null?avg.toFixed(1):"—"}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!noConfig&&<Board title="Team Leaders" icon="⭐" color="#F59E0B" people={teamLeaders} allForms={forms}/>}
      {!noConfig&&<Board title="Team Members" icon="👥" color="#10B981" people={teamMembers} allForms={forms}/>}
    </div>
  );
}
