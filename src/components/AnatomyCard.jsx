import React from "react";

const ANATOMY_SRC="https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Muscles_front_and_back.svg/960px-Muscles_front_and_back.svg.png";

const ZONES={
  chest:[{l:13,t:18,w:12,h:12},{l:25,t:18,w:12,h:12}],
  frontShoulder:[{l:8,t:17,w:7,h:12},{l:38,t:17,w:7,h:12}],
  rearShoulder:[{l:55,t:17,w:7,h:12},{l:88,t:17,w:7,h:12}],
  biceps:[{l:7.5,t:27,w:6.5,h:15},{l:40,t:27,w:6.5,h:15}],
  triceps:[{l:56,t:27,w:6.5,h:16},{l:89,t:27,w:6.5,h:16}],
  forearms:[{l:3.5,t:41,w:6,h:18},{l:44,t:41,w:6,h:18},{l:51,t:41,w:6,h:18},{l:94,t:41,w:6,h:18}],
  abs:[{l:19.3,t:29,w:11.5,h:23}],
  hipflexors:[{l:16.5,t:50,w:8,h:10},{l:27,t:50,w:8,h:10}]
};

const MUSCLE_INFO={
  chest:{name:"Pectoral mayor",loc:"Parte frontal del tórax, a ambos lados del esternón.",feel:"En el pecho, especialmente al cerrar o empujar los brazos.",label:"PECHO",call:"call-chest"},
  biceps:{name:"Bíceps",loc:"Parte delantera del brazo, entre el hombro y el codo.",feel:"En la parte frontal del brazo al flexionar el codo.",label:"BÍCEPS",call:"call-biceps"},
  triceps:{name:"Tríceps",loc:"Parte trasera del brazo, entre el hombro y el codo.",feel:"Detrás del brazo cuando extiendes el codo.",label:"TRÍCEPS",call:"call-triceps"},
  forearms:{name:"Antebrazo",loc:"Entre el codo y la muñeca.",feel:"En el antebrazo y la muñeca.",label:"ANTEBRAZO",call:"call-forearms"},
  abs:{name:"Recto abdominal",loc:"Parte frontal media del tronco.",feel:"En el centro del abdomen al elevar las piernas.",label:"ABDOMEN",call:"call-abs"},
  hipflexors:{name:"Flexores de cadera",loc:"Parte frontal de la cadera.",feel:"En la parte delantera de la cadera al elevar las piernas.",label:"CADERA",call:"call-hipflexors"},
  frontShoulder:{name:"Deltoide anterior",loc:"Parte delantera del hombro.",feel:"En la parte frontal del hombro.",label:"HOMBRO",call:"call-frontShoulder"},
  rearShoulder:{name:"Deltoide posterior",loc:"Parte trasera del hombro.",feel:"Detrás del hombro.",label:"HOMBRO",call:"call-rearShoulder"}
};

function Zone({zone,type}){
  return <span className={"zone "+type} style={{left:zone.l+"%",top:zone.t+"%",width:zone.w+"%",height:zone.h+"%"}} />;
}

function AssetImage({src,alt}){
  return <img src={src} alt={alt} style={{display:"block",position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain",objectPosition:"center"}} decoding="async" fetchPriority="high" />;
}

export default function AnatomyCard({day,exercise,part}){
  if(day!==1 || !part?.m?.length) return null;
  const key=part.hp?.[0]||"chest";
  const info=MUSCLE_INFO[key]||MUSCLE_INFO.chest;
  const support=(part.m||[]).slice(1);
  const base=import.meta.env.BASE_URL;
  const isPec=exercise.n==="Pec deck";
  const isPress=exercise.n==="Press plano";
  let cardClass="musclePanel";
  let stageClass="anatomyStage";
  let special=null;

  if(isPec){
    cardClass+=" pecDeckCard";
    stageClass+=" exactCrop";
    special=<AssetImage src={base+"assets/pec-deck-anatomy-final.webp"} alt="Tarjeta anatómica del Pec deck" />;
  }else if(isPress){
    cardClass+=" pressBodyCard";
    stageClass+=" exactCrop";
    special=<AssetImage src={base+"assets/anatomy/day1/press-plano-body.webp"} alt="Anatomía muscular del Press plano" />;
  }

  return <div className={cardClass}>
    <div className="muscleTitle">Qué fortalece este ejercicio</div>
    <div className="muscleGrid">
      <div className={stageClass}>
        {special || <>
          <img className="anatomyBase" src={ANATOMY_SRC} alt="Vista anatómica frontal y posterior" decoding="async" fetchPriority="high" referrerPolicy="no-referrer" />
          {(part.hs||[]).flatMap(k=>(ZONES[k]||[]).map((z,i)=><Zone key={"s-"+k+"-"+i} zone={z} type="secondary" />))}
          {(part.hp||[]).flatMap(k=>(ZONES[k]||[]).map((z,i)=><Zone key={"p-"+k+"-"+i} zone={z} type="primary" />))}
          <span className={"muscleCallout "+info.call}>{info.label}</span>
          <div className="viewTags"><span>Vista frontal</span><span>Vista trasera</span></div>
        </>}
      </div>
      <div className="muscleInfo">
        <div className="muscleLine"><span>Principal:</span><strong>{info.name}</strong></div>
        <div className="muscleLine"><span>Ubicación:</span><strong>{info.loc}</strong></div>
        <div className="muscleLine"><span>Dónde lo sentirás:</span><strong>{info.feel}</strong></div>
        {support.length>0 && <div className="muscleLine"><span>También trabaja:</span><strong>{support.join(", ")}</strong></div>}
      </div>
      <div className="heatLegend"><span><span className="legendDot" style={{background:"#ff1e1e"}}></span>Mayor activación</span><span><span className="legendDot" style={{background:"#ff8800"}}></span>Apoyo</span></div>
      <div className="anatomyCredit">Anatomía base: OpenStax / Tomáš Kebert / umimeto.org · CC BY-SA 4.0</div>
    </div>
  </div>;
}
