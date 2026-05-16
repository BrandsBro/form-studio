"use client";
import { useState, useEffect } from "react";
import { ChevronRight, Star } from "lucide-react";

function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function getColor(form){const T={amber:"#F59E0B",blue:"#3B82F6",green:"#10B981",rose:"#F43F5E",violet:"#8B5CF6",cyan:"#06B6D4"};return form?.customColor||T[form?.theme]||"#F59E0B";}

function getReviewedCount(formId, email){
  try{return JSON.parse(localStorage.getItem("submissions_"+formId)||"[]").filter(s=>s.reviewerEmail===email).length;}catch{return 0;}
}

export default function Home(){
  const [email,setEmail]=useState("");
  const [err,setErr]=useState("");
  const [myForms,setMyForms]=useState(null); // null=not searched, []=searched but none
  const [allForms,setAllForms]=useState([]);

  useEffect(()=>{
    const sf=localStorage.getItem("forms_list");
    if(sf){try{setAllForms(JSON.parse(sf).filter(f=>f.active));}catch{}}
  },[]);

  function handleFind(){
    if(!email.trim()){setErr("Please enter your email.");return;}
    if(!email.includes("@")){setErr("Please enter a valid email.");return;}
    const e=email.toLowerCase().trim();
    // Find all active forms where this email has a connection
    const found=allForms.filter(form=>
      (form.connections||[]).some(c=>c.reviewerEmail.toLowerCase()===e)
    );
    setMyForms(found);
    if(!found.length)setErr("No review assignments found for this email.");
    else setErr("");
  }

  function goToForm(formId){
    window.location.href="/form/"+formId+"?email="+encodeURIComponent(email.trim());
  }

  return(
    <div style={{minHeight:"100vh",background:"#0D1117",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:540}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontSize:40,marginBottom:12}}>📋</div>
          <h1 style={{color:"white",fontSize:26,fontWeight:700,margin:"0 0 8px",fontFamily:"var(--font-playfair)"}}>Performance Reviews</h1>
          <p style={{color:"#6b7280",fontSize:14,margin:0}}>Enter your email to see your assigned reviews</p>
        </div>

        {/* Email input */}
        <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:16,padding:24,marginBottom:16}}>
          <label style={{fontSize:11,color:"#6b7280",display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em"}}>Your Email Address</label>
          <div style={{display:"flex",gap:10}}>
            <input
              value={email}
              onChange={e=>{setEmail(e.target.value);setErr("");setMyForms(null);}}
              onKeyDown={e=>e.key==="Enter"&&handleFind()}
              placeholder="your@email.com"
              type="email"
              autoFocus
              style={{flex:1,background:"#0D1117",border:"1px solid "+(err?"rgba(239,68,68,0.5)":"#21262D"),borderRadius:10,padding:"11px 14px",color:"white",fontSize:14,outline:"none",transition:"border-color 0.2s"}}
              onFocus={e=>e.target.style.borderColor="#F59E0B"}
              onBlur={e=>e.target.style.borderColor=err?"rgba(239,68,68,0.5)":"#21262D"}
            />
            <button onClick={handleFind}
              style={{padding:"11px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:14,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6}}>
              Find <ChevronRight size={16}/>
            </button>
          </div>
          {err&&<p style={{color:"#ef4444",fontSize:12,margin:"8px 0 0"}}>{err}</p>}
        </div>

        {/* Forms list */}
        {myForms!==null&&myForms.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{color:"#6b7280",fontSize:13,margin:"0 0 4px"}}>
              Found <strong style={{color:"white"}}>{myForms.length}</strong> form{myForms.length>1?"s":""} assigned to you:
            </p>
            {myForms.map(form=>{
              const color=getColor(form);
              const conn=(form.connections||[]).find(c=>c.reviewerEmail.toLowerCase()===email.toLowerCase().trim());
              const totalToReview=conn?.revieweeNames?.length||0;
              const reviewed=getReviewedCount(form.id,email.toLowerCase().trim());
              const allDone=reviewed>=totalToReview&&totalToReview>0;
              return(
                <button key={form.id} onClick={()=>goToForm(form.id)}
                  style={{background:"#161B22",border:"1px solid #21262D",borderRadius:16,overflow:"hidden",cursor:"pointer",textAlign:"left",width:"100%",transition:"all 0.2s"}}
                  onMouseOver={e=>{e.currentTarget.style.borderColor=color+"55";e.currentTarget.style.transform="translateY(-1px)";}}
                  onMouseOut={e=>{e.currentTarget.style.borderColor="#21262D";e.currentTarget.style.transform="none";}}>
                  <div style={{height:3,background:"linear-gradient(90deg,"+color+","+color+"33)"}}/>
                  <div style={{padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{color:"white",fontSize:15,fontWeight:700,margin:0}}>{form.name}</p>
                      {form.description&&<p style={{color:"#6b7280",fontSize:13,margin:"4px 0 8px"}}>{form.description}</p>}
                      <div style={{display:"flex",gap:12,alignItems:"center"}}>
                        <span style={{fontSize:11,color:"#6b7280"}}>{totalToReview} to review</span>
                        {reviewed>0&&(
                          <span style={{fontSize:11,color:allDone?"#22c55e":"#F59E0B",fontWeight:600}}>
                            {allDone?"✓ All done":"•"+reviewed+" done"}
                          </span>
                        )}
                        {conn?.type&&(
                          <span style={{fontSize:10,color:conn.type==="multi"?"#8B5CF6":"#3B82F6",background:conn.type==="multi"?"rgba(139,92,246,0.12)":"rgba(59,130,246,0.12)",padding:"2px 8px",borderRadius:999,fontWeight:600}}>
                            {conn.type==="multi"?"One → Many":"One → One"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
                      {totalToReview>0&&(
                        <div style={{width:40,height:40,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"33",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:12,fontWeight:700,color}}>{reviewed}/{totalToReview}</span>
                        </div>
                      )}
                      <ChevronRight size={16} color={color}/>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {myForms!==null&&myForms.length===0&&!err&&(
          <div style={{textAlign:"center",padding:40,background:"#161B22",border:"1px solid #21262D",borderRadius:16,color:"#4b5563"}}>
            <p style={{fontSize:32,margin:"0 0 12px"}}>🔍</p>
            <p style={{fontSize:14,margin:0}}>No review assignments found.</p>
            <p style={{fontSize:12,margin:"6px 0 0"}}>Contact your admin to set up your connections.</p>
          </div>
        )}

      </div>
    </div>
  );
}
