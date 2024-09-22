import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2,
  Chip,
  CircularProgress,
} from "@mui/material";
import { format } from "date-fns";

function Tasks() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/calendar`,
          { withCredentials: true }
        );
        const calendarsWithEvents = response.data;
        const filteredEvents = calendarsWithEvents.flatMap((cal) =>
          cal.events.length > 0 ? cal.events : []
        );

        setEvents(filteredEvents);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch events");
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tasks from Calendar
      </Typography>
      <Grid2 container spacing={3}>
        {events.map((event, index) => (
          <Grid2 item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {event.summary}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {event.description}
                </Typography>
                {event.location && (
                  <Typography variant="body2" paragraph>
                    Location: {event.location}
                  </Typography>
                )}
                <Typography variant="body2">
                  Creator: {event.creator?.email}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`Start: ${format(new Date(event.start.dateTime || event.start.date), "PPp")}`}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    label={`End: ${format(new Date(event.end.dateTime || event.end.date), "PPp")}`}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
}

export default Tasks;
