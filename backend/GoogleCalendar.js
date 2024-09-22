require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const Cerebras = require("@cerebras/cerebras_cloud_sdk");
const { json } = require("sequelize");

const seedData = require("./seedDataSchedule.json");


const app = express();


app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

app.get("/auth", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: "https://www.googleapis.com/auth/calendar",
    });
    res.redirect(url);
});

app.get("/redirect", async (req, res) => {
    const code = req.query.code;
    oauth2Client.getToken(code, (err, token) => {
        if (err) {
            console.error("Error retrieving access token", err);
            return res.status(500).send("Error retrieving access token");
        }
        oauth2Client.setCredentials(token);

        // Redirect to the frontend with a success message (you can customize the URL as needed)
        res.redirect("http://localhost:3000?authenticated=true");
    });
});

app.get("/calendar", async (req, res) => {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Get the start and end of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // Set to midnight
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999); // Set to the end of the day

    try {
        const calendarList = await calendar.calendarList.list();
        const calendars = calendarList.data.items;

        const eventsPromises = calendars.map(async (cal) => {
            const events = await calendar.events.list({
                calendarId: cal.id,
                timeMin: startOfToday.toISOString(),
                timeMax: endOfToday.toISOString(),
                singleEvents: true,
                orderBy: "startTime",
            });
            return {
                calendar: cal,
                events: events.data.items,
            };
        });

        const calendarsWithEvents = await Promise.all(eventsPromises);
        res.json(calendarsWithEvents);
    } catch (err) {
        console.error("Error retrieving calendars or events: ", err);
        res.status(500).send("Error retrieving calendars or events");
    }
});

app.patch("/updateEvent", async (req, res) => {
    const { eventId, priority, is_fixed, summary } = req.body;

    // Determine the color based on priority
    let colorId;
    switch (priority) {
        case "high":
            colorId = "2"; // Change to appropriate Google Calendar color ID for red
            break;
        case "medium":
            colorId = "4"; // Change to appropriate Google Calendar color ID for yellow
            break;
        case "low":
            colorId = "8"; // Change to appropriate Google Calendar color ID for gray
            break;
        default:
            colorId = ""; // Default if priority is not recognized
            break;
    }

    // Prepare the updated event data
    const updatedEvent = {
        colorId,
        summary: is_fixed ? {summary} : summary,
    };

    try {
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        await calendar.events.patch({
            calendarId: "primary",
            eventId,
            requestBody: updatedEvent,
        });
        res.status(200).send("Event updated successfully");
    } catch (err) {
        console.error("Error updating event:", err);
        res.status(500).send("Error updating event");
    }
});

app.get("/events", async (req, res) => {
    const calendarId = req.query.calendarId ?? "primary";
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    calendar.events.list(
        {
            calendarId,
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: "startTime",
        },
        (err, response) => {
            if (err) {
                console.error("The API returned an error: ", err);
                res.send("The API returned an error");
                return;
            }
            const events = response.data.items;
            res.json(events);
        }
    );
});

const client = new Cerebras({
    apiKey: process.env["CEREBRAS_API_KEY"],
});

// Process schedule with OpenAI
app.post("/processSchedule", async (req, res) => {
    const { schedule } = req.body;

    if (!schedule) {
        return res.status(400).send("Schedule data is required");
    }

    const prompt = `
  Given my schedule for the day looks like this in JSON format:
  ${JSON.stringify(schedule)}
  Rearrange to give me the optimize schedule in JSON format base on the rules below and do not return any other thing than the optimized schedule.

  Priority System
  Events categorized by:
  1. Priority: High, Medium, Low
  2. Fixedness: Fixed, Non-fixed
  3. Priority order (highest to lowest):
  4. High priority + Fixed
  5. High priority (non-fixed)
  6. Medium priority + Fixed
  7. Medium priority (non-fixed)
  8. Low priority + Fixed
  9. Low priority (non-fixed)

  Key Concepts
  Fixed events: Cannot be moved
  Non-fixed events: Can be rescheduled
  Overlap handling: Lower priority events adjusted or split

  Algorithm Steps
  1. Sort events by priority and start time
  2. Place fixed events
  3. Place high and medium priority non-fixed events
  4. Handle low priority events (split if necessary)
  5. Fill gaps with unscheduled events
  6. Final optimization
  
  Conflict Resolution
  High priority events never removed/split
  Same priority conflicts: Fixed takes precedence, earlier event if both non-fixed
  
  Edge Cases
  Completely overlapped events may be removed
  Back-to-back events allowed
  Long events may be split across days
  
  Output
  Optimized schedule with all high/medium priority events and fitting low priority events, ordered by scheduled time.
  This algorithm maximizes time utilization while respecting priorities and preserving higher priority events.`;

    /*

    */

    try {
        const response = await client.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama3.1-70b",
        });
        console.log("Response from OpenAI:", response.choices[0].message.content);
        res.json(response);
    } catch (error) {
        console.error("Error calling API:", error);
        res.status(500).send("Error calling API");
    }
});

app.listen(8000, () => console.log("Server running on port 8000"));