"use client";
import { getForms, getSubmissions } from "@/lib/sheets";
import { useState, useEffect } from "react";
import { ChevronRight, CheckCircle, Clock, ChevronLeft } from "lucide-react";

function getColor(form){const T={amber:"#F59E0B",blue:"#3B82F6",green:"#10B981",rose:"#F43F5E",violet:"#8B5CF6",cyan:"#06B6D4"};return form?.customColor||T[form?.theme]||"#F59E0B";}
function Skeleton({w="100%",h=20,r=8}){return<div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#161B22 25%,#21262D 50%,#161B22 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>;}

export default function MyForms(){
  const [email,setEmail]=useState("");
  const [myForms,setMyForms]=useState(null);
  const [finding,setFinding]=useState(true);
  const [formProgress,setFormProgress]=useState({});
  const [err,setErr]=useState("");
  const [name,setName]=useState("");
  const [particles,setParticles]=useState([]);
  const [stars]=useState(()=>Array.from({length:15},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,size:1+Math.random()*2,delay:Math.random()*3,dur:2+Math.random()*3})));

  async function loadForms(e){
    setFinding(true);setErr("");setMyForms(null);
    try{
      let fl;
      try{
        const cached=sessionStorage.getItem("forms_cache");
        const cachedTime=sessionStorage.getItem("forms_cache_time");
        if(cached&&cachedTime&&Date.now()-Number(cachedTime)<120000) fl=JSON.parse(cached);
      }catch{}
      if(!fl){
        fl=await getForms();
        try{sessionStorage.setItem("forms_cache",JSON.stringify(fl));sessionStorage.setItem("forms_cache_time",Date.now().toString());}catch{}
      }
      const active=fl.filter(f=>f.active);
      const found=active.filter(form=>(form.connections||[]).some(c=>c.reviewerEmail&&c.reviewerEmail.toLowerCase()===e.toLowerCase().trim()));
      const progress={};
      await Promise.all(found.map(async form=>{
        const conn=(form.connections||[]).find(c=>c.reviewerEmail&&c.reviewerEmail.toLowerCase()===e.toLowerCase().trim());
        if(conn){
          const subs=await getSubmissions(form.id);
          const reviewed=subs.filter(s=>s.reviewerEmail===e.toLowerCase().trim()).map(s=>s.personName);
          const total=(conn.revieweeNames||[]).length;
          progress[form.id]={reviewed:reviewed.length,total,done:reviewed.length>=total};
        }
      }));
      setFormProgress(progress);
      setMyForms(found);
    }catch(e){setErr("Error loading forms.");}
    setFinding(false);
  }

  useEffect(()=>{
    const interval=setInterval(()=>{
      setParticles(prev=>[...prev.slice(-4),{id:Date.now(),x:Math.random()*100,y:Math.random()*100,color:["#F59E0B","#3B82F6","#10B981","#8B5CF6"][Math.floor(Math.random()*4)]}]);
    },3000);
    const e=sessionStorage.getItem("reviewer_email");
    const n=sessionStorage.getItem("reviewer_name");
    if(!e){ window.location.href="/"; return; }
    setEmail(e);
    setName(n||e);
    setTimeout(()=>loadForms(e),300);
  },[]);

  function handleLogout(){
    sessionStorage.removeItem("reviewer_email");
    sessionStorage.removeItem("reviewer_name");
    sessionStorage.removeItem("forms_cache");
    sessionStorage.removeItem("forms_cache_time");
    window.location.href="/";
  }

  const allDone=myForms&&myForms.length>0&&myForms.every(f=>formProgress[f.id]?.done);
  const pendingForms=myForms?myForms.filter(f=>!formProgress[f.id]?.done):[];
  const doneForms=myForms?myForms.filter(f=>formProgress[f.id]?.done):[];

  return(
    <div style={{minHeight:"100vh",background:"#0D1117",display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 20px",fontFamily:"var(--font-dm-sans)",position:"relative",overflow:"hidden"}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:0.8}}@keyframes particleFade{0%{opacity:0.6}100%{opacity:0;transform:translateY(-40px)}}"}</style>
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(245,158,11,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.02) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none",zIndex:0}}/>
      {stars.map(s=><div key={s.id} style={{position:"fixed",left:s.x+"%",top:s.y+"%",width:s.size,height:s.size,borderRadius:"50%",background:"white",opacity:0.2,pointerEvents:"none",animation:`twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,zIndex:0}}/>)}
      {particles.map(p=><div key={p.id} style={{position:"fixed",left:p.x+"%",top:p.y+"%",width:4,height:4,borderRadius:"50%",background:p.color,pointerEvents:"none",animation:"particleFade 3s ease-out forwards",zIndex:0}}/>)}

      {/* Header */}
      <div style={{width:"min(540px,100%)",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:32}}>
        <button onClick={handleLogout}
          style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:13,padding:0}}
          onMouseOver={e=>e.currentTarget.style.color="#ef4444"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>
          <ChevronLeft size={16}/> Logout
        </button>
        <div style={{textAlign:"right"}}>
          <p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{name}</p>
          <p style={{color:"#6b7280",fontSize:11,margin:"2px 0 0"}}>{email}</p>
        </div>
      </div>

      {/* Title */}
      <div style={{width:"min(540px,100%)",marginBottom:24,textAlign:"center"}}>
        <h1 style={{color:"white",fontSize:28,fontWeight:800,margin:"0 0 8px",fontFamily:"var(--font-playfair)"}}>My Reviews</h1>
        <p style={{color:"#6b7280",fontSize:14,margin:0}}>Your assigned performance reviews</p>
      </div>

      {/* Loading */}
      {finding&&(
        <div style={{width:"min(540px,100%)",display:"flex",flexDirection:"column",gap:12}}>
          {[1,2].map(i=>(
            <div key={i} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,padding:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <Skeleton w="60%" h={18}/><Skeleton w={60} h={24} r={999}/>
              </div>
              <Skeleton w="40%" h={14}/>
            </div>
          ))}
        </div>
      )}

      {!finding&&myForms!==null&&(
        <div style={{width:"min(540px,100%)",display:"flex",flexDirection:"column",gap:12}}>
          {err&&<p style={{color:"#ef4444",fontSize:13,textAlign:"center"}}>{err}</p>}

          {allDone&&(
            <div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:14,padding:"20px",textAlign:"center",marginBottom:4}}>
              <div style={{fontSize:36,marginBottom:8}}>🎉</div>
              <p style={{color:"#22c55e",fontSize:16,fontWeight:700,margin:"0 0 4px"}}>You're All Done!</p>
              <p style={{color:"#6b7280",fontSize:13,margin:0}}>All your reviews have been submitted. Great job!</p>
            </div>
          )}

          {myForms.length===0&&(
            <div style={{textAlign:"center",padding:"48px 0",background:"#161B22",border:"1px solid #21262D",borderRadius:14,color:"#4b5563"}}>
              <p style={{fontSize:32,margin:"0 0 12px"}}>📋</p>
              <p style={{fontSize:14,margin:0}}>No review assignments found for your account.</p>
            </div>
          )}

          {pendingForms.map(form=>{
            const color=getColor(form);
            const prog=formProgress[form.id]||{reviewed:0,total:0,done:false};
            const pct=prog.total>0?Math.round((prog.reviewed/prog.total)*100):0;
            return(
              <a key={form.id} href={"/form/"+form.id+"?email="+encodeURIComponent(email)}
                style={{display:"block",background:"#161B22",border:"1px solid "+color+"44",borderRadius:14,padding:20,textDecoration:"none",transition:"all 0.2s",position:"relative",overflow:"hidden"}}
                onMouseOver={ev=>ev.currentTarget.style.borderColor=color}
                onMouseOut={ev=>ev.currentTarget.style.borderColor=color+"44"}>
                <div style={{height:3,background:color,position:"absolute",top:0,left:0,width:pct+"%",transition:"width 0.5s"}}/>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>{form.name}</p>
                  <span style={{fontSize:11,color:color,background:color+"15",padding:"3px 10px",borderRadius:999,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                    <Clock size={11}/> {prog.reviewed}/{prog.total}
                  </span>
                </div>
                {form.description&&<p style={{color:"#6b7280",fontSize:12,margin:"0 0 8px"}}>{form.description}</p>}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <p style={{color:"#6b7280",fontSize:12,margin:0}}>Click to start reviewing</p>
                  <ChevronRight size={16} color={color}/>
                </div>
                {prog.total>0&&(
                  <div style={{marginTop:10,height:4,background:"#21262D",borderRadius:999,overflow:"hidden"}}>
                    <div style={{height:"100%",background:color,borderRadius:999,width:pct+"%",transition:"width 0.5s"}}/>
                  </div>
                )}
              </a>
            );
          })}

          {doneForms.length>0&&(
            <div style={{marginTop:pendingForms.length>0?8:0}}>
              {pendingForms.length>0&&<p style={{color:"#4b5563",fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 8px"}}>Completed</p>}
              {doneForms.map(form=>{
                const color=getColor(form);
                const prog=formProgress[form.id];
                return(
                  <a key={form.id} href={"/form/"+form.id+"?email="+encodeURIComponent(email)}
                    style={{display:"block",background:"#161B22",border:"1px solid rgba(34,197,94,0.3)",borderRadius:14,padding:20,textDecoration:"none",marginBottom:8,opacity:0.7,transition:"all 0.2s",position:"relative",overflow:"hidden"}}
                    onMouseOver={ev=>{ev.currentTarget.style.opacity="1";ev.currentTarget.style.borderColor="rgba(34,197,94,0.6)";}}
                    onMouseOut={ev=>{ev.currentTarget.style.opacity="0.7";ev.currentTarget.style.borderColor="rgba(34,197,94,0.3)";}}>
                    <div style={{height:3,background:"#22c55e",position:"absolute",top:0,left:0,width:"100%"}}/>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>{form.name}</p>
                      <span style={{fontSize:11,color:"#22c55e",background:"rgba(34,197,94,0.12)",padding:"3px 10px",borderRadius:999,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                        <CheckCircle size={11}/> Done {prog?.reviewed}/{prog?.total}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
