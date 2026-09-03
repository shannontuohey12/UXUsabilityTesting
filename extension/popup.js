const button = document.getElementById("startTracking");
const input = document.getElementById("websiteUrl");
const status = document.getElementById("status");

button.addEventListener("click", async () => {

    const websiteUrl = input.value.trim();

    if (!websiteUrl) {
        status.textContent = "Please enter a website URL.";
        return;
    }

    try {

        const url = new URL(websiteUrl);

        // Get the currently active tab
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        // Make sure the active tab matches the website
        const targetOrigin = url.origin;
        const currentOrigin = new URL(tab.url).origin;

        if (targetOrigin !== currentOrigin) {
            status.textContent =
                "The active tab does not match the website.";
            return;
        }

        // Inject tracker.js into the active tab
        await chrome.scripting.executeScript({
            target: {
                tabId: tab.id
            },
            files: ["tracker.js"]
        });

        status.textContent = "Tracking started!";

    } catch (error) {

        console.error(error);

        status.textContent =
            "Could not inject tracker.";
    }
});