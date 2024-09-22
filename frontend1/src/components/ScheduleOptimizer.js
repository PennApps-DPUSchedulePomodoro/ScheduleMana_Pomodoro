import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { format, parseISO } from "date-fns";

function ScheduleOptimizer() {
  const [calendarData, setCalendarData] = useState(null);
  const [optimizedSchedule, setOptimizedSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/calendar`,
        { withCredentials: true }
      );
      setCalendarData(response.data);
    } catch (err) {
      setError("Error fetching calendar data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!calendarData) {
      setError("No calendar data available. Please refresh the page.");
      return;
    }

    setLoading(true);
    setError("");
    setOptimizedSchedule(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/processSchedule`,
        { schedule: calendarData },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // The optimized schedule is already a string, so we need to parse it
      const parsedSchedule = JSON.parse(response.data.optimizedSchedule);
      setOptimizedSchedule(parsedSchedule);
    } catch (err) {
      console.error("Error details:", err);
      setError("Error optimizing schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    try {
      return format(parseISO(dateTimeString), "MMM d, yyyy h:mm a");
    } catch (error) {
      console.error("Error parsing date:", error);
      return dateTimeString; // Return the original string if parsing fails
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Schedule Optimizer
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      ) : (
        <>
          <Button
            onClick={handleOptimize}
            variant="contained"
            color="primary"
            disabled={!calendarData}
            sx={{ mb: 2 }}>
            Optimize Schedule
          </Button>
          {optimizedSchedule && (
            <Paper sx={{ mt: 2, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Optimized Schedule:
              </Typography>
              <List>
                {optimizedSchedule.map((event, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={event.summary}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary">
                              {formatDateTime(event.start)} -{" "}
                              {formatDateTime(event.end)}
                            </Typography>
                            {event.description && (
                              <Typography component="p" variant="body2">
                                {event.description}
                              </Typography>
                            )}
                            {event.location && (
                              <Typography component="p" variant="body2">
                                Location: {event.location}
                              </Typography>
                            )}
                            <Typography component="p" variant="body2">
                              Priority: {event.priority}, Fixed:{" "}
                              {event.fixed ? "Yes" : "No"}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < optimizedSchedule.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}

export default ScheduleOptimizer;
