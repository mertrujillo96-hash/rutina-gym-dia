import {defineConfig,devices} from "@playwright/test";

export default defineConfig({
  testDir:"./tests",
  timeout:45000,
  retries:0,
  use:{
    baseURL:"https://mertrujillo96-hash.github.io/rutina-gym-dia/",
    trace:"retain-on-failure",
    screenshot:"only-on-failure",
    ...devices["Pixel 7"]
  }
});
