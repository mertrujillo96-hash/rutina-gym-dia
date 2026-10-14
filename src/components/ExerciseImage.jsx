import React,{useEffect,useMemo,useState} from "react";
import {DAY1_FALLBACKS} from "../data/workouts";
import {localImage} from "../data/imageMap";

export default function ExerciseImage({part,exercise,day}){
  const candidates=useMemo(()=>{
    const dayFallback=day===1?DAY1_FALLBACKS[exercise.n]:null;
    return [
      localImage(part.img,"detail"),
      localImage(part.img,"thumb"),
      part.img,
      part.altImg?localImage(part.altImg,"detail"):null,
      part.altImg?localImage(part.altImg,"thumb"):null,
      part.altImg,
      dayFallback?localImage(dayFallback,"detail"):null,
      dayFallback
    ].filter((v,i,a)=>v&&a.indexOf(v)===i);
  },[part.img,part.altImg,exercise.n,day]);

  const [index,setIndex]=useState(0);
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    setIndex(0);
    setReady(false);
  },[part.img,part.altImg,exercise.n,day]);

  if(index>=candidates.length){
    return <div className="hero"><div className="fallback" style={{display:"grid"}}>🏋️</div></div>;
  }

  return <div className={"hero "+(ready?"imgReady":"imgLoading")}>
    <img
      key={candidates[index]}
      src={candidates[index]}
      alt={part.l}
      loading="eager"
      decoding="async"
      fetchPriority="high"
      referrerPolicy="no-referrer"
      onLoad={()=>setReady(true)}
      onError={()=>{
        setReady(false);
        setIndex(v=>v+1);
      }}
    />
    <div className="fallback">🏋️</div>
  </div>;
}
