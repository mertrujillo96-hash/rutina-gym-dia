const C="rutina-gym-dia-react-v34";
const SHELL=["./","./index.html","./manifest.webmanifest","./assets/pec-deck-anatomy-final.webp","./assets/anatomy/day1/press-plano-body.webp"];

self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)));
});

self.addEventListener("activate",e=>{
  e.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k)))),
    self.clients.claim()
  ]));
});

self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const req=e.request;
  const u=new URL(req.url);

  if(req.mode==="navigate"||u.pathname.endsWith("/index.html")){
    e.respondWith(
      fetch(req,{cache:"no-store"})
        .then(r=>{
          const x=r.clone();
          caches.open(C).then(c=>c.put(req,x));
          return r;
        })
        .catch(()=>caches.match(req).then(r=>r||caches.match("./index.html")))
    );
    return;
  }

  if(req.destination==="image"&&u.origin===self.location.origin){
    e.respondWith(
      caches.open(C).then(async cache=>{
        const cached=await cache.match(req);
        if(cached)return cached;
        try{
          const fresh=await fetch(req,{cache:"no-cache"});
          if(fresh&&fresh.ok)await cache.put(req,fresh.clone());
          return fresh;
        }catch(_){
          return Response.error();
        }
      })
    );
    return;
  }

  if(req.destination==="image"){
    e.respondWith(
      caches.open(C).then(async cache=>{
        const cached=await cache.match(req);
        if(cached)return cached;
        try{
          const r=await fetch(req);
          if(r&&(r.ok||r.type==="opaque"))await cache.put(req,r.clone());
          return r;
        }catch(_){
          return Response.error();
        }
      })
    );
    return;
  }

  e.respondWith(
    caches.open(C).then(async cache=>{
      const cached=await cache.match(req);
      if(cached)return cached;
      try{
        const r=await fetch(req);
        if(r&&(r.ok||r.type==="opaque"))await cache.put(req,r.clone());
        return r;
      }catch(_){
        return Response.error();
      }
    })
  );
});
