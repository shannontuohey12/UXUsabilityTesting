// ========================================
// SESSION
// ========================================

let sessionId = sessionStorage.getItem("trackerSessionId");

if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(
        "trackerSessionId",
        sessionId
    );
}

console.log("UX Tracker Session:", sessionId);


// ========================================
// EVENT TRACKING
// ========================================

function trackEvent(type, data = {}) {

    const event = {
        sessionId,
        type,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        ...data
    };

    console.log("TRACKED EVENT:", event);

    fetch("http://localhost:3000/api/events", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(event)
    })
    .catch(error => {
        console.error(
            "Error sending event:",
            error
        );
    });
}


// ========================================
// PAGE VIEW
// ========================================

trackEvent("PAGE_VIEW", {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
});


// ========================================
// CLICK TRACKING
// ========================================

document.addEventListener("click", (event) => {

    const element = event.target;

    trackEvent("CLICK", {

        element: element.tagName,

        text: element.innerText || "",

        id: element.id || "",

        className: element.className || "",

        x: event.clientX,

        y: event.clientY
    });

});


// ========================================
// SCROLL TRACKING
// ========================================

const scrollMilestones = [25, 50, 75, 100];

const reachedMilestones = new Set();

function checkScrollDepth() {

    const scrollTop = window.scrollY;

    const pageHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

    if (pageHeight <= 0) {
        return;
    }

    const scrollPercent =
        (scrollTop / pageHeight) * 100;

    scrollMilestones.forEach((milestone) => {

        if (
            scrollPercent >= milestone &&
            !reachedMilestones.has(milestone)
        ) {

            reachedMilestones.add(milestone);

            trackEvent("SCROLL", {
                scrollDepth: milestone
            });
        }

    });
}

window.addEventListener(
    "scroll",
    checkScrollDepth
);


console.log("UX Research Tracker initialized.");