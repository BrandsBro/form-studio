"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ChevronRight } from "lucide-react";

export default function AdminLogin(){
  const [password,setPassword]=useState("");
  const [showPass,setShowPass]=useState(false);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const router=useRouter();

  useEffect(()=>{
    if(sessionStorage.getItem("admin_auth")==="true") router.replace("/admin/dashboard");
  },[]);

  function handleLogin(){
    if(!password.trim()){setErr("Please enter password.");return;}
    setLoading(true);
    setTimeout(()=>{
      if(password==="2XmWwVq5A436"){
        sessionStorage.setItem("admin_auth","true");
        router.replace("/admin/dashboard");
      } else {
        setErr("Incorrect password.");
        setLoading(false);
      }
    },400);
  }

  return(
    <div style={{minHeight:"100vh",background:"#0D1117",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"var(--font-dm-sans)"}}>
      <style>{"@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>

      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:56,height:56,borderRadius:16,background:"rgba(245,158,11,0.15)",border:"1px solid rgba(245,158,11,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:26}}>★</div>
        <h1 style={{color:"white",fontSize:26,fontWeight:800,margin:"0 0 8px",fontFamily:"var(--font-playfair)"}}>FormStudio Admin</h1>
        <p style={{color:"#6b7280",fontSize:14,margin:0}}>Enter your admin password to continue</p>
      </div>

      <div style={{width:"min(380px,100%)",background:"#161B22",border:"1px solid #21262D",borderRadius:16,padding:28}}>
        <label style={{fontSize:11,color:"#6b7280",display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em"}}>Admin Password</label>
        <div style={{position:"relative",marginBottom:err?8:16}}>
          <input value={password} onChange={e=>{setPassword(e.target.value);setErr("");}}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            type={showPass?"text":"password"} placeholder="Enter password..." autoFocus
            style={{width:"100%",background:"#0D1117",border:"1px solid "+(err?"rgba(239,68,68,0.5)":"#21262D"),borderRadius:10,padding:"12px 44px 12px 16px",color:"white",fontSize:14,outline:"none",boxSizing:"border-box"}}
            onFocus={e=>e.target.style.borderColor="#F59E0B"} onBlur={e=>e.target.style.borderColor=err?"rgba(239,68,68,0.5)":"#21262D"}/>
          <button onClick={()=>setShowPass(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#6b7280",display:"flex"}}
            onMouseOver={e=>e.currentTarget.style.color="white"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>
            {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
          </button>
        </div>
        {err&&<p style={{color:"#ef4444",fontSize:12,margin:"0 0 14px"}}>{err}</p>}
        <button onClick={handleLogin} disabled={loading}
          style={{width:"100%",padding:"13px 0",borderRadius:10,border:"none",background:loading?"#374151":"linear-gradient(135deg,#D97706,#F59E0B)",color:loading?"#9ca3af":"#000",fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {loading
            ?<><svg style={{width:16,height:16,animation:"spin 1s linear infinite"}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Signing in...</>
            :<>Enter Dashboard <ChevronRight size={18}/></>
          }
        </button>
      </div>
    </div>
  );
}
