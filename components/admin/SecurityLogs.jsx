"use client";
import { useState, useEffect } from "react";
import { getSecurityLogs } from "@/lib/sheets";
import { RefreshCw, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

function Skel({w="100%",h=20,r=8}){return<div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#161B22 25%,#21262D 50%,#161B22 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>;}

export default function SecurityLogs(){
  const [logs,setLogs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [refreshing,setRefreshing]=useState(false);
  const [filter,setFilter]=useState("All");

  async function load(){
    const data=await getSecurityLogs();
    setLogs(data||[]);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(()=>{load();},[]);

  function refresh(){setRefreshing(true);load();}

  const types=["All","User Login","Management Login","Admin Login"];
  const filtered=logs.filter(l=>filter==="All"||l.type===filter);
  const failed=logs.filter(l=>l.status==="Failed").length;
  const success=logs.filter(l=>l.status==="Success").length;
  const adminAttempts=logs.filter(l=>l.type==="Admin Login"&&l.status==="Failed").length;

  if(loading) return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style>
      <Skel w={200} h={28}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[1,2,3,4].map(i=><div key={i} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}><Skel w="40%" h={24}/><div style={{marginTop:6}}><Skel w="60%" h={12}/></div></div>)}
      </div>
    </div>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>🔒 Security Logs</h2>
          <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>All login attempts across all portals</p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:9,border:"1px solid #21262D",background:"#161B22",color:"#9ca3af",fontSize:13,cursor:"pointer"}}>
          <RefreshCw size={14} style={{animation:refreshing?"spin 1s linear infinite":"none"}}/> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        {[
          {l:"Total Attempts",v:logs.length,c:"#F59E0B",icon:"📋"},
          {l:"Successful",v:success,c:"#22c55e",icon:"✓"},
          {l:"Failed",v:failed,c:"#ef4444",icon:"✗"},
          {l:"Admin Failed",v:adminAttempts,c:"#8B5CF6",icon:"⚠️"},
        ].map(s=>(
          <div key={s.l} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}>
            <p style={{color:s.c,fontSize:20,fontWeight:800,margin:0}}>{s.v}</p>
            <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {types.map(t=>(
          <button key={t} onClick={()=>setFilter(t)}
            style={{padding:"7px 16px",borderRadius:8,border:"1px solid "+(filter===t?"rgba(245,158,11,0.4)":"#21262D"),background:filter===t?"rgba(245,158,11,0.08)":"transparent",color:filter===t?"#F59E0B":"#6b7280",fontSize:12,fontWeight:filter===t?600:400,cursor:"pointer"}}>
            {t} {t!=="All"&&<span style={{fontSize:10,color:"#4b5563"}}>({logs.filter(l=>l.type===t).length})</span>}
          </button>
        ))}
      </div>

      {/* Logs table */}
      <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid #21262D",display:"flex",alignItems:"center",gap:8}}>
          <Shield size={16} color="#F59E0B"/>
          <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{filtered.length} log{filtered.length!==1?"s":""}</p>
        </div>
        {filtered.length===0?(
          <div style={{textAlign:"center",padding:"48px 0",color:"#4b5563"}}>
            <p style={{fontSize:32,margin:"0 0 12px"}}>🔒</p>
            <p style={{fontSize:14,margin:0}}>No logs yet.</p>
          </div>
        ):(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:"1px solid #21262D"}}>
                  {["Time","Name","Email","Type","Status","Location","IP"].map(h=>(
                    <th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:11,color:"#6b7280",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log,i)=>{
                  const isSuccess=log.status==="Success";
                  const isAdminFail=log.type==="Admin Login"&&!isSuccess;
                  return(
                    <tr key={log.id||i} style={{borderBottom:"1px solid #21262D",background:isAdminFail?"rgba(239,68,68,0.04)":"transparent"}}
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
                          {log.status||"—"}
                        </span>
                      </td>
                      <td style={{padding:"12px 16px",fontSize:12,color:"#6b7280"}}>
                        {log.location||"—"}
                      </td>
                      <td style={{padding:"12px 16px",fontSize:11,color:"#4b5563",fontFamily:"monospace"}}>
                        {log.ip||"—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
