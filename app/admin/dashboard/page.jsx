"use client";
import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Download, Search } from "lucide-react";
import StatsCard from "@/components/admin/StatsCard";
import Overview from "@/components/admin/Overview";
import Submissions from "@/components/admin/Submissions";
import FormBuilder from "@/components/admin/FormBuilder";
import FormsList from "@/components/admin/FormsList";
import People from "@/components/admin/People";
import Marking from "@/components/admin/Marking";
import Leaderboard from "@/components/admin/Leaderboard";
import ReReview from "@/components/admin/ReReview";
import Performance from "@/components/admin/Performance";
import Connections from "@/components/admin/Connections";

const TABS = [
  { id:"overview",    label:"Overview",     icon:"📊" },
  { id:"marking",     label:"Marking",      icon:"📊" },
  { id:"leaderboard", label:"Leaderboard",  icon:"🏆" },
  { id:"rereview",    label:"Re-Review",    icon:"⚠️" },
  { id:"performance",  label:"Performance",  icon:"📈" },
  { id:"submissions", label:"Submissions",  icon:"📋" },

  { id:"people",      label:"People",       icon:"👥" },
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
    if (["overview","submissions"].includes(tab)) {
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
            <button key={t.id} onClick={()=>{ if(t.id==="formbuilder") setEditingForm(null); setTab(t.id); }}
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
          {tab==="overview" && <Overview/>}

          {/* ── SUBMISSIONS ── */}
          {tab==="submissions" && <Submissions/>}

                    {tab==="marking" && <Marking/>}
          {tab==="leaderboard" && <Leaderboard/>}
          {tab==="rereview" && <ReReview/>}
          {tab==="performance" && <Performance/>}

          {tab==="people" && <People/>}
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
