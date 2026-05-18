"use client";
import { getForms, getPeople } from "@/lib/sheets";
import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, RotateCcw, Settings } from "lucide-react";
import { getInvalidated, invalidateSubmission, restoreSubmission } from "@/lib/roles";

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=36}){const color=gc(name);return<div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}

function getFormSubs(formId){
  try{return JSON.parse(localStorage.getItem("submissions_"+formId)||"[]");}catch{return[];}
}

function calcAvg(subs,fields,excludeEmail=null,invalidated=[]){
  const rFields=fields.filter(f=>f.type==="rating");
  if(!rFields.length)return null;
  const valid=subs.filter(s=>{
    if(excludeEmail&&s.reviewerEmail===excludeEmail)return false;
    if(invalidated.some(i=>i.reviewerEmail===s.reviewerEmail&&i.personName===s.personName&&i.formId===s.formId))return false;
    return true;
  });
  if(!valid.length)return null;
  const totals=valid.map(s=>rFields.map(f=>s.values?.[f.id]||0).reduce((a,b)=>a+b,0)/rFields.length);
  return totals.reduce((a,b)=>a+b,0)/totals.length;
}

function ScoreChip({label,score,weight,color}){
  return(
    <div style={{background:color+"10",border:"1px solid "+color+"33",borderRadius:8,padding:"8px 12px",textAlign:"center",minWidth:80}}>
      <p style={{color,fontSize:14,fontWeight:800,margin:0}}>{score!==null?(score/5*100).toFixed(1)+"%":"—"}</p>
      <p style={{color:"#6b7280",fontSize:9,margin:"2px 0 0"}}>{label} ({weight}%)</p>
    </div>
  );
}

export default function ReReview(){
  const [forms,setForms]=useState([]);
  const [people,setPeople]=useState([]);
  const [threshold,setThreshold]=useState(20);
  const [editThreshold,setEditThreshold]=useState(false);
  const [invalidated,setInvalidated]=useState([]);
  const [refresh,setRefresh]=useState(0);

  useEffect(()=>{
    getForms().then(setForms);
    getPeople().then(setPeople);
    const st=localStorage.getItem("rr_threshold");
    if(st){try{setThreshold(parseInt(st));}catch{}}
    setInvalidated(getInvalidated());
  },[refresh]);

  function saveThreshold(v){
    const val=Math.min(100,Math.max(1,parseInt(v)||20));
    setThreshold(val);
    localStorage.setItem("rr_threshold",String(val));
    setEditThreshold(false);
    setRefresh(r=>r+1);
  }

  function handleInvalidate(reviewerEmail,personName,formId){
    invalidateSubmission(reviewerEmail,personName,formId);
    setRefresh(r=>r+1);
  }
  function handleRestore(reviewerEmail,personName,formId){
    restoreSubmission(reviewerEmail,personName,formId);
    setRefresh(r=>r+1);
  }

  // ── SECTION 1: Team Leaders ───────────────────────────────────────────────
  // Forms containing "team member" in name = forms filled by team members to review leaders
  const tmForms=forms.filter(f=>f.name.toLowerCase().includes("team member"));
  const teamLeaders=people.filter(p=>(p.designations||[]).includes("Team Leader"));

  const tlFlags=[];
  const tlInvalidated=[];

  tmForms.forEach(form=>{
    const fields=form.fields||[];
    teamLeaders.forEach(leader=>{
      const subs=getFormSubs(form.id).filter(s=>s.personName===leader.name);
      if(!subs.length)return;

      const overallAvg=calcAvg(subs,fields,[],invalidated);
      if(overallAvg===null)return;
      const overallPct=(overallAvg/5)*100;

      // Check each reviewer's impact
      subs.forEach(sub=>{
        const isInv=invalidated.some(i=>i.reviewerEmail===sub.reviewerEmail&&i.personName===leader.name&&i.formId===form.id);
        const reviewerFields=fields.filter(f=>f.type==="rating");
        const reviewerScore=reviewerFields.length?reviewerFields.map(f=>sub.values?.[f.id]||0).reduce((a,b)=>a+b,0)/reviewerFields.length:0;
        const scoreWithout=calcAvg(subs,fields,sub.reviewerEmail,invalidated);

        // PM weight 13%, HR weight 12%
        const pmScore=overallAvg!==null?overallAvg*(13/100):null;
        const hrScore=overallAvg!==null?overallAvg*(12/100):null;

        const entry={leader,form,reviewerEmail:sub.reviewerEmail,reviewerScore,overallAvg,overallPct,scoreWithout,reviewerCount:subs.length,pmScore,hrScore,isInv};

        if(isInv) tlInvalidated.push(entry);
        else if(overallPct<=threshold) tlFlags.push(entry);
      });
    });
  });

  const uniqueTLFlags=tlFlags.filter((f,i)=>tlFlags.findIndex(x=>x.leader.name===f.leader.name&&x.reviewerEmail===f.reviewerEmail&&x.form.id===f.form.id)===i);
  const uniqueTLInv=tlInvalidated.filter((f,i)=>tlInvalidated.findIndex(x=>x.leader.name===f.leader.name&&x.reviewerEmail===f.reviewerEmail&&x.form.id===f.form.id)===i);

  // ── SECTION 2: Team Members ────────────────────────────────────────────────
  // Flag if they are the ONLY Team Member in their department
  const deptGroups={};
  people.forEach(p=>{
    const dept=p.department||"Unknown";
    if(!deptGroups[dept])deptGroups[dept]=[];
    deptGroups[dept].push(p);
  });

  const loneTMFlags=Object.entries(deptGroups)
    .map(([dept,members])=>({
      dept,
      teamMembers:members.filter(p=>(p.designations||[]).includes("Team Member")),
      leaders:members.filter(p=>(p.designations||[]).includes("Team Leader")),
    }))
    .filter(g=>g.teamMembers.length===1) // only ONE team member in dept
    .map(g=>{
      // Calculate their score: TL=60%, HR=40%
      const tm=g.teamMembers[0];
      const allSubs=forms.flatMap(form=>{
        const subs=getFormSubs(form.id).filter(s=>s.reviewerEmail===tm.email);
        const rFields=(form.fields||[]).filter(f=>f.type==="rating");
        return subs.map(s=>({score:rFields.length?rFields.map(f=>s.values?.[f.id]||0).reduce((a,b)=>a+b,0)/rFields.length:0}));
      });
      const avgScore=allSubs.length?allSubs.reduce((a,s)=>a+s.score,0)/allSubs.length:null;
      const tlContrib=avgScore!==null?avgScore*0.6:null;
      const hrContrib=avgScore!==null?avgScore*0.4:null;
      const total=tlContrib!==null?tlContrib+hrContrib:null;
      return{...g,tm,avgScore,tlContrib,hrContrib,total};
    });

  const totalFlags=uniqueTLFlags.length+loneTMFlags.length;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>⚠️ Re-Review</h2>
          <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>Team Leader flags + lone Team Member alerts</p>
        </div>
        {editThreshold?(
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#161B22",border:"1px solid rgba(245,158,11,0.4)",borderRadius:9,padding:"6px 14px"}}>
            <span style={{color:"#6b7280",fontSize:12}}>Threshold:</span>
            <input type="number" defaultValue={threshold} min={1} max={100} autoFocus
              onBlur={e=>saveThreshold(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&saveThreshold(e.target.value)}
              style={{width:46,background:"transparent",border:"none",color:"#F59E0B",fontSize:15,fontWeight:700,outline:"none",textAlign:"center"}}/>
            <span style={{color:"#6b7280",fontSize:12}}>%</span>
          </div>
        ):(
          <button onClick={()=>setEditThreshold(true)}
            style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:9,border:"1px solid #21262D",background:"#161B22",color:"#9ca3af",fontSize:13,cursor:"pointer"}}>
            <Settings size={14}/> TL Threshold: <strong style={{color:"#F59E0B"}}>{threshold}%</strong>
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        {[
          {l:"TL Flagged",    v:uniqueTLFlags.length, c:"#ef4444"},
          {l:"Lone TM",       v:loneTMFlags.length,   c:"#8B5CF6"},
          {l:"Invalidated",   v:uniqueTLInv.length,   c:"#F59E0B"},
          {l:"TL Threshold",  v:threshold+"%",         c:"#3B82F6"},
        ].map(s=>(
          <div key={s.l} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}>
            <p style={{color:s.c,fontSize:20,fontWeight:800,margin:0}}>{s.v}</p>
            <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* ── SECTION 1: Team Leader Flags ── */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:8,borderBottom:"1px solid #21262D"}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:"#ef4444"}}/>
          <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>Team Leader Flags</p>
          <span style={{fontSize:11,color:"#6b7280",background:"#21262D",padding:"2px 10px",borderRadius:999}}>From "Team Members" forms · PM 13% · HR 12% · below {threshold}%</span>
          {tmForms.length===0&&<span style={{fontSize:11,color:"#ef4444"}}>No "Team Members" forms found</span>}
        </div>

        {uniqueTLFlags.length===0?(
          <div style={{textAlign:"center",padding:"28px 0",background:"#161B22",border:"1px solid rgba(34,197,94,0.2)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            <CheckCircle size={20} color="#22c55e"/>
            <p style={{color:"#22c55e",fontSize:13,fontWeight:600,margin:0}}>No Team Leader flags</p>
          </div>
        ):(
          uniqueTLFlags.map((f,i)=>(
            <div key={i} style={{background:"#161B22",border:"1px solid rgba(239,68,68,0.3)",borderRadius:12,padding:18,display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <Av name={f.leader.name} size={44}/>
                  <div>
                    <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{f.leader.name}</p>
                    <p style={{color:"#6b7280",fontSize:12,margin:"3px 0 0"}}>Form: <span style={{color:"#9ca3af"}}>{f.form.name}</span> · {f.reviewerCount} reviewer{f.reviewerCount>1?"s":""}</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <ScoreChip label="PM" score={f.pmScore!==null?f.pmScore/0.13:null} weight={13} color="#8B5CF6"/>
                  <ScoreChip label="HR" score={f.hrScore!==null?f.hrScore/0.12:null} weight={12} color="#F43F5E"/>
                  <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"8px 14px",textAlign:"center"}}>
                    <p style={{color:"#ef4444",fontSize:16,fontWeight:800,margin:0}}>{f.overallPct.toFixed(1)}%</p>
                    <p style={{color:"#6b7280",fontSize:9,margin:"2px 0 0"}}>Overall</p>
                  </div>
                </div>
              </div>

              <div style={{background:"#0D1117",border:"1px solid #21262D",borderRadius:10,padding:14}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                  <div>
                    <p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{f.reviewerEmail}</p>
                    <p style={{color:"#ef4444",fontSize:12,margin:"3px 0 0"}}>Gave {f.reviewerScore.toFixed(2)}/5 → {(f.reviewerScore/5*100).toFixed(1)}%</p>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    {f.scoreWithout!==null&&(
                      <div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:8,padding:"6px 12px",textAlign:"center"}}>
                        <p style={{color:"#22c55e",fontSize:13,fontWeight:700,margin:0}}>{(f.scoreWithout/5*100).toFixed(1)}%</p>
                        <p style={{color:"#6b7280",fontSize:10,margin:"2px 0 0"}}>Without this</p>
                      </div>
                    )}
                    <button onClick={()=>handleInvalidate(f.reviewerEmail,f.leader.name,f.form.id)}
                      style={{padding:"10px 18px",borderRadius:9,border:"none",background:"linear-gradient(135deg,#dc2626,#ef4444)",color:"white",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                      Mark Invalid
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── SECTION 2: Lone Team Members ── */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:8,borderBottom:"1px solid #21262D"}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:"#8B5CF6"}}/>
          <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>Lone Team Members</p>
          <span style={{fontSize:11,color:"#6b7280",background:"#21262D",padding:"2px 10px",borderRadius:999}}>Only TM in their dept · TL 60% · HR 40% · no threshold</span>
        </div>

        {loneTMFlags.length===0?(
          <div style={{textAlign:"center",padding:"28px 0",background:"#161B22",border:"1px solid rgba(139,92,246,0.2)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            <CheckCircle size={20} color="#8B5CF6"/>
            <p style={{color:"#8B5CF6",fontSize:13,fontWeight:600,margin:0}}>No lone Team Members found</p>
          </div>
        ):(
          loneTMFlags.map(({dept,tm,leaders,tlContrib,hrContrib,total},i)=>(
            <div key={i} style={{background:"#161B22",border:"1px solid rgba(139,92,246,0.3)",borderRadius:12,padding:18}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:12}}>
                <div>
                  <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{dept} Department</p>
                  <p style={{color:"#8B5CF6",fontSize:12,margin:"3px 0 0"}}>⚠️ Only 1 Team Member — limited review perspective</p>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <div style={{background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:8,padding:"8px 12px",textAlign:"center"}}>
                    <p style={{color:"#3B82F6",fontSize:14,fontWeight:800,margin:0}}>{tlContrib!==null?(tlContrib/5*100).toFixed(1)+"%":"—"}</p>
                    <p style={{color:"#6b7280",fontSize:9,margin:"2px 0 0"}}>TL (60%)</p>
                  </div>
                  <div style={{background:"rgba(244,63,94,0.1)",border:"1px solid rgba(244,63,94,0.3)",borderRadius:8,padding:"8px 12px",textAlign:"center"}}>
                    <p style={{color:"#F43F5E",fontSize:14,fontWeight:800,margin:0}}>{hrContrib!==null?(hrContrib/5*100).toFixed(1)+"%":"—"}</p>
                    <p style={{color:"#6b7280",fontSize:9,margin:"2px 0 0"}}>HR (40%)</p>
                  </div>
                  <div style={{background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.3)",borderRadius:8,padding:"8px 14px",textAlign:"center"}}>
                    <p style={{color:"#8B5CF6",fontSize:16,fontWeight:800,margin:0}}>{total!==null?(total/5*100).toFixed(1)+"%":"—"}</p>
                    <p style={{color:"#6b7280",fontSize:9,margin:"2px 0 0"}}>Total</p>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10,background:"#0D1117",borderRadius:10,padding:"12px 14px",border:"1px solid rgba(139,92,246,0.2)"}}>
                  <Av name={tm.name} size={38}/>
                  <div>
                    <p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{tm.name}</p>
                    <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>{tm.email} · Sole Team Member</p>
                  </div>
                  <span style={{marginLeft:"auto",fontSize:11,color:"#10B981",background:"rgba(16,185,129,0.1)",padding:"3px 10px",borderRadius:999,fontWeight:600}}>Reviewer</span>
                </div>
                {/* Leaders not shown here - lone TM section focuses on the member only */}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invalidated */}
      {uniqueTLInv.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <p style={{color:"#F59E0B",fontSize:13,fontWeight:600,margin:0}}>🚫 Invalidated ({uniqueTLInv.length})</p>
          {uniqueTLInv.map((f,i)=>(
            <div key={i} style={{background:"#161B22",border:"1px solid rgba(245,158,11,0.2)",borderRadius:12,padding:14,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Av name={f.leader.name} size={34}/>
                <div>
                  <p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{f.leader.name}</p>
                  <p style={{color:"#6b7280",fontSize:11,margin:"2px 0 0"}}>Review by {f.reviewerEmail} on {f.form.name} → <span style={{color:"#ef4444",fontWeight:600}}>INVALID</span></p>
                </div>
              </div>
              <button onClick={()=>handleRestore(f.reviewerEmail,f.leader.name,f.form.id)}
                style={{padding:"7px 14px",borderRadius:8,border:"1px solid #21262D",background:"transparent",color:"#9ca3af",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                <RotateCcw size={13}/> Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
