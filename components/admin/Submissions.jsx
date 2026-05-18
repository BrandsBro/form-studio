"use client";
import { useState, useEffect } from "react";
import { Search, Download, ChevronDown, ChevronUp } from "lucide-react";

function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function Av({name="",size=30}){const color=gc(name);return<div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}
function getFormColor(form){const T={amber:"#F59E0B",blue:"#3B82F6",green:"#10B981",rose:"#F43F5E",violet:"#8B5CF6",cyan:"#06B6D4"};return form?.customColor||T[form?.theme]||"#F59E0B";}

export default function Submissions(){
  const [forms,setForms]=useState([]);
  const [selectedId,setSelectedId]=useState(null);
  const [search,setSearch]=useState("");
  const [personFilter,setPersonFilter]=useState("All");
  const [expandedRow,setExpandedRow]=useState(null);
  const [subs,setSubs]=useState([]);
  const [sortKey,setSortKey]=useState("updatedAt");
  const [sortDir,setSortDir]=useState("desc");

  useEffect(()=>{
    getForms().then(data=>{setForms(data);if(data.length)setSelectedId(data[0].id);});
  },[]);

  const form=forms.find(f=>f.id===selectedId);
  useEffect(()=>{ if(selectedId) getSubmissions(selectedId).then(setSubs); },[selectedId]);
  const color=form?getFormColor(form):"#F59E0B";
  const rFields=(form?.fields||[]).filter(f=>f.type==="rating");
  

  const allPersons=["All",...new Set(subs.map(s=>s.personName))];

  function getAvg(s){
    const vals=rFields.map(f=>s.values?.[f.id]||0).filter(v=>v>0);
    return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
  }

  const filtered=subs
    .filter(s=>personFilter==="All"||s.personName===personFilter)
    .filter(s=>s.personName?.toLowerCase().includes(search.toLowerCase())||s.reviewerEmail?.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>{
      if(sortKey==="avg")return sortDir==="asc"?getAvg(a)-getAvg(b):getAvg(b)-getAvg(a);
      const av=a[sortKey]||"",bv=b[sortKey]||"";
      return sortDir==="asc"?av>bv?1:-1:av<bv?1:-1;
    });

  function toggleSort(key){if(sortKey===key)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortKey(key);setSortDir("desc");}}

  function exportCSV(){
    if(!form||!filtered.length)return;
    const headers=["Date","Reviewer","Person Reviewed",...rFields.map((_,i)=>"Q"+(i+1)),"Avg"];
    const rows=filtered.map(s=>{
      const avg=getAvg(s).toFixed(2);
      return[s.updatedAt?new Date(s.updatedAt).toLocaleDateString():"",s.reviewerEmail,s.personName,...rFields.map(f=>s.values?.[f.id]||""),avg];
    });
    const csv=[headers,...rows].map(r=>r.join(",")).join("\n");
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download=form.name+".csv";a.click();
  }

  const avgColor=v=>v>=4?"#22c55e":v>=3?"#F59E0B":v>=2?"#f97316":"#ef4444";

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div>
        <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>Submissions</h2>
        <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>All reviews submitted per form</p>
      </div>

      {/* Form tabs */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {forms.map(f=>{
          const c=getFormColor(f);const sel=f.id===selectedId;
          const count=subs.length.length;
          return(
            <button key={f.id} onClick={()=>{setSelectedId(f.id);setPersonFilter("All");setSearch("");}}
              style={{padding:"8px 16px",borderRadius:10,border:`2px solid ${sel?c+"88":"#21262D"}`,background:sel?c+"15":"#161B22",color:sel?c:"#6b7280",fontSize:12,fontWeight:sel?600:400,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:sel?c:"#374151"}}/>
              {f.name.length>28?f.name.slice(0,28)+"...":f.name}
              <span style={{fontSize:10,background:"#0D1117",color:sel?c:"#4b5563",padding:"1px 7px",borderRadius:999}}>{count}</span>
            </button>
          );
        })}
      </div>

      {!form?(
        <div style={{textAlign:"center",padding:60,background:"#161B22",border:"1px solid #21262D",borderRadius:12,color:"#4b5563"}}>
          <p style={{fontSize:32,margin:"0 0 10px"}}>📋</p><p style={{margin:0}}>Select a form above.</p>
        </div>
      ):(
        <>
          {/* Controls */}
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <div style={{position:"relative",flex:1,minWidth:200}}>
              <Search size={14} color="#6b7280" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search reviewer or person..."
                style={{width:"100%",background:"#161B22",border:"1px solid #21262D",borderRadius:9,padding:"10px 12px 10px 36px",color:"white",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <select value={personFilter} onChange={e=>setPersonFilter(e.target.value)}
              style={{background:"#161B22",border:"1px solid #21262D",borderRadius:9,padding:"10px 14px",color:"white",fontSize:13,outline:"none",minWidth:160}}>
              {allPersons.map(p=><option key={p} style={{background:"#0D1117"}}>{p}</option>)}
            </select>
            <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:9,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>
              <Download size={14}/> CSV
            </button>
          </div>

          {/* Stats row */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
            {[
              {l:"Total",v:subs.length,c:color},
              {l:"Showing",v:filtered.length,c:"#3B82F6"},
              {l:"People Reviewed",v:new Set(subs.map(s=>s.personName)).size,c:"#8B5CF6"},
              {l:"Reviewers",v:new Set(subs.map(s=>s.reviewerEmail)).size,c:"#10B981"},
            ].map(s=>(
              <div key={s.l} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"10px 14px"}}>
                <p style={{color:s.c,fontSize:20,fontWeight:800,margin:0}}>{s.v}</p>
                <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>{s.l}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,overflow:"auto"}}>
            <table style={{width:"100%",fontSize:13,borderCollapse:"collapse",minWidth:600}}>
              <thead>
                <tr style={{borderBottom:"1px solid #21262D",background:"#0D1117"}}>
                  {[
                    {k:"personName",l:"Person Reviewed"},
                    {k:"reviewerEmail",l:"Reviewer"},
                    {k:"avg",l:"Avg Score"},
                    {k:"updatedAt",l:"Date"},
                  ].map(col=>(
                    <th key={col.k} onClick={()=>toggleSort(col.k)}
                      style={{textAlign:"left",padding:"12px 16px",fontSize:11,fontWeight:600,color:sortKey===col.k?"#F59E0B":"#6b7280",textTransform:"uppercase",cursor:"pointer",userSelect:"none",whiteSpace:"nowrap"}}>
                      {col.l} {sortKey===col.k?(sortDir==="asc"?"↑":"↓"):""}
                    </th>
                  ))}
                  <th style={{padding:"12px 16px",fontSize:11,color:"#6b7280",textTransform:"uppercase",textAlign:"left"}}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s,i)=>{
                  const avg=getAvg(s);
                  const isOpen=expandedRow===i;
                  const ac=avgColor(avg);
                  const date=s.updatedAt?new Date(s.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—";
                  return(
                    <>
                      <tr key={i} onClick={()=>setExpandedRow(isOpen?null:i)} style={{borderBottom:"1px solid #21262D",cursor:"pointer",transition:"background 0.15s"}}
                        onMouseOver={e=>e.currentTarget.style.background="#1C2333"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{padding:"12px 16px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <Av name={s.personName} size={32}/>
                            <p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{s.personName}</p>
                          </div>
                        </td>
                        <td style={{padding:"12px 16px",color:"#9ca3af",fontSize:12}}>{s.reviewerEmail}</td>
                        <td style={{padding:"12px 16px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:60,height:5,background:"#21262D",borderRadius:999,overflow:"hidden"}}>
                              <div style={{height:"100%",background:ac,borderRadius:999,width:(avg/5*100)+"%"}}/>
                            </div>
                            <span style={{color:ac,fontWeight:700,fontSize:13}}>{avg.toFixed(2)}</span>
                          </div>
                        </td>
                        <td style={{padding:"12px 16px",color:"#6b7280",fontSize:12}}>{date}</td>
                        <td style={{padding:"12px 16px",color:"#4b5563",fontSize:13}}>{isOpen?"▲":"▼"}</td>
                      </tr>
                      {isOpen&&(
                        <tr key={i+"_exp"} style={{background:"#0D1117",borderBottom:"1px solid #21262D"}}>
                          <td colSpan={5} style={{padding:"16px"}}>
                            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8,marginBottom:s.values?.comments?10:0}}>
                              {rFields.map((f,qi)=>{
                                const val=s.values?.[f.id]||0;
                                const vc=avgColor(val);
                                return(
                                  <div key={f.id} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",gap:10}}>
                                    <div style={{width:30,height:30,borderRadius:"50%",background:vc+"18",border:"1px solid "+vc+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:vc,flexShrink:0}}>{val}</div>
                                    <p style={{color:"#9ca3af",fontSize:11,margin:0,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Q{qi+1}. {f.label}</p>
                                  </div>
                                );
                              })}
                            </div>
                            {s.values?.comments&&<div style={{background:"#161B22",borderRadius:8,padding:"10px 14px",border:"1px solid #21262D"}}>
                              <p style={{color:"#6b7280",fontSize:11,margin:"0 0 4px"}}>💬 Comment</p>
                              <p style={{color:"#9ca3af",fontSize:12,margin:0}}>{s.values.comments}</p>
                            </div>}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
                {filtered.length===0&&(
                  <tr><td colSpan={5} style={{padding:"40px 16px",textAlign:"center",color:"#4b5563"}}>No submissions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
