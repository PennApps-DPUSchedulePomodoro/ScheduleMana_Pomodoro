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
      const parsedSchedule = response.data.optimizedSchedule;
      console.log("Parse Schedule", parsedSchedule);
      setOptimizedSchedule(parsedSchedule);

    } catch (err) {
      console.error("Error details:", err);
      setError("Error optimizing schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
      return format(parseISO(dateTimeString), "MMM d, yyyy h:mm a");
  };

  console.log("Optimize Schedule", optimizedSchedule)
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
                      {optimizedSchedule.map((item, index) => (
                          <React.Fragment key={index}>
                            <ListItem alignItems="flex-start">
                              <ListItemText
                                  primary={<>
                                              <Typography>
                                                {item.summary}
                                                {item.title}
                                              </Typography>
                                          </>
                                  }
                                  secondary={
                                    <>
                                      <Typography
                                          component="span"
                                          variant="body2"
                                          color="text.primary">
                                        {formatDateTime(item.start)} -{" "}
                                        {formatDateTime(item.end)}
                                        {/*{item.start} - {item.end}*/}
                                      </Typography>
                                      {/*<Typography component="p" variant="body2">*/}
                                      {/*  Calendar ID: {item.id}*/}
                                      {/*</Typography>*/}
                                      <Typography component="p" variant="body2">
                                        Priority: {item.priority}
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
