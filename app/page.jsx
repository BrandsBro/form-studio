"use client";
import { getForms, getSubmissions } from "@/lib/sheets";
import { useState, useEffect, useRef } from "react";
import { ChevronRight, CheckCircle, Clock } from "lucide-react";

function getColor(form){const T={amber:"#F59E0B",blue:"#3B82F6",green:"#10B981",rose:"#F43F5E",violet:"#8B5CF6",cyan:"#06B6D4"};return form?.customColor||T[form?.theme]||"#F59E0B";}
function Skeleton({w="100%",h=20,r=8}){return <div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#161B22 25%,#21262D 50%,#161B22 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>;}

export default function Home(){
  const [email,setEmail]=useState("");
  const [err,setErr]=useState("");
  const [myForms,setMyForms]=useState(null);
  const [finding,setFinding]=useState(()=>{
    if(typeof window!=="undefined"){
      const params=new URLSearchParams(window.location.search);
      return !!params.get("email");
    }
    return false;
  });
  const [formProgress,setFormProgress]=useState({});
  const loadedRef=useRef(false);

  async function handleFindWithEmail(e){
    setFinding(true);setErr("");setMyForms(null);
    try{
      const fl=await getForms();
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
    }catch(e){setErr("Error loading forms. Please try again.");}
    setFinding(false);
  }

  useEffect(()=>{
    if(loadedRef.current) return;
    loadedRef.current=true;
    const params=new URLSearchParams(window.location.search);
    const e=params.get("email");
    if(e){
      setEmail(e);
      handleFindWithEmail(e.toLowerCase().trim());
    }
  },[]);

  async function handleFind(){
    if(!email.trim()){setErr("Please enter your email.");return;}
    if(!email.includes("@")){setErr("Please enter a valid email.");return;}
    handleFindWithEmail(email.toLowerCase().trim());
  }

  const allDone=myForms&&myForms.length>0&&myForms.every(f=>formProgress[f.id]?.done);
  const pendingForms=myForms?myForms.filter(f=>!formProgress[f.id]?.done):[];
  const doneForms=myForms?myForms.filter(f=>formProgress[f.id]?.done):[];
  const e=email.toLowerCase().trim();

  return(
    <div style={{minHeight:"100vh",background:"#0D1117",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"var(--font-dm-sans)"}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>
      <div style={{textAlign:"center",marginBottom:32}}>
        <h1 style={{color:"white",fontSize:32,fontWeight:800,margin:"0 0 8px",fontFamily:"var(--font-playfair)"}}>Performance Reviews</h1>
        <p style={{color:"#6b7280",fontSize:15,margin:0}}>Enter your email to see your assigned reviews</p>
      </div>

      <div style={{width:"min(540px,100%)",background:"#161B22",border:"1px solid #21262D",borderRadius:16,padding:28}}>
        <p style={{color:"#9ca3af",fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",margin:"0 0 10px"}}>Your Email Address</p>
        <div style={{display:"flex",gap:10}}>
          <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleFind()}
            placeholder="your@email.com" type="email"
            style={{flex:1,padding:"11px 14px",borderRadius:10,border:"1px solid #21262D",background:"#0D1117",color:"white",fontSize:14,outline:"none"}}/>
          <button onClick={handleFind} disabled={finding}
            style={{padding:"11px 20px",borderRadius:10,border:"none",background:finding?"#374151":"linear-gradient(135deg,#D97706,#F59E0B)",color:finding?"#9ca3af":"#000",fontSize:14,fontWeight:700,cursor:finding?"not-allowed":"pointer",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6}}>
            {finding
              ?<><svg style={{width:14,height:14,animation:"spin 1s linear infinite"}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Finding...</>
              :<>Find <ChevronRight size={16}/></>
            }
          </button>
        </div>
        {err&&<p style={{color:"#ef4444",fontSize:12,margin:"8px 0 0"}}>{err}</p>}
      </div>

      {/* Loading skeleton */}
      {finding&&(
        <div style={{width:"min(540px,100%)",marginTop:20,display:"flex",flexDirection:"column",gap:12}}>
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

      {/* Forms list */}
      {!finding&&myForms!==null&&(
        <div style={{width:"min(540px,100%)",marginTop:20,display:"flex",flexDirection:"column",gap:12}}>

          {/* All done banner */}
          {allDone&&(
            <div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:14,padding:"18px 20px",textAlign:"center",marginBottom:4}}>
              <div style={{fontSize:32,marginBottom:6}}>🎉</div>
              <p style={{color:"#22c55e",fontSize:15,fontWeight:700,margin:"0 0 4px"}}>All Reviews Completed!</p>
              <p style={{color:"#6b7280",fontSize:12,margin:0}}>Great job! All your assigned reviews are submitted.</p>
            </div>
          )}

          {myForms.length===0?(
            <p style={{color:"#6b7280",fontSize:14,textAlign:"center"}}>No review assignments found for this email.</p>
          ):allDone?(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <p style={{color:"#22c55e",fontSize:15,fontWeight:700,margin:0}}>You're all done! 🎉</p>
              <p style={{color:"#6b7280",fontSize:13,margin:"8px 0 0"}}>All your reviews have been submitted. Thank you!</p>
            </div>
          ):(
            pendingForms.map(form=>{
              const color=getColor(form);
              const prog=formProgress[form.id]||{reviewed:0,total:0,done:false};
              const pct=prog.total>0?Math.round((prog.reviewed/prog.total)*100):0;
              return(
                <a key={form.id} href={"/form/"+form.id+"?email="+encodeURIComponent(e)}
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
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <p style={{color:"#6b7280",fontSize:12,margin:0}}>Click to continue reviewing</p>
                    <ChevronRight size={16} color={color}/>
                  </div>
                  {prog.total>0&&(
                    <div style={{marginTop:10,height:4,background:"#21262D",borderRadius:999,overflow:"hidden"}}>
                      <div style={{height:"100%",background:color,borderRadius:999,width:pct+"%",transition:"width 0.5s"}}/>
                    </div>
                  )}
                </a>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
