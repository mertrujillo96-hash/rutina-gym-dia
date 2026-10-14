// Mobile cache validation v2
import {test,expect} from "@playwright/test";

async function imageStatus(page){
  const img=page.locator(".hero img");
  try{
    await expect(img).toBeVisible({timeout:12000});
    await expect.poll(async()=>img.evaluate(el=>el.naturalWidth),{timeout:12000}).toBeGreaterThan(0);
    return await img.evaluate(el=>({ok:true,src:el.currentSrc||el.src,width:el.naturalWidth,height:el.naturalHeight}));
  }catch{
    const fallback=page.locator(".hero .fallback");
    return {ok:false,src:await img.count()?await img.getAttribute("src"):null,fallback:await fallback.count()?await fallback.isVisible():false};
  }
}

test("auditar todas las imágenes de ejercicios y miniaturas",async({page})=>{
  test.setTimeout(180000);
  const failures=[];
  const pageErrors=[];
  const consoleErrors=[];
  page.on("pageerror",err=>pageErrors.push(err.stack||err.message));
  page.on("console",msg=>{if(msg.type()==="error")consoleErrors.push(msg.text())});
  await page.goto("./");
  await page.evaluate(async()=>{
    if("serviceWorker" in navigator){
      await navigator.serviceWorker.ready;
    }
  });
  await page.reload({waitUntil:"networkidle"});
  if(await page.evaluate(()=>"serviceWorker" in navigator)){
    await expect.poll(
      ()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller)),
      {timeout:10000}
    ).toBe(true);
  }

  for(let day=1;day<=5;day++){
    await page.locator(".dayCard").filter({hasText:"Día "+day}).click();
    await expect(page.locator(".summary h2")).toHaveText("Día "+day);

    const items=page.locator(".item");
    const count=await items.count();

    for(let i=0;i<count;i++){
      const name=(await items.nth(i).locator(".ename").textContent())?.trim()||("Ejercicio "+(i+1));
      const thumb=items.nth(i).locator("img.thumb");
      try{
        await expect.poll(async()=>thumb.evaluate(el=>el.naturalWidth),{timeout:8000}).toBeGreaterThan(0);
      }catch{
        failures.push({day,exercise:name,kind:"thumbnail",src:await thumb.getAttribute("src")});
      }
    }

    for(let i=0;i<count;i++){
      const currentItems=page.locator(".item");
      const name=(await currentItems.nth(i).locator(".ename").textContent())?.trim()||("Ejercicio "+(i+1));
      await currentItems.nth(i).click();
      try{
        await expect(page.locator(".dhead h2")).toHaveText(name,{timeout:10000});
      }catch(err){
        console.log("OPEN_DETAIL_PAGE_ERRORS="+JSON.stringify(pageErrors));
        console.log("OPEN_DETAIL_CONSOLE_ERRORS="+JSON.stringify(consoleErrors));
        console.log("OPEN_DETAIL_URL="+page.url());
        console.log("OPEN_DETAIL_BODY="+JSON.stringify((await page.locator("body").innerText()).slice(0,2500)));
        throw err;
      }

      const tabs=page.locator(".tab");
      const tabCount=await tabs.count();
      if(tabCount){
        for(let j=0;j<tabCount;j++){
          const label=(await tabs.nth(j).textContent())?.trim()||("Parte "+(j+1));
          await tabs.nth(j).click();
          const st=await imageStatus(page);
          if(!st.ok) failures.push({day,exercise:name,part:label,kind:"detail",...st});
        }
      }else{
        const st=await imageStatus(page);
        if(!st.ok) failures.push({day,exercise:name,kind:"detail",...st});
      }

      await page.locator(".back").click();
      await expect(page.locator(".summary h2")).toHaveText("Día "+day);
    }
  }

  console.log("IMAGE_AUDIT_FAILURES="+JSON.stringify(failures));
  expect(failures).toEqual([]);
});
