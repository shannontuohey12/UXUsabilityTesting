# Lab Notes
### Research & Links
- https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Safely_inserting_external_content_into_a_page

### Progress (as of 9/8)
I developed a tracking script (`tracker.js`) that collects user interaction data such as clicks, page views, scrolling behavior, and navigation. I initially tested the script locally on my own websites and verified that it could successfully track interactions. I then tested the script on a separate website from the application where it was originally developed. This demonstrated that the tracker could be injected into and run on an external website rather than being limited to the application it was created for.

Building on this, I developed a Chrome browser extension that allows a user to enter a target website and inject the tracking script into that site. I successfully tested the extension on both a basic external website and my personal Wix portfolio, where the tracker was able to detect real user interactions, including clicks, scrolling, and navigation between pages. This was an important proof of concept for the project, as it demonstrated that the platform can potentially collect usability data from websites without requiring the researcher to modify the website's source code.

The next step is to connect the tracking extension to the backend so that collected events can be sent to and stored by the application. 
