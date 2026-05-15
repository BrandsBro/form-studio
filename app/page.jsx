"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, Star, ChevronRight, ChevronLeft } from "lucide-react";
import ProgressBar from "@/components/form/ProgressBar";
import QuestionCard from "@/components/form/QuestionCard";
import RatingScale from "@/components/form/RatingScale";
import SubmitButton from "@/components/form/SubmitButton";

const THEMES = {
  amber:  { primary:"#F59E0B", light:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.2)"  },
  blue:   { primary:"#3B82F6", light:"rgba(59,130,246,0.1)",  border:"rgba(59,130,246,0.2)"  },
  green:  { primary:"#10B981", light:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.2)"  },
  rose:   { primary:"#F43F5E", light:"rgba(244,63,94,0.1)",   border:"rgba(244,63,94,0.2)"   },
  violet: { primary:"#8B5CF6", light:"rgba(139,92,246,0.1)",  border:"rgba(139,92,246,0.2)"  },
};

const DEFAULT_CONFIG = {
  title:"Leadership Performance Review",
  description:"Monthly team performance review",
  quote:"As a team you have the right to measure your team leader wisely.",
  badgeLabel:"Monthly Performance Review",
  theme:"amber",
  customColor:"",
  fields:[
    { id:"f1",  type:"rating",   label:"The manager communicates clearly and effectively, ensuring expectations and goals are well understood.", required:true },
    { id:"f2",  type:"rating",   label:"The manager provides the necessary support and guidance, helping team members succeed in their roles.", required:true },
    { id:"f3",  type:"rating",   label:"The manager provides regular, constructive feedback that helps with professional development.", required:true },
    { id:"f4",  type:"rating",   label:"The manager is approachable, open to listening, and receptive to concerns or new ideas.", required:true },
    { id:"f5",  type:"rating",   label:"The manager motivates the team, keeping them engaged and fostering a positive work environment.", required:true },
    { id:"f6",  type:"rating",   label:"The manager handles challenges effectively, providing practical solutions and taking action when needed.", required:true },
    { id:"f7",  type:"rating",   label:"The manager treats all team members fairly, respecting diverse opinions and perspectives.", required:true },
    { id:"f8",  type:"rating",   label:"The manager recognizes and appreciates individual contributions, acknowledging efforts and achievements.", required:true },
    { id:"f9",  type:"rating",   label:"The manager empowers team members to take ownership of their tasks and make decisions within their roles.", required:true },
    { id:"f10", type:"rating",   label:"The manager supports professional growth, providing opportunities for learning and career advancement.", required:true },
    { id:"f11", type:"textarea", label:"Any comments or suggestions to improve?", required:false },
  ],
};

function getInitials(name="") { return name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2)||"?"; }
function getAvatarColor(name="") {
  const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];
  return c[(name.charCodeAt(0)||0)%c.length];
}
function Avatar({ name="", size=48 }) {
  const color = getAvatarColor(name);
  return (
    <div style={{ width:size,height:size,borderRadius:"50%",background:`${color}18`,border:`2px solid ${color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0 }}>
      {getInitials(name)}
    </div>
  );
}

function getCurrentMonthYear() {
  return new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"});
}

// ── STEP 1: Enter Name ───────────────────────────────────────────────────────

function StepSelectForm({ forms, onSelect }) {
  const active = forms.filter(f => f.active);
  const getTheme = form => {
    const THEMES = { amber:"#F59E0B", blue:"#3B82F6", green:"#10B981", rose:"#F43F5E", violet:"#8B5CF6", cyan:"#06B6D4" };
    return form?.customColor || THEMES[form?.theme] || "#F59E0B";
  };
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:560 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
          <h2 style={{ color:"white", fontSize:22, fontWeight:700, margin:"0 0 8px", fontFamily:"var(--font-playfair)" }}>Select a Form</h2>
          <p style={{ color:"#6b7280", fontSize:14, margin:0 }}>Choose the review form you want to fill out</p>
        </div>
        {active.length === 0 ? (
          <div style={{ textAlign:"center", padding:40, background:"#161B22", border:"1px solid #21262D", borderRadius:14, color:"#4b5563" }}>
            <p style={{ margin:0 }}>No active forms available. Please contact your admin.</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {active.map(form => {
              const color = getTheme(form);
              return (
                <button key={form.id} onClick={() => onSelect(form)}
                  style={{ background:"#161B22", border:"1px solid #21262D", borderRadius:14, padding:20, cursor:"pointer", textAlign:"left", transition:"all 0.2s", position:"relative", overflow:"hidden" }}
                  onMouseOver={e => { e.currentTarget.style.borderColor=color+"55"; e.currentTarget.style.transform="translateY(-1px)"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor="#21262D"; e.currentTarget.style.transform="none"; }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,"+color+","+color+"33)" }}/>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                    <div>
                      <p style={{ color:"white", fontSize:15, fontWeight:700, margin:0 }}>{form.name}</p>
                      {form.description && <p style={{ color:"#6b7280", fontSize:13, margin:"4px 0 0" }}>{form.description}</p>}
                      <div style={{ display:"flex", gap:12, marginTop:8 }}>
                        <span style={{ fontSize:11, color:"#6b7280" }}>{form.fields?.length||0} questions</span>
                        <span style={{ fontSize:11, color:"#6b7280" }}>{form.connections?.length||0} connections</span>
                      </div>
                    </div>
                    <div style={{ color:color, fontSize:20, flexShrink:0 }}>→</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StepName({ onNext, form }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const theme = form
    ? { primary: form.customColor || THEMES[form.theme]?.primary || "#F59E0B", border: form.customColor ? "rgba(255,255,255,0.12)" : THEMES[form.theme]?.border || "rgba(245,158,11,0.2)" }
    : THEMES.amber;

  function handleNext() {
    if(!name.trim()) { setError("Please enter your name."); return; }
    onNext(name.trim());
  }

  return (
    <div className="max-w-md mx-auto text-center" style={{ paddingTop:40 }}>
      <div style={{ fontSize:48,marginBottom:16 }}>👋</div>
      <h2 style={{ color:"white",fontSize:22,fontWeight:700,margin:"0 0 8px",fontFamily:"var(--font-playfair)" }}>Welcome</h2>
      <p style={{ color:"#6b7280",fontSize:14,margin:"0 0 32px" }}>Enter your name to begin the review</p>
      <input
        value={name}
        onChange={e=>{ setName(e.target.value); setError(""); }}
        onKeyDown={e=>e.key==="Enter"&&handleNext()}
        placeholder="Your full name"
        autoFocus
        style={{ width:"100%",background:"#161B22",border:`1px solid ${error?"rgba(239,68,68,0.6)":theme.border}`,borderRadius:12,padding:"14px 16px",color:"white",fontSize:16,outline:"none",boxSizing:"border-box",textAlign:"center",marginBottom:8 }}
      />
      {error && <p style={{ color:"#ef4444",fontSize:12,margin:"0 0 12px" }}>{error}</p>}
      <button onClick={handleNext}
        style={{ width:"100%",padding:"13px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${theme.primary}cc,${theme.primary})`,color:"#000",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:8 }}>
        Continue <ChevronRight size={18}/>
      </button>
    </div>
  );
}

// ── STEP 2: Choose who to review ─────────────────────────────────────────────
function StepChoose({ form, reviewerName, onNext, onBack, theme }) {
  const [selected, setSelected] = useState([]);
  const resolvedTheme = theme || (form ? {
    primary: form.customColor || THEMES[form.theme]?.primary || "#F59E0B",
    light: form.customColor ? "rgba(255,255,255,0.08)" : THEMES[form.theme]?.light || "rgba(245,158,11,0.1)",
    border: form.customColor ? "rgba(255,255,255,0.12)" : THEMES[form.theme]?.border || "rgba(245,158,11,0.2)",
  } : THEMES.amber);

  const conn = (form?.connections||[]).find(c=>c.reviewerName.toLowerCase()===reviewerName.toLowerCase());
  const assignedNames = conn ? conn.revieweeNames : [];

  function toggle(name) {
    setSelected(prev=>prev.includes(name)?prev.filter(n=>n!==name):[...prev,name]);
  }

  function handleNext() {
    if(!selected.length) return alert("Please select at least one person to review.");
    onNext(selected);
  }

  if(!assignedNames.length) {
    return (
      <div className="max-w-md mx-auto text-center" style={{ paddingTop:40 }}>
        <div style={{ fontSize:48,marginBottom:16 }}>🔍</div>
        <h2 style={{ color:"white",fontSize:20,fontWeight:700,margin:"0 0 8px",fontFamily:"var(--font-playfair)" }}>No Assignments Found</h2>
        <p style={{ color:"#6b7280",fontSize:14,margin:"0 0 8px" }}>Hi <strong style={{ color:"white" }}>{reviewerName}</strong>, you have no assigned leaders to review yet.</p>
        <p style={{ color:"#4b5563",fontSize:13,margin:"0 0 32px" }}>Please contact your admin to set up your review connections.</p>
        <button onClick={onBack} style={{ padding:"10px 24px",borderRadius:10,border:"1px solid #21262D",background:"transparent",color:"#9ca3af",fontSize:13,cursor:"pointer" }}>← Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto" style={{ paddingTop:20 }}>
      <button onClick={onBack} style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:13,marginBottom:24,display:"flex",alignItems:"center",gap:6,padding:0 }}>
        <ChevronLeft size={16}/> Back
      </button>
      <h2 style={{ color:"white",fontSize:20,fontWeight:700,margin:"0 0 6px",fontFamily:"var(--font-playfair)" }}>
        Hi {reviewerName.split(" ")[0]} 👋
      </h2>
      <p style={{ color:"#6b7280",fontSize:14,margin:"0 0 24px" }}>
        Select who you want to review. You can select <span style={{ color:resolvedTheme.primary,fontWeight:600 }}>one or multiple</span>.
      </p>

      <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:24 }}>
        {assignedNames.map(name=>{
          const isSelected = selected.includes(name);
          const color = getAvatarColor(name);
          return (
            <button key={name} onClick={()=>toggle(name)}
              style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:12,border:`2px solid ${isSelected?color+"88":"#21262D"}`,background:isSelected?color+"12":"#161B22",cursor:"pointer",textAlign:"left",transition:"all 0.2s",position:"relative" }}>
              <Avatar name={name} size={44}/>
              <div style={{ flex:1 }}>
                <p style={{ color:"white",fontSize:15,fontWeight:600,margin:0 }}>{name}</p>
                <p style={{ color:"#6b7280",fontSize:12,margin:"3px 0 0" }}>Click to {isSelected?"deselect":"select"}</p>
              </div>
              <div style={{ width:24,height:24,borderRadius:"50%",border:`2px solid ${isSelected?color:"#374151"}`,background:isSelected?color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",flexShrink:0 }}>
                {isSelected && <span style={{ color:"#000",fontSize:14,fontWeight:900 }}>✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      {selected.length>0 && (
        <div style={{ background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#F59E0B" }}>
          ✓ You will review <strong>{selected.length}</strong> person{selected.length>1?"s":""}: {selected.join(", ")}
        </div>
      )}

      <button onClick={handleNext}
        style={{ width:"100%",padding:"13px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${resolvedTheme.primary}cc,${resolvedTheme.primary})`,color:"#000",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
        Start Review{selected.length>1?"s":""} <ChevronRight size={18}/>
      </button>
    </div>
  );
}

// ── STEP 3: Fill form for each selected leader ───────────────────────────────
function StepForm({ reviewerName, leaders, form, theme, onDone }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentLeader = leaders[currentIndex];
  const ratingFields = form.fields.filter(f=>f.type==="rating"&&f.required);
  const totalFields = ratingFields.length + 1;

  useEffect(()=>{
    setFieldValues({});
    setErrors({});
    setProgress(0);
  },[currentIndex]);

  useEffect(()=>{
    const answered = ratingFields.filter(f=>fieldValues[f.id]).length;
    setProgress((answered/totalFields)*100);
  },[fieldValues]);

  function handleFieldChange(id, value) {
    setFieldValues(prev=>({...prev,[id]:value}));
    setErrors(prev=>({...prev,[id]:false}));
  }

  async function handleSubmitCurrent() {
    const newErrors = {};
    let hasError = false;
    form.fields.forEach(f=>{ if(f.required&&!fieldValues[f.id]){ newErrors[f.id]=true; hasError=true; } });
    if(hasError){ setErrors(newErrors); return; }
    setLoading(true);
    await new Promise(r=>setTimeout(r,1200));
    const submission = { reviewerName, leaderName:currentLeader, ...fieldValues, submittedAt:new Date().toISOString() };
    const updated = [...allSubmissions, submission];
    setAllSubmissions(updated);
    console.log("Submitted:", submission);
    setLoading(false);
    if(currentIndex < leaders.length-1) setCurrentIndex(i=>i+1);
    else onDone(updated);
  }

  let questionIndex = 0;

  return (
    <>
      <ProgressBar progress={progress}/>

      {/* Progress indicator for multiple reviews */}
      {leaders.length>1 && (
        <div style={{ position:"fixed",top:4,left:"50%",transform:"translateX(-50%)",zIndex:60,background:"rgba(13,17,23,0.9)",border:"1px solid #21262D",borderRadius:999,padding:"6px 16px",display:"flex",gap:8,alignItems:"center" }}>
          {leaders.map((l,i)=>(
            <div key={l} style={{ display:"flex",alignItems:"center",gap:6 }}>
              <div style={{ width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,background:i<currentIndex?"#22c55e":i===currentIndex?theme.primary:"#21262D",color:i<=currentIndex?"#000":"#6b7280",transition:"all 0.3s" }}>
                {i<currentIndex?"✓":i+1}
              </div>
              {i<leaders.length-1 && <div style={{ width:16,height:1,background:i<currentIndex?"#22c55e":"#21262D" }}/>}
            </div>
          ))}
          <span style={{ fontSize:11,color:"#6b7280",marginLeft:4 }}>
            Reviewing {currentIndex+1}/{leaders.length}
          </span>
        </div>
      )}

      <main style={{ minHeight:"100vh",padding:"80px 16px 40px",maxWidth:680,margin:"0 auto" }}>

        {/* Header */}
        <div style={{ textAlign:"center",marginBottom:32 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:999,background:theme.light,border:`1px solid ${theme.border}`,marginBottom:12 }}>
            <Star size={11} color={theme.primary}/>
            <span style={{ fontSize:10,color:theme.primary,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase" }}>
              {form.badgeLabel||"Monthly Performance Review"} · {getCurrentMonthYear()}
            </span>
          </div>

          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:8 }}>
            <Avatar name={currentLeader} size={52}/>
            <div style={{ textAlign:"left" }}>
              <p style={{ color:"#6b7280",fontSize:12,margin:"0 0 4px" }}>Reviewing</p>
              <h2 style={{ color:"white",fontSize:22,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)" }}>{currentLeader}</h2>
            </div>
          </div>

          {form.quote && (
            <p style={{ color:"#6b7280",fontSize:13,fontStyle:"italic",margin:"12px auto 0",maxWidth:400 }}>
              "{form.quote}"
            </p>
          )}
          <div style={{ margin:"14px auto 0",width:48,height:1,background:`linear-gradient(90deg,transparent,${theme.primary},transparent)` }}/>
        </div>

        {/* Reviewer info (read-only) */}
        <div style={{ background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10 }}>
          <Avatar name={reviewerName} size={36}/>
          <div>
            <p style={{ color:"white",fontSize:13,fontWeight:600,margin:0 }}>{reviewerName}</p>
            <p style={{ color:"#6b7280",fontSize:11,margin:0 }}>Reviewer</p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display:"flex",alignItems:"center",gap:8,margin:"16px 0" }}>
          <div style={{ flex:1,height:1,background:"#21262D" }}/>
          <span style={{ fontSize:10,color:"#4b5563",textTransform:"uppercase",letterSpacing:"0.1em" }}>Performance Ratings</span>
          <div style={{ flex:1,height:1,background:"#21262D" }}/>
        </div>

        {/* Dynamic Fields */}
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {form.fields.map(field=>{
            if(field.type==="rating") {
              questionIndex++;
              const idx=questionIndex;
              return (
                <QuestionCard key={field.id} number={idx} question={field.label} answered={!!fieldValues[field.id]}>
                  <RatingScale value={fieldValues[field.id]||null} onChange={val=>handleFieldChange(field.id,val)} error={!!errors[field.id]} accentColor={theme.primary}/>
                </QuestionCard>
              );
            }
            if(field.type==="textarea") return (
              <div key={field.id} style={{ borderRadius:12,padding:20,background:"#161B22",border:"1px solid #21262D" }}>
                <label style={{ display:"block",fontSize:14,color:"#d1d5db",marginBottom:10 }}>
                  {field.label}
                  {!field.required&&<span style={{ color:"#4b5563",marginLeft:8,fontSize:12 }}>(Optional)</span>}
                </label>
                <textarea rows={4} maxLength={1000} placeholder="Share your thoughts..."
                  onChange={e=>handleFieldChange(field.id,e.target.value)}
                  style={{ width:"100%",background:"#0D1117",border:"1px solid #21262D",borderRadius:8,padding:"10px 12px",color:"white",fontSize:13,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit" }}/>
                <div style={{ textAlign:"right",fontSize:11,color:"#4b5563",marginTop:4 }}>
                  {(fieldValues[field.id]||"").length}/1000
                </div>
              </div>
            );
            if(field.type==="yesno") return (
              <div key={field.id} style={{ borderRadius:12,padding:20,background:"#161B22",border:`1px solid ${errors[field.id]?"rgba(239,68,68,0.4)":"#21262D"}` }}>
                <label style={{ display:"block",fontSize:14,color:"#d1d5db",marginBottom:12 }}>
                  {field.label}{field.required&&<span style={{ color:theme.primary,marginLeft:4 }}>*</span>}
                </label>
                <div style={{ display:"flex",gap:10 }}>
                  {["Yes","No"].map(opt=>(
                    <button key={opt} type="button" onClick={()=>handleFieldChange(field.id,opt)}
                      style={{ padding:"9px 24px",borderRadius:999,fontSize:13,fontWeight:500,cursor:"pointer",border:`1px solid ${fieldValues[field.id]===opt?theme.primary:"#21262D"}`,background:fieldValues[field.id]===opt?theme.primary:"#0D1117",color:fieldValues[field.id]===opt?"#000":"#9ca3af",transition:"all 0.2s" }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            );
            return null;
          })}
        </div>

        {/* Submit */}
        <div style={{ marginTop:24 }}>
          <button onClick={handleSubmitCurrent} disabled={loading}
            style={{ width:"100%",padding:"14px 0",borderRadius:12,border:"none",background:loading?"#374151":`linear-gradient(135deg,${theme.primary}cc,${theme.primary})`,color:loading?"#9ca3af":"#000",fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            {loading ? (
              <>
                <svg style={{ animation:"spin 1s linear infinite",width:20,height:20 }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" opacity="0.75"/>
                </svg>
                Submitting...
              </>
            ) : currentIndex < leaders.length-1 ? (
              <>Submit & Review Next <ChevronRight size={18}/></>
            ) : "Submit Review"}
          </button>
          <p style={{ textAlign:"center",fontSize:11,color:"#4b5563",marginTop:12 }}>
            Your response is confidential and used only for team improvement.
          </p>
        </div>
      </main>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

// ── SUCCESS ──────────────────────────────────────────────────────────────────
function StepSuccess({ reviewerName, leaders, form }) {
  const theme = form
    ? {
        primary: form.customColor || THEMES[form.theme]?.primary || "#F59E0B",
        light: form.customColor ? "rgba(255,255,255,0.08)" : THEMES[form.theme]?.light || "rgba(245,158,11,0.1)",
        border: form.customColor ? "rgba(255,255,255,0.12)" : THEMES[form.theme]?.border || "rgba(245,158,11,0.2)",
      }
    : THEMES.amber;
  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
      <div style={{ textAlign:"center",maxWidth:400 }}>
        <div style={{ width:80,height:80,borderRadius:"50%",background:theme.light,border:`2px solid ${theme.border}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:36 }}>
          ✓
        </div>
        <h2 style={{ color:"white",fontSize:26,fontWeight:700,margin:"0 0 10px",fontFamily:"var(--font-playfair)" }}>All Done!</h2>
        <p style={{ color:"#9ca3af",fontSize:14,margin:"0 0 20px",lineHeight:1.6 }}>
          Thank you <strong style={{ color:"white" }}>{reviewerName}</strong>. You successfully reviewed{" "}
          <strong style={{ color:theme.primary }}>{leaders.length}</strong> person{leaders.length>1?"s":""}.
        </p>
        <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:24 }}>
          {leaders.map(l=>(
            <div key={l} style={{ display:"flex",alignItems:"center",gap:10,background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"10px 14px" }}>
              <span style={{ color:"#22c55e",fontSize:16 }}>✓</span>
              <Avatar name={l} size={28}/>
              <p style={{ color:"white",fontSize:13,margin:0 }}>{l}</p>
            </div>
          ))}
        </div>
        <p style={{ color:"#4b5563",fontSize:12 }}>Your insights help us build a stronger team. You may close this window.</p>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function ReviewForm(){
  const [step,setStep]=useState("selectForm");
  const [forms,setForms]=useState([]);
  const [selectedForm,setSelectedForm]=useState(null);
  const [reviewerName,setReviewerName]=useState("");
  const [leaders,setLeaders]=useState([]);

  useEffect(()=>{
    const sf=localStorage.getItem("forms_list");
    if(sf){try{setForms(JSON.parse(sf));}catch{}}
  },[]);

  const selectedFormTheme = selectedForm ? {
    primary: selectedForm.customColor || THEMES[selectedForm.theme]?.primary || "#F59E0B",
    light: selectedForm.customColor ? "rgba(255,255,255,0.08)" : THEMES[selectedForm.theme]?.light || "rgba(245,158,11,0.1)",
    border: selectedForm.customColor ? "rgba(255,255,255,0.12)" : THEMES[selectedForm.theme]?.border || "rgba(245,158,11,0.2)",
  } : THEMES.amber;

  return(
    <div style={{background:"#0D1117",minHeight:"100vh"}}>
      {step==="selectForm"&&<StepSelectForm forms={forms} onSelect={f=>{setSelectedForm(f);setStep("name");}}/>}
      {step==="name"&&<StepName form={selectedForm} onNext={n=>{setReviewerName(n);setStep("choose");}} onBack={()=>setStep("selectForm")}/>}
      {step==="choose"&&<StepChoose form={selectedForm} reviewerName={reviewerName} onNext={l=>{setLeaders(l);setStep("form");}} onBack={()=>setStep("name")} theme={selectedFormTheme}/>}
      {step==="form"&&<StepForm form={selectedForm} reviewerName={reviewerName} leaders={leaders} theme={selectedFormTheme} onDone={()=>setStep("success")}/>}

      {step==="success"&&<StepSuccess reviewerName={reviewerName} leaders={leaders} form={selectedForm}/>}
    </div>
  );
}