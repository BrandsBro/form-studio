"use client";
import { useState, useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound(){
  const [pos,setPos]=useState({x:50,y:50});
  const [score,setScore]=useState(0);
  const [particles,setParticles]=useState([]);

  useEffect(()=>{
    const interval=setInterval(()=>{
      setPos({x:10+Math.random()*80,y:20+Math.random()*60});
      setParticles(prev=>[...prev.slice(-8),{id:Date.now(),x:Math.random()*100,y:Math.random()*100,color:["#F59E0B","#3B82F6","#10B981","#8B5CF6"][Math.floor(Math.random()*4)]}]);
    },1500);
    return()=>clearInterval(interval);
  },[]);

  return(
    <div style={{minHeight:"100vh",background:"#0D1117",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"var(--font-dm-sans)",overflow:"hidden",position:"relative"}}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes particleFade{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(0) translateY(-40px)}}
        @keyframes glitch{0%,100%{text-shadow:2px 0 #F59E0B,-2px 0 #3B82F6}25%{text-shadow:-2px 0 #F59E0B,2px 0 #3B82F6}50%{text-shadow:2px 2px #10B981,-2px -2px #8B5CF6}75%{text-shadow:-2px 2px #F43F5E,2px -2px #F59E0B}}
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      `}</style>

      {/* Grid background */}
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(245,158,11,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}}/>

      {/* Scanline */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden"}}>
        <div style={{position:"absolute",width:"100%",height:2,background:"linear-gradient(90deg,transparent,rgba(245,158,11,0.08),transparent)",animation:"scanline 5s linear infinite"}}/>
      </div>

      {/* Particles */}
      {particles.map(p=>(
        <div key={p.id} style={{position:"fixed",left:p.x+"%",top:p.y+"%",width:6,height:6,borderRadius:"50%",background:p.color,pointerEvents:"none",animation:"particleFade 1.5s ease-out forwards",boxShadow:`0 0 8px ${p.color}`}}/>
      ))}

      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:32,maxWidth:480,width:"100%",animation:"fadeIn 0.6s ease"}}>

        {/* 404 */}
        <div style={{textAlign:"center"}}>
          <h1 style={{fontSize:"clamp(80px,20vw,160px)",fontWeight:900,margin:0,color:"#F59E0B",lineHeight:1,fontFamily:"var(--font-playfair)",animation:"glitch 3s ease-in-out infinite",letterSpacing:"-0.04em"}}>
            404
          </h1>
          <div style={{height:2,background:"linear-gradient(90deg,transparent,#F59E0B,transparent)",margin:"8px 0 16px"}}/>
          <p style={{color:"white",fontSize:20,fontWeight:700,margin:"0 0 8px",fontFamily:"var(--font-playfair)"}}>Page Not Found</p>
          <p style={{color:"#6b7280",fontSize:14,margin:0,lineHeight:1.6}}>The page you're looking for doesn't exist or has been moved.</p>
        </div>

        {/* Mini game */}
        <div style={{width:"100%",background:"#161B22",border:"1px solid #21262D",borderRadius:14,padding:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <p style={{color:"#6b7280",fontSize:12,margin:0}}>🎮 Catch the star while you wait</p>
            <span style={{color:"#F59E0B",fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{score} pts</span>
          </div>
          <div style={{position:"relative",height:100,background:"#0D1117",borderRadius:10,overflow:"hidden",cursor:"crosshair",border:"1px solid #21262D"}}>
            {[...Array(6)].map((_,i)=>(
              <div key={i} style={{position:"absolute",width:1,height:1,background:"white",opacity:0.3,left:`${15+i*14}%`,top:`${20+i*10}%`,borderRadius:"50%",boxShadow:"0 0 3px white"}}/>
            ))}
            <button onClick={()=>{setScore(s=>s+1);setPos({x:10+Math.random()*80,y:10+Math.random()*80});}}
              style={{position:"absolute",left:pos.x+"%",top:pos.y+"%",transform:"translate(-50%,-50%)",background:"none",border:"none",cursor:"pointer",fontSize:22,padding:4,lineHeight:1,transition:"left 0.3s ease,top 0.3s ease",filter:"drop-shadow(0 0 6px #F59E0B)"}}>
              ⭐
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",width:"100%"}}>
          <a href="/" style={{display:"flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:14,fontWeight:700,textDecoration:"none"}}>
            <Home size={16}/> Go Home
          </a>
          <button onClick={()=>window.history.back()}
            style={{display:"flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:10,border:"1px solid #21262D",background:"transparent",color:"#9ca3af",fontSize:14,cursor:"pointer"}}
            onMouseOver={e=>e.currentTarget.style.color="white"} onMouseOut={e=>e.currentTarget.style.color="#9ca3af"}>
            <ArrowLeft size={16}/> Go Back
          </button>
        </div>

        <p style={{color:"#21262D",fontSize:11,fontFamily:"monospace",margin:0}}>
          ERROR_CODE: 404 · <span style={{animation:"blink 1s infinite",display:"inline-block"}}>▮</span>
        </p>
      </div>
    </div>
  );
}
