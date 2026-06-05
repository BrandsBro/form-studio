"use client";
import { getPeople, saveSecurityLog } from "@/lib/sheets";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";

export default function ManagementLogin(){
  const [email,setEmail]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    // Already logged in → go to forms
    const e=sessionStorage.getItem("reviewer_email");
    if(e) window.location.href="/forms";
  },[]);

  async function handleLogin(){
    if(!email.trim()){setErr("Please enter your email.");return;}
    if(!email.includes("@")){setErr("Please enter a valid email.");return;}
    setLoading(true);setErr("");
    try{
      const people=await getPeople();
      const person=people.find(p=>p.email.toLowerCase().trim()===email.toLowerCase().trim());
      if(!person){
        setErr("Email not found. Please check and try again.");
        saveSecurityLog({email:email.trim(),name:"",type:"Management Login",status:"Failed"});
        setLoading(false);
        return;
      }
      saveSecurityLog({email:person.email,name:person.name,type:"Management Login",status:"Success"});
      sessionStorage.setItem("reviewer_email",person.email.toLowerCase().trim());
      sessionStorage.setItem("reviewer_name",person.name);
      window.location.href="/forms";
    }catch(e){
      setErr("Error connecting. Please try again.");
      setLoading(false);
    }
  }

  return(
    <div style={{minHeight:"100vh",background:"#0D1117",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"var(--font-dm-sans)"}}>
      <style>{"@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>

      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:56,height:56,borderRadius:16,background:"rgba(245,158,11,0.15)",border:"1px solid rgba(245,158,11,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:26}}>⭐</div>
        <h1 style={{color:"white",fontSize:28,fontWeight:800,margin:"0 0 8px",fontFamily:"var(--font-playfair)"}}>Performance Reviews</h1>
        <p style={{color:"#6b7280",fontSize:14,margin:0}}>Enter your email to access your reviews</p>
      </div>

      <div style={{width:"min(400px,100%)",background:"#161B22",border:"1px solid #21262D",borderRadius:16,padding:28}}>
        <label style={{fontSize:11,color:"#6b7280",display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em"}}>Your Email Address</label>
        <input value={email} onChange={e=>{setEmail(e.target.value);setErr("");}}
          onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          placeholder="your@email.com" type="email" autoFocus
          style={{width:"100%",background:"#0D1117",border:"1px solid "+(err?"rgba(239,68,68,0.5)":"#21262D"),borderRadius:10,padding:"12px 16px",color:"white",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:err?8:16}}
          onFocus={e=>e.target.style.borderColor="#F59E0B"} onBlur={e=>e.target.style.borderColor=err?"rgba(239,68,68,0.5)":"#21262D"}/>
        {err&&<p style={{color:"#ef4444",fontSize:12,margin:"0 0 14px"}}>{err}</p>}
        <button onClick={handleLogin} disabled={loading}
          style={{width:"100%",padding:"13px 0",borderRadius:10,border:"none",background:loading?"#374151":"linear-gradient(135deg,#D97706,#F59E0B)",color:loading?"#9ca3af":"#000",fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {loading
            ?<><svg style={{width:16,height:16,animation:"spin 1s linear infinite"}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Finding your forms...</>
            :<>Continue <ChevronRight size={18}/></>
          }
        </button>
      </div>
    </div>
  );
}
