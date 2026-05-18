"use client";
import { getForms, saveSubmission as sheetSaveSubmission } from "@/lib/sheets";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronLeft, Star, Check } from "lucide-react";
import ProgressBar from "@/components/form/ProgressBar";
import QuestionCard from "@/components/form/QuestionCard";
import RatingScale from "@/components/form/RatingScale";

function getTheme(form){
  const T={amber:"#F59E0B",blue:"#3B82F6",green:"#10B981",rose:"#F43F5E",violet:"#8B5CF6",cyan:"#06B6D4"};
  const p=form?.customColor||T[form?.theme]||"#F59E0B";
  const rgb=p.startsWith("#")?parseInt(p.slice(1,3),16)+","+parseInt(p.slice(3,5),16)+","+parseInt(p.slice(5,7),16):"245,158,11";
  return{primary:p,light:"rgba("+rgb+",0.1)",border:"rgba("+rgb+",0.2)",glow:"rgba("+rgb+",0.06)"};
}
function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=40}){const color=gc(name);return <div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}
function getMY(){return new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"});}

// ── localStorage helpers ───────────────────────────────────────────────────────
function getSubmissions(formId){
  try{return JSON.parse(localStorage.getItem("submissions_"+formId)||"[]");}catch{return[];}
}
function saveSubmission(formId,reviewerEmail,personName,values){
  const all=getSubmissions(formId);
  const idx=all.findIndex(s=>s.reviewerEmail===reviewerEmail&&s.personName===personName);
  const entry={reviewerEmail,personName,formId,values,updatedAt:new Date().toISOString()};
  if(idx!==-1)all[idx]=entry;
  else all.push(entry);
  localStorage.setItem("submissions_"+formId,JSON.stringify(all));
}
function getPrevSubmission(formId,reviewerEmail,personName){
  return getSubmissions(formId).find(s=>s.reviewerEmail===reviewerEmail&&s.personName===personName)||null;
}
function getReviewedNames(formId,reviewerEmail){
  return getSubmissions(formId).filter(s=>s.reviewerEmail===reviewerEmail).map(s=>s.personName);
}

// ── Step: Enter Email ─────────────────────────────────────────────────────────
function StepEmail({form,onNext}){
  const [email,setEmail]=useState("");
  const [err,setErr]=useState("");
  const t=getTheme(form);
  function handleNext(){
    if(!email.trim()){setErr("Please enter your email.");return;}
    if(!email.includes("@")){setErr("Please enter a valid email.");return;}
    const conn=(form?.connections||[]).find(c=>c.reviewerEmail.toLowerCase()===email.toLowerCase().trim());
    if(!conn){setErr("No review assigned to this email for this form.");return;}
    onNext(email.trim(),conn);
  }
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:420,textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:999,background:t.light,border:"1px solid "+t.border,marginBottom:20}}>
          <Star size={11} color={t.primary}/>
          <span style={{fontSize:10,color:t.primary,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase"}}>{form.badgeLabel||"Review"} · {getMY()}</span>
        </div>
        <h2 style={{color:"white",fontSize:24,fontWeight:700,margin:"0 0 8px",fontFamily:"var(--font-playfair)"}}>{form.name}</h2>
        {form.quote&&<p style={{color:"#6b7280",fontSize:13,fontStyle:"italic",margin:"0 0 32px"}}>"{form.quote}"</p>}
        <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,padding:28,textAlign:"left"}}>
          <label style={{fontSize:11,color:"#6b7280",display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em"}}>Your Email Address</label>
          <input value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&handleNext()}
            placeholder="your@email.com" type="email" autoFocus
            style={{width:"100%",background:"#0D1117",border:"1px solid "+(err?"rgba(239,68,68,0.6)":t.border),borderRadius:10,padding:"12px 16px",color:"white",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:err?8:16,transition:"border-color 0.2s"}}
            onFocus={e=>e.target.style.borderColor=t.primary} onBlur={e=>e.target.style.borderColor=err?"rgba(239,68,68,0.6)":t.border}/>
          {err&&<p style={{color:"#ef4444",fontSize:12,margin:"0 0 14px"}}>{err}</p>}
          <button onClick={handleNext}
            style={{width:"100%",padding:"13px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,"+t.primary+"cc,"+t.primary+")",color:"#000",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            Continue <ChevronRight size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step: Review List (one-to-many) ───────────────────────────────────────────
function StepReviewList({form,conn,reviewerEmail,onStart,onBack}){
  const t=getTheme(form);
  const reviewed=getReviewedNames(form.id,reviewerEmail);
  const pending=conn.revieweeNames.filter(n=>!reviewed.includes(n));
  const allDone=pending.length===0;

  return(
    <div style={{minHeight:"100vh",padding:"40px 24px"}}>
      <div style={{maxWidth:520,margin:"0 auto"}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:13,marginBottom:24,display:"flex",alignItems:"center",gap:6,padding:0}}>
          <ChevronLeft size={16}/> Back
        </button>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:999,background:t.light,border:"1px solid "+t.border,marginBottom:16}}>
          <Star size={11} color={t.primary}/>
          <span style={{fontSize:10,color:t.primary,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em"}}>{form.badgeLabel||"Review"} · {getMY()}</span>
        </div>
        <h2 style={{color:"white",fontSize:20,fontWeight:700,margin:"0 0 6px",fontFamily:"var(--font-playfair)"}}>Your Reviews</h2>
        <p style={{color:"#6b7280",fontSize:14,margin:"0 0 20px"}}>
          {allDone?"All reviews completed! You can edit any previous review below.":reviewed.length===0?"You have "+conn.revieweeNames.length+" people to review.":"Progress: "+reviewed.length+" of "+conn.revieweeNames.length+" completed."}
        </p>

        {/* Progress */}
        {conn.revieweeNames.length>1&&(
          <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px",marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,color:"#6b7280"}}>Progress</span>
              <span style={{fontSize:12,color:t.primary,fontWeight:600}}>{reviewed.length}/{conn.revieweeNames.length}</span>
            </div>
            <div style={{height:6,background:"#21262D",borderRadius:999,overflow:"hidden"}}>
              <div style={{height:"100%",background:t.primary,borderRadius:999,width:((reviewed.length/conn.revieweeNames.length)*100)+"%",transition:"width 0.5s ease"}}/>
            </div>
          </div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
          {conn.revieweeNames.map((name,i)=>{
            const isDone=reviewed.includes(name);
            const isNext=!isDone&&pending[0]===name;
            const c=gc(name);
            const prev=getPrevSubmission(form.id,reviewerEmail,name);
            return(
              <button key={name} onClick={()=>onStart(name)}
                style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:12,border:"1px solid "+(isDone?"#22c55e33":isNext?c+"55":"#21262D"),background:isDone?"rgba(34,197,94,0.05)":isNext?c+"08":"#161B22",cursor:"pointer",textAlign:"left",transition:"all 0.2s",width:"100%"}}
                onMouseOver={e=>e.currentTarget.style.borderColor=isDone?"#22c55e55":c+"77"}
                onMouseOut={e=>e.currentTarget.style.borderColor=isDone?"#22c55e33":isNext?c+"55":"#21262D"}>
                <div style={{width:36,height:36,borderRadius:"50%",background:isDone?"rgba(34,197,94,0.15)":isNext?c+"18":"#21262D",border:"2px solid "+(isDone?"#22c55e":isNext?c:"#374151"),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {isDone?<Check size={16} color="#22c55e"/>:<span style={{fontSize:13,fontWeight:700,color:isNext?c:"#6b7280"}}>{i+1}</span>}
                </div>
                <Av name={name} size={40}/>
                <div style={{flex:1}}>
                  <p style={{color:"white",fontSize:15,fontWeight:600,margin:0}}>{name}</p>
                  <p style={{color:isDone?"#22c55e":isNext?c:"#4b5563",fontSize:12,margin:"3px 0 0",fontWeight:isNext?600:400}}>
                    {isDone?"✓ Reviewed — click to edit":isNext?"Start →":"Pending"}
                  </p>
                </div>
                <div style={{flexShrink:0}}>
                  {isDone&&<span style={{fontSize:11,color:"#22c55e",background:"rgba(34,197,94,0.1)",padding:"4px 12px",borderRadius:999,fontWeight:600}}>Edit</span>}
                  {isNext&&<span style={{fontSize:11,color:c,background:c+"18",padding:"4px 12px",borderRadius:999,fontWeight:600}}>Next →</span>}
                  {!isDone&&!isNext&&<span style={{fontSize:11,color:"#4b5563",background:"#21262D",padding:"4px 12px",borderRadius:999}}>Pending</span>}
                </div>
              </button>
            );
          })}
        </div>

        {!allDone&&(
          <button onClick={()=>onStart(pending[0])}
            style={{width:"100%",padding:"14px 0",borderRadius:12,border:"none",background:"linear-gradient(135deg,"+t.primary+"cc,"+t.primary+")",color:"#000",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {reviewed.length===0?"Start Reviews":"Continue Reviews"} <ChevronRight size={18}/>
          </button>
        )}
        {allDone&&(
          <div style={{textAlign:"center",padding:"20px 0",display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
            <p style={{color:"#22c55e",fontSize:14,fontWeight:600,margin:0}}>✓ All reviews completed!</p>
            <a href="/" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 24px",borderRadius:10,border:"1px solid #21262D",background:"transparent",color:"#9ca3af",fontSize:13,textDecoration:"none"}}>
              ← Back to Forms
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step: Fill form ───────────────────────────────────────────────────────────
function StepForm({form,reviewerEmail,personName,isMulti,onDone,onBack}){
  const prev=getPrevSubmission(form.id,reviewerEmail,personName);
  const [vals,setVals]=useState(prev?.values||{});
  const [errors,setErrors]=useState({});
  const [loading,setLoading]=useState(false);
  const [progress,setProgress]=useState(0);
  const t=getTheme(form);
  const rFields=(form.fields||[]).filter(f=>f.type==="rating"&&f.required);
  const isEditing=!!prev;

  useEffect(()=>{setProgress((rFields.filter(f=>vals[f.id]).length/Math.max(rFields.length,1))*100);},[vals]);

  function change(id,val){setVals(p=>({...p,[id]:val}));setErrors(p=>({...p,[id]:false}));}

  async function submit(){
    const errs={};let hasErr=false;
    (form.fields||[]).forEach(f=>{if(f.required&&!vals[f.id]){errs[f.id]=true;hasErr=true;}});
    if(hasErr){setErrors(errs);return;}
    setLoading(true);
    try{
      // Save to localStorage
      saveSubmission(form.id,reviewerEmail,personName,vals);
      // Save to Google Sheets
      await sheetSaveSubmission({
        formId:form.id,
        formName:form.name,
        reviewerEmail,
        personName,
        values:vals,
        comments:vals.comments||"",
        submittedAt:new Date().toISOString(),
      });
    }catch(err){
      console.error("Sheets save error:",err);
    }
    setLoading(false);
    onDone();
  }

  let qi=0;
  return(
    <>
      <ProgressBar progress={progress}/>
      <main style={{minHeight:"100vh",padding:"70px 16px 40px",maxWidth:680,margin:"0 auto"}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:999,background:t.light,border:"1px solid "+t.border,marginBottom:12}}>
            <Star size={11} color={t.primary}/>
            <span style={{fontSize:10,color:t.primary,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em"}}>{form.badgeLabel||"Review"} · {getMY()}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:8}}>
            <Av name={personName} size={52}/>
            <div style={{textAlign:"left"}}>
              <p style={{color:"#6b7280",fontSize:11,margin:"0 0 3px"}}>{isEditing?"Editing review for":"Reviewing"}</p>
              <h2 style={{color:"white",fontSize:22,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>{personName}</h2>
            </div>
          </div>
          {isEditing&&(
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:999,padding:"4px 14px",fontSize:12,color:"#F59E0B"}}>
              ✏️ Previous answers loaded — change what you want
            </div>
          )}
          <div style={{margin:"12px auto 0",width:40,height:1,background:"linear-gradient(90deg,transparent,"+t.primary+",transparent)"}}/>
        </div>

        {isMulti&&(
          <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1px solid #21262D",borderRadius:8,cursor:"pointer",color:"#6b7280",padding:"6px 14px",fontSize:12,marginBottom:16,transition:"all 0.2s"}}
            onMouseOver={e=>e.currentTarget.style.color="white"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>
            <ChevronLeft size={14}/> Back to list
          </button>
        )}

        <div style={{display:"flex",alignItems:"center",gap:8,margin:"16px 0"}}>
          <div style={{flex:1,height:1,background:"#21262D"}}/><span style={{fontSize:10,color:"#4b5563",textTransform:"uppercase",letterSpacing:"0.1em"}}>Questions</span><div style={{flex:1,height:1,background:"#21262D"}}/>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {(form.fields||[]).map(field=>{
            if(field.type==="rating"){qi++;const n=qi;return(
              <QuestionCard key={field.id} number={n} question={field.label} answered={!!vals[field.id]}>
                <RatingScale value={vals[field.id]||null} onChange={v=>change(field.id,v)} error={!!errors[field.id]} accentColor={t.primary}/>
              </QuestionCard>
            );}
            if(field.type==="textarea")return(
              <div key={field.id} style={{borderRadius:12,padding:20,background:"#161B22",border:"1px solid #21262D"}}>
                <label style={{display:"block",fontSize:14,color:"#d1d5db",marginBottom:10}}>{field.label}{!field.required&&<span style={{color:"#4b5563",marginLeft:8,fontSize:12}}>(Optional)</span>}</label>
                <textarea rows={4} maxLength={1000} defaultValue={vals[field.id]||""} onChange={e=>change(field.id,e.target.value)}
                  style={{width:"100%",background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"10px 12px",color:"white",fontSize:13,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
                <div style={{textAlign:"right",fontSize:11,color:"#4b5563",marginTop:4}}>{(vals[field.id]||"").length}/1000</div>
              </div>
            );
            if(field.type==="yesno")return(
              <div key={field.id} style={{borderRadius:12,padding:20,background:"#161B22",border:"1px solid "+(errors[field.id]?"rgba(239,68,68,0.4)":"#21262D")}}>
                <label style={{display:"block",fontSize:14,color:"#d1d5db",marginBottom:12}}>{field.label}{field.required&&<span style={{color:t.primary,marginLeft:4}}>*</span>}</label>
                <div style={{display:"flex",gap:10}}>
                  {["Yes","No"].map(opt=><button key={opt} type="button" onClick={()=>change(field.id,opt)}
                    style={{padding:"9px 24px",borderRadius:999,fontSize:13,fontWeight:500,cursor:"pointer",border:"1px solid "+(vals[field.id]===opt?t.primary:"#21262D"),background:vals[field.id]===opt?t.primary:"#0D1117",color:vals[field.id]===opt?"#000":"#9ca3af",transition:"all 0.2s"}}>{opt}</button>)}
                </div>
              </div>
            );
            if(field.type==="text")return(
              <div key={field.id} style={{borderRadius:12,padding:20,background:"#161B22",border:"1px solid "+(errors[field.id]?"rgba(239,68,68,0.4)":"#21262D")}}>
                <label style={{display:"block",fontSize:14,color:"#d1d5db",marginBottom:10}}>{field.label}{field.required&&<span style={{color:t.primary,marginLeft:4}}>*</span>}</label>
                <input type="text" defaultValue={vals[field.id]||""} placeholder="Your answer..." onChange={e=>change(field.id,e.target.value)}
                  style={{width:"100%",background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"10px 12px",color:"white",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            );
            return null;
          })}
        </div>

        <div style={{marginTop:24}}>
          <button onClick={submit} disabled={loading}
            style={{width:"100%",padding:"14px 0",borderRadius:12,border:"none",background:loading?"#374151":"linear-gradient(135deg,"+t.primary+"cc,"+t.primary+")",color:loading?"#9ca3af":"#000",fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading?"Saving...":(isEditing?"Update Review":"Submit Review")}
          </button>
          <p style={{textAlign:"center",fontSize:11,color:"#4b5563",marginTop:10}}>Your response is saved privately.</p>
        </div>
      </main>
    </>
  );
}

// ── Step: All Done ────────────────────────────────────────────────────────────
function StepSuccess({form,conn,reviewerEmail,onEdit}){
  const t=getTheme(form);
  const reviewed=getReviewedNames(form.id,reviewerEmail);
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:420}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:t.light,border:"2px solid "+t.border,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:36}}>✓</div>
        <h2 style={{color:"white",fontSize:26,fontWeight:700,margin:"0 0 10px",fontFamily:"var(--font-playfair)"}}>All Done!</h2>
        <p style={{color:"#9ca3af",fontSize:14,margin:"0 0 20px",lineHeight:1.6}}>
          You have reviewed <strong style={{color:t.primary}}>{reviewed.length}</strong> person{reviewed.length>1?"s":""}.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
          {conn.revieweeNames.map(name=>(
            <button key={name} onClick={()=>onEdit(name)}
              style={{display:"flex",alignItems:"center",gap:10,background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"10px 14px",cursor:"pointer",textAlign:"left",transition:"all 0.2s",width:"100%"}}
              onMouseOver={e=>e.currentTarget.style.borderColor="#F59E0B44"}
              onMouseOut={e=>e.currentTarget.style.borderColor="#21262D"}>
              <span style={{color:"#22c55e",fontSize:16}}>✓</span>
              <Av name={name} size={28}/>
              <p style={{color:"white",fontSize:13,margin:0,flex:1}}>{name}</p>
              <span style={{fontSize:11,color:"#6b7280",background:"#21262D",padding:"3px 10px",borderRadius:999}}>Edit</span>
            </button>
          ))}
        </div>
        <p style={{color:"#4b5563",fontSize:12}}>Click any name above to edit your review.</p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FormPage(){
  const {formId}=useParams();
  const searchParams=useSearchParams();
  const [form,setForm]=useState(null);
  const [loading,setLoading]=useState(true);
  const [notFound,setNotFound]=useState(false);
  const [step,setStep]=useState("email");
  const [reviewerEmail,setReviewerEmail]=useState("");
  const [conn,setConn]=useState(null);
  const [currentPerson,setCurrentPerson]=useState(null);

  useEffect(()=>{
    const sf=localStorage.getItem("forms_list");
    let found=null;
    if(sf){
      try{
        const forms=JSON.parse(sf);
        found=forms.find(f=>f.id===formId);
        if(found&&found.active) setForm(found);
        else setNotFound(true);
      }catch{
        setNotFound(true);
      }
    }else setNotFound(true);
    // Check URL for pre-filled email
    const urlEmail=searchParams.get("email");
    if(urlEmail&&found&&found.active){
      const connection=(found.connections||[]).find(c=>c.reviewerEmail.toLowerCase()===urlEmail.toLowerCase());
      if(connection){
        setReviewerEmail(urlEmail);
        setConn(connection);
        if(connection.type==="single"){setCurrentPerson(connection.revieweeNames[0]);setStep("form");}
        else setStep("list");
      }
    }
    setLoading(false);
  },[formId, searchParams]);

  function handleEmailNext(email,connection){
    setReviewerEmail(email);
    setConn(connection);
    if(connection.type==="single"){
      setCurrentPerson(connection.revieweeNames[0]);
      setStep("form");
    }else{
      setStep("list");
    }
  }

  function handleStartPerson(name){
    setCurrentPerson(name);
    setStep("form");
  }

  function handleFormDone(){
    if(conn.type==="single"){
      setStep("success");
    }else{
      // Check if all done
      const reviewed=getReviewedNames(form.id,reviewerEmail);
      const allNames=conn.revieweeNames;
      const allDone=allNames.every(n=>reviewed.includes(n));
      if(allDone)setStep("success");
      else setStep("list");
    }
  }

  function handleEditFromSuccess(name){
    setCurrentPerson(name);
    setStep("form");
  }

  if(loading)return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0D1117"}}><p style={{color:"#6b7280"}}>Loading...</p></div>;
  if(notFound)return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0D1117",padding:24}}>
      <div style={{textAlign:"center"}}>
        <p style={{fontSize:40,margin:"0 0 16px"}}>🔍</p>
        <h2 style={{color:"white",fontSize:20,fontWeight:700,margin:"0 0 8px"}}>Form Not Found</h2>
        <p style={{color:"#6b7280",fontSize:14,margin:"0 0 20px"}}>This form does not exist or is no longer active.</p>
        <a href="/" style={{color:"#F59E0B",fontSize:13}}>Back to home</a>
      </div>
    </div>
  );

  const t=getTheme(form);
  return(
    <div style={{background:"#0D1117",minHeight:"100vh"}}>
      <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:600,height:280,background:"radial-gradient(ellipse,"+t.glow+" 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"relative",zIndex:1}}>
        {step==="email"&&<StepEmail form={form} onNext={handleEmailNext}/>}
        {step==="list"&&<StepReviewList form={form} conn={conn} reviewerEmail={reviewerEmail} onStart={handleStartPerson} onBack={()=>setStep("email")}/>}
        {step==="form"&&<StepForm form={form} reviewerEmail={reviewerEmail} personName={currentPerson} isMulti={conn?.type==="multi"} onDone={handleFormDone} onBack={()=>setStep("list")}/>}
        {step==="success"&&<StepSuccess form={form} conn={conn} reviewerEmail={reviewerEmail} onEdit={handleEditFromSuccess}/>}
      </div>
    </div>
  );
}