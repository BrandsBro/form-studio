"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveSecurityLog } from "@/lib/sheets";
import { Eye, EyeOff, ChevronRight } from "lucide-react";

const STYLES = `
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-12px)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
  @keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:1}}
  @keyframes particleFade{0%{opacity:0.8}100%{opacity:0;transform:translateY(-50px)}}
  @keyframes gradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
  @keyframes pulse{0%,100%{box-shadow:0 0 20px rgba(245,158,11,0.2)}50%{box-shadow:0 0 40px rgba(245,158,11,0.4)}}
  @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
  @keyframes ringPulse{0%{transform:scale(0.8);opacity:0.6}100%{transform:scale(1.8);opacity:0}}
`;

export default function AdminLogin(){
  const [password,setPassword]=useState("");
  const [showPass,setShowPass]=useState(false);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [mounted,setMounted]=useState(false);
  const [particles,setParticles]=useState([]);
  const [stars]=useState(()=>Array.from({length:20},(_,i)=>({
    id:i,x:Math.random()*100,y:Math.random()*100,
    size:1+Math.random()*2,delay:Math.random()*3,dur:2+Math.random()*3
  })));
  const router=useRouter();

  useEffect(()=>{
    setMounted(true);
    const t=sessionStorage.getItem("admin_token");
    if(t){try{const d=JSON.parse(atob(t));if(d.v==="adm"&&Date.now()-d.t<28800000) router.replace("/admin/dashboard");}catch{}}
    const interval=setInterval(()=>{
      setParticles(prev=>[...prev.slice(-6),{
        id:Date.now(),x:Math.random()*100,y:Math.random()*100,
        color:["#F59E0B","#3B82F6","#10B981","#8B5CF6"][Math.floor(Math.random()*4)]
      }]);
    },2000);
    return()=>clearInterval(interval);
  },[]);

  function handleLogin(){
    if(!password.trim()){setErr("Please enter password.");return;}
    setLoading(true);
    setTimeout(()=>{
      if(password===process.env.NEXT_PUBLIC_ADMIN_PASSWORD){
        saveSecurityLog({email:"admin",name:"Admin",type:"Admin Login",status:"Success"});
        const token=btoa(JSON.stringify({v:"adm",t:Date.now(),k:password.slice(-4)+Date.now().toString(36)}));
        sessionStorage.setItem("admin_token",token);
        router.replace("/admin/dashboard");
      } else {
        saveSecurityLog({email:"admin",name:"Unknown",type:"Admin Login",status:"Failed"});
        setErr("Incorrect password.");
        setLoading(false);
      }
    },400);
  }

  return(
    <div style={{minHeight:"100vh",background:"#0D1117",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",minHeight:"100vh",padding:20,fontFamily:"var(--font-dm-sans)",overflow:"hidden",position:"relative"}}>
      <style>{STYLES}</style>

      {/* Grid */}
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(245,158,11,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}}/>
      {/* Scanline */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden"}}>
        <div style={{position:"absolute",width:"100%",height:1,background:"linear-gradient(90deg,transparent,rgba(245,158,11,0.06),transparent)",animation:"scanline 6s linear infinite"}}/>
      </div>
      {/* Stars */}
      {stars.map(s=>(
        <div key={s.id} style={{position:"fixed",left:s.x+"%",top:s.y+"%",width:s.size,height:s.size,borderRadius:"50%",background:"white",opacity:0.3,pointerEvents:"none",animationName:"twinkle",animationDuration:s.dur+"s",animationDelay:s.delay+"s",animationIterationCount:"infinite",animationTimingFunction:"ease-in-out"}}/>
      ))}
      {/* Particles */}
      {particles.map(p=>(
        <div key={p.id} style={{position:"fixed",left:p.x+"%",top:p.y+"%",width:5,height:5,borderRadius:"50%",background:p.color,pointerEvents:"none",animation:"particleFade 2s ease-out forwards"}}/>
      ))}
      {/* Glow */}
      <div style={{position:"fixed",top:"30%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:600,background:"radial-gradient(circle,rgba(245,158,11,0.04),transparent 70%)",pointerEvents:"none"}}/>

      <div style={{position:"relative",zIndex:1,width:"min(380px,100%)",opacity:mounted?1:0,animation:mounted?"fadeUp 0.7s ease":"none"}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{position:"relative",display:"inline-block",marginBottom:20}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:56+i*24,height:56+i*24,borderRadius:"50%",border:"1px solid rgba(245,158,11,0.15)",animationName:"ringPulse",animationDuration:(2+i*0.7)+"s",animationDelay:(i*0.4)+"s",animationIterationCount:"infinite"}}/>
            ))}
            <div style={{width:56,height:56,borderRadius:16,background:"rgba(245,158,11,0.15)",border:"1px solid rgba(245,158,11,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,animation:"float 3s ease-in-out infinite",position:"relative"}}>★</div>
          </div>
          <h1 style={{color:"white",fontSize:26,fontWeight:800,margin:"0 0 8px",fontFamily:"var(--font-playfair)"}}>FormStudio Admin</h1>
          <p style={{color:"#6b7280",fontSize:14,margin:0}}>Enter your admin password to continue</p>
        </div>

        {/* Card */}
        <div style={{background:"linear-gradient(180deg,#161B22,#12181F)",border:"1px solid #21262D",borderRadius:16,padding:28,boxShadow:"0 32px 80px rgba(0,0,0,0.5)"}}>
          <div style={{height:2,background:"linear-gradient(90deg,transparent,#F59E0B,transparent)",borderRadius:999,marginBottom:24}}/>
          <label style={{fontSize:11,color:"#6b7280",display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em"}}>Admin Password</label>
          <div style={{position:"relative",marginBottom:err?8:16}}>
            <input value={password} onChange={e=>{setPassword(e.target.value);setErr("");}}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              type={showPass?"text":"password"} placeholder="Enter password..." autoFocus
              style={{width:"100%",background:"#0D1117",border:"1px solid "+(err?"rgba(239,68,68,0.5)":"#21262D"),borderRadius:10,padding:"12px 44px 12px 16px",color:"white",fontSize:14,outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"}}
              onFocus={e=>e.target.style.borderColor="#F59E0B"} onBlur={e=>e.target.style.borderColor=err?"rgba(239,68,68,0.5)":"#21262D"}/>
            <button onClick={()=>setShowPass(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#6b7280",display:"flex"}}
              onMouseOver={e=>e.currentTarget.style.color="white"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>
              {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
            </button>
          </div>
          {err&&<p style={{color:"#ef4444",fontSize:12,margin:"0 0 14px"}}>{err}</p>}
          <button onClick={handleLogin} disabled={loading}
            style={{width:"100%",padding:"13px 0",borderRadius:10,border:"none",background:loading?"#374151":"linear-gradient(135deg,#D97706,#F59E0B)",color:loading?"#9ca3af":"#000",fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"transform 0.1s,box-shadow 0.2s"}}
            onMouseOver={e=>{if(!loading){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(245,158,11,0.3)";}}}
            onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
            {loading
              ?<><svg style={{width:16,height:16,animation:"spin 1s linear infinite"}} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Signing in...</>
              :<>Enter Dashboard <ChevronRight size={18}/></>
            }
          </button>
        </div>
        <p style={{textAlign:"center",color:"#374151",fontSize:11,marginTop:16,fontFamily:"monospace"}}>FormStudio · Admin Access</p>
      </div>
      {/* Footer */}
      <div style={{textAlign:"center",padding:"24px 20px 16px",marginTop:"auto"}}>
        <p style={{color:"#374151",fontSize:16,margin:0,lineHeight:1.8}}>
          © 2026 <a href="https://brandsbro.com/" target="_blank" rel="noopener" style={{color:"#F59E0B",textDecoration:"none",fontWeight:600}}>Brands Bro</a>. All rights reserved.
        </p>
        <p style={{color:"#2d3748",fontSize:16,margin:"2px 0 0"}}>
          Designed and Developed by Mahtab Uddin · Strategy by Imran Khan
        </p>
      </div>
    </div>
  );
}
