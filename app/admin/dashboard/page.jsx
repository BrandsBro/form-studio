"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Download, Search } from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import FormBuilder from "@/components/admin/FormBuilder";
import FormsList from "@/components/admin/FormsList";
import Employees from "@/components/admin/Employees";
import Executives from "@/components/admin/Executives";
import Connections from "@/components/admin/Connections";

const TABS = [
  { id:"overview",    label:"Overview",     icon:"📊" },
  { id:"submissions", label:"Submissions",  icon:"📋" },
  { id:"analytics",   label:"Analytics",    icon:"📈" },
  { id:"employees",   label:"Employees",    icon:"👥" },
  { id:"executives",  label:"Executives",   icon:"👔" },
  { id:"connections", label:"Connections",  icon:"🔗" },
  { id:"formslist",   label:"Forms",        icon:"📄" },
  { id:"formbuilder", label:"Form Builder", icon:"🔧" },
];

// Generate mock submissions based on form fields
function getMockSubmissions(form) {
  if (!form) return [];
  const rFields = (form.fields||[]).filter(f=>f.type==="rating");
  if (!rFields.length) return [];
  const names = ["Alice Johnson","Carlos Mendez","Diana Lee","Ethan Brown","Fiona Kim","George Tan"];
  const leaders = ["Bob Smith","Sarah Chen"];
  return names.map((name,i) => {
    const fv = {};
    rFields.forEach(f => { fv[f.id] = Math.floor(Math.random()*2)+3; });
    return { id:i+1, formId:form.id, submittedAt:`2026-05-${String(14-i).padStart(2,"0")}`, name, leaderName:leaders[i%2], fieldValues:fv, comments:i%3===0?"Great leadership.":"" };
  });
}

function getRatingFields(form) {
  return (form?.fields||[]).filter(f=>f.type==="rating");
}

function getAvg(submission, rFields) {
  if (!rFields.length) return 0;
  const vals = rFields.map(f=>submission.fieldValues?.[f.id]||0);
  return vals.reduce((a,b)=>a+b,0)/vals.length;
}

function exportCSV(submissions, form) {
  const rFields = getRatingFields(form);
  const headers = ["ID","Date","Reviewer","Leader",...rFields.map((_,i)=>`Q${i+1}`),"Avg","Comments"];
  const rows = submissions.map(s => {
    const avg = getAvg(s,rFields).toFixed(2);
    return [s.id,s.submittedAt,s.name,s.leaderName,...rFields.map(f=>s.fieldValues?.[f.id]||""),avg,s.comments||""];
  });
  const csv=[headers,...rows].map(r=>r.join(",")).join("\n");
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
  a.download=`${form.name||"submissions"}.csv`;a.click();
}

// Form selector dropdown
function FormSelector({ forms, selectedId, onChange }) {
  if (!forms.length) return null;
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
      <span style={{fontSize:12,color:"#6b7280",fontWeight:500}}>Viewing form:</span>
      <select value={selectedId||""} onChange={e=>onChange(e.target.value)}
        style={{background:"#161B22",border:"1px solid #21262D",borderRadius:9,padding:"8px 14px",color:"white",fontSize:13,outline:"none",cursor:"pointer",minWidth:220}}>
        {forms.map(f=><option key={f.id} value={f.id} style={{background:"#0D1117"}}>{f.name}{f.active?"":" (inactive)"}</option>)}
      </select>
      <span style={{fontSize:11,color:"#4b5563"}}>
        {forms.find(f=>f.id===selectedId)?.fields?.filter(f=>f.type==="rating").length||0} rating questions ·{" "}
        {forms.find(f=>f.id===selectedId)?.connections?.reduce((a,c)=>a+c.revieweeNames.length,0)||0} reviewees
      </span>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [editingForm, setEditingForm] = useState(null);
  const [connectionFormId, setConnectionFormId] = useState(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("submittedAt");
  const [sortDir, setSortDir] = useState("desc");
  const [expandedRow, setExpandedRow] = useState(null);
  const [leaderFilter, setLeaderFilter] = useState("All");

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") !== "true") router.replace("/admin");
    const sf = localStorage.getItem("forms_list");
    if (sf) { try { const fl=JSON.parse(sf); setForms(fl); if(fl.length) setSelectedFormId(fl[0].id); } catch {} }
  }, []);

  // Reload forms when switching to data tabs
  useEffect(() => {
    if (["overview","submissions","analytics"].includes(tab)) {
      const sf = localStorage.getItem("forms_list");
      if (sf) { try { const fl=JSON.parse(sf); setForms(fl); if(!selectedFormId&&fl.length) setSelectedFormId(fl[0].id); } catch {} }
    }
  }, [tab]);

  const selectedForm = forms.find(f=>f.id===selectedFormId)||null;
  const ratingFields = getRatingFields(selectedForm);
  const submissions = getMockSubmissions(selectedForm);
  const leaders = ["All",...Array.from(new Set(submissions.map(s=>s.leaderName)))];

  const filtered = submissions
    .filter(s=>leaderFilter==="All"||s.leaderName===leaderFilter)
    .filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||s.leaderName.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>{
      const av=sortKey==="avg"?getAvg(a,ratingFields):(a[sortKey]||"");
      const bv=sortKey==="avg"?getAvg(b,ratingFields):(b[sortKey]||"");
      return sortDir==="asc"?(av>bv?1:-1):(av<bv?1:-1);
    });

  function logout() { sessionStorage.removeItem("admin_auth"); router.replace("/admin"); }
  function toggleSort(key) { if(sortKey===key)setSortDir(d=>d==="asc"?"desc":"asc"); else{setSortKey(key);setSortDir("desc");} }

  const overallAvg = submissions.length&&ratingFields.length
    ? (submissions.flatMap(s=>ratingFields.map(f=>s.fieldValues?.[f.id]||0)).reduce((a,b)=>a+b,0)/(submissions.length*ratingFields.length)).toFixed(2)
    : "—";

  return (
    <div style={{minHeight:"100vh",display:"flex",background:"#0D1117"}}>
      <aside style={{width:220,flexShrink:0,borderRight:"1px solid #21262D",display:"flex",flexDirection:"column",padding:"24px 10px",background:"#0D1117",position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
        <div style={{padding:"0 12px 24px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"#F59E0B",fontSize:16}}>★</span>
            <span style={{fontSize:14,fontWeight:600,color:"white"}}>FormStudio</span>
          </div>
          <p style={{fontSize:10,color:"#4b5563",margin:"3px 0 0"}}>Admin Panel</p>
        </div>
        <nav style={{flex:1,display:"flex",flexDirection:"column",gap:3}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:9,border:tab===t.id?"1px solid rgba(245,158,11,0.2)":"1px solid transparent",cursor:"pointer",textAlign:"left",background:tab===t.id?"rgba(245,158,11,0.08)":"transparent",color:tab===t.id?"#F59E0B":"#6b7280",fontSize:13,fontWeight:tab===t.id?500:400}}>
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
        <div style={{borderTop:"1px solid #21262D",paddingTop:12}}>
          <button onClick={logout} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,border:"none",cursor:"pointer",background:"transparent",color:"#4b5563",fontSize:13}}
            onMouseOver={e=>{e.currentTarget.style.color="#ef4444";e.currentTarget.style.background="rgba(239,68,68,0.05)";}}
            onMouseOut={e=>{e.currentTarget.style.color="#4b5563";e.currentTarget.style.background="transparent";}}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main style={{flex:1,overflow:"auto"}}>
        <div style={{padding:"16px 24px",borderBottom:"1px solid #21262D",background:"#0D1117",position:"sticky",top:0,zIndex:30}}>
          <h1 style={{color:"white",fontSize:16,fontWeight:600,margin:0}}>
            {TABS.find(t=>t.id===tab)?.icon} {TABS.find(t=>t.id===tab)?.label}
          </h1>
        </div>
        <div style={{padding:"24px"}}>
          {/* ── OVERVIEW ── */}
          {tab==="overview" && (
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              <FormSelector forms={forms} selectedId={selectedFormId} onChange={setSelectedFormId}/>
              {!selectedForm ? (
                <div style={{textAlign:"center",padding:"60px 0",color:"#4b5563",background:"#161B22",borderRadius:12,border:"1px solid #21262D"}}>
                  <p style={{fontSize:32,margin:"0 0 10px"}}>📄</p>
                  <p style={{margin:0,fontSize:14}}>No forms yet. Create one in the Forms tab.</p>
                </div>
              ) : (
                <>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
                    <StatsCard icon="📋" label="Submissions" value={submissions.length} sub={selectedForm.name}/>
                    <StatsCard icon="⭐" label="Avg Score" value={overallAvg+"/5"} sub="All questions"/>
                    <StatsCard icon="❓" label="Questions" value={ratingFields.length} sub="Rating fields"/>
                    <StatsCard icon="💬" label="With Comments" value={submissions.filter(s=>s.comments).length} sub="Qualitative feedback"/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
                    <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:20}}>
                      <h3 style={{color:"white",fontSize:14,fontWeight:600,margin:"0 0 16px"}}>Avg Score by Question</h3>
                      {ratingFields.map((f,i)=>{
                        const vals=submissions.map(s=>s.fieldValues?.[f.id]||0).filter(Boolean);
                        const avg=vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2):0;
                        const color=avg>=4?"#22c55e":avg>=3?"#F59E0B":"#ef4444";
                        return(
                          <div key={f.id} style={{marginBottom:12}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                              <span style={{fontSize:11,color:"#9ca3af",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginRight:8}}>Q{i+1}. {f.label.slice(0,40)}...</span>
                              <span style={{fontSize:12,fontWeight:600,color,flexShrink:0}}>{avg}/5</span>
                            </div>
                            <div style={{height:6,background:"#21262D",borderRadius:999,overflow:"hidden"}}>
                              <div style={{height:"100%",borderRadius:999,background:color,width:(avg/5*100)+"%",transition:"width 0.6s ease"}}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:20}}>
                      <h3 style={{color:"white",fontSize:14,fontWeight:600,margin:"0 0 16px"}}>Recent Submissions</h3>
                      {submissions.slice(0,5).map(s=>{
                        const avg=getAvg(s,ratingFields).toFixed(1);
                        return(
                          <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #21262D"}}>
                            <div><p style={{color:"white",fontSize:13,margin:0}}>{s.name}</p><p style={{color:"#6b7280",fontSize:11,margin:"2px 0 0"}}>→ {s.leaderName}</p></div>
                            <span style={{color:"#F59E0B",fontSize:13,fontWeight:600}}>{avg}/5</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── SUBMISSIONS ── */}
          {tab==="submissions" && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <FormSelector forms={forms} selectedId={selectedFormId} onChange={setSelectedFormId}/>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or leader..."
                  style={{flex:1,minWidth:200,background:"#161B22",border:"1px solid #21262D",borderRadius:9,padding:"10px 14px",color:"white",fontSize:13,outline:"none"}}/>
                <select value={leaderFilter} onChange={e=>setLeaderFilter(e.target.value)}
                  style={{background:"#161B22",border:"1px solid #21262D",borderRadius:9,padding:"10px 14px",color:"white",fontSize:13,outline:"none"}}>
                  {leaders.map(l=><option key={l}>{l}</option>)}
                </select>
                <button onClick={()=>selectedForm&&exportCSV(filtered,selectedForm)}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:9,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                  <Download size={14}/> Export CSV
                </button>
              </div>
              <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,overflow:"auto"}}>
                <table style={{width:"100%",fontSize:13,borderCollapse:"collapse",minWidth:560}}>
                  <thead>
                    <tr style={{borderBottom:"1px solid #21262D"}}>
                      {[{key:"submittedAt",label:"Date"},{key:"name",label:"Reviewer"},{key:"leaderName",label:"Leader"},{key:"avg",label:"Avg"}].map(col=>(
                        <th key={col.key} onClick={()=>toggleSort(col.key)}
                          style={{textAlign:"left",padding:"12px 16px",fontSize:11,fontWeight:500,color:"#6b7280",textTransform:"uppercase",cursor:"pointer",userSelect:"none"}}>
                          {col.label} {sortKey===col.key?(sortDir==="asc"?"↑":"↓"):""}
                        </th>
                      ))}
                      <th style={{padding:"12px 16px",fontSize:11,color:"#6b7280",textTransform:"uppercase",textAlign:"left"}}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s=>{
                      const avg=getAvg(s,ratingFields).toFixed(2);
                      const isOpen=expandedRow===s.id;
                      const color=avg>=4?"#22c55e":avg>=3?"#F59E0B":"#ef4444";
                      return(
                        <>
                          <tr key={s.id} onClick={()=>setExpandedRow(isOpen?null:s.id)} style={{borderBottom:"1px solid #21262D",cursor:"pointer"}}
                            onMouseOver={e=>e.currentTarget.style.background="#1C2333"}
                            onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                            <td style={{padding:"12px 16px",color:"#9ca3af"}}>{s.submittedAt}</td>
                            <td style={{padding:"12px 16px",color:"white",fontWeight:500}}>{s.name}</td>
                            <td style={{padding:"12px 16px",color:"#d1d5db"}}>{s.leaderName}</td>
                            <td style={{padding:"12px 16px",fontWeight:600,color}}>{avg}/5</td>
                            <td style={{padding:"12px 16px",color:"#6b7280"}}>{isOpen?"▲":"▼"}</td>
                          </tr>
                          {isOpen&&(
                            <tr style={{background:"#0D1117"}}>
                              <td colSpan={5} style={{padding:"14px 16px"}}>
                                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8,marginBottom:10}}>
                                  {ratingFields.map((f,i)=>{
                                    const val=s.fieldValues?.[f.id]||0;
                                    const c=val>=4?"#22c55e":val>=3?"#F59E0B":"#ef4444";
                                    return(
                                      <div key={f.id} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:10}}>
                                        <span style={{width:28,height:28,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,background:c+"18",color:c,flexShrink:0}}>{val}</span>
                                        <p style={{color:"#9ca3af",fontSize:11,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Q{i+1}. {f.label.slice(0,35)}...</p>
                                      </div>
                                    );
                                  })}
                                </div>
                                {s.comments&&<p style={{fontSize:12,color:"#9ca3af",background:"#161B22",borderRadius:8,padding:"8px 12px",border:"1px solid #21262D",margin:0}}>💬 {s.comments}</p>}
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                    {!filtered.length&&<tr><td colSpan={5} style={{padding:"40px 16px",textAlign:"center",color:"#4b5563"}}>No submissions found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {tab==="analytics" && (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <FormSelector forms={forms} selectedId={selectedFormId} onChange={setSelectedFormId}/>
              {!selectedForm ? (
                <div style={{textAlign:"center",padding:"60px 0",color:"#4b5563",background:"#161B22",borderRadius:12,border:"1px solid #21262D"}}>
                  <p style={{fontSize:32,margin:"0 0 10px"}}>📈</p>
                  <p style={{margin:0,fontSize:14}}>Select a form to view analytics.</p>
                </div>
              ) : (
                <>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
                    {/* Score by leader */}
                    <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:20}}>
                      <h3 style={{color:"white",fontSize:14,fontWeight:600,margin:"0 0 16px"}}>Score by Leader</h3>
                      {Array.from(new Set(submissions.map(s=>s.leaderName))).map(leader=>{
                        const subs=submissions.filter(s=>s.leaderName===leader);
                        const avg=subs.length?(subs.flatMap(s=>ratingFields.map(f=>s.fieldValues?.[f.id]||0)).reduce((a,b)=>a+b,0)/(subs.length*Math.max(ratingFields.length,1))).toFixed(2):0;
                        const color=avg>=4?"#22c55e":avg>=3?"#F59E0B":"#ef4444";
                        return(
                          <div key={leader} style={{marginBottom:14}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                              <span style={{fontSize:13,color:"#d1d5db"}}>{leader}</span>
                              <span style={{fontSize:13,fontWeight:600,color}}>{avg}/5 · {subs.length} reviews</span>
                            </div>
                            <div style={{height:8,background:"#21262D",borderRadius:999,overflow:"hidden"}}>
                              <div style={{height:"100%",borderRadius:999,background:color,width:(avg/5*100)+"%"}}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Rating distribution */}
                    <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:20}}>
                      <h3 style={{color:"white",fontSize:14,fontWeight:600,margin:"0 0 16px"}}>Rating Distribution</h3>
                      {[5,4,3,2,1].map(rating=>{
                        const allVals=submissions.flatMap(s=>ratingFields.map(f=>s.fieldValues?.[f.id]||0));
                        const count=allVals.filter(v=>v===rating).length;
                        const pct=allVals.length?((count/allVals.length)*100).toFixed(0):0;
                        return(
                          <div key={rating} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                            <span style={{fontSize:12,color:"#6b7280",width:30}}>{rating} ★</span>
                            <div style={{flex:1,height:8,background:"#21262D",borderRadius:999,overflow:"hidden"}}>
                              <div style={{height:"100%",background:"#F59E0B",borderRadius:999,width:pct+"%"}}/>
                            </div>
                            <span style={{fontSize:11,color:"#6b7280",width:30,textAlign:"right"}}>{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* All questions breakdown */}
                  <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:20}}>
                    <h3 style={{color:"white",fontSize:14,fontWeight:600,margin:"0 0 20px"}}>All Questions — Average Score</h3>
                    {ratingFields.map((f,i)=>{
                      const vals=submissions.map(s=>s.fieldValues?.[f.id]||0).filter(Boolean);
                      const avg=vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2):0;
                      const color=avg>=4?"#22c55e":avg>=3?"#F59E0B":"#ef4444";
                      return(
                        <div key={f.id} style={{marginBottom:14}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5,gap:12}}>
                            <p style={{color:"#9ca3af",fontSize:12,margin:0,flex:1,lineHeight:1.4}}>
                              <span style={{color:"#F59E0B",fontWeight:600,marginRight:6}}>Q{i+1}.</span>
                              {f.label}
                            </p>
                            <span style={{fontSize:13,fontWeight:700,color,flexShrink:0}}>{avg}/5</span>
                          </div>
                          <div style={{height:8,background:"#21262D",borderRadius:999,overflow:"hidden"}}>
                            <div style={{height:"100%",borderRadius:999,background:color,width:(avg/5*100)+"%",transition:"width 0.6s ease"}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {tab==="employees"   && <Employees/>}
          {tab==="executives"  && <Executives/>}
          {tab==="connections" && <Connections defaultFormId={connectionFormId}/>}
          {tab==="formslist"   && <FormsList onEdit={(form)=>{ setEditingForm(form); setTab("formbuilder"); }} onOpenConnections={(id)=>{ setConnectionFormId(id); setTab("connections"); }}/>}
          {tab==="formbuilder" && (
            <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,padding:24,minHeight:600}}>
              <FormBuilder editForm={editingForm} onSaved={()=>{ setEditingForm(null); setTab("formslist"); }}/>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
