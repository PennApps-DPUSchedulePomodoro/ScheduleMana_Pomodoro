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