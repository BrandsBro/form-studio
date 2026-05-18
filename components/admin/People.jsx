"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Check, X } from "lucide-react";
import { DEPARTMENTS, DEFAULT_DESIGNATIONS, getDesignations, addDesignation, removeDesignation } from "@/lib/roles";
import { getPeople, savePerson, deletePerson, saveAllPeople } from "@/lib/sheets";

const DESIG_COLORS = {
  "Project Manager": "#8B5CF6",
  "Team Leader":     "#3B82F6",
  "Management":      "#F59E0B",
  "Team Member":     "#10B981",
  "HR":              "#F43F5E",
};
function getDesigColor(d){ return DESIG_COLORS[d]||"#06B6D4"; }

const DEFAULT_PEOPLE = [
  { id:"p1", name:"Bob Smith",     email:"bob@company.com",    designations:["Management","Team Leader"], department:"Engineering", photoUrl:"", joinDate:"2022-03-01", employeeId:"EMP001" },
  { id:"p2", name:"Sarah Chen",    email:"sarah@company.com",  designations:["Management"],               department:"Design",      photoUrl:"", joinDate:"2021-07-15", employeeId:"EMP002" },
  { id:"p3", name:"Alice Johnson", email:"alice@company.com",  designations:["Team Member"],              department:"Engineering", photoUrl:"", joinDate:"2023-01-10", employeeId:"EMP003" },
  { id:"p4", name:"Carlos Mendez", email:"carlos@company.com", designations:["Team Member"],              department:"Engineering", photoUrl:"", joinDate:"2023-06-01", employeeId:"EMP004" },
  { id:"p5", name:"Diana Lee",     email:"diana@company.com",  designations:["HR"],                       department:"HR",          photoUrl:"", joinDate:"2022-11-20", employeeId:"EMP005" },
  { id:"p6", name:"James Thornton",email:"james@company.com",  designations:["Management","Project Manager"],department:"Executive",photoUrl:"", joinDate:"2020-01-01", employeeId:"EMP006" },
];

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Avatar({person,size=44}){
  const color=gc(person.name);
  if(person.photoUrl)return<img src={person.photoUrl} alt={person.name} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:"2px solid "+color+"44",flexShrink:0}}/>;
  return<div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(person.name)}</div>;
}
function DesignationBadge({label}){
  const color=getDesigColor(label);
  return<span style={{fontSize:10,color,background:color+"18",border:"1px solid "+color+"33",padding:"2px 8px",borderRadius:999,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>;
}

// ── Designation Manager ───────────────────────────────────────────────────────
function DepartmentManager(){
  const [departments,setDepartments]=useState([...DEPARTMENTS]);
  const [newDesig,setNewDesig]=useState("");
  const [open,setOpen]=useState(false);

  useEffect(()=>{
    try{
      const custom=JSON.parse(localStorage.getItem("custom_departments")||"[]");
      setDepartments([...DEPARTMENTS,...custom]);
    }catch{}
  },[]);

  function handleAdd(){
    if(!newDesig.trim())return;
    const updated=[...new Set([...departments,newDesig.trim()])];
    setDepartments(updated);
    localStorage.setItem("custom_departments",JSON.stringify(updated.filter(d=>!DEPARTMENTS.includes(d))));
    setNewDesig("");
  }

  function handleRemove(d){
    if(DEPARTMENTS.includes(d))return;
    const updated=departments.filter(x=>x!==d);
    setDepartments(updated);
    localStorage.setItem("custom_departments",JSON.stringify(updated.filter(x=>!DEPARTMENTS.includes(x))));
  }

  return(
    <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
        <div>
          <p style={{color:"white",fontSize:14,fontWeight:600,margin:0}}>🏢 Manage Departments</p>
          <p style={{color:"#6b7280",fontSize:12,margin:"3px 0 0"}}>{departments.length} departments · click to {open?"collapse":"expand"}</p>
        </div>
        <span style={{color:"#6b7280"}}>{open?"▲":"▼"}</span>
      </button>

      {open&&(
        <div style={{padding:"0 18px 18px",display:"flex",flexDirection:"column",gap:12,borderTop:"1px solid #21262D"}}>
          {/* Add new */}
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <input value={newDesig} onChange={e=>setNewDesig(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAdd()}
              placeholder="New department name..." style={{flex:1,background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"8px 12px",color:"white",fontSize:13,outline:"none"}}/>
            <button onClick={handleAdd} style={{padding:"8px 16px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>
              Add
            </button>
          </div>

          {/* List */}
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {departments.map(d=>{
              const color=getDesigColor(d);
              const isDefault=DEPARTMENTS.includes(d);
              return(
                <div key={d} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:999,background:color+"18",border:"1px solid "+color+"33"}}>
                  <span style={{fontSize:12,color,fontWeight:600}}>{d}</span>
                  {!isDefault&&(
                    <button onClick={()=>handleRemove(d)} style={{background:"none",border:"none",cursor:"pointer",color:color+"88",padding:0,display:"flex",lineHeight:1}}
                      onMouseOver={e=>e.currentTarget.style.color="#ef4444"} onMouseOut={e=>e.currentTarget.style.color=color+"88"}>
                      <X size={12}/>
                    </button>
                  )}
                  {isDefault&&<span style={{fontSize:9,color:color+"66"}}>default</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Person Modal ──────────────────────────────────────────────────────────────
function PersonModal({person,onSave,onClose}){
  const [form,setForm]=useState(person||{id:"p"+Date.now(),name:"",email:"",designations:[],department:"",photoUrl:"",joinDate:"",employeeId:""});
  const [designations,setDesignations]=useState(getDesignations());
  const u=(k,v)=>setForm(f=>({...f,[k]:v}));
  const toggleDesig=d=>setForm(f=>({...f,designations:f.designations.includes(d)?f.designations.filter(x=>x!==d):[...f.designations,d]}));

  const inp={width:"100%",background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"9px 12px",color:"white",fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  const lbl={fontSize:11,color:"#6b7280",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"};

  return(
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex"}}>
      <div onClick={onClose} style={{flex:1,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}}/>
      <div style={{width:"min(460px,100%)",background:"#0D1117",borderLeft:"1px solid #21262D",display:"flex",flexDirection:"column",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:"1px solid #21262D",position:"sticky",top:0,background:"#0D1117",zIndex:1}}>
          <div>
            <h3 style={{color:"white",fontWeight:700,margin:0,fontSize:16}}>{person?.id?"Edit Person":"Add Person"}</h3>
            <p style={{color:"#6b7280",fontSize:12,margin:"3px 0 0"}}>Fill in the details below</p>
          </div>
          <button onClick={onClose} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:8,cursor:"pointer",color:"#6b7280",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center"}}
            onMouseOver={e=>e.currentTarget.style.color="white"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>✕</button>
        </div>

        <div style={{padding:24,display:"flex",flexDirection:"column",gap:16,flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:14,padding:16,background:"#161B22",borderRadius:12,border:"1px solid #21262D"}}>
            <Avatar person={form} size={52}/>
            <div>
              <p style={{color:"white",fontSize:14,fontWeight:600,margin:0}}>{form.name||"Person Name"}</p>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>
                {form.designations.length>0?form.designations.map(d=><DesignationBadge key={d} label={d}/>):<span style={{color:"#4b5563",fontSize:11}}>No designation</span>}
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={{gridColumn:"1/-1"}}><label style={lbl}>Full Name *</label><input value={form.name} onChange={e=>u("name",e.target.value)} placeholder="e.g. Alice Johnson" style={inp}/></div>
            <div style={{gridColumn:"1/-1"}}><label style={lbl}>Email Address *</label><input value={form.email} onChange={e=>u("email",e.target.value)} placeholder="alice@company.com" type="email" style={inp}/></div>
            <div><label style={lbl}>Employee ID</label><input value={form.employeeId} onChange={e=>u("employeeId",e.target.value)} placeholder="EMP001" style={inp}/></div>
            <div><label style={lbl}>Join Date</label><input value={form.joinDate} onChange={e=>u("joinDate",e.target.value)} type="date" style={{...inp,colorScheme:"dark"}}/></div>
            <div style={{gridColumn:"1/-1"}}>
              <label style={lbl}>Department</label>
              <select value={form.department} onChange={e=>u("department",e.target.value)} style={{...inp,cursor:"pointer"}}>
                <option value="">Select department...</option>
                {(()=>{try{const c=JSON.parse(localStorage.getItem("custom_departments")||"[]");return[...DEPARTMENTS,...c];}catch{return DEPARTMENTS;}})().map(d=><option key={d} value={d} style={{background:"#161B22"}}>{d}</option>)}
              </select>
            </div>
            <div style={{gridColumn:"1/-1"}}><label style={lbl}>Photo URL</label><input value={form.photoUrl} onChange={e=>u("photoUrl",e.target.value)} placeholder="https://..." style={inp}/></div>
          </div>

          <div>
            <label style={lbl}>Designations <span style={{color:"#4b5563",textTransform:"none",letterSpacing:0,fontSize:10}}>(select multiple)</span></label>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {designations.map(d=>{
                const sel=form.designations.includes(d);
                const color=getDesigColor(d);
                return(
                  <button key={d} onClick={()=>toggleDesig(d)}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,border:"1px solid "+(sel?color+"55":"#21262D"),background:sel?color+"10":"#161B22",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                    <div style={{width:20,height:20,borderRadius:"50%",border:"2px solid "+(sel?color:"#374151"),background:sel?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {sel&&<Check size={11} color="#000"/>}
                    </div>
                    <span style={{color:sel?color:"#9ca3af",fontSize:13,fontWeight:sel?600:400}}>{d}</span>
                    {sel&&<span style={{marginLeft:"auto",fontSize:10,color,background:color+"18",padding:"2px 8px",borderRadius:999}}>Selected</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{padding:"16px 24px",borderTop:"1px solid #21262D",display:"flex",gap:10,position:"sticky",bottom:0,background:"#0D1117"}}>
          <button onClick={onClose} style={{flex:1,padding:"10px 0",borderRadius:9,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:13,cursor:"pointer"}}>Cancel</button>
          <button onClick={()=>{if(!form.name||!form.email)return alert("Name and email are required.");onSave(form);}}
            style={{flex:2,padding:"10px 0",borderRadius:9,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>
            {person?.id?"Save Changes":"Add Person"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

function Skeleton({w="100%",h=20,r=8}){
  return <div style={{width:w,height:h,borderRadius:r,background:"linear-gradient(90deg,#161B22,#21262D,#161B22)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}} />;
}

export default function People(){
  const [people,setPeople]=useState([]);
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("All");
  const [modal,setModal]=useState(null);
  const [loading,setLoading]=useState(false);
  const [designations,setDesignations]=useState(DEFAULT_DESIGNATIONS);

  useEffect(()=>{
    setDesignations(getDesignations());
    setLoading(true);
    getPeople().then(data=>{ setPeople(data); setLoading(false); });
  },[]);

  function save(list){setPeople(list);saveAllPeople(list);}
  function handleSave(person){
    const ex=people.find(x=>x.id===person.id);
    const updated=ex?people.map(x=>x.id===person.id?person:x):[...people,person];
    setPeople(updated);
    savePerson(person);
    saveAllPeople(updated);
    setModal(null);
  }
  function handleDelete(id){save(people.filter(p=>p.id!==id));}

  const allDesig=["All",...getDesignations()];
  const filtered=people
    .filter(p=>filter==="All"||(p.designations||[]).includes(filter))
    .filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.email.toLowerCase().includes(search.toLowerCase()));

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {loading&&(
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        <style>{"@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style>
        {[1,2,3,4,5,6].map(i=>(
          <div key={i} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,padding:18,display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <Skeleton w={48} h={48} r={50}/>
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                <Skeleton w="70%" h={16}/>
                <Skeleton w="90%" h={12}/>
              </div>
            </div>
            <Skeleton w="50%" h={20}/>
          </div>
        ))}
      </div>
    )}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>People</h2>
          <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>{people.length} total</p>
        </div>
        <button onClick={()=>setModal({})} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>
          <Plus size={16}/> Add Person
        </button>
      </div>

      <DepartmentManager/>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8}}>
        {allDesig.map(d=>{
          const color=d==="All"?"#F59E0B":getDesigColor(d);
          const count=d==="All"?people.length:people.filter(p=>(p.designations||[]).includes(d)).length;
          return(
            <button key={d} onClick={()=>setFilter(d)}
              style={{background:filter===d?"#161B22":"#0D1117",border:"1px solid "+(filter===d?color+"55":"#21262D"),borderRadius:10,padding:"10px 12px",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
              <p style={{color,fontSize:18,fontWeight:800,margin:0}}>{count}</p>
              <p style={{color:filter===d?color:"#6b7280",fontSize:10,margin:"3px 0 0",fontWeight:filter===d?600:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d}</p>
            </button>
          );
        })}
      </div>

      <div style={{position:"relative"}}>
        <Search size={14} color="#6b7280" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email..."
          style={{width:"100%",background:"#161B22",border:"1px solid #21262D",borderRadius:9,padding:"10px 12px 10px 36px",color:"white",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {filtered.map(person=>{
          const color=gc(person.name);
          return(
            <div key={person.id} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,overflow:"hidden",transition:"all 0.2s"}}
              onMouseOver={e=>e.currentTarget.style.borderColor=color+"44"}
              onMouseOut={e=>e.currentTarget.style.borderColor="#21262D"}>
              <div style={{height:3,background:"linear-gradient(90deg,"+color+","+color+"44)"}}/>
              <div style={{padding:18}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
                  <Avatar person={person} size={48}/>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{color:"white",fontSize:14,fontWeight:700,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{person.name}</p>
                    <p style={{color:"#6b7280",fontSize:12,margin:"3px 0 6px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{person.email}</p>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {(person.designations||[]).map(d=><DesignationBadge key={d} label={d}/>)}
                    </div>
                  </div>
                </div>
                <div style={{paddingTop:10,borderTop:"1px solid #21262D"}}>
                  {person.department&&<p style={{color:"#4b5563",fontSize:11,margin:0}}>{person.department}</p>}
                  {person.employeeId&&<p style={{color:"#374151",fontSize:10,margin:"2px 0 0"}}>{person.employeeId}</p>}
                </div>
              </div>
              <div style={{display:"flex",gap:6,padding:"0 16px 14px"}}>
                <button onClick={()=>setModal(person)}
                  style={{flex:1,padding:"7px 0",borderRadius:8,border:"1px solid #21262D",background:"transparent",color:"#9ca3af",fontSize:12,cursor:"pointer",transition:"all 0.2s"}}
                  onMouseOver={e=>{e.currentTarget.style.borderColor="#F59E0B44";e.currentTarget.style.color="#F59E0B";}}
                  onMouseOut={e=>{e.currentTarget.style.borderColor="#21262D";e.currentTarget.style.color="#9ca3af";}}>
                  ✏️ Edit
                </button>
                <button onClick={()=>handleDelete(person.id)}
                  style={{padding:"7px 12px",borderRadius:8,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:12,cursor:"pointer"}}
                  onMouseOver={e=>{e.currentTarget.style.borderColor="rgba(239,68,68,0.4)";e.currentTarget.style.color="#ef4444";}}
                  onMouseOut={e=>{e.currentTarget.style.borderColor="#21262D";e.currentTarget.style.color="#6b7280";}}>
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length===0&&(
        <div style={{textAlign:"center",padding:"60px 0",color:"#4b5563",background:"#161B22",borderRadius:12,border:"1px solid #21262D"}}>
          <p style={{fontSize:32,margin:"0 0 12px"}}>👥</p>
          <p style={{margin:0,fontSize:14}}>No people found.</p>
        </div>
      )}

      {modal!==null&&<PersonModal person={Object.keys(modal).length?modal:null} onSave={handleSave} onClose={()=>setModal(null)}/>}
    </div>
  );
}
