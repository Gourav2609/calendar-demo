// Event Utilities

let eventGuid = 0;
const todayStr = new Date().toISOString().split('T')[0]; // Extract YYYY-MM-DD format

/**
 * Initial set of events for the calendar
 */
export const INITIAL_EVENTS = [
  {
    id: createEventId(),
    title: 'All-day event',
    start: todayStr, // All day event starting today
  },
  {
    id: createEventId(),
    title: 'Timed event',
    start: `${todayStr}T12:00:00`, // Timed event at 12:00 PM today
  },
];

/**
 * Generates a unique event ID
 * @returns {string} A unique string ID for an event
 */
export function createEventId() {
  return String(eventGuid++);
}

/**
 * Utility to generate default events programmatically
 * @param {number} count - Number of events to generate
 * @returns {Array} Array of event objects
 */
export function generateDefaultEvents(count = 5) {
  const events = [];
  for (let i = 0; i < count; i++) {
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + i); // Spread events across days
    events.push({
      id: createEventId(),
      title: `Generated Event ${i + 1}`,
      start: eventDate.toISOString(),
    });
  }
  return events;
}
