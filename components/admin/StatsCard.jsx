"use client";

export default function StatsCard({ label, value, sub, icon }) {
  return (
    <div style={{background:"#161B22",border:"1px solid #21262D",borderRadius:12,padding:20,display:"flex",alignItems:"flex-start",gap:16}}>
      <div style={{width:40,height:40,borderRadius:8,background:"rgba(245,158,11,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
        {icon}
      </div>
      <div>
        <p style={{fontSize:22,fontWeight:"bold",color:"white",margin:0}}>{value}</p>
        <p style={{fontSize:13,color:"#9ca3af",margin:"4px 0 0"}}>{label}</p>
        {sub && <p style={{fontSize:11,color:"#4b5563",margin:"2px 0 0"}}>{sub}</p>}
      </div>
    </div>
  );
}
