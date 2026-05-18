"use client";
import { getForms, getSubmissions, getPeople } from "@/lib/sheets";
import { useState, useEffect } from "react";

function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function Av({name="",size=32}){const color=gc(name);return<div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}

function getFormColor(form){const T={amber:"#F59E0B",blue:"#3B82F6",green:"#10B981",rose:"#F43F5E",violet:"#8B5CF6",cyan:"#06B6D4"};return form?.customColor||T[form?.theme]||"#F59E0B";}


export default function Overview(){
  const [forms,setForms]=useState([]);
  const [selectedId,setSelectedId]=useState(null);
  const [people,setPeople]=useState([]);
  const [allSubs,setAllSubs]=useState([]);

  useEffect(()=>{
    getForms().then(data=>{setForms(data);if(data.length){setSelectedId(data[0].id);}});
    getPeople().then(setPeople);
  },[]);

  const form=forms.find(f=>f.id===selectedId);
  useEffect(()=>{ if(selectedId) getSubmissions(selectedId).then(setAllSubs); },[selectedId]);
  const color=form?getFormColor(form):"#F59E0B";
  const subs=form?allSubs:[];
  const rFields=(form?.fields||[]).filter(f=>f.type==="rating");
  const connections=form?.connections||[];

  // Who has been reviewed and who hasn't
  const allReviewees=[...new Set(connections.flatMap(c=>c.revieweeNames))];
  const reviewedPeople=[...new Set(subs.map(s=>s.personName))];
  const notReviewed=allReviewees.filter(n=>!reviewedPeople.includes(n));

  // Who has submitted and who hasn't (reviewers)
  const allReviewers=connections.map(c=>({name:c.reviewerName,email:c.reviewerEmail,total:c.revieweeNames.length}));
  const reviewerProgress=allReviewers.map(r=>{
    const done=subs.filter(s=>s.reviewerEmail===r.email).length;
    return{...r,done,pct:r.total>0?Math.round((done/r.total)*100):0};
  });

  // Avg per question
  const qAvgs=rFields.map(f=>{
    const vals=subs.map(s=>s.values?.[f.id]||0).filter(v=>v>0);
    return{label:f.label,avg:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0};
  });

  const overallAvg=subs.length&&rFields.length?(subs.flatMap(s=>rFields.map(f=>s.values?.[f.id]||0)).filter(v=>v>0).reduce((a,b)=>a+b,0)/(subs.filter(s=>rFields.some(f=>s.values?.[f.id]>0)).length*rFields.length)):0;

  const completionPct=allReviewers.length?Math.round(reviewerProgress.reduce((a,r)=>a+r.pct,0)/allReviewers.length):0;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div>
        <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>Overview</h2>
        <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>Summary per form — submissions, scores, completion</p>
      </div>

      {/* Form selector */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {forms.map(f=>{
          const c=getFormColor(f);
          const sel=f.id===selectedId;
          return(
            <button key={f.id} onClick={()=>setSelectedId(f.id)}
              style={{padding:"8px 18px",borderRadius:10,border:`2px solid ${sel?c+"88":"#21262D"}`,background:sel?c+"15":"#161B22",color:sel?c:"#6b7280",fontSize:13,fontWeight:sel?600:400,cursor:"pointer",transition:"all 0.2s",display:"flex",alignItems:"center",gap:8}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:sel?c:"#374151",display:"inline-block"}}/>
              {f.name.length>30?f.name.slice(0,30)+"...":f.name}
            </button>
          );
        })}
      </div>

      {!form?(
        <div style={{textAlign:"center",padding:60,background:"#161B22",border:"1px solid #21262D",borderRadius:12,color:"#4b5563"}}>
          <p style={{fontSize:32,margin:"0 0 10px"}}>📋</p>
          <p style={{margin:0}}>No forms yet. Create one in Forms tab.</p>
        </div>
      ):(
        <>
          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
            {[
              {l:"Total Submissions",v:subs.length,c:color,icon:"📋"},
              {l:"Avg Score",v:overallAvg>0?overallAvg.toFixed(2)+"/5":"—",c:"#22c55e",icon:"⭐"},
              {l:"Completion",v:completionPct+"%",c:"#3B82F6",icon:"✅"},
              {l:"People Reviewed",v:reviewedPeople.length+"/"+allReviewees.length,c:"#8B5CF6",icon:"👥"},
              {l:"Pending Reviews",v:notReviewed.length,c:notReviewed.length>0?"#ef4444":"#22c55e",icon:"⏳"},
              {l:"Questions",v:rFields.length,c:"#F59E0B",icon:"❓"},
            ].map(s=>(
              <div key={s.l} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:18}}>{s.icon}</span>
                  <span style={{color:s.c,fontSize:22,fontWeight:800}}>{s.v}</span>
                </div>
                <p style={{color:"#6b7280",fontSize:11,margin:0}}>{s.l}</p>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
            {/* Avg score per question */}
            <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:20}}>
              <p style={{color:"white",fontSize:14,fontWeight:700,margin:"0 0 16px"}}>Average Score per Question</p>
              {qAvgs.length===0&&<p style={{color:"#4b5563",fontSize:13}}>No submissions yet.</p>}
              {qAvgs.map((q,i)=>{
                const c=q.avg>=4?"#22c55e":q.avg>=3?"#F59E0B":q.avg>=2?"#f97316":"#ef4444";
                return(
                  <div key={i} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:11,color:"#9ca3af",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginRight:8}}>Q{i+1}. {q.label}</span>
                      <span style={{fontSize:12,fontWeight:700,color:c,flexShrink:0}}>{q.avg.toFixed(2)}/5</span>
                    </div>
                    <div style={{height:6,background:"#21262D",borderRadius:999,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:999,background:c,width:(q.avg/5*100)+"%",transition:"width 0.6s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reviewer progress */}
            <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:20}}>
              <p style={{color:"white",fontSize:14,fontWeight:700,margin:"0 0 16px"}}>Reviewer Progress</p>
              {reviewerProgress.length===0&&<p style={{color:"#4b5563",fontSize:13}}>No connections set up.</p>}
              {reviewerProgress.map((r,i)=>{
                const c=r.pct===100?"#22c55e":r.pct>0?"#F59E0B":"#ef4444";
                return(
                  <div key={i} style={{marginBottom:12,padding:"10px 12px",background:"#0D1117",borderRadius:10,border:"1px solid #21262D"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <Av name={r.name} size={28}/>
                        <div>
                          <p style={{color:"white",fontSize:12,fontWeight:600,margin:0}}>{r.name}</p>
                          <p style={{color:"#4b5563",fontSize:10,margin:0}}>{r.email}</p>
                        </div>
                      </div>
                      <span style={{color:c,fontSize:12,fontWeight:700}}>{r.done}/{r.total}</span>
                    </div>
                    <div style={{height:4,background:"#21262D",borderRadius:999,overflow:"hidden"}}>
                      <div style={{height:"100%",background:c,borderRadius:999,width:r.pct+"%",transition:"width 0.5s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* People reviewed vs not */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={{background:"#161B22",border:"1px solid rgba(34,197,94,0.2)",borderRadius:12,padding:18}}>
              <p style={{color:"#22c55e",fontSize:13,fontWeight:700,margin:"0 0 12px"}}>✓ Reviewed ({reviewedPeople.length})</p>
              {reviewedPeople.length===0&&<p style={{color:"#4b5563",fontSize:12}}>None yet.</p>}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {reviewedPeople.map(name=>{
                  const count=subs.filter(s=>s.personName===name).length;
                  const vals=subs.filter(s=>s.personName===name).flatMap(s=>rFields.map(f=>s.values?.[f.id]||0)).filter(v=>v>0);
                  const avg=vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2):null;
                  return(
                    <div key={name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#0D1117",borderRadius:8}}>
                      <Av name={name} size={30}/>
                      <p style={{color:"white",fontSize:12,fontWeight:600,margin:0,flex:1}}>{name}</p>
                      <span style={{fontSize:11,color:"#6b7280"}}>{count} review{count>1?"s":""}</span>
                      {avg&&<span style={{fontSize:11,color:"#22c55e",fontWeight:700}}>{avg}/5</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{background:"#161B22",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,padding:18}}>
              <p style={{color:"#ef4444",fontSize:13,fontWeight:700,margin:"0 0 12px"}}>⏳ Not Yet Reviewed ({notReviewed.length})</p>
              {notReviewed.length===0&&<p style={{color:"#22c55e",fontSize:12}}>Everyone has been reviewed! ✓</p>}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {notReviewed.map(name=>(
                  <div key={name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#0D1117",borderRadius:8}}>
                    <Av name={name} size={30}/>
                    <p style={{color:"#9ca3af",fontSize:12,margin:0}}>{name}</p>
                    <span style={{marginLeft:"auto",fontSize:10,color:"#ef4444",background:"rgba(239,68,68,0.1)",padding:"2px 8px",borderRadius:999}}>Pending</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent submissions */}
          {subs.length>0&&(
            <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:20}}>
              <p style={{color:"white",fontSize:14,fontWeight:700,margin:"0 0 14px"}}>Recent Submissions</p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[...subs].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,8).map((s,i)=>{
                  const vals=rFields.map(f=>s.values?.[f.id]||0).filter(v=>v>0);
                  const avg=vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2):null;
                  const c=avg>=4?"#22c55e":avg>=3?"#F59E0B":avg>=2?"#f97316":"#ef4444";
                  const date=s.updatedAt?new Date(s.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"—";
                  return(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#0D1117",borderRadius:10,border:"1px solid #21262D"}}>
                      <Av name={s.personName} size={34}/>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{s.personName}</p>
                        <p style={{color:"#6b7280",fontSize:11,margin:"2px 0 0"}}>by {s.reviewerEmail}</p>
                      </div>
                      {avg&&<span style={{color:c,fontSize:14,fontWeight:800}}>{avg}/5</span>}
                      <span style={{color:"#4b5563",fontSize:11}}>{date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
