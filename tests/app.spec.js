import {test,expect} from "@playwright/test";

test("flujo principal, persistencia y anatomías aprobadas", async ({page,request})=>{
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e)));

  await page.goto("./");
  await expect(page.getByRole("heading",{name:"Rutina de Gym"})).toBeVisible();
  await expect(page.locator(".dayCard")).toHaveCount(5);
  await expect(page.locator(".item")).toHaveCount(9);

  const pressAsset=await request.get("http://127.0.0.1:4173/rutina-gym-dia/assets/anatomy/day1/press-plano-body.webp");
  expect(pressAsset.ok()).toBeTruthy();
  expect(pressAsset.headers()["content-type"]||"").toContain("image/webp");
  const pressBytes=await pressAsset.body();
  expect(pressBytes.subarray(0,4).toString()).toBe("RIFF");

  await page.getByRole("button",{name:/Press plano/}).click();
  await expect(page.locator(".dhead h2")).toHaveText("Press plano");
  await expect(page.locator(".musclePanel img")).toHaveAttribute("src",/press-plano-body\.webp/);

  const firstSet=page.locator(".set").first();
  await firstSet.click();
  await expect(firstSet).toHaveClass(/done/);

  await page.locator(".notes").fill("QA React");
  await page.getByRole("button",{name:"Inicio"}).click();
  await page.reload();
  await page.getByRole("button",{name:/Press plano/}).click();
  await expect(page.locator(".set").first()).toHaveClass(/done/);
  await expect(page.locator(".notes")).toHaveValue("QA React");

  await page.getByRole("button",{name:"Inicio"}).click();
  await page.getByRole("button",{name:/Día 2/}).click();
  await expect(page.locator(".summary h2")).toHaveText("Día 2");
  await page.getByRole("button",{name:/Sentadilla y leg extensión/}).click();
  await expect(page.locator(".tab")).toHaveCount(2);
  await page.getByRole("button",{name:"Leg extensión",exact:true}).click();
  await expect(page.locator(".tab.active")).toHaveText("Leg extensión");

  await page.getByRole("button",{name:"Progreso"}).click();
  await expect(page.getByRole("heading",{name:"Progreso"})).toBeVisible();
  await expect(page.locator(".screenShell")).toHaveCount(1);
  await expect(page.locator(".progressDays .pday")).toHaveCount(5);

  expect(errors).toEqual([]);
});

test("Pec deck conserva anatomía local aprobada",async({page,request})=>{
  const asset=await request.get("http://127.0.0.1:4173/rutina-gym-dia/assets/pec-deck-anatomy-final.webp");
  expect(asset.ok()).toBeTruthy();
  expect(asset.headers()["content-type"]||"").toContain("image/svg+xml");
  const body=await asset.text();
  expect(body).toContain("BÍCEPS BRAQUIAL");

  await page.goto("./");
  await page.getByRole("button",{name:/Pec deck/}).click();
  await expect(page.locator(".musclePanel img")).toHaveAttribute("src",/pec-deck-anatomy-final\.webp/);
});

test("los cinco días son navegables",async({page})=>{
  await page.goto("./");
  for(let d=1;d<=5;d++){
    await page.locator(".dayCard").filter({hasText:"Día "+d}).click();
    await expect(page.locator(".summary h2")).toHaveText("Día "+d);
    await expect(page.locator(".item").first()).toBeVisible();
  }
});

test("transiciones de vistas en móvil sin pantalla en blanco",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e)));
  await page.goto("./");
  await expect(page.locator(".dayCard")).toHaveCount(5);
  await page.locator(".item").first().click();
  await expect(page.locator(".dhead h2")).toBeVisible();
  await expect(page.locator(".screenShell")).toHaveCount(1);
  await page.getByRole("button",{name:"Siguiente →"}).click();
  await expect(page.locator(".dhead h2")).toBeVisible();
  await page.locator(".back").click();
  await expect(page.locator(".item").first()).toBeVisible();
  await page.getByRole("button",{name:"Progreso"}).click();
  await expect(page.getByRole("heading",{name:"Progreso"})).toBeVisible();
  await page.getByRole("button",{name:"Inicio"}).click();
  await expect(page.locator(".dayCard")).toHaveCount(5);
  expect(errors).toEqual([]);
});


test("Curl barra usa la anatomía corporal asignada al ejercicio 3 del día 1",async({page,request})=>{
  const asset=await request.get("http://127.0.0.1:4173/rutina-gym-dia/assets/anatomy/day1/curl-barra-body.svg");
  expect(asset.ok()).toBeTruthy();
  expect(asset.headers()["content-type"]||"").toContain("image/webp");
  const bytes=await asset.body();
  expect(bytes.subarray(0,4).toString()).toBe("RIFF");

  await page.goto("./");
  await page.getByRole("button",{name:/Curl barra/}).click();
  await expect(page.locator(".dhead h2")).toHaveText("Curl barra");
  await expect(page.locator(".musclePanel img")).toHaveAttribute("src",/curl-barra-body\.svg/);
  await expect(page.locator(".muscleLine").first()).toContainText("Bíceps");
});
