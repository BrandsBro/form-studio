"use client";
import { useState, useEffect } from "react";
import { Plus, ArrowLeft, Trash2, X, ArrowRight, Save, GripVertical, PlusCircle, Copy } from "lucide-react";

const THEMES = { amber:"#F59E0B", blue:"#3B82F6", green:"#10B981", rose:"#F43F5E", violet:"#8B5CF6", cyan:"#06B6D4" };
const FTYPES = [{type:"rating",label:"Rating 1-5"},{type:"text",label:"Short Text"},{type:"textarea",label:"Long Text"},{type:"yesno",label:"Yes / No"}];
const DFIELDS = [
  {id:"f1",type:"rating",label:"The manager communicates clearly and effectively.",required:true},
  {id:"f2",type:"rating",label:"The manager provides necessary support and guidance.",required:true},
  {id:"f3",type:"rating",label:"The manager provides regular constructive feedback.",required:true},
  {id:"f4",type:"rating",label:"The manager is approachable and open to listening.",required:true},
  {id:"f5",type:"rating",label:"The manager motivates the team effectively.",required:true},
  {id:"f6",type:"rating",label:"The manager handles challenges and provides solutions.",required:true},
  {id:"f7",type:"rating",label:"The manager treats all team members fairly.",required:true},
  {id:"f8",type:"rating",label:"The manager recognizes individual contributions.",required:true},
  {id:"f9",type:"rating",label:"The manager empowers team members to take ownership.",required:true},
  {id:"f10",type:"rating",label:"The manager supports professional growth.",required:true},
  {id:"f11",type:"textarea",label:"Any comments or suggestions to improve?",required:false},
];
const EF = {name:"New Form",description:"",active:true,badgeLabel:"Monthly Performance Review",quote:"As a team you have the right to measure your team leader wisely.",theme:"amber",customColor:"",fields:DFIELDS,connections:[]};

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=34}){const color=gc(name);return <div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}
let dragIdx=null;

function ConnModal({employees,executives,existing,onSave,onClose}){
  const [rName,setRName]=useState("");
  const [eeNames,setEeNames]=useState([]);
  const all=[...employees.map(e=>({name:e.name,role:e.role,tag:"Staff"})),...executives.map(e=>({name:e.name,role:e.role,tag:"Executive"}))];
  const toggle=n=>setEeNames(p=>p.includes(n)?p.filter(x=>x!==n):[...p,n]);
  function doSave(){
    if(!rName||!eeNames.length)return alert("Select reviewer and at least one reviewee.");
    const ex=existing.find(c=>c.reviewerName===rName);
    if(ex){const m=[...new Set([...ex.revieweeNames,...eeNames])];onSave({...ex,revieweeNames:m});}
    else onSave({id:"c"+Date.now(),reviewerName:rName,revieweeNames:eeNames,type:eeNames.length>1?"multi":"single"});
  }
  const inp={width:"100%",background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"9px 12px",color:"white",fontSize:13,outline:"none",boxSizing:"border-box"};
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.75)"}}/>
      <div style={{position:"relative",width:"min(540px,100%)",background:"#0D1117",border:"1px solid #21262D",borderRadius:16,overflow:"hidden",maxHeight:"88vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid #21262D",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><h3 style={{color:"white",margin:0,fontWeight:700}}>Add Connection</h3><p style={{color:"#6b7280",fontSize:12,margin:"3px 0 0"}}>Set who reviews whom</p></div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:20}}>x</button>
        </div>
        <div style={{padding:20,overflowY:"auto",display:"flex",flexDirection:"column",gap:18}}>
          <div>
            <p style={{fontSize:11,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 10px"}}>Step 1 - Who is the reviewer?</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8}}>
              {all.map(p=>{const sel=rName===p.name;const c=gc(p.name);return(
                <button key={p.name} onClick={()=>{setRName(p.name);setEeNames([]);}} style={{padding:"10px",borderRadius:10,border:"2px solid "+(sel?c+"88":"#21262D"),background:sel?c+"15":"#161B22",cursor:"pointer",textAlign:"left"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><Av name={p.name} size={26}/>
                    <div><p style={{color:"white",fontSize:11,fontWeight:600,margin:0}}>{p.name.split(" ")[0]}</p>
                    <p style={{color:"#4b5563",fontSize:9,margin:0}}>{p.tag}</p></div></div>
                </button>);
              })}
            </div>
          </div>
          {rName&&(
            <div>
              <p style={{fontSize:11,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 10px"}}>Step 2 - Who can they review? (select multiple)</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8}}>
                {all.filter(p=>p.name!==rName).map(p=>{const sel=eeNames.includes(p.name);const c=gc(p.name);return(
                  <button key={p.name} onClick={()=>toggle(p.name)} style={{padding:"10px",borderRadius:10,border:"2px solid "+(sel?c+"88":"#21262D"),background:sel?c+"15":"#161B22",cursor:"pointer",textAlign:"left",position:"relative"}}>
                    {sel&&<span style={{position:"absolute",top:5,right:8,color:c,fontSize:12,fontWeight:900}}>v</span>}
                    <div style={{display:"flex",alignItems:"center",gap:8}}><Av name={p.name} size={26}/>
                      <div><p style={{color:"white",fontSize:11,fontWeight:600,margin:0}}>{p.name.split(" ")[0]}</p>
                      <p style={{color:"#4b5563",fontSize:9,margin:0}}>{p.tag}</p></div></div>
                  </button>);
                })}
              </div>
            </div>
          )}
        </div>
        <div style={{padding:"14px 20px",borderTop:"1px solid #21262D",display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"9px 0",borderRadius:9,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:13,cursor:"pointer"}}>Cancel</button>
          <button onClick={doSave} style={{flex:2,padding:"9px 0",borderRadius:9,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>Save Connection</button>
        </div>
      </div>
    </div>
  );
}

function FormDetail({form,onUpdate,onBack,employees,executives}){
  const [tab,setTab]=useState("builder");
  const [f,setF]=useState(form);
  const [showConn,setShowConn]=useState(false);
  const [saved,setSaved]=useState(false);
  const [addType,setAddType]=useState(false);
  const pc=f.customColor||THEMES[f.theme]||"#F59E0B";

  function save(){onUpdate(f);setSaved(true);setTimeout(()=>setSaved(false),2000);}
  function uf(id,k,v){setF(p=>({...p,fields:p.fields.map(x=>x.id===id?{...x,[k]:v}:x)}));}
  function df(id){setF(p=>({...p,fields:p.fields.filter(x=>x.id!==id)}));}
  function af(type){setF(p=>({...p,fields:[...p.fields,{id:"f"+Date.now(),type,label:"New question - click to edit.",required:false}]}));setAddType(false);}
  function ds(e,i){dragIdx=i;e.dataTransfer.effectAllowed="move";}
  function do2(e,i){e.preventDefault();if(dragIdx===null||dragIdx===i)return;const fl=[...f.fields];const[r]=fl.splice(dragIdx,1);fl.splice(i,0,r);dragIdx=i;setF(p=>({...p,fields:fl}));}
  function sc(conn){const ex=f.connections.find(c=>c.reviewerName===conn.reviewerName);const cs=ex?f.connections.map(c=>c.reviewerName===conn.reviewerName?conn:c):[...f.connections,conn];setF(p=>({...p,connections:cs}));setShowConn(false);}
  function rc(id){setF(p=>({...p,connections:p.connections.filter(c=>c.id!==id)}));}
  function rr(cid,name){const conn=f.connections.find(c=>c.id===cid);if(!conn)return;const ns=conn.revieweeNames.filter(n=>n!==name);if(!ns.length){rc(cid);return;}setF(p=>({...p,connections:p.connections.map(c=>c.id===cid?{...c,revieweeNames:ns,type:ns.length>1?"multi":"single"}:c)}));}

  const inp={width:"100%",background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"9px 12px",color:"white",fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  const lb={fontSize:11,color:"#6b7280",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#6b7280",display:"flex",alignItems:"center",gap:6,fontSize:13,padding:0}}>
            Back to Forms
          </button>
          <span style={{color:"#21262D"}}>|</span>
          <h2 style={{color:"white",fontSize:16,fontWeight:700,margin:0}}>{f.name}</h2>
          <span style={{fontSize:11,color:f.active?"#22c55e":"#6b7280",background:f.active?"rgba(34,197,94,0.12)":"#21262D",padding:"2px 10px",borderRadius:999}}>{f.active?"Active":"Inactive"}</span>
        </div>
        <button onClick={save} style={{padding:"8px 18px",borderRadius:9,border:"none",background:saved?"#16a34a":pc,color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>
          {saved?"Saved!":"Save Changes"}
        </button>
      </div>

      <div style={{display:"flex",background:"#0D1117",borderRadius:10,padding:3,width:"fit-content"}}>
        {[{id:"builder",label:"Form Builder"},{id:"connections",label:"Connections ("+f.connections.length+")"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 18px",fontSize:13,fontWeight:500,borderRadius:8,border:"none",cursor:"pointer",background:tab===t.id?"#161B22":"transparent",color:tab===t.id?"white":"#6b7280"}}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==="builder"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:20}}>
          <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:20,display:"flex",flexDirection:"column",gap:14}}>
            <p style={{color:"white",fontWeight:600,fontSize:14,margin:0}}>Settings</p>
            {[{k:"name",l:"Form Name"},{k:"description",l:"Description"},{k:"badgeLabel",l:"Badge Label"},{k:"quote",l:"Header Quote",m:true}].map(({k,l,m})=>(
              <div key={k}>
                <label style={lb}>{l}</label>
                {m?<textarea value={f[k]} onChange={e=>setF(p=>({...p,[k]:e.target.value}))} rows={2} style={{...inp,resize:"none"}}/>
                  :<input value={f[k]} onChange={e=>setF(p=>({...p,[k]:e.target.value}))} style={inp}/>}
              </div>
            ))}
            <div>
              <label style={lb}>Status</label>
              <button onClick={()=>setF(p=>({...p,active:!p.active}))} style={{padding:"7px 14px",borderRadius:8,border:"1px solid "+(f.active?"#22c55e44":"#21262D"),background:f.active?"rgba(34,197,94,0.1)":"transparent",color:f.active?"#22c55e":"#6b7280",fontSize:12,cursor:"pointer"}}>
                {f.active?"Active (visible to users)":"Inactive (hidden)"}
              </button>
            </div>
            <div>
              <label style={lb}>Theme Color</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
                {Object.entries(THEMES).map(([k,c])=>(
                  <button key={k} onClick={()=>setF(p=>({...p,theme:k,customColor:""}))} style={{width:28,height:28,borderRadius:"50%",border:f.theme===k&&!f.customColor?"3px solid white":"3px solid transparent",background:c,cursor:"pointer",outline:"none",transform:f.theme===k&&!f.customColor?"scale(1.2)":"scale(1)"}}/>
                ))}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="color" value={f.customColor||THEMES[f.theme]||"#F59E0B"} onChange={e=>setF(p=>({...p,customColor:e.target.value}))} style={{width:36,height:36,borderRadius:6,border:"1px solid #21262D",cursor:"pointer",padding:2,flexShrink:0}}/>
                <input value={f.customColor} onChange={e=>setF(p=>({...p,customColor:e.target.value}))} placeholder="#F59E0B" style={{...inp,fontFamily:"monospace",flex:1}}/>
                {f.customColor&&<button onClick={()=>setF(p=>({...p,customColor:""}))} style={{fontSize:11,color:"#6b7280",background:"none",border:"none",cursor:"pointer",whiteSpace:"nowrap"}}>Clear</button>}
              </div>
            </div>
          </div>

          <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:20,display:"flex",flexDirection:"column",gap:10}}>
            <p style={{color:"white",fontWeight:600,fontSize:14,margin:"0 0 4px"}}>Questions ({f.fields.length})</p>
            {f.fields.map((field,idx)=>(
              <div key={field.id} draggable onDragStart={e=>ds(e,idx)} onDragOver={e=>do2(e,idx)} onDragEnd={()=>{dragIdx=null;}}
                style={{background:"#0D1117",border:"1px solid #21262D",borderRadius:9,padding:"10px",display:"flex",alignItems:"flex-start",gap:8,cursor:"grab"}}>
                <span style={{color:"#374151",marginTop:10,flexShrink:0,fontSize:12}}>::::</span>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <select value={field.type} onChange={e=>uf(field.id,"type",e.target.value)} style={{fontSize:10,background:pc+"22",color:pc,border:"1px solid "+pc+"44",borderRadius:4,padding:"2px 6px",outline:"none",cursor:"pointer"}}>
                      {FTYPES.map(o=><option key={o.type} value={o.type} style={{background:"#161B22",color:"white"}}>{o.label}</option>)}
                    </select>
                    <label style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#6b7280",cursor:"pointer"}}>
                      <input type="checkbox" checked={field.required} onChange={e=>uf(field.id,"required",e.target.checked)} style={{accentColor:pc}}/>Required
                    </label>
                  </div>
                  <textarea value={field.label} onChange={e=>uf(field.id,"label",e.target.value)} rows={2}
                    style={{background:"transparent",border:"none",outline:"none",color:"#d1d5db",fontSize:12,resize:"none",lineHeight:1.5,width:"100%",fontFamily:"inherit"}}/>
                </div>
                <button onClick={()=>df(field.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#374151",padding:3,marginTop:4}}
                  onMouseOver={e=>e.currentTarget.style.color="#ef4444"} onMouseOut={e=>e.currentTarget.style.color="#374151"}>
                  x
                </button>
              </div>
            ))}
            {addType?(
              <div style={{background:"#0D1117",border:"1px solid #21262D",borderRadius:9,padding:12}}>
                <p style={{color:"#9ca3af",fontSize:12,margin:"0 0 8px"}}>Choose type:</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {FTYPES.map(o=><button key={o.type} onClick={()=>af(o.type)} style={{padding:"8px 10px",fontSize:12,background:"#161B22",border:"1px solid #21262D",borderRadius:7,color:"white",cursor:"pointer",textAlign:"left"}}>{o.label}</button>)}
                </div>
                <button onClick={()=>setAddType(false)} style={{marginTop:8,fontSize:11,color:"#6b7280",background:"none",border:"none",cursor:"pointer"}}>Cancel</button>
              </div>
            ):(
              <button onClick={()=>setAddType(true)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"9px 0",border:"1px dashed #30363D",borderRadius:9,color:"#6b7280",background:"transparent",cursor:"pointer",fontSize:13}}>
                + Add Question
              </button>
            )}
          </div>
        </div>
      )}

      {tab==="connections"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
            <div>
              <p style={{color:"white",fontWeight:600,fontSize:14,margin:0}}>Connections for this form</p>
              <p style={{color:"#6b7280",fontSize:12,margin:"3px 0 0"}}>Both employees and executives can be assigned as reviewees.</p>
            </div>
            <button onClick={()=>setShowConn(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:12,fontWeight:700,cursor:"pointer"}}>
              + Add Connection
            </button>
          </div>
          {f.connections.length===0?(
            <div style={{textAlign:"center",padding:"48px 0",color:"#4b5563",background:"#161B22",borderRadius:12,border:"1px solid #21262D"}}>
              <p style={{fontSize:28,margin:"0 0 8px"}}>o--o</p>
              <p style={{margin:0,fontSize:14}}>No connections yet. Add one above.</p>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {f.connections.map(conn=>(
                <div key={conn.id} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:18,display:"flex",alignItems:"flex-start",gap:14,flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,minWidth:150}}>
                    <Av name={conn.reviewerName} size={40}/>
                    <div>
                      <p style={{color:"white",fontSize:13,fontWeight:700,margin:0}}>{conn.reviewerName}</p>
                      <span style={{fontSize:10,color:conn.type==="multi"?"#8B5CF6":"#3B82F6",background:conn.type==="multi"?"rgba(139,92,246,0.12)":"rgba(59,130,246,0.12)",padding:"2px 8px",borderRadius:999,fontWeight:600}}>
                        {conn.type==="multi"?"One to Many":"One to One"}
                      </span>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,color:"#F59E0B",fontSize:12,paddingTop:10}}>-- reviews --</div>
                  <div style={{flex:1,display:"flex",flexWrap:"wrap",gap:8}}>
                    {conn.revieweeNames.map(name=>{
                      const c=gc(name);
                      return(
                        <div key={name} style={{display:"flex",alignItems:"center",gap:7,background:"#0D1117",border:"1px solid "+c+"33",borderRadius:9,padding:"7px 10px"}}>
                          <Av name={name} size={26}/>
                          <p style={{color:"white",fontSize:12,fontWeight:600,margin:0}}>{name}</p>
                          <button onClick={()=>rr(conn.id,name)} style={{background:"none",border:"none",cursor:"pointer",color:"#374151",padding:2,marginLeft:2}}
                            onMouseOver={e=>e.currentTarget.style.color="#ef4444"} onMouseOut={e=>e.currentTarget.style.color="#374151"}>
                            x
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={()=>rc(conn.id)} style={{background:"none",border:"1px solid #21262D",borderRadius:7,cursor:"pointer",color:"#6b7280",padding:"6px 8px"}}
                    onMouseOver={e=>{e.currentTarget.style.borderColor="rgba(239,68,68,0.4)";e.currentTarget.style.color="#ef4444";}}
                    onMouseOut={e=>{e.currentTarget.style.borderColor="#21262D";e.currentTarget.style.color="#6b7280";}}>
                    Del
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {showConn&&<ConnModal employees={employees} executives={executives} existing={f.connections} onSave={sc} onClose={()=>setShowConn(false)}/>}
    </div>
  );
}

export default function FormManager(){
  const [forms,setForms]=useState([]);
  const [selected,setSelected]=useState(null);
  const [employees,setEmployees]=useState([]);
  const [executives,setExecutives]=useState([]);

  useEffect(()=>{
    const sf=localStorage.getItem("forms_list");
    const se=localStorage.getItem("employees");
    const sx=localStorage.getItem("executives");
    if(se){try{setEmployees(JSON.parse(se));}catch{}}
    if(sx){try{setExecutives(JSON.parse(sx));}catch{}}
    if(sf){try{setForms(JSON.parse(sf));}catch{}}
    else{
      const def=[{...EF,id:"form_"+Date.now(),name:"Leadership Performance Review",description:"Monthly leadership assessment",createdAt:new Date().toISOString().slice(0,10)}];
      setForms(def);
    }
  },[]);

  function saveForms(list){setForms(list);}
  function handleUpdate(updated){const list=forms.map(f=>f.id===updated.id?updated:f);saveForms(list);setSelected(updated);}
  function createForm(){const nf={...EF,id:"form_"+Date.now(),name:"New Form "+(forms.length+1),description:"",createdAt:new Date().toISOString().slice(0,10)};saveForms([...forms,nf]);setSelected(nf);}
  function dupForm(form){saveForms([...forms,{...form,id:"form_"+Date.now(),name:form.name+" (Copy)",createdAt:new Date().toISOString().slice(0,10)}]);}
  function delForm(id){if(confirm("Delete this form?"))saveForms(forms.filter(f=>f.id!==id));}
  function toggleActive(id){saveForms(forms.map(f=>f.id===id?{...f,active:!f.active}:f));}

  if(selected){
    const fresh=forms.find(f=>f.id===selected.id)||selected;
    return <FormDetail form={fresh} onUpdate={handleUpdate} onBack={()=>setSelected(null)} employees={employees} executives={executives}/>;
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>Forms</h2>
          <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>{forms.length} form{forms.length!==1?"s":""} - Click to edit, add connections, and publish</p>
        </div>
        <button onClick={createForm} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>
          + New Form
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {forms.map(form=>{
          const color=THEMES[form.theme]||form.customColor||"#F59E0B";
          return(
            <div key={form.id} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,overflow:"hidden",transition:"all 0.2s",cursor:"pointer"}}
              onMouseOver={e=>e.currentTarget.style.borderColor=color+"55"}
              onMouseOut={e=>e.currentTarget.style.borderColor="#21262D"}>
              <div style={{height:4,background:"linear-gradient(90deg,"+color+","+color+"44)"}}/>
              <div style={{padding:18}} onClick={()=>setSelected(form)}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:12}}>
                  <div>
                    <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{form.name}</p>
                    {form.description&&<p style={{color:"#6b7280",fontSize:12,margin:"4px 0 0"}}>{form.description}</p>}
                  </div>
                  <span style={{fontSize:10,color:form.active?"#22c55e":"#6b7280",background:form.active?"rgba(34,197,94,0.12)":"#21262D",padding:"3px 10px",borderRadius:999,whiteSpace:"nowrap",flexShrink:0}}>
                    {form.active?"Active":"Inactive"}
                  </span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                  {[{l:"Questions",v:form.fields?.length||0},{l:"Connections",v:form.connections?.length||0},{l:"Reviewees",v:form.connections?.reduce((a,c)=>a+c.revieweeNames.length,0)||0}].map(s=>(
                    <div key={s.l} style={{background:"#0D1117",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                      <p style={{color:color,fontSize:16,fontWeight:700,margin:0}}>{s.v}</p>
                      <p style={{color:"#6b7280",fontSize:10,margin:"2px 0 0"}}>{s.l}</p>
                    </div>
                  ))}
                </div>
                <p style={{color:"#4b5563",fontSize:10,margin:0}}>Created {form.createdAt}</p>
              </div>
              <div style={{display:"flex",gap:6,padding:"0 18px 16px"}} onClick={e=>e.stopPropagation()}>
                <button onClick={()=>setSelected(form)} style={{flex:1,padding:"7px 0",borderRadius:8,border:"1px solid "+color+"44",background:color+"12",color,fontSize:12,fontWeight:600,cursor:"pointer"}}>Edit</button>
                <button onClick={()=>toggleActive(form.id)} style={{flex:1,padding:"7px 0",borderRadius:8,border:"1px solid #21262D",background:"transparent",color:"#9ca3af",fontSize:12,cursor:"pointer"}}>{form.active?"Deactivate":"Activate"}</button>
                <button onClick={()=>dupForm(form)} style={{padding:"7px 10px",borderRadius:8,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:12,cursor:"pointer"}}>Copy</button>
                <button onClick={()=>delForm(form.id)} style={{padding:"7px 10px",borderRadius:8,border:"1px solid #21262D",background:"transparent",color:"#6b7280",fontSize:12,cursor:"pointer"}}
                  onMouseOver={e=>e.currentTarget.style.color="#ef4444"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>
                  Del
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {forms.length===0&&<div style={{textAlign:"center",padding:"60px 0",color:"#4b5563"}}><p style={{fontSize:14}}>No forms yet. Click New Form to get started.</p></div>}
    </div>
  );
}
