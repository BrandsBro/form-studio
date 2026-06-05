"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveSecurityLog } from "@/lib/sheets";
import { Eye, EyeOff, ChevronRight } from "lucide-react";

export default function AdminLogin(){
  const [password,setPassword]=useState("");
  const [showPass,setShowPass]=useState(false);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [mounted,setMounted]=useState(false);
  const [particles,setParticles]=useState([]);
  const [stars]=useState(()=>Array.from({length:20},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,size:1+Math.random()*2,delay:Math.random()*3,dur:2+Math.random()*3})));
  const router=useRouter();

  useEffect(()=>{
    setMounted(true);
    if(sessionStorage.getItem("admin_auth")==="true") router.replace("/admin/dashboard");
    const interval=setInterval(()=>{
      setParticles(prev=>[...prev.slice(-6),{id:Date.now(),x:Math.random()*100,y:Math.random()*100,color:["#F59E0B","#3B82F6","#10B981","#8B5CF6"][Math.floor(Math.random()*4)]}]);
    },2000);
    return()=>clearInterval(interval);
  },[]);

  function handleLogin(){
    if(!password.trim()){setErr("Please enter password.");return;}
    setLoading(true);
    setTimeout(()=>{
      if(password==="2XmWwVq5A436"){
        saveSecurityLog({email:"admin",name:"Admin",type:"Admin Login",status:"Success"});
        sessionStorage.setItem("admin_auth","true");
        router.replace("/admin/dashboard");
      } else {
        saveSecurityLog({email:"admin",name:"Unknown",type:"Admin Login",status:"Failed"});
        setErr("Incorrect password.");
        setLoading(false);
      }
    },400);
  }

  return(
    <div style={{minHeight:"100vh",background:"#0D1117",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"var(--font-dm-sans)",overflow:"hidden",position:"relative"}}>
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-12px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:1;transform:scale(1.5)}}
        @keyframes particleFade{0%{opacity:0.8}100%{opacity:0;transform:scale(0) translateY(-50px)}}
        @keyframes gradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes pulse{0%,100%{box-shadow:0 0 20px rgba(245,158,11,0.2)}50%{box-shadow:0 0 40px rgba(245,158,11,0.4)}}
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @keyframes ringPulse{0%{transform:scale(0.8);opacity:0.6}100%{transform:scale(1.8);opacity:0}}
      `}</style>
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(245,158,11,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}}/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden"}}><div style={{position:"absolute",width:"100%",height:1,background:"linear-gradient(90deg,transparent,rgba(245,158,11,0.06),transparent)",animation:"scanline 6s linear infinite"}}/></div>
      {stars.map(s=><div key={s.id} style={{position:"fixed",left:s.x+"%",top:s.y+"%",width:s.size,height:s.size,borderRadius:"50%",background:"white",opacity:0.3,pointerEvents:"none",animation:`twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`}}/>)}
      {particles.map(p=><div key={p.id} style={{position:"fixed",left:p.x+"%",top:p.y+"%",width:5,height:5,borderRadius:"50%",background:p.color,pointerEvents:"none",animation:"particleFade 2s ease-out forwards",boxShadow:`0 0 8px ${p.color}`}}/>)}
      <div style={{position:"fixed",top:"30%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:600,background:"radial-gradient(circle,rgba(245,158,11,0.04),transparent 70%)",pointerEvents:"none"}}/>

      <div style={{position:"relative",zIndex:1,width:"min(380px,100%)",animation:mounted?"fadeUp 0.7s ease":"none",opacity:mounted?1:0}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{position:"relative",display:"inline-block",marginBottom:20}}>
          {[0,1,2].map(i=><div key={i} style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:56+i*24,height:56+i*24,borderRadius:"50%",border:"1px solid rgba(245,158,11,0.15)",animation:`ringPulse ${2+i*0.7}s ease-out ${i*0.4}s infinite`}}/>)}
        <div style={{width:56,height:56,borderRadius:16,background:"rgba(245,158,11,0.15)",border:"1px solid rgba(245,158,11,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",fontSize:26,animation:"float 3s ease-in-out infinite, pulse 3s ease-in-out infinite",position:"relative"}}>★</div></div></div>
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
      <p style={{textAlign:"center",color:"#374151",fontSize:11,marginTop:16,fontFamily:"monospace"}}>FormStudio · Admin Access</p>
      </div>
    </div>
  );
}
