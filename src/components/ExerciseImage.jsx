import React,{useEffect,useMemo,useState} from "react";
import {DAY1_FALLBACKS} from "../data/workouts";

function localImage(url,kind="detail"){
  const m=window.GYM_IMAGES?.[url];
  return m?.[kind]||url;
}

export default function ExerciseImage({part,exercise,day}){
  const candidates=useMemo(()=>[
    localImage(part.img,"detail"),
    part.img,
    part.altImg?localImage(part.altImg,"detail"):null,
    part.altImg,
    day===1?DAY1_FALLBACKS[exercise.n]:null
  ].filter((v,i,a)=>v&&a.indexOf(v)===i),[part,exercise,day]);

  const [index,setIndex]=useState(0);
  const [ready,setReady]=useState(false);
  useEffect(()=>{setIndex(0);setReady(false)},[part.img,exercise.n,day]);

  if(index>=candidates.length){
    return <div className="hero"><div className="fallback" style={{display:"grid"}}>🏋️</div></div>;
  }

  return <div className={"hero "+(ready?"imgReady":"imgLoading")}>
    <img
      src={candidates[index]}
      alt={part.l}
      decoding="async"
      fetchPriority="high"
      referrerPolicy="no-referrer"
      onLoad={()=>setReady(true)}
      onError={()=>{setReady(false);setIndex(v=>v+1)}}
    />
    <div className="fallback">🏋️</div>
  </div>;
}
