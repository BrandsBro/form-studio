"use client";
import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

function gi(n=""){return n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"?";}
function gc(n=""){const c=["#F59E0B","#3B82F6","#10B981","#F43F5E","#8B5CF6","#06B6D4","#F97316"];return c[(n.charCodeAt(0)||0)%c.length];}
function Av({name="",size=36}){const color=gc(name);return<div style={{width:size,height:size,borderRadius:"50%",background:color+"18",border:"2px solid "+color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color,flexShrink:0}}>{gi(name)}</div>;}

function getSubmissions(formId){
  try{return JSON.parse(localStorage.getItem("submissions_"+formId)||"[]");}catch{return[];}
}

function ScoreBar({value,max=5}){
  const pct=(value/max)*100;
  const color=value>=4?"#22c55e":value>=3?"#F59E0B":value>=2?"#f97316":"#ef4444";
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
      <div style={{flex:1,height:5,background:"#21262D",borderRadius:999,overflow:"hidden"}}>
        <div style={{height:"100%",background:color,borderRadius:999,width:pct+"%",transition:"width 0.5s"}}/>
      </div>
      <span style={{fontSize:11,fontWeight:700,color,minWidth:24,textAlign:"right"}}>{value}/5</span>
    </div>
  );
}

function PersonCard({person,forms}){
  const [open,setOpen]=useState(false);
  const color=gc(person.name);

  // Gather all submissions for this person across all forms
  const allReviews=forms.flatMap(form=>{
    const subs=getSubmissions(form.id).filter(s=>s.personName===person.name);
    return subs.map(s=>({...s,formName:form.name,formColor:form.customColor||{amber:"#F59E0B",blue:"#3B82F6",green:"#10B981",rose:"#F43F5E",violet:"#8B5CF6",cyan:"#06B6D4"}[form.theme]||"#F59E0B",fields:(form.fields||[]).filter(f=>f.type==="rating")}));
  });

  if(!allReviews.length)return null;

  // Calculate overall avg
  const allScores=allReviews.flatMap(r=>r.fields.map(f=>r.values?.[f.id]||0).filter(v=>v>0));
  const overallAvg=allScores.length?(allScores.reduce((a,b)=>a+b,0)/allScores.length):0;
  const avgColor=overallAvg>=4?"#22c55e":overallAvg>=3?"#F59E0B":overallAvg>=2?"#f97316":"#ef4444";

  return(
    <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:14,overflow:"hidden",transition:"border-color 0.2s"}}
      onMouseOver={e=>e.currentTarget.style.borderColor=color+"44"}
      onMouseOut={e=>e.currentTarget.style.borderColor="#21262D"}>
      <div style={{height:3,background:`linear-gradient(90deg,${color},${color}33)`}}/>

      {/* Header row */}
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",cursor:"pointer"}}>
        <Av name={person.name} size={44}/>
        <div style={{flex:1,minWidth:0}}>
          <p style={{color:"white",fontSize:14,fontWeight:700,margin:0}}>{person.name}</p>
          <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
            {(person.designations||[]).map(d=><span key={d} style={{fontSize:10,color:"#6b7280",background:"#21262D",padding:"1px 6px",borderRadius:999}}>{d}</span>)}
            {person.department&&<span style={{fontSize:10,color:"#4b5563"}}>· {person.department}</span>}
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
          {/* Total reviews badge */}
          <div style={{textAlign:"center"}}>
            <p style={{color:color,fontSize:22,fontWeight:800,margin:0,lineHeight:1}}>{allReviews.length}</p>
            <p style={{color:"#6b7280",fontSize:10,margin:"3px 0 0"}}>review{allReviews.length>1?"s":""}</p>
          </div>
          {/* Avg score */}
          <div style={{textAlign:"center",background:avgColor+"12",border:"1px solid "+avgColor+"33",borderRadius:10,padding:"8px 14px"}}>
            <p style={{color:avgColor,fontSize:16,fontWeight:800,margin:0}}>{overallAvg.toFixed(2)}</p>
            <p style={{color:"#6b7280",fontSize:10,margin:"3px 0 0"}}>avg / 5</p>
          </div>
          {open?<ChevronUp size={16} color="#6b7280"/>:<ChevronDown size={16} color="#6b7280"/>}
        </div>
      </div>

      {/* Expanded: each review */}
      {open&&(
        <div style={{borderTop:"1px solid #21262D",padding:"14px 18px",display:"flex",flexDirection:"column",gap:10}}>
          <p style={{color:"#4b5563",fontSize:11,textTransform:"uppercase",letterSpacing:"0.07em",margin:0}}>{allReviews.length} review{allReviews.length>1?"s":""} received</p>
          {allReviews.map((review,i)=>{
            const scores=review.fields.map(f=>review.values?.[f.id]||0);
            const avg=scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(2):null;
            const avgC=avg>=4?"#22c55e":avg>=3?"#F59E0B":avg>=2?"#f97316":"#ef4444";
            const date=review.updatedAt?new Date(review.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—";
            return(
              <div key={i} style={{background:"#0D1117",border:"1px solid #21262D",borderRadius:10,padding:14}}>
                {/* Review meta */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,gap:8,flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:review.formColor,flexShrink:0}}/>
                    <p style={{color:"white",fontSize:13,fontWeight:600,margin:0}}>{review.formName}</p>
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <p style={{color:"#6b7280",fontSize:11,margin:0}}>by <span style={{color:"#9ca3af"}}>{review.reviewerEmail}</span></p>
                    <p style={{color:"#4b5563",fontSize:11,margin:0}}>{date}</p>
                    {avg&&<span style={{fontSize:12,fontWeight:700,color:avgC,background:avgC+"18",padding:"3px 10px",borderRadius:999}}>avg {avg}</span>}
                  </div>
                </div>

                {/* Scores per question */}
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {review.fields.map((field,qi)=>{
                    const val=review.values?.[field.id]||0;
                    return(
                      <div key={field.id} style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:11,color:"#F59E0B",fontWeight:600,minWidth:20}}>Q{qi+1}</span>
                        <p style={{color:"#9ca3af",fontSize:11,margin:0,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{field.label}</p>
                        <ScoreBar value={val}/>
                      </div>
                    );
                  })}
                </div>

                {/* Comments */}
                {review.values?.comments&&(
                  <div style={{marginTop:10,padding:"8px 12px",background:"#161B22",borderRadius:8,border:"1px solid #21262D"}}>
                    <p style={{color:"#6b7280",fontSize:11,margin:"0 0 4px"}}>💬 Comment</p>
                    <p style={{color:"#9ca3af",fontSize:12,margin:0,lineHeight:1.5}}>{review.values.comments}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Performance(){
  const [forms,setForms]=useState([]);
  const [people,setPeople]=useState([]);
  const [search,setSearch]=useState("");

  useEffect(()=>{
    const sf=localStorage.getItem("forms_list");
    const sp=localStorage.getItem("people");
    if(sf){try{setForms(JSON.parse(sf));}catch{}}
    if(sp){try{setPeople(JSON.parse(sp));}catch{}}
  },[]);

  // Count total reviews per person
  const peopleWithReviews=people.map(p=>{
    const count=forms.reduce((a,form)=>a+getSubmissions(form.id).filter(s=>s.personName===p.name).length,0);
    return{...p,reviewCount:count};
  }).filter(p=>p.reviewCount>0)
    .sort((a,b)=>b.reviewCount-a.reviewCount);

  const filtered=peopleWithReviews.filter(p=>
    p.name.toLowerCase().includes(search.toLowerCase())||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalReviews=peopleWithReviews.reduce((a,p)=>a+p.reviewCount,0);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div>
        <h2 style={{color:"white",fontSize:18,fontWeight:700,margin:0,fontFamily:"var(--font-playfair)"}}>📈 Performance</h2>
        <p style={{color:"#6b7280",fontSize:13,margin:"3px 0 0"}}>Reviews received per person — click any card to see individual scores</p>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        {[
          {l:"People Reviewed", v:peopleWithReviews.length, c:"#F59E0B"},
          {l:"Total Reviews",   v:totalReviews,             c:"#3B82F6"},
          {l:"Forms Active",    v:forms.length,             c:"#10B981"},
          {l:"Avg per Person",  v:peopleWithReviews.length?(totalReviews/peopleWithReviews.length).toFixed(1):"—", c:"#8B5CF6"},
        ].map(s=>(
          <div key={s.l} style={{background:"#161B22",border:"1px solid #21262D",borderRadius:10,padding:"12px 16px"}}>
            <p style={{color:s.c,fontSize:20,fontWeight:800,margin:0}}>{s.v}</p>
            <p style={{color:"#6b7280",fontSize:11,margin:"3px 0 0"}}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{position:"relative"}}>
        <Search size={14} color="#6b7280" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search person..."
          style={{width:"100%",background:"#161B22",border:"1px solid #21262D",borderRadius:9,padding:"10px 12px 10px 36px",color:"white",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
      </div>

      {/* People list */}
      {filtered.length===0?(
        <div style={{textAlign:"center",padding:"48px 0",background:"#161B22",border:"1px solid #21262D",borderRadius:12,color:"#4b5563"}}>
          <p style={{fontSize:32,margin:"0 0 10px"}}>📊</p>
          <p style={{fontSize:14,margin:0}}>No reviews submitted yet.</p>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map(person=><PersonCard key={person.id} person={person} forms={forms}/>)}
        </div>
      )}
    </div>
  );
}
