
// STUDY ID

const params = new URLSearchParams(
    window.location.search
);

let studyId =
    params.get("uxStudyId") ||
    sessionStorage.getItem("uxStudyId");

if (!studyId) {
    console.error("No study ID found.");
} else {
    sessionStorage.setItem(
        "uxStudyId",
        studyId
    );
}

console.log("UX Tracker Study ID:", studyId);
// SESSION

let sessionId = sessionStorage.getItem(
    `trackerSessionId_${studyId}`
);

if (!sessionId) {
    sessionId = crypto.randomUUID();

    sessionStorage.setItem(
        `trackerSessionId_${studyId}`,
        sessionId
    );
}

console.log("UX Tracker Session:", sessionId);

fetch("http://localhost:3000/api/sessions", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        studyId: Number(studyId),
        sessionId: sessionId
    })
})
.then(response => response.json())
.then(data => console.log("Session created:", data))
.catch(error => console.error("Session error:", error));


// EVENT TRACKING

function trackEvent(type, data = {}) {

    const event = {
        studyId: Number(studyId),
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


// PAGE VIEW

trackEvent("PAGE_VIEW", {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
});


// CLICK TRACKING

document.addEventListener("click", (event) => {

    const element = event.target;

    trackEvent("CLICK", {
    element: element.tagName,
    text: element.innerText || "",
    id: element.id || "",
    className: element.className || "",
    x: event.pageX,
    y: event.pageY,
    pageWidth: document.documentElement.scrollWidth,
    pageHeight: document.documentElement.scrollHeight
});

});


// SCROLL TRACKING

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