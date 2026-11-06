const { chromium } = require('playwright');

(async () => {
  // تشغيل المتصفح (headless: false لترى نافذة المتصفح)
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://playwright.dev/');
  console.log('عنوان الصفحة:', await page.title());

  await browser.close();
  console.log('تم تشغيل Playwright بنجاح!');
})();

