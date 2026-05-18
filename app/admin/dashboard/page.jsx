"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const Dashboard = dynamic(() => import("./Dashboard"), { 
  ssr: false,
  loading: () => (
    <div style={{minHeight:"100vh",background:"#0D1117",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#6b7280",fontSize:14}}>Loading dashboard...</p>
    </div>
  )
});

export default function Page() {
  return (
    <Suspense fallback={<div style={{minHeight:"100vh",background:"#0D1117"}}/>}>
      <Dashboard />
    </Suspense>
  );
}
