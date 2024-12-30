import SidebarEvent from "./SidebarEvent";

function Sidebar({ weekendsVisible, handleWeekendsToggle, currentEvents }) {
  return (
    <div className="w-64 bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-bold mb-4">Instructions</h2>
      <ul className="list-disc list-inside mb-4 text-gray-600">
        <li>Select dates to create a new event.</li>
        <li>Drag, drop, and resize events.</li>
        <li>Click an event to delete it.</li>
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

export default Sidebar;
