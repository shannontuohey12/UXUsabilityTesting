# UX Research & Usability Testing Platform
### Project Overview 
I propose to develop a full-stack web application that allows UX designers, researchers, and developers to conduct usability studies on websites and analyze participant behavior. The platform will allow a researcher to create a study, provide a website URL, define tasks for participants to complete, distribute a unique testing link, and collect interaction data throughout the study. Researchers will then be able to view the collected data through an analytics dashboard designed to identify usability problems and patterns in user behavior.

The goal of this project is to combine software engineering, usability testing, and accessibility design – three of my main passions. As an aspiring UX Designer/Researcher, I wanted to create something that I could imagine myself using and helping out in the design process. 

This is particularly relevant to me because I recently completed a summer internship at Canon USA where I was a UX/UI Design Intern. There, we used applications such as ContentSquare which allowed us to see data and analytics about the user’s experience on a website. However, something like ContentSquare is embedded with the business, is a major cost factor, and requires a considerable amount of traffic on the website to be accurate. This gave me the idea for this project, which makes user testing more accessible to startups and allows direct interaction with each participant. 

### System Functionality 
 This project will include two primary types of users – Researchers and Participants. 
Researchers can
- Create and manage an account 
- Create a usability study 
- Add URL of their website to test
- Add tasks for participants 
- Generate a unique URL for participants
- Monitor study participation
- View summary of usability data 
- View specific user sessions
- Compare results

Participants can
- Access unique URL to test website
- Be presented with tasks from researcher 
- Give feedback

While participants are using the URL provided by the researcher, certain information will be tracked such as:
- Number of clicks
- Time spent on page/ session duration
- Rage clicks
- Task completion or abandonment 
- Participant responses to post-task questions/feedback

### Technical Architecture 
I will use a MVC (Model-View-Controller) architecture for this application.
Model - Database
MySQL, a relational database, will be used to store information. Entities include:
- Researcher
Participant
Study
Website
Task
Session
Event
Feedback

View - Frontend
The frontend will provide separate dashboards for Researchers and Participants. For researchers, they will have a more data-driven dashboard where they can view analytics regarding their tests. There will be a section to create a new test as well. 
For participants, they will have a simple interface with tasks displayed and the embedded website to test. They will also have a feedback section for any written responses. 
HTML/CSS/JavaScript
React 
Figma to design screens
Controller - Backend
The backend will be developed using JavaScript, Node.js, and Express.js. The Express server will receive requests from the frontend, process the logic, communicate with the database, and return the requested information to the frontend.
The backend will be responsible for:
Authentication and authorization
Study management
Task management
Participant sessions
Event collection
Data processing
Analytics calculations
Communication with the database

