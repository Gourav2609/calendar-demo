import React from 'react';

const EventDetails = ({ event }) => {
  if (!event) {
    return <p>Select an event to see details</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-bold">Event Details</h3>
      <p>
        <strong>Title: </strong>{event.title}
      </p>
      <p>
        <strong>Start: </strong>{event.start}
      </p>
      <p>
        <strong>End: </strong>{event.end}
      </p>
      <p>
        <strong>Description: </strong>{event.description}
      </p>
    </div>
  );
};

export default EventDetails;
