require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

app.get("/auth/google", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: "https://www.googleapis.com/auth/calendar",
    });
    res.redirect(url);
});

app.get("/auth/token", async (req, res) => {
    const code = req.query.code;
    oauth2Client.getToken(code, (err, token) => {
        if (err) {
            console.error("Error retrieving access token", err);
            return res.status(500).send("Error retrieving access token");
        }
        console.log(token);
        oauth2Client.setCredentials(token);
        res.json(token);
    });
});

app.get("/redirect", async (req, res) => {
    const code = req.query.code;
    oauth2Client.getToken(code, (err, token) => {
        if (err) {
            console.error("Error retrieving access token", err);
            return res.status(500).send("Error retrieving access token");
        }
        console.log(token);
        oauth2Client.setCredentials(token);

        // Redirect to the frontend with a success message (you can customize the URL as needed)
        res.redirect("http://localhost:3000/main?authenticated=true");
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

app.patch("/updateEvent/:eventId", async (req, res) => {
    const { eventId } = req.params;
    const { priority, is_fixed } = req.body;

    // Determine the color based on priority
    let color;
    switch (priority) {
        case "high":
            color = "red"; // Red for high priority
            break;
        case "medium":
            color = "yellow"; // Yellow for medium priority
            break;
        case "low":
            color = "gray"; // Gray for low priority
            break;
        default:
            color = ""; // Default if priority is not recognized
            break;
    }

    // Prepare the updated event data
    const updatedEvent = {
        colorId: color,
        summary: req.body.summary
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

app.listen(8000, () => console.log("Server running on port 8000"));