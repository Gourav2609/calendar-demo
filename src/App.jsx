import { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { formatDate } from "@fullcalendar/core";
import { Plus } from "lucide-react";

// Utility functions for event handling
const createEventId = () => String(new Date().getTime());

const INITIAL_EVENTS = [
  {
    id: createEventId(),
    title: 'Sample Event',
    start: new Date().toISOString(),
  }
];

const MAX_CONCURRENT_EVENTS = 5;

export default function App() {
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "10:00"
  });
  const calendarRef = useRef(null);

  const checkEventLimit = (startTime, excludeEventId = null) => {
    if (!calendarRef.current) return true;
    
    const calendarApi = calendarRef.current.getApi();
    const events = calendarApi.getEvents();
    const concurrentEvents = events.filter(event => {
      if (excludeEventId && event.id === excludeEventId) return false;
      
      const eventStart = new Date(event.start);
      const newEventStart = new Date(startTime);
      return eventStart.getHours() === newEventStart.getHours() &&
             eventStart.getMinutes() === newEventStart.getMinutes() &&
             eventStart.getDate() === newEventStart.getDate() &&
             eventStart.getMonth() === newEventStart.getMonth() &&
             eventStart.getFullYear() === newEventStart.getFullYear();
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
      date: selectInfo.startStr.split('T')[0],
      startTime: selectInfo.startStr.split('T')[1]?.slice(0, 5) || "09:00",
      endTime: selectInfo.endStr.split('T')[1]?.slice(0, 5) || "10:00"
    });
    setModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'?`)) {
      clickInfo.event.remove();
    }
  };

  const handleEventDrop = (dropInfo) => {
    if (!checkEventLimit(dropInfo.event.start, dropInfo.event.id)) {
      alert(`Cannot move event. Maximum ${MAX_CONCURRENT_EVENTS} events allowed per time slot.`);
      dropInfo.revert();
    }
  };

  const handleEventReceive = (receiveInfo) => {
    if (!checkEventLimit(receiveInfo.event.start)) {
      alert(`Cannot add event. Maximum ${MAX_CONCURRENT_EVENTS} events allowed per time slot.`);
      receiveInfo.revert();
    }
  };

  const handleEvents = (events) => {
    setCurrentEvents(events);
  };

  const handleManualEventAdd = () => {
    if (!modalData.title || !modalData.date || !modalData.startTime || !modalData.endTime) {
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
      alert(`Cannot add more than ${MAX_CONCURRENT_EVENTS} events at the same time slot`);
      return;
    }

    const calendarApi = calendarRef.current.getApi();
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
      date: new Date().toISOString().split('T')[0],
      startTime: "09:00",
      endTime: "10:00"
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
        <Sidebar
          weekendsVisible={weekendsVisible}
          handleWeekendsToggle={handleWeekendsToggle}
          currentEvents={currentEvents}
        />
        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="timeGridWeek"
            editable
            selectable
            selectMirror
            dayMaxEvents
            weekends={weekendsVisible}
            initialEvents={INITIAL_EVENTS}
            select={handleDateSelect}
            eventContent={renderEventContent}
            eventClick={handleEventClick}
            eventsSet={handleEvents}
            eventDrop={handleEventDrop}
            eventReceive={handleEventReceive}
            nowIndicator={true}
            slotMinTime="06:00:00"
            slotMaxTime="21:00:00"
            scrollTime="08:00:00"
            height="80vh"
          />
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

function Sidebar({ weekendsVisible, handleWeekendsToggle, currentEvents }) {
  return (
    <div className="w-64 bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-bold mb-4">Instructions</h2>
      <ul className="list-disc list-inside mb-4 text-gray-600">
        <li>Select dates to create events</li>
        <li>Drag and drop to move events</li>
        <li>Click event to delete</li>
      </ul>
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="mr-2"
            checked={weekendsVisible}
            onChange={handleWeekendsToggle}
          />
          <span className="text-gray-700">Toggle weekends</span>
        </label>
      </div>
      <h2 className="text-lg font-bold mb-2">All Events ({currentEvents.length})</h2>
      <ul className="text-gray-600 space-y-1">
        {currentEvents.map((event) => (
          <SidebarEvent key={event.id} event={event} />
        ))}
      </ul>
    </div>
  );
}

function SidebarEvent({ event }) {
  return (
    <li>
      <b>{formatDate(event.start, { year: "numeric", month: "short", day: "numeric" })}</b>
      <i className="ml-2">{event.title}</i>
    </li>
  );
}

function renderEventContent(eventInfo) {
  return (
    <div>
      <b>{eventInfo.timeText}</b>
      <i className="ml-1">{eventInfo.event.title}</i>
    </div>
  );
}

function EventModal({ modalData, setModalData, handleModalSubmit, closeModal }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Create Event</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={modalData.title}
              onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Event title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={modalData.date}
              onChange={(e) => setModalData({ ...modalData, date: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              value={modalData.startTime}
              onChange={(e) => setModalData({ ...modalData, startTime: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              value={modalData.endTime}
              onChange={(e) => setModalData({ ...modalData, endTime: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleModalSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}