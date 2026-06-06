"use client";
import { getForms, saveSubmission as sheetSaveSubmission, getSubmissions } from "@/lib/sheets";
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
function Av({name="",size=40}){const color=gc(name);return<div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}
function getMY(){return new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"});}

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
            style={{width:"100%",background:"#0D1117",border:"1px solid "+(err?"rgba(239,68,68,0.6)":t.border),borderRadius:10,padding:"12px 16px",color:"white",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:err?8:16}}
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

function StepReviewList({form,conn,reviewerEmail,onStart,onBack,allSubs=[]}){
  const t=getTheme(form);
  const reviewed=allSubs.filter(s=>s.reviewerEmail?.toLowerCase()===reviewerEmail?.toLowerCase()).map(s=>s.personName);
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
          {allDone?"All reviews completed!":reviewed.length===0?"You have "+conn.revieweeNames.length+" people to review.":"Progress: "+reviewed.length+" of "+conn.revieweeNames.length+" completed."}
        </p>
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
            if(isDone) return(
              <div key={name} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:12,border:"1px solid #22c55e33",background:"rgba(34,197,94,0.05)",textAlign:"left",width:"100%"}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(34,197,94,0.15)",border:"2px solid #22c55e",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Check size={16} color="#22c55e"/>
                </div>
                <Av name={name} size={40}/>
                <div style={{flex:1}}>
                  <p style={{color:"white",fontSize:15,fontWeight:600,margin:0}}>{name}</p>
                  <p style={{color:"#22c55e",fontSize:12,margin:"3px 0 0",fontWeight:600}}>✓ Reviewed</p>
                </div>
                <span style={{fontSize:11,color:"#22c55e",background:"rgba(34,197,94,0.1)",padding:"4px 12px",borderRadius:999,fontWeight:600}}>Done</span>
              </div>
            );
            return(
              <button key={name} onClick={()=>onStart(name)}
                style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:12,border:"1px solid "+(isNext?c+"55":"#21262D"),background:isNext?c+"08":"#161B22",cursor:"pointer",textAlign:"left",width:"100%"}}
                onMouseOver={e=>e.currentTarget.style.borderColor=c+"77"}
                onMouseOut={e=>e.currentTarget.style.borderColor=isNext?c+"55":"#21262D"}>
                <div style={{width:36,height:36,borderRadius:"50%",background:isNext?c+"18":"#21262D",border:"2px solid "+(isNext?c:"#374151"),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:13,fontWeight:700,color:isNext?c:"#6b7280"}}>{i+1}</span>
                </div>
                <Av name={name} size={40}/>
                <div style={{flex:1}}>
                  <p style={{color:"white",fontSize:15,fontWeight:600,margin:0}}>{name}</p>
                  <p style={{color:isNext?c:"#4b5563",fontSize:12,margin:"3px 0 0",fontWeight:isNext?600:400}}>
                    {isNext?"Start →":"Pending"}
                  </p>
                </div>
                <div style={{flexShrink:0}}>
                  {isNext&&<span style={{fontSize:11,color:c,background:c+"18",padding:"4px 12px",borderRadius:999,fontWeight:600}}>Next →</span>}
                  {!isNext&&<span style={{fontSize:11,color:"#4b5563",background:"#21262D",padding:"4px 12px",borderRadius:999}}>Pending</span>}
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
            <button onClick={()=>window.location.href="/forms"}
              style={{display:"inline-flex",alignItems:"center",gap:8,padding:"10px 24px",borderRadius:10,border:"1px solid #21262D",background:"transparent",color:"#9ca3af",fontSize:13,cursor:"pointer"}}>
              ← Back to My Forms
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepForm({form,reviewerEmail,personName,isMulti,onDone,onBack,allSubs=[],onSubsUpdate}){
  const prev=allSubs.find(s=>s.reviewerEmail===reviewerEmail&&s.personName===personName)||null;
  const [vals,setVals]=useState(prev?.values||{});
  const [errors,setErrors]=useState({});
  const [loading,setLoading]=useState(false);
  const [progress,setProgress]=useState(0);
  const t=getTheme(form);
  const rFields=(form.fields||[]).filter(f=>f.type==="rating"&&f.required);

  useEffect(()=>{
    window.history.pushState(null,"",window.location.href);
    const onPop=()=>window.history.pushState(null,"",window.location.href);
    window.addEventListener("popstate",onPop);
    return()=>window.removeEventListener("popstate",onPop);
  },[]);

  useEffect(()=>{
    if(prev?.values&&Object.keys(prev.values).length>0) setVals(prev.values);
  },[prev?.id]);

  useEffect(()=>{
    setProgress((rFields.filter(f=>vals[f.id]).length/Math.max(rFields.length,1))*100);
  },[vals]);

  function change(id,val){setVals(p=>({...p,[id]:val}));setErrors(p=>({...p,[id]:false}));}

  async function submit(){
    const errs={};let hasErr=false;
    (form.fields||[]).forEach(f=>{if(f.required&&!vals[f.id]){errs[f.id]=true;hasErr=true;}});
    if(hasErr){
      setErrors(errs);
      const firstId=Object.keys(errs)[0];
      setTimeout(()=>{
        const el=document.getElementById("q_"+firstId);
        if(el) el.scrollIntoView({behavior:"smooth",block:"center"});
      },100);
      return;
    }
    setLoading(true);
    try{
      await sheetSaveSubmission({formId:form.id,formName:form.name,reviewerEmail,personName,values:vals,comments:vals.comments||"",submittedAt:new Date().toISOString()});
    }catch(err){ console.error("Save error:",err); }
    try{ const freshS=await getSubmissions(form.id); onSubsUpdate&&onSubsUpdate(freshS); }catch(e){}
    setLoading(false);
    onDone();
  }

  let qi=0;
  return(
    <>
      <ProgressBar progress={progress}/>

      <main style={{minHeight:"100vh",padding:"70px 16px 40px",maxWidth:680,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          {/* Back button */}
          <div style={{display:"flex",justifyContent:"flex-start",marginBottom:16}}>
            <button onClick={isMulti?onBack:()=>window.location.href="/forms"}
              style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",cursor:"pointer",color:"#6b7280",fontSize:13,padding:0}}
              onMouseOver={e=>e.currentTarget.style.color="#F59E0B"} onMouseOut={e=>e.currentTarget.style.color="#6b7280"}>
              <ChevronLeft size={15}/> {isMulti?"Back to list":"My Forms"}
            </button>
          </div>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:999,background:t.light,border:"1px solid "+t.border,marginBottom:12}}>
            <Star size={11} color={t.primary}/>
            <span style={{fontSize:10,color:t.primary,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em"}}>{form.badgeLabel||"Review"} · {getMY()}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:8}}>
            <Av name={personName} size={52}/>
            <div style={{textAlign:"left"}}>
              <p style={{color:"#6b7280",fontSize:11,margin:"0 0 3px"}}>Reviewing</p>
              <h2 style={{color:"white",fontSize:22,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>{personName}</h2>
            </div>
          </div>
          <div style={{margin:"12px auto 0",width:40,height:1,background:"linear-gradient(90deg,transparent,"+t.primary+",transparent)"}}/>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8,margin:"16px 0"}}>
          <div style={{flex:1,height:1,background:"#21262D"}}/><span style={{fontSize:10,color:"#4b5563",textTransform:"uppercase",letterSpacing:"0.1em"}}>Questions</span><div style={{flex:1,height:1,background:"#21262D"}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {(form.fields||[]).map(field=>{
            if(field.type==="rating"){qi++;const n=qi;return(
              <div id={"q_"+field.id} key={field.id}>
                <QuestionCard number={n} question={field.label} answered={!!vals[field.id]} error={!!errors[field.id]}>
                  <RatingScale value={vals[field.id]||null} onChange={v=>change(field.id,v)} error={!!errors[field.id]} accentColor={t.primary}/>
                </QuestionCard>
              </div>
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
                    style={{padding:"9px 24px",borderRadius:999,fontSize:13,fontWeight:500,cursor:"pointer",border:"1px solid "+(vals[field.id]===opt?t.primary:"#21262D"),background:vals[field.id]===opt?t.primary:"#0D1117",color:vals[field.id]===opt?"#000":"#9ca3af"}}>{opt}</button>)}
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
            {loading?"Saving...":"Submit Review"}
          </button>
          <p style={{textAlign:"center",fontSize:11,color:"#4b5563",marginTop:10}}>Your response is saved privately.</p>
        </div>
      </main>
    </>
  );
}

function StepSuccess({form,conn,reviewerEmail,allSubs=[]}){
  const [freshSubs,setFreshSubs]=useState(allSubs);
  const [allFormsCompleted,setAllFormsCompleted]=useState(false);
  const t=getTheme(form);

  useEffect(()=>{
    getSubmissions(form.id).then(setFreshSubs).catch(()=>{});
  },[form.id]);

  useEffect(()=>{
    if(!reviewerEmail) return;
    getForms().then(async fl=>{
      const active=fl.filter(f=>f.active);
      const myForms=active.filter(f=>(f.connections||[]).some(c=>c.reviewerEmail&&c.reviewerEmail.toLowerCase()===reviewerEmail.toLowerCase()));
      let allDone=true;
      for(const f of myForms){
        const subs=await getSubmissions(f.id);
        const conn2=(f.connections||[]).find(c=>c.reviewerEmail&&c.reviewerEmail.toLowerCase()===reviewerEmail.toLowerCase());
        if(conn2){
          const reviewed=subs.filter(s=>s.reviewerEmail===reviewerEmail.toLowerCase()).map(s=>s.personName);
          if(reviewed.length<(conn2.revieweeNames||[]).length){allDone=false;break;}
        }
      }
      setAllFormsCompleted(allDone);
    }).catch(()=>{});
  },[reviewerEmail]);

  function goHome(){ window.location.href="/forms"; }
  const reviewed=freshSubs.filter(s=>s.reviewerEmail===reviewerEmail).map(s=>s.personName);

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:420}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:t.light,border:"2px solid "+t.border,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:36}}>✓</div>
        <h2 style={{color:"white",fontSize:26,fontWeight:700,margin:"0 0 10px",fontFamily:"var(--font-playfair)"}}>All Done!</h2>
        <p style={{color:"#9ca3af",fontSize:14,margin:"0 0 20px",lineHeight:1.6}}>
          You have reviewed <strong style={{color:t.primary}}>{reviewed.length}</strong> person{reviewed.length!==1?"s":""}.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
          {conn.revieweeNames.map(name=>(
            <div key={name}
              style={{display:"flex",alignItems:"center",gap:10,background:"#161B22",border:"1px solid #22c55e33",borderRadius:10,padding:"10px 14px",textAlign:"left"}}>
              <span style={{color:"#22c55e",fontSize:16}}>✓</span>
              <Av name={name} size={28}/>
              <p style={{color:"white",fontSize:13,margin:0,flex:1}}>{name}</p>
              <span style={{fontSize:11,color:"#22c55e",background:"rgba(34,197,94,0.1)",padding:"3px 10px",borderRadius:999}}>✓ Done</span>
            </div>
          ))}
        </div>
        {allFormsCompleted?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
            <div style={{background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:14,padding:"20px 24px",textAlign:"center",width:"100%"}}>
              <div style={{fontSize:36,marginBottom:8}}>🎉</div>
              <p style={{color:"#22c55e",fontSize:16,fontWeight:700,margin:"0 0 6px"}}>All Reviews Completed!</p>
              <p style={{color:"#6b7280",fontSize:13,margin:0}}>Great job! All reviews submitted.</p>
            </div>
            <button onClick={()=>window.location.href="/forms"}
              style={{padding:"12px 28px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:14,fontWeight:700,cursor:"pointer"}}>
              Back to My Forms
            </button>
          </div>
        ):(
          <button onClick={()=>window.location.href="/forms"} style={{padding:"13px 32px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#D97706,#F59E0B)",color:"#000",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8,margin:"0 auto"}}>
            ← Back to My Forms
          </button>
        )}
      </div>
    </div>
  );
}

function FormLoadingScreen(){
  const [progress,setProgress]=useState(0);
  const [phase,setPhase]=useState(0);
  const [particles,setParticles]=useState([]);

  const phases=[
    {icon:"🔍",text:"Finding your forms...",color:"#3B82F6"},
    {icon:"👥",text:"Loading people...",color:"#10B981"},
    {icon:"📋",text:"Fetching questions...",color:"#8B5CF6"},
    {icon:"🔗",text:"Building connections...",color:"#F59E0B"},
    {icon:"✨",text:"Almost there!",color:"#F59E0B"},
  ];

  useEffect(()=>{
    // Smooth progress
    const pi=setInterval(()=>{
      setProgress(p=>{
        if(p>=95) return 95;
        const speed=p<50?3:p<80?1.5:0.5;
        return Math.min(p+speed,95);
      });
    },80);
    // Phase changes
    const ph=setInterval(()=>setPhase(p=>(p+1)%phases.length),1200);
    // Spawn particles
    const pa=setInterval(()=>{
      setParticles(prev=>[
        ...prev.slice(-12),
        {id:Date.now(),x:Math.random()*100,y:Math.random()*100,size:4+Math.random()*8,color:["#F59E0B","#3B82F6","#10B981","#8B5CF6","#F43F5E"][Math.floor(Math.random()*5)],speed:3+Math.random()*4}
      ]);
    },300);
    return()=>{clearInterval(pi);clearInterval(ph);clearInterval(pa);};
  },[]);

  const cur=phases[phase];

  return(
    <div style={{minHeight:"100vh",background:"#0D1117",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,overflow:"hidden",position:"relative"}}>
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes spinR{from{transform:rotate(360deg)}to{transform:rotate(0deg)}}
        @keyframes fadeUp{0%{opacity:0;transform:translateY(16px) scale(0.9)}100%{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes fadeOut{0%{opacity:1}100%{opacity:0;transform:translateY(-16px) scale(0.9)}}
        @keyframes float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(180deg)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(245,158,11,0.3)}50%{box-shadow:0 0 40px rgba(245,158,11,0.6)}}
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes particleFall{0%{opacity:1;transform:translateY(0) rotate(0deg)}100%{opacity:0;transform:translateY(60px) rotate(360deg)}}
        @keyframes ringPulse{0%{transform:scale(0.8);opacity:0.8}100%{transform:scale(1.4);opacity:0}}
      `}</style>

      {/* Scanline effect */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
        <div style={{position:"absolute",width:"100%",height:2,background:"linear-gradient(90deg,transparent,rgba(245,158,11,0.1),transparent)",animation:"scanline 4s linear infinite"}}/>
      </div>

      {/* Floating particles */}
      {particles.map(p=>(
        <div key={p.id} style={{position:"fixed",left:p.x+"%",top:p.y+"%",width:p.size,height:p.size,borderRadius:"50%",background:p.color,opacity:0.6,pointerEvents:"none",animation:`particleFall ${p.speed}s ease-out forwards`,boxShadow:`0 0 6px ${p.color}`}}/>
      ))}

      {/* Grid background */}
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(245,158,11,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}}/>

      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:28,maxWidth:380,width:"100%"}}>

        {/* Main icon display */}
        <div style={{position:"relative",width:140,height:140,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {/* Pulsing rings */}
          {[0,1,2].map(i=>(
            <div key={i} style={{position:"absolute",width:80+i*24,height:80+i*24,borderRadius:"50%",border:`1px solid ${cur.color}`,opacity:0.2-i*0.05,animation:`ringPulse ${1.5+i*0.5}s ease-out infinite`,animationDelay:`${i*0.3}s`}}/>
          ))}
          {/* Spinning rings */}
          <div style={{position:"absolute",width:110,height:110,borderRadius:"50%",border:"2px solid transparent",borderTopColor:cur.color,borderRightColor:cur.color+"44",animation:"spin 1.5s linear infinite"}}/>
          <div style={{position:"absolute",width:90,height:90,borderRadius:"50%",border:"2px solid transparent",borderBottomColor:cur.color,borderLeftColor:cur.color+"44",animation:"spinR 1s linear infinite"}}/>
          {/* Center icon */}
          <div style={{width:64,height:64,borderRadius:"50%",background:`radial-gradient(circle,${cur.color}22,${cur.color}08)`,border:`2px solid ${cur.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,animation:"glow 2s ease-in-out infinite",transition:"all 0.4s"}}>
            {cur.icon}
          </div>
        </div>

        {/* Title */}
        <div style={{textAlign:"center"}}>
          <h2 style={{color:"white",fontSize:20,fontWeight:800,margin:"0 0 6px",fontFamily:"var(--font-playfair)",letterSpacing:"-0.02em"}}>
            Performance Review
          </h2>
          {/* Animated phase text */}
          <div style={{height:22,overflow:"hidden",position:"relative"}}>
            <p key={phase} style={{color:cur.color,fontSize:13,margin:0,fontWeight:500,animation:"fadeUp 0.4s ease"}}>
              {cur.text}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div style={{width:"100%",display:"flex",flexDirection:"column",gap:6}}>
          {/* Main bar */}
          <div style={{position:"relative",height:8,background:"#161B22",borderRadius:999,overflow:"hidden",border:"1px solid #21262D"}}>
            <div style={{height:"100%",background:`linear-gradient(90deg,${cur.color}88,${cur.color},#fff8)`,borderRadius:999,width:progress+"%",transition:"width 0.1s ease",position:"relative"}}>
              {/* Shimmer on bar */}
              <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.3) 50%,transparent 100%)",backgroundSize:"200% 100%",animation:"scanline 1s linear infinite"}}/>
            </div>
          </div>
          {/* Step dots */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:4}}>
            {phases.map((ph,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{width:i<=phase?8:6,height:i<=phase?8:6,borderRadius:"50%",background:i<phase?"#22c55e":i===phase?cur.color:"#21262D",transition:"all 0.3s",boxShadow:i===phase?`0 0 8px ${cur.color}`:"none"}}/>
                <span style={{fontSize:8,color:i<=phase?"#6b7280":"#374151"}}>{ph.icon}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{color:"#374151",fontSize:10}}>Loading assets</span>
            <span style={{color:cur.color,fontSize:10,fontWeight:700,fontFamily:"monospace"}}>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Mini game */}
        <MiniGame/>

        {/* Fun footer */}
        <p style={{color:"#21262D",fontSize:10,textAlign:"center",margin:0,fontFamily:"monospace"}}>
          FormStudio v2 · <span style={{animation:"blink 1s infinite",display:"inline-block"}}>▮</span>
        </p>
      </div>
    </div>
  );
}

function MiniGame(){
  const [score,setScore]=useState(0);
  const [targets,setTargets]=useState([{id:1,x:30,y:50,type:0},{id:2,x:70,y:50,type:1}]);
  const [pops,setPops]=useState([]);
  const types=["⭐","💫","✨","🎯","🏆"];
  const colors=["#F59E0B","#8B5CF6","#10B981","#3B82F6","#F43F5E"];

  function spawnTarget(){
    return{id:Date.now()+Math.random(),x:8+Math.random()*84,y:10+Math.random()*80,type:Math.floor(Math.random()*types.length)};
  }

  function handleHit(id,e){
    e.stopPropagation();
    const rect=e.currentTarget.getBoundingClientRect();
    setPops(prev=>[...prev,{id:Date.now(),x:rect.left,y:rect.top}]);
    setTimeout(()=>setPops(prev=>prev.filter(p=>p.id!==Date.now())),500);
    setScore(s=>s+1);
    setTargets(prev=>[...prev.filter(t=>t.id!==id),spawnTarget()]);
  }

  return(
    <div style={{width:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <p style={{color:"#4b5563",fontSize:11,margin:0}}>🎮 Tap to catch while loading</p>
        <span style={{fontSize:11,color:"#F59E0B",fontWeight:700,fontFamily:"monospace"}}>{score} pts</span>
      </div>
      <div style={{width:"100%",height:90,background:"#0D1117",borderRadius:12,border:"1px solid #161B22",position:"relative",overflow:"hidden",cursor:"crosshair"}}
        style={{width:"100%",height:90,background:"linear-gradient(135deg,#0D1117,#0a0f16)",borderRadius:12,border:"1px solid #161B22",position:"relative",overflow:"hidden",cursor:"crosshair"}}>
        {/* Stars bg */}
        {[...Array(8)].map((_,i)=>(
          <div key={i} style={{position:"absolute",width:1,height:1,background:"white",opacity:0.2,left:`${10+i*12}%`,top:`${20+i*8}%`,borderRadius:"50%"}}/>
        ))}
        {targets.map(t=>(
          <button key={t.id} onClick={(e)=>handleHit(t.id,e)}
            style={{position:"absolute",left:t.x+"%",top:t.y+"%",transform:"translate(-50%,-50%)",background:"none",border:"none",cursor:"pointer",fontSize:18,padding:4,lineHeight:1,filter:`drop-shadow(0 0 4px ${colors[t.type]})`,transition:"left 0.2s,top 0.2s"}}>
            {types[t.type]}
          </button>
        ))}
        {score>0&&<div style={{position:"absolute",bottom:4,right:8,fontSize:9,color:"#F59E0B",fontFamily:"monospace"}}>SCORE: {score}</div>}
      </div>
    </div>
  );
}

export default function FormPage(){
  const {formId}=useParams();
  const searchParams=useSearchParams();
  const [form,setForm]=useState(null);
  const [loading,setLoading]=useState(true);
  const [allSubs,setAllSubs]=useState([]);
  const [subsLoaded,setSubsLoaded]=useState(false);
  const [notFound,setNotFound]=useState(false);
  const [step,setStep]=useState("email");
  const [reviewerEmail,setReviewerEmail]=useState("");
  const [conn,setConn]=useState(null);
  const [currentPerson,setCurrentPerson]=useState(null);

  useEffect(()=>{
    getForms().then(fl=>{
      const f=fl.find(f=>f.id===formId);
      if(!f){ setNotFound(true); setLoading(false); setSubsLoaded(true); return; }
      setForm(f);
      const urlEmail=searchParams.get("email");
      if(urlEmail&&f.active){
        const connection=(f.connections||[]).find(c=>c.reviewerEmail&&c.reviewerEmail.toLowerCase()===urlEmail.toLowerCase());
        if(connection){
          setReviewerEmail(urlEmail);
          setConn(connection);
          if(connection.type==="single"){setCurrentPerson(connection.revieweeNames[0]);setStep("form");}
          else setStep("list");
        }
      }
      getSubmissions(f.id).then(s=>{setAllSubs(s);setSubsLoaded(true);setLoading(false);}).catch(()=>{setSubsLoaded(true);setLoading(false);});
    }).catch(()=>{ setNotFound(true); setLoading(false); setSubsLoaded(true); });
  },[formId]);

  function handleEmailNext(email,connection){
    setReviewerEmail(email);
    setConn(connection);
    if(connection.type==="single"){ setCurrentPerson(connection.revieweeNames[0]); setStep("form"); }
    else setStep("list");
  }

  function handleStartPerson(name){ setCurrentPerson(name); setStep("form"); }

  function handleFormDone(){
    if(conn.type==="single"){ setStep("success"); return; }
    const reviewed=allSubs.filter(s=>s.reviewerEmail===reviewerEmail).map(s=>s.personName);
    const allDone=conn.revieweeNames.every(n=>reviewed.includes(n));
    if(allDone) setStep("success");
    else setStep("list");
  }

  const Spinner=()=>(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0D1117"}}>
      <svg style={{width:32,height:32,animation:"spin 1s linear infinite"}} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#21262D" strokeWidth="3"/>
        <path d="M4 12a8 8 0 018-8" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    </div>
  );

  if(loading)return <FormLoadingScreen/>;

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
    <div style={{background:"#0D1117",minHeight:"100vh",position:"relative",overflow:"hidden"}}>
      <style>{"@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes twinkle{0%,100%{opacity:0.1}50%{opacity:0.5}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}"}</style>
      {/* Subtle grid */}
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.01) 1px,transparent 1px)",backgroundSize:"50px 50px",pointerEvents:"none",zIndex:0}}/>
      {/* Static stars */}
      {[...Array(12)].map((_,i)=>(
        <div key={i} style={{position:"fixed",left:(8+i*8)+"%",top:(5+i*7)%90+"%",width:i%3===0?2:1,height:i%3===0?2:1,borderRadius:"50%",background:"white",opacity:0.15,pointerEvents:"none",animation:`twinkle ${2+i*0.4}s ease-in-out ${i*0.3}s infinite`,zIndex:0}}/>
      ))}
      <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:600,height:280,background:"radial-gradient(ellipse,"+t.glow+" 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"relative",zIndex:1}}>
        {step==="email"&&<StepEmail form={form} onNext={handleEmailNext}/>}
        {step==="list"&&<StepReviewList form={form} conn={conn} reviewerEmail={reviewerEmail} allSubs={allSubs} onStart={handleStartPerson} onBack={()=>{ window.location.href="/forms"; }}/>}
        {step==="form"&&<StepForm form={form} reviewerEmail={reviewerEmail} personName={currentPerson} isMulti={conn?.type==="multi"} onDone={handleFormDone} onBack={()=>setStep("list")} allSubs={allSubs} onSubsUpdate={s=>setAllSubs(s)}/>}
        {step==="success"&&<StepSuccess form={form} conn={conn} reviewerEmail={reviewerEmail} allSubs={allSubs}/>}
      </div>
    </div>
  );
}
