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
  Analyze how my day looks like, see which tasks you I prioritize and which ones I should reschedule. Rearrange to give me the optimize schedule in JSON format in descending order base on priority and only return the optimized schedule as JSON and do not return anythign else.
`;

  /*

  */

  try {
    const response = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3.1-70b",
    });
    console.log("Response from LLM:", response.choices[0].message.content);
    res.json({ optimizedSchedule: response.choices[0].message.content });
  } catch (error) {
    console.error("Error calling API:", error);
    res.status(500).send("Error calling API");
  }
});

const processEventsForLLM = (events) => {
  return events.map((event) => {
    return {
      id: event.id, // Keep ID for future reference
      summary: event.summary, // Event title
      description: event.description, // Event description
      creator: event.creator.email, // Event creator
      start: event.start.dateTime || event.start.date, // Start time or all-day event
      end: event.end.dateTime || event.end.date, // End time or all-day event
      location: event.location, // Event location
      sequence: event.sequence, // Event sequence
    };
  });
};

app.get("/test", async (req, res) => {
  try {
    // Step 1: Retrieve data from the /calendar route
    const calendarResponse = await fetch("http://localhost:8000/calendar");
    const calendarsWithEvents = await calendarResponse.json();

    // Step 2: Filter events that have more than 0 events
    const filteredEvents = calendarsWithEvents.flatMap((cal) =>
      cal.events.length > 0 ? cal.events : []
    );

    // Step 3: Process events with the processEventsForLLM function
    const processedEvents = processEventsForLLM(filteredEvents);
    console.log("Processed events:", processedEvents);
    // Step 4: Send the processed events to the /processSchedule route
    const response = await fetch("http://localhost:8000/processSchedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ schedule: processedEvents }),
    });
    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      res.status(response.status).send("Error processing schedule");
    }
  } catch (error) {
    console.error("Error in /test route:", error);
    res.status(500).send("Error in /test route");
  }
});

app.listen(8000, () => console.log("Server running on port 8000"));
