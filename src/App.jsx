import { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Plus } from "lucide-react";
import Sidebar from "./components/SideBar";
import EventModal from "./components/EventModal";
import EventDetails from "./components/EventDetails"; // Import EventDetails
import { formatDate } from "@fullcalendar/core"; // Import formatDate

const createEventId = () => String(new Date().getTime());

const INITIAL_EVENTS = [
  {
    id: createEventId(),
    title: "Sample Event",
    start: new Date().toISOString(),
  },
];

const MAX_CONCURRENT_EVENTS = 5;

export default function App() {
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
  });
  const [selectedEvent, setSelectedEvent] = useState(null); // Store selected event
  const calendarRef = useRef(null);

  const checkEventLimit = (startTime, excludeEventId = null) => {
    if (!calendarRef.current) return true;

    const calendarApi = calendarRef.current.getApi();
    const events = calendarApi.getEvents();
    const concurrentEvents = events.filter((event) => {
      if (excludeEventId && event.id === excludeEventId) return false;

      const eventStart = new Date(event.start);
      const newEventStart = new Date(startTime);
      return (
        eventStart.getHours() === newEventStart.getHours() &&
        eventStart.getMinutes() === newEventStart.getMinutes() &&
        eventStart.getDate() === newEventStart.getDate() &&
        eventStart.getMonth() === newEventStart.getMonth() &&
        eventStart.getFullYear() === newEventStart.getFullYear()
      );
    });
    return concurrentEvents.length < MAX_CONCURRENT_EVENTS;
  };

  const handleWeekendsToggle = () => {
    setWeekendsVisible(!weekendsVisible);
  };

  const handleDateSelect = (selectInfo) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    setModalData({
      ...modalData,
      date: selectInfo.startStr.split("T")[0],
      startTime: selectInfo.startStr.split("T")[1]?.slice(0, 5) || "09:00",
      endTime: selectInfo.endStr.split("T")[1]?.slice(0, 5) || "10:00",
    });
    setModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEvent({
      title: event.title,
      start: formatDate(event.start, { hour: "2-digit", minute: "2-digit" }), // Format start time
      end: formatDate(event.end, { hour: "2-digit", minute: "2-digit" }), // Format end time
      description: event.extendedProps.description || "No description",
    });
  };

  const handleEventDrop = (dropInfo) => {
    if (!checkEventLimit(dropInfo.event.start, dropInfo.event.id)) {
      alert(
        `Cannot move event. Maximum ${MAX_CONCURRENT_EVENTS} events allowed per time slot.`
      );
      dropInfo.revert();
    }
  };

  const handleEventReceive = (receiveInfo) => {
    if (!checkEventLimit(receiveInfo.event.start)) {
      alert(
        `Cannot add event. Maximum ${MAX_CONCURRENT_EVENTS} events allowed per time slot.`
      );
      receiveInfo.revert();
    }
  };

  const handleEvents = (events) => {
    setCurrentEvents(events);
  };

  const handleManualEventAdd = () => {
    if (
      !modalData.title ||
      !modalData.date ||
      !modalData.startTime ||
      !modalData.endTime
    ) {
      alert("Please fill in all fields");
      return;
    }

    const startDateTime = new Date(`${modalData.date}T${modalData.startTime}`);
    const endDateTime = new Date(`${modalData.date}T${modalData.endTime}`);

    if (endDateTime <= startDateTime) {
      alert("End time must be after start time");
      return;
    }

    if (!checkEventLimit(startDateTime)) {
      alert(
        `Cannot add more than ${MAX_CONCURRENT_EVENTS} events at the same time slot`
      );
      return;
    }

    const calendarApi = calendarRef.current.getApi();

    // console.log("calendarApi", calendarApi);

    calendarApi.addEvent({
      id: createEventId(),
      title: modalData.title,
      start: startDateTime,
      end: endDateTime,
    });
    closeModal();
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData({
      title: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mb-4">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <Plus size={20} />
          Add Event
        </button>
      </div>
      <div className="flex gap-4">
        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right:
                "dayGridMonth,timeGridWeek,timeGridDay,threeDay,fourDay,fiveDay",
            }}
            initialView="timeGridWeek"
            editable
            selectable
            selectMirror
            dayMaxEvents
            allDaySlot={false}
            weekends={weekendsVisible}
            initialEvents={INITIAL_EVENTS}
            select={handleDateSelect}
            eventContent={renderEventContent}
            eventClick={handleEventClick}
            eventsSet={handleEvents}
            eventDrop={handleEventDrop}
            eventReceive={handleEventReceive}
            nowIndicator={true}
            
            height="85vh"
            // slotMinTime="00:00:00"
            // slotDuration="00:15:00"
            contentHeight="auto"
            views={{
              threeDay: {
                type: "timeGrid",
                duration: { days: 3 },
              },
              fourDay: {
                type: "timeGrid",
                duration: { days: 4 },
              },
              fiveDay: {
                type: "timeGrid",
                duration: { days: 5 },
              },
            }}
          />
        </div>
        <div className="w-1/3 bg-white shadow-md rounded-lg p-4">
          {/* Conditionally render EventDetails */}
          <EventDetails event={selectedEvent} />
        </div>
      </div>
      {modalOpen && (
        <EventModal
          modalData={modalData}
          setModalData={setModalData}
          handleModalSubmit={handleManualEventAdd}
          closeModal={closeModal}
        />
      )}
    </div>
  );
}

function renderEventContent(eventInfo) {
  return (
    <div className="">
      <i className="">{eventInfo.event.title}</i>
      {" "}
      <b className="">{eventInfo.timeText}</b>
    </div>
  );
}

