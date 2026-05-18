"use client";
import { getForms } from "@/lib/sheets";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

function getColor(form){const T={amber:"#F59E0B",blue:"#3B82F6",green:"#10B981",rose:"#F43F5E",violet:"#8B5CF6",cyan:"#06B6D4"};return form?.customColor||T[form?.theme]||"#F59E0B";}

export default function Home(){
  const [email,setEmail]=useState("");
  const [err,setErr]=useState("");
  const [myForms,setMyForms]=useState(null);
  const [finding,setFinding]=useState(false);

  async function handleFind(){
    if(!email.trim()){setErr("Please enter your email.");return;}
    if(!email.includes("@")){setErr("Please enter a valid email.");return;}
    setFinding(true);
    setErr("");
    setMyForms(null);
    try{
      const fl=await getForms();
      const e=email.toLowerCase().trim();
      const active=fl.filter(f=>f.active);
      const found=active.filter(form=>(form.connections||[]).some(c=>c.reviewerEmail&&c.reviewerEmail.toLowerCase()===e));
      setMyForms(found);
    }catch(e){
      setErr("Error loading forms. Please try again.");
    }
    setFinding(false);
  }

  return(
    <div style={{minHeight:"100vh",background:"#0D1117",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"var(--font-dm-sans)"}}>
      <style>{"@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>
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
            {finding?<><svg style={{width:14,height:14,animation:"spin 1s linear infinite"}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Finding...</>:<>Find <ChevronRight size={16}/></>}
          </button>
        </div>
        {err&&<p style={{color:"#ef4444",fontSize:12,margin:"8px 0 0"}}>{err}</p>}
      </div>
      {myForms!==null&&(
        <div style={{width:"min(540px,100%)",marginTop:20,display:"flex",flexDirection:"column",gap:12}}>
          {myForms.length===0?(
            <p style={{color:"#6b7280",fontSize:14,textAlign:"center"}}>No review assignments found for this email.</p>
          ):(
            myForms.map(form=>{
              const color=getColor(form);
              const conns=(form.connections||[]).filter(c=>c.reviewerEmail&&c.reviewerEmail.toLowerCase()===email.toLowerCase().trim());
              const total=conns.reduce((a,c)=>a+(c.revieweeNames||[]).length,0);
              return(
                <a key={form.id} href={"/form/"+form.id+"?email="+encodeURIComponent(email)}
                  style={{display:"block",background:"#161B22",border:"1px solid "+color+"44",borderRadius:14,padding:20,textDecoration:"none",transition:"all 0.2s"}}
                  onMouseOver={e=>e.currentTarget.style.borderColor=color}
                  onMouseOut={e=>e.currentTarget.style.borderColor=color+"44"}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <p style={{color:"white",fontSize:15,fontWeight:700,margin:"0 0 4px"}}>{form.name}</p>
                      <p style={{color:"#6b7280",fontSize:12,margin:0}}>{total} person{total!==1?"s":""} to review</p>
                    </div>
                    <ChevronRight size={20} color={color}/>
                  </div>
                </a>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}