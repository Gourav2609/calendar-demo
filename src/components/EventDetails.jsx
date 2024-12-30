import React from "react";

export default function EventDetails({ event, onClose }) {
  if (!event) return null;

  return (
    <div
      className="bg-gray-50 p-4 rounded-lg shadow-lg transform transition-transform scale-100 hover:scale-105 relative"
    >
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={onClose}
      >
        &times;
      </button>
      <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
      <p className="text-sm text-gray-700 mb-1">
        <strong>Start:</strong> {event.start}
      </p>
      <p className="text-sm text-gray-700 mb-1">
        <strong>End:</strong> {event.end}
      </p>
      <p className="text-sm text-gray-700">
        <strong>Description:</strong> {event.description}
      </p>
    </div>
  );
}
