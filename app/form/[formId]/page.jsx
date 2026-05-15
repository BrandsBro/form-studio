"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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

function StepName({form,onNext}){
  const [name,setName]=useState("");
  const [err,setErr]=useState("");
  const t=getTheme(form);
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:400,textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:999,background:t.light,border:"1px solid "+t.border,marginBottom:16}}>
          <Star size={11} color={t.primary}/>
          <span style={{fontSize:10,color:t.primary,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase"}}>{form.badgeLabel||"Review"} · {getMY()}</span>
        </div>
        <h2 style={{color:"white",fontSize:22,fontWeight:700,margin:"0 0 8px",fontFamily:"var(--font-playfair)"}}>{form.name}</h2>
        {form.quote&&<p style={{color:"#6b7280",fontSize:13,fontStyle:"italic",margin:"0 0 28px"}}>"{form.quote}"</p>}
        <input value={name} onChange={e=>{setName(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&name.trim()&&onNext(name.trim())}
          placeholder="Enter your full name" autoFocus
          style={{width:"100%",background:"#161B22",border:"1px solid "+(err?"rgba(239,68,68,0.6)":t.border),borderRadius:12,padding:"13px 16px",color:"white",fontSize:15,outline:"none",boxSizing:"border-box",textAlign:"center",marginBottom:8}}
          onFocus={e=>e.target.style.borderColor=t.primary} onBlur={e=>e.target.style.borderColor=err?"rgba(239,68,68,0.6)":t.border}/>
        {err&&<p style={{color:"#ef4444",fontSize:12,margin:"0 0 8px"}}>{err}</p>}
        <button onClick={()=>{if(!name.trim()){setErr("Please enter your name.");return;}onNext(name.trim());}}
          style={{width:"100%",padding:"13px 0",borderRadius:12,border:"none",background:"linear-gradient(135deg,"+t.primary+"cc,"+t.primary+")",color:"#000",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}>
          Continue
        </button>
      </div>
    </div>
  );
}

function StepChoose({form,reviewerName,onNext,onBack}){
  const [selected,setSelected]=useState([]);
  const t=getTheme(form);
  const conn=(form?.connections||[]).find(c=>c.reviewerName.toLowerCase()===reviewerName.toLowerCase());
  const assigned=conn?.revieweeNames||[];
  const toggle=n=>setSelected(p=>p.includes(n)?p.filter(x=>x!==n):[...p,n]);
  if(!assigned.length)return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:400}}>
        <p style={{fontSize:40,margin:"0 0 16px"}}>🔍</p>
        <h2 style={{color:"white",fontSize:20,fontWeight:700,margin:"0 0 8px"}}>No Assignments Found</h2>
        <p style={{color:"#6b7280",fontSize:14,margin:"0 0 24px"}}>Hi <strong style={{color:"white"}}>{reviewerName}</strong>, you have no assigned reviews for this form.</p>
        <button onClick={onBack} style={{padding:"10px 24px",borderRadius:10,border:"1px solid #21262D",background:"transparent",color:"#9ca3af",fontSize:13,cursor:"pointer"}}>Back</button>
      </div>
    </div>
  );
  return(
    <div style={{minHeight:"100vh",padding:"40px 24px"}}>
      <div style={{maxWidth:520,margin:"0 auto"}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:13,marginBottom:24,display:"flex",alignItems:"center",gap:6,padding:0}}>Back</button>
        <h2 style={{color:"white",fontSize:20,fontWeight:700,margin:"0 0 6px",fontFamily:"var(--font-playfair)"}}>Hi {reviewerName.split(" ")[0]} 👋</h2>
        <p style={{color:"#6b7280",fontSize:14,margin:"0 0 20px"}}>Select who to review — <span style={{color:t.primary,fontWeight:600}}>one or multiple</span>.</p>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          {assigned.map(name=>{
            const sel=selected.includes(name);const c=gc(name);
            return(
              <button key={name} onClick={()=>toggle(name)}
                style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:12,border:"2px solid "+(sel?c+"88":"#21262D"),background:sel?c+"12":"#161B22",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                <Av name={name} size={44}/>
                <div style={{flex:1}}>
                  <p style={{color:"white",fontSize:15,fontWeight:600,margin:0}}>{name}</p>
                  <p style={{color:"#6b7280",fontSize:12,margin:"3px 0 0"}}>Tap to {sel?"deselect":"select"}</p>
                </div>
                <div style={{width:24,height:24,borderRadius:"50%",border:"2px solid "+(sel?c:"#374151"),background:sel?c:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {sel&&<Check size={12} color="#000"/>}
                </div>
              </button>
            );
          })}
        </div>
        {selected.length>0&&<div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"12px 16px",marginBottom:14,fontSize:13,color:"#F59E0B"}}>
          Reviewing {selected.length}: {selected.join(", ")}
        </div>}
        <button onClick={()=>selected.length&&onNext(selected)}
          style={{width:"100%",padding:"13px 0",borderRadius:12,border:"none",background:selected.length?"linear-gradient(135deg,"+t.primary+"cc,"+t.primary+")":"#21262D",color:selected.length?"#000":"#4b5563",fontSize:15,fontWeight:700,cursor:selected.length?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          Start Review{selected.length>1?"s":""}
        </button>
      </div>
    </div>
  );
}

function StepForm({form,reviewerName,leaders,onDone}){
  const [idx,setIdx]=useState(0);
  const [vals,setVals]=useState({});
  const [errors,setErrors]=useState({});
  const [loading,setLoading]=useState(false);
  const [progress,setProgress]=useState(0);
  const t=getTheme(form);
  const currentLeader=leaders[idx];
  const rFields=(form.fields||[]).filter(f=>f.type==="rating"&&f.required);
  useEffect(()=>{setVals({});setErrors({});setProgress(0);},[idx]);
  useEffect(()=>{setProgress((rFields.filter(f=>vals[f.id]).length/Math.max(rFields.length,1))*100);},[vals]);
  function change(id,val){setVals(p=>({...p,[id]:val}));setErrors(p=>({...p,[id]:false}));}
  async function submit(){
    const errs={};let hasErr=false;
    (form.fields||[]).forEach(f=>{if(f.required&&!vals[f.id]){errs[f.id]=true;hasErr=true;}});
    if(hasErr){setErrors(errs);return;}
    setLoading(true);
    await new Promise(r=>setTimeout(r,1200));
    setLoading(false);
    if(idx<leaders.length-1)setIdx(i=>i+1);
    else onDone();
  }
  let qi=0;
  return(
    <>
      <ProgressBar progress={progress}/>
      {leaders.length>1&&(
        <div style={{position:"fixed",top:6,left:"50%",transform:"translateX(-50%)",zIndex:60,background:"rgba(13,17,23,0.92)",border:"1px solid #21262D",borderRadius:999,padding:"6px 16px",display:"flex",gap:8,alignItems:"center"}}>
          {leaders.map((l,i)=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,background:i<idx?"#22c55e":i===idx?t.primary:"#21262D",color:i<=idx?"#000":"#6b7280"}}>{i<idx?"v":i+1}</div>
              {i<leaders.length-1&&<div style={{width:14,height:1,background:i<idx?"#22c55e":"#21262D"}}/>}
            </div>
          ))}
          <span style={{fontSize:10,color:"#6b7280",marginLeft:4}}>{idx+1}/{leaders.length}</span>
        </div>
      )}
      <main style={{minHeight:"100vh",padding:"80px 16px 40px",maxWidth:680,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:999,background:t.light,border:"1px solid "+t.border,marginBottom:12}}>
            <Star size={11} color={t.primary}/>
            <span style={{fontSize:10,color:t.primary,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em"}}>{form.badgeLabel||"Review"} · {getMY()}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:8}}>
            <Av name={currentLeader} size={52}/>
            <div style={{textAlign:"left"}}>
              <p style={{color:"#6b7280",fontSize:11,margin:"0 0 3px"}}>Reviewing</p>
              <h2 style={{color:"white",fontSize:22,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>{currentLeader}</h2>
            </div>
          </div>
          <div style={{margin:"12px auto 0",width:40,height:1,background:"linear-gradient(90deg,transparent,"+t.primary+",transparent)"}}/>
        </div>
        <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
          <Av name={reviewerName} size={34}/>
          <div><p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{reviewerName}</p><p style={{color:"#6b7280",fontSize:11,margin:0}}>Reviewer</p></div>
        </div>
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
                <textarea rows={4} maxLength={1000} placeholder="Share your thoughts..." onChange={e=>change(field.id,e.target.value)}
                  style={{width:"100%",background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"10px 12px",color:"white",fontSize:13,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
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
                <input type="text" placeholder="Your answer..." onChange={e=>change(field.id,e.target.value)}
                  style={{width:"100%",background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"10px 12px",color:"white",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            );
            return null;
          })}
        </div>
        <div style={{marginTop:24}}>
          <button onClick={submit} disabled={loading}
            style={{width:"100%",padding:"14px 0",borderRadius:12,border:"none",background:loading?"#374151":"linear-gradient(135deg,"+t.primary+"cc,"+t.primary+")",color:loading?"#9ca3af":"#000",fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading?"Submitting...":idx<leaders.length-1?"Submit & Next":"Submit Review"}
          </button>
          <p style={{textAlign:"center",fontSize:11,color:"#4b5563",marginTop:10}}>Your response is confidential.</p>
        </div>
      </main>
    </>
  );
}

function StepSuccess({reviewerName,leaders,form}){
  const t=getTheme(form);
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:400}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:t.light,border:"2px solid "+t.border,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:36}}>✓</div>
        <h2 style={{color:"white",fontSize:26,fontWeight:700,margin:"0 0 10px",fontFamily:"var(--font-playfair)"}}>All Done!</h2>
        <p style={{color:"#9ca3af",fontSize:14,margin:"0 0 20px",lineHeight:1.6}}>Thank you <strong style={{color:"white"}}>{reviewerName}</strong>. You reviewed <strong style={{color:t.primary}}>{leaders.length}</strong> person{leaders.length>1?"s":""}.</p>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
          {leaders.map(l=><div key={l} style={{display:"flex",alignItems:"center",gap:10,background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"10px 14px"}}>
            <span style={{color:"#22c55e",fontSize:16}}>✓</span><Av name={l} size={28}/><p style={{color:"white",fontSize:13,margin:0}}>{l}</p>
          </div>)}
        </div>
        <p style={{color:"#4b5563",fontSize:12}}>You may close this window.</p>
      </div>
    </div>
  );
}

export default function FormPage(){
  const {formId}=useParams();
  const [form,setForm]=useState(null);
  const [loading,setLoading]=useState(true);
  const [notFound,setNotFound]=useState(false);
  const [step,setStep]=useState("name");
  const [reviewerName,setReviewerName]=useState("");
  const [leaders,setLeaders]=useState([]);

  useEffect(()=>{
    const sf=localStorage.getItem("forms_list");
    if(sf){
      try{
        const forms=JSON.parse(sf);
        const found=forms.find(f=>f.id===formId);
        if(found&&found.active){setForm(found);}
        else{setNotFound(true);}
      }catch{setNotFound(true);}
    }else{setNotFound(true);}
    setLoading(false);
  },[formId]);

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
      {step==="name"&&<StepName form={form} onNext={n=>{setReviewerName(n);setStep("choose");}}/>}
      {step==="choose"&&<StepChoose form={form} reviewerName={reviewerName} onNext={l=>{setLeaders(l);setStep("form");}} onBack={()=>setStep("name")}/>}
      {step==="form"&&<StepForm form={form} reviewerName={reviewerName} leaders={leaders} onDone={()=>setStep("success")}/>}
      {step==="success"&&<StepSuccess reviewerName={reviewerName} leaders={leaders} form={form}/>}
    </div>
  );
}