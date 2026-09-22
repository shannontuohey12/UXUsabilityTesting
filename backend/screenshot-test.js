const { chromium } = require("playwright");

async function takeScreenshot() {
    const browser = await chromium.launch();

    const page = await browser.newPage({
        viewport: {
            width: 1440,
            height: 900
        }
    });

    await page.goto(
        "https://studioshan.wixsite.com/portfolio",
        {
            waitUntil: "domcontentloaded",
            timeout: 60000
        }
    );

    // Give Wix a few seconds to finish rendering
    await page.waitForTimeout(5000);

    await page.screenshot({
        path: "portfolio-screenshot.png",
        fullPage: true
    });

    await browser.close();

    console.log("Screenshot saved!");
}

takeScreenshot();