(function () {

    // Prevent the tracker from being initialized more than once
    if (window.__uxTrackerLoaded) {
        console.log("UX Tracker already loaded.");
        return;
    }

    window.__uxTrackerLoaded = true;

    // ------------------------------------------------
    // GET STUDY ID
    // ------------------------------------------------

    const pageParams = new URLSearchParams(
        window.location.search
    );

    const currentScript =
        document.currentScript;

    const backendUrl = currentScript
        ? new URL(currentScript.src).origin
        : window.location.origin;

    const scriptParams = currentScript
        ? new URLSearchParams(
            new URL(
                currentScript.src
            ).search
        )
        : null;

    let studyId =
        pageParams.get("uxStudyId") ||
        scriptParams?.get("uxStudyId") ||
        sessionStorage.getItem("uxStudyId");

    if (!studyId) {
        console.error("No study ID found.");
        return;
    }

    sessionStorage.setItem(
        "uxStudyId",
        studyId
    );

    console.log(
        "UX Tracker Study ID:",
        studyId
    );

    // ------------------------------------------------
    // GET / CREATE SESSION
    // ------------------------------------------------

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

    console.log(
        "UX Tracker Session:",
        sessionId
    );

    // ------------------------------------------------
    // CREATE SESSION
    // ------------------------------------------------

    fetch(
        `${backendUrl}/api/sessions`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                studyId: Number(studyId),
                sessionId: sessionId
            })
        }
    )
    .then(async (response) => {

        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                `Session request failed (${response.status}): ${text}`
            );
        }

        return response.json();
    })
    .then((data) => {

        console.log(
            "Session created:",
            data
        );

    })
    .catch((error) => {

        console.error(
            "Session error:",
            error
        );

    });

    // ------------------------------------------------
    // TRACK EVENT
    // ------------------------------------------------

    function trackEvent(type, data = {}) {

        const event = {

            studyId: Number(studyId),

            sessionId,

            type,

            url:
                window.location.href,

            timestamp:
                new Date().toISOString(),

            ...data
        };

        console.log(
            "TRACKED EVENT:",
            event
        );

        fetch(
            `${backendUrl}/api/events`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(event)
            }
        )
        .catch((error) => {

            console.error(
                "Error sending event:",
                error
            );

        });
    }

    // ------------------------------------------------
    // PAGE VIEW
    // ------------------------------------------------

    trackEvent("PAGE_VIEW", {

        screenWidth:
            window.screen.width,

        screenHeight:
            window.screen.height,

        viewportWidth:
            window.innerWidth,

        viewportHeight:
            window.innerHeight

    });

    // ------------------------------------------------
    // CLICK TRACKING
    // ------------------------------------------------

    document.addEventListener(
        "click",
        (event) => {

            const element =
                event.target;

            trackEvent(
                "CLICK",
                {

                    element:
                        element.tagName,

                    text:
                        element.innerText || "",

                    id:
                        element.id || "",

                    className:
                        element.className || "",

                    x:
                        event.pageX,

                    y:
                        event.pageY,

                    pageWidth:
                        document.documentElement
                            .scrollWidth,

                    pageHeight:
                        document.documentElement
                            .scrollHeight

                }
            );

        }
    );

    // ------------------------------------------------
    // SCROLL TRACKING
    // ------------------------------------------------

    const scrollMilestones = [
        25,
        50,
        75,
        100
    ];

    const reachedMilestones =
        new Set();

    function checkScrollDepth() {

        const scrollTop =
            window.scrollY;

        const pageHeight =
            document.documentElement
                .scrollHeight -
            window.innerHeight;

        if (pageHeight <= 0) {
            return;
        }

        const scrollPercent =
            (scrollTop / pageHeight) * 100;

        scrollMilestones.forEach(
            (milestone) => {

                if (
                    scrollPercent >= milestone &&
                    !reachedMilestones.has(
                        milestone
                    )
                ) {

                    reachedMilestones.add(
                        milestone
                    );

                    trackEvent(
                        "SCROLL",
                        {
                            scrollDepth:
                                milestone
                        }
                    );
                }
            }
        );
    }

    window.addEventListener(
        "scroll",
        checkScrollDepth
    );

    console.log(
        "UX Research Tracker initialized."
    );

})();