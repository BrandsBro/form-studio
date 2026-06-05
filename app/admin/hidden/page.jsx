"use client";
import { useState, useEffect } from "react";
import { getSecurityLogs } from "@/lib/sheets";
import { RefreshCw, CheckCircle, XCircle, Shield } from "lucide-react";

function Skel({w="100%",h=20,r=8}){return<div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#161B22 25%,#21262D 50%,#161B22 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>;}

export default function HiddenSecurityPage(){
  const [logs,setLogs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [refreshing,setRefreshing]=useState(false);
  const [filter,setFilter]=useState("All");
  const [auth,setAuth]=useState(false);
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");

  useEffect(()=>{
    const t=sessionStorage.getItem("hidden_token");
    if(t){try{const d=JSON.parse(atob(t));if(d.v==="hid"&&Date.now()-d.t<28800000) setAuth(true);}catch{}}
  },[]);

  async function load(){
    const data=await getSecurityLogs();
    setLogs(data||[]);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(()=>{ if(auth) load(); },[auth]);

  function handleAuth(){
    if(pass===process.env.NEXT_PUBLIC_ADMIN_PASSWORD){
      const token=btoa(JSON.stringify({v:"hid",t:Date.now()}));
      sessionStorage.setItem("hidden_token",token);
      sessionStorage.removeItem("hidden_auth");
      setAuth(true);
    }
    else setErr("Wrong password.");
  }

  if(!auth) return(
    <div style={{minHeight:"100vh",background:"#0D1117",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style>
      <div style={{width:"min(360px,100%)",background:"#161B22",border:"1px solid #21262D",borderRadius:16,padding:28,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:12}}>🔒</div>
        <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:"0 0 20px"}}>Hidden Page</h2>
        <input value={pass} onChange={e=>{setPass(e.target.value);setErr("");}}
          onKeyDown={e=>e.key==="Enter"&&handleAuth()}
          type="password" placeholder="Enter password..." autoFocus
          style={{width:"100%",background:"#0D1117",border:"1px solid "+(err?"rgba(239,68,68,0.5)":"#21262D"),borderRadius:9,padding:"11px 14px",color:"white",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:err?8:14}}/>
        {err&&<p style={{color:"#ef4444",fontSize:12,margin:"0 0 10px"}}>{err}</p>}
        <button onClick={handleAuth}
          style={{width:"100%",padding:"11px 0",borderRadius:9,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:14,fontWeight:700,cursor:"pointer"}}>
          Enter
        </button>
      </div>
    </div>
  );

  const types=["All","User Login","Management Login","Admin Login"];
  const filtered=logs.filter(l=>filter==="All"||l.type===filter);
  const failed=logs.filter(l=>l.status==="Failed").length;
  const success=logs.filter(l=>l.status==="Success").length;
  const adminFailed=logs.filter(l=>l.type==="Admin Login"&&l.status==="Failed").length;

  return(
    <div style={{minHeight:"100vh",background:"#0D1117",padding:"32px 24px",fontFamily:"var(--font-dm-sans)"}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>

      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",flexDirection:"column",gap:20}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <h1 style={{color:"white",fontSize:22,fontWeight:800,margin:0,fontFamily:"var(--font-playfair)"}}>🔒 Security Logs</h1>
            <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>All login attempts across all portals</p>
          </div>
          <button onClick={()=>{setRefreshing(true);load();}} disabled={refreshing}
            style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:9,border:"1px solid #21262D",background:"#161B22",color:"#9ca3af",fontSize:13,cursor:"pointer"}}>
            <RefreshCw size={14} style={{animation:refreshing?"spin 1s linear infinite":"none"}}/> Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
          {[
            {l:"Total",v:logs.length,c:"#F59E0B"},
            {l:"Successful",v:success,c:"#22c55e"},
            {l:"Failed",v:failed,c:"#ef4444"},
            {l:"Admin Failed",v:adminFailed,c:"#8B5CF6"},
          ].map(s=>(
            <div key={s.l} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}>
              <p style={{color:s.c,fontSize:20,fontWeight:800,margin:0}}>{s.v}</p>
              <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {types.map(t=>(
            <button key={t} onClick={()=>setFilter(t)}
              style={{padding:"7px 16px",borderRadius:8,border:"1px solid "+(filter===t?"rgba(245,158,11,0.4)":"#21262D"),background:filter===t?"rgba(245,158,11,0.08)":"transparent",color:filter===t?"#F59E0B":"#6b7280",fontSize:12,fontWeight:filter===t?600:400,cursor:"pointer"}}>
              {t}{t!=="All"&&<span style={{marginLeft:4,fontSize:10,color:"#4b5563"}}>({logs.filter(l=>l.type===t).length})</span>}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading?(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[1,2,3,4,5].map(i=><Skel key={i} h={52} r={10}/>)}
          </div>
        ):(
          <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,overflow:"hidden"}}>
            {filtered.length===0?(
              <div style={{textAlign:"center",padding:"48px 0",color:"#4b5563"}}>
                <p style={{fontSize:32,margin:"0 0 12px"}}>🔒</p>
                <p style={{fontSize:14,margin:0}}>No logs yet.</p>
              </div>
            ):(
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid #21262D",background:"#0D1117"}}>
                      {["Time","Name","Email","Type","Status","Location","IP","Device"].map(h=>(
                        <th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:11,color:"#6b7280",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((log,i)=>{
                      const isSuccess=log.status==="Success";
                      const isAdminFail=log.type==="Admin Login"&&!isSuccess;
                      return(
                        <tr key={log.id||i}
                          style={{borderBottom:"1px solid #21262D",background:isAdminFail?"rgba(239,68,68,0.04)":"transparent",transition:"background 0.15s"}}
                          onMouseOver={e=>e.currentTarget.style.background=isAdminFail?"rgba(239,68,68,0.08)":"rgba(255,255,255,0.02)"}
                          onMouseOut={e=>e.currentTarget.style.background=isAdminFail?"rgba(239,68,68,0.04)":"transparent"}>
                          <td style={{padding:"12px 16px",fontSize:12,color:"#9ca3af",whiteSpace:"nowrap"}}>
                            {log.time?new Date(log.time).toLocaleString():"—"}
                          </td>
                          <td style={{padding:"12px 16px",fontSize:13,color:"white",fontWeight:600,whiteSpace:"nowrap"}}>
                            {log.name||"—"}
                          </td>
                          <td style={{padding:"12px 16px",fontSize:12,color:"#6b7280",whiteSpace:"nowrap"}}>
                            {log.email||"—"}
                          </td>
                          <td style={{padding:"12px 16px",whiteSpace:"nowrap"}}>
                            <span style={{fontSize:11,color:log.type==="Admin Login"?"#8B5CF6":log.type==="Management Login"?"#3B82F6":"#F59E0B",background:log.type==="Admin Login"?"rgba(139,92,246,0.1)":log.type==="Management Login"?"rgba(59,130,246,0.1)":"rgba(245,158,11,0.1)",padding:"3px 10px",borderRadius:999,fontWeight:600}}>
                              {log.type||"—"}
                            </span>
                          </td>
                          <td style={{padding:"12px 16px",whiteSpace:"nowrap"}}>
                            <span style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:isSuccess?"#22c55e":"#ef4444",fontWeight:600}}>
                              {isSuccess?<CheckCircle size={13}/>:<XCircle size={13}/>}
                              {log.status}
                            </span>
                          </td>
                          <td style={{padding:"12px 16px",fontSize:12,color:"#6b7280",whiteSpace:"nowrap"}}>
                            {log.location||"—"}
                          </td>
                          <td style={{padding:"12px 16px",fontSize:11,color:"#4b5563",fontFamily:"monospace",whiteSpace:"nowrap"}}>
                            {log.ip||"—"}
                          </td>
                          <td style={{padding:"12px 16px",fontSize:10,color:"#374151",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {log.userAgent||"—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
