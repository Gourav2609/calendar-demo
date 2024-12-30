import { formatDate } from "@fullcalendar/core";

function SidebarEvent({ event }) {
  return (
    <li>
      <b>{formatDate(event.start, { year: "numeric", month: "short", day: "numeric" })}</b>{" "}
      <i>{event.title}</i>
    </li>
  );
}

export default SidebarEvent;
