import React,{useEffect,useMemo,useState} from "react";
import {DAYS,STORAGE_KEY} from "./data/workouts";
import {localImage} from "./data/imageMap";
import ExerciseImage from "./components/ExerciseImage";
import AnatomyCard from "./components/AnatomyCard";

function preloadUrl(src){
  return new Promise(resolve=>{
    if(!src){resolve();return}
    const img=new Image();
    let settled=false;
    const finish=()=>{if(!settled){settled=true;resolve()}};
    img.onload=finish;
    img.onerror=finish;
    img.decoding="async";
    img.src=src;
    if(img.complete&&img.naturalWidth>0)finish();
    window.setTimeout(finish,2500);
  });
}

function preloadExerciseImage(exercise,partIndex=0){
  const part=exercise?.p?.[partIndex]||exercise?.p?.[0];
  if(!part)return Promise.resolve();
  return preloadUrl(localImage(part.img,"detail"));
}

function blankDay(d){
  return {sets:DAYS[d].ex.map(()=>[false,false,false,false]),notes:DAYS[d].ex.map(()=>"")};
}
function makeInitialState(){
  let s={day:1,i:0,p:0,days:{}};
  Object.keys(DAYS).forEach(d=>{s.days[d]=blankDay(Number(d))});
  try{
    const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
    if(x?.days){
      s={...s,...x,days:{...s.days,...x.days}};
      Object.keys(DAYS).forEach(d=>{if(!s.days[d])s.days[d]=blankDay(Number(d))});
    }
  }catch{}
  return s;
}
export default function App(){
  const [state,setState]=useState(makeInitialState);
  const [screen,setScreen]=useState("home");
  const [motion,setMotion]=useState({direction:"",key:0});
  const runTransition=(action,direction="forward")=>{
    setMotion(m=>({direction,key:m.key+1}));
    action();
  };
  useEffect(()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))},[state]);

  const day=state.day;
  const exercises=DAYS[day].ex;
  const exercise=exercises[state.i]||exercises[0];
  const part=exercise.p[Math.min(state.p,exercise.p.length-1)];

  const navigate=(next,direction="forward")=>runTransition(()=>setScreen(next),direction);
  const openExercise=async(i)=>{
    const target=exercises[i];
    await preloadExerciseImage(target,0);
    runTransition(()=>{
      setState(s=>({...s,i,p:0}));
      setScreen("detail");
    },"forward");
  };
  const openCurrentDetail=async()=>{
    await preloadExerciseImage(exercise,state.p);
    navigate("detail","forward");
  };
  const moveExercise=async(next,direction)=>{
    await preloadExerciseImage(exercises[next],0);
    runTransition(()=>setState(s=>({...s,i:next,p:0})),direction);
  };

  const count=(i,d=day)=>state.days[d].sets[i].filter(Boolean).length;
  const done=(i,d=day)=>count(i,d)===4;
  const totalSets=(d=day)=>state.days[d].sets.flat().filter(Boolean).length;
  const totalEx=(d=day)=>DAYS[d].ex.filter((_,i)=>done(i,d)).length;
  const pct=(d=day)=>Math.round(totalSets(d)/(DAYS[d].ex.length*4)*100);

  const update=(patch)=>setState(s=>({...s,...patch}));
  const switchDay=(d)=>setState(s=>({...s,day:d,i:0,p:0}));

  const toggleSet=(j)=>setState(s=>{
    const days={...s.days};
    const d={...days[s.day],sets:days[s.day].sets.map(x=>[...x]),notes:[...days[s.day].notes]};
    d.sets[s.i][j]=!d.sets[s.i][j];
    days[s.day]=d;
    return {...s,days};
  });
  const complete=()=>setState(s=>{
    const days={...s.days};
    const d={...days[s.day],sets:days[s.day].sets.map(x=>[...x]),notes:[...days[s.day].notes]};
    const all=d.sets[s.i].every(Boolean);
    d.sets[s.i]=[!all,!all,!all,!all];
    days[s.day]=d;
    return {...s,days};
  });
  const setNote=(value)=>setState(s=>{
    const days={...s.days};
    const d={...days[s.day],sets:days[s.day].sets.map(x=>[...x]),notes:[...days[s.day].notes]};
    d.notes[s.i]=value;days[s.day]=d;return {...s,days};
  });
  const resetDay=()=>{
    if(window.confirm("¿Reiniciar el progreso de "+DAYS[day].title+"?")){
      setState(s=>({...s,days:{...s.days,[day]:blankDay(day)}}));
    }
  };

  return <>
    <div className="app"><main key={motion.key} className={"screenShell "+(motion.direction?"slide-"+motion.direction:"")}>
      {screen==="home" && <section>
        <div className="top"><div className="title"><h1>Rutina de Gym</h1><div className="dayText">Plan de entrenamiento</div></div><div className="badge">DISCIPLINA HOY · RESULTADOS MAÑANA</div></div>
        <div className="daySelector">
          {Object.keys(DAYS).map(Number).map(d=><button key={d} className={"dayCard"+(day===d?" active":"")} onClick={()=>switchDay(d)}>
            <div className="label">Rutina</div><div className="dtitle">{DAYS[d].title}</div><div className="dprogress">{totalEx(d)}/{DAYS[d].ex.length} ejercicios · {pct(d)}%</div>
          </button>)}
        </div>
        <div className="progress"><div className="prow"><span>Progreso {DAYS[day].title}</span><span>{pct()}%</span></div><div className="bar"><div className="fill" style={{width:pct()+"%"}}></div></div></div>
        <div className="summary"><div><h2>{DAYS[day].title}</h2><p>{exercises.length} ejercicios · progreso independiente</p></div><div className="big">4 × 15</div></div>
        <div className="list">
          {exercises.map((x,i)=><button key={x.n} className="item" onClick={()=>openExercise(i)}>
            <span className="num">{done(i)?"✓":i+1}</span>
            <span className="thumbWrap"><img className="thumb" src={localImage(x.p[0].img,"thumb")} alt="" loading="eager" decoding="async" referrerPolicy="no-referrer" width="82" height="60" onError={e=>{
              const img=e.currentTarget;
              const original=x.p[0].img;
              const detail=localImage(original,"detail");
              if(img.dataset.fallback!=="detail"&&img.getAttribute("src")!==detail){
                img.dataset.fallback="detail";
                img.src=detail;
                return;
              }
              if(img.dataset.fallback!=="remote"&&original!==detail){
                img.dataset.fallback="remote";
                img.src=original;
                return;
              }
              img.style.display="none";
            }} /></span>
            <span><span className="ename">{x.n}</span><span className="sub">{x.s}</span></span><span className="pill">4 × 15</span>
          </button>)}
        </div>
        <button className="primary" onClick={()=>openExercise(0)}>▶ Comenzar {DAYS[day].title}</button>
      </section>}

      {screen==="detail" && <section>
        <div className="top"><button className="back" onClick={()=>navigate("home","back")}>‹</button><div className="title"><h1 style={{fontSize:25}}>Rutina de Gym</h1><div className="dayText" style={{fontSize:19}}>{DAYS[day].title}</div></div><div className="badge">TÉCNICA PRIMERO</div></div>
        <div className="dhead"><div><div className="sub">Ejercicio {state.i+1} de {exercises.length}</div><h2>{exercise.n}</h2><div className="sub">{exercise.s}</div></div><div className="seriesBadge">4 × 15</div></div>
        {exercise.p.length>1 && <div className="tabs">{exercise.p.map((r,j)=><button key={r.l} className={"tab"+(j===state.p?" active":"")} onClick={()=>update({p:j})}>{r.l}</button>)}</div>}
        <ExerciseImage part={part} exercise={exercise} day={day} />
        <AnatomyCard day={day} exercise={exercise} part={part} />
        <div className="copy howCard"><div className="how">Cómo se hace</div><div>{part.i}</div></div>
        <div className="grid2"><div className="panel ok"><h3>✓ Claves</h3><ul>{part.t.map(v=><li key={v}>{v}</li>)}</ul></div><div className="panel bad"><h3>✕ Evita</h3><ul>{part.e.map(v=><li key={v}>{v}</li>)}</ul></div></div>
        <div className="panel series"><h3>Series realizadas · <span className="sub">{count(state.i)}/4</span></h3><div className="srow">{state.days[day].sets[state.i].map((v,j)=><button key={j} className={"set"+(v?" done":"")} onClick={()=>toggleSet(j)}>{v?"✓ ":""}Serie {j+1}</button>)}</div></div>
        <textarea className="notes" maxLength="300" placeholder="Notas: peso usado, sensaciones, ajustes..." value={state.days[day].notes[state.i]||""} onChange={e=>setNote(e.target.value)} />
        <div className="nav">
          <button disabled={state.i===0} onClick={()=>state.i>0&&moveExercise(state.i-1,"back")}>← Anterior</button>
          <button onClick={complete}>{done(state.i)?"✓ Completado":"✓ Completar"}</button>
          <button onClick={()=>{if(state.i<exercises.length-1)moveExercise(state.i+1,"forward");else navigate("progress","forward")}}>{state.i===exercises.length-1?"Finalizar":"Siguiente →"}</button>
        </div>
      </section>}

      {screen==="progress" && <section>
        <div className="top"><div className="title"><h1>Progreso</h1><div className="dayText">Por día</div></div><div className="badge">GUARDADO EN ESTE DISPOSITIVO</div></div>
        <div className="progressDays">{Object.keys(DAYS).map(Number).map(d=><button key={d} className={"pday"+(day===d?" active":"")} onClick={()=>switchDay(d)}><strong>{DAYS[d].title}</strong><div className="sub">{pct(d)}% completado</div></button>)}</div>
        <div className="stats"><div className="stat">Ejercicios completados<b>{totalEx()}/{exercises.length}</b></div><div className="stat">Series completadas<b>{totalSets()}/{exercises.length*4}</b></div></div>
        <div className="panel" style={{marginTop:12}}><h3>Avance total</h3><div className="bar"><div className="fill" style={{width:pct()+"%"}}></div></div><p className="sub">{DAYS[day].title}: {pct()}% de las series completadas</p></div>
        <button className="reset" onClick={resetDay}>Reiniciar progreso del día seleccionado</button>
      </section>}
    </main></div>

    <nav className="bottom"><div className="bottomin">
      <button className={screen==="home"?"active":""} onClick={()=>navigate("home","back")}>⌂<br/>Inicio</button>
      <button className={screen==="detail"?"active":""} onClick={openCurrentDetail}>🏋️<br/>Rutina</button>
      <button className={screen==="progress"?"active":""} onClick={()=>navigate("progress","forward")}>▥<br/>Progreso</button>
    </div></nav>
  </>;
}
