const { chromium } = require("playwright");
const fs = require("fs");

async function captureWebsiteScreenshot(studyId, targetUrl) {
    let browser;

    try {
        console.log("Capturing screenshot for:", targetUrl);

        browser = await chromium.launch();

        const page = await browser.newPage({
            viewport: {
                width: 1440,
                height: 900
            }
        });
        try {
            await page.goto(targetUrl, {
            waitUntil: "commit",
            timeout: 60000
        });
        } catch (error) {
            console.log("Navigation timed out, attempting screenshot anyway.");
        }
        

        console.log("Page loaded.");

        // Give the website time to render
        await page.waitForTimeout(5000);

        await page.evaluate(() => {
            document.querySelectorAll("img").forEach(img => {
                img.loading = "eager";
            });
        });

        // Scroll through the page slowly to trigger
        // lazy-loaded content and scroll animations.
        await page.evaluate(async () => {
            const delay = 500;
            const step = 400;

            let previousHeight = 0;
            let unchangedCount = 0;

            while (unchangedCount < 5) {
                const height = Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight
                );

                // Move down the page
                window.scrollBy(0, step);

                await new Promise(resolve =>
                    setTimeout(resolve, delay)
                );

                const newHeight = Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight
                );

                // If the page grew, keep going
                if (newHeight > previousHeight) {
                    unchangedCount = 0;
                } else {
                    unchangedCount++;
                }

                previousHeight = newHeight;

                // If we're at the bottom AND the height has stopped changing,
                // we've probably loaded everything.
                if (
                    window.scrollY + window.innerHeight >= newHeight &&
                    unchangedCount >= 5
                ) {
                    break;
                }
            }

            // Stay at the bottom briefly
            await new Promise(resolve =>
                setTimeout(resolve, 2000)
            );
        });
        console.log("Finished scrolling.");

        // Give animations/lazy content time to finish
        await page.waitForTimeout(2000);

        // Return to top
        await page.evaluate(() => {
            window.scrollTo(0, 0);
        });

        await page.waitForTimeout(1000);

        const pageHeight = await page.evaluate(() => {
            return document.documentElement.scrollHeight;
        });

        console.log("PAGE HEIGHT:", pageHeight);

        const screenshotDirectory = path.join(
            __dirname,
            "screenshots"
        );

        if (!fs.existsSync(screenshotDirectory)) {
            fs.mkdirSync(screenshotDirectory, {
                recursive: true
            });
        }

        const screenshotPath = path.join(
            screenshotDirectory,
            `study-${studyId}.png`
        );

        console.log("Taking screenshot...");

        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });

        console.log(
            "Screenshot saved:",
            screenshotPath
        );

        return screenshotPath;

    } catch (error) {
        console.error(
            "Screenshot error:",
            error
        );

        return null;

    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = {
    captureWebsiteScreenshot
};