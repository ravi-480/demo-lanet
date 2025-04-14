import { IEvent } from "../../../Interface/interface";



import MyPieChart from "./EventPieChart";

const EventOverView = ({ event }: { event: IEvent }) => {

  const { budget = { allocated: 0, spent: 0 }, rsvp } = event;
  const remaining = budget.allocated - budget.spent;
  return (
    <div>
      <MyPieChart event={event} />
      <section className="bg-gray-800 mt-20 rounded-2xl p-4">
        <p className="text-blue-600 mb-3">Guest Summary</p>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span>Total Invited:</span> <span>{rsvp.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Confirmed:</span>{" "}
            <span className="text-green-700">{rsvp.confirmed}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Pending:</span>{" "}
            <span className="text-amber-400">
              {rsvp.total - rsvp.confirmed}
            </span>
          </div>
        </div>
      </section>

      {/* Budget Summary */}
      <section className="bg-green-950 rounded-2xl mt-3 p-4">
        <p className="text-green-100 mb-3">Budget Summary</p>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span>Total Budget:</span>{" "}
            <span>₹{budget.allocated.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Spent:</span> <span>₹{budget.spent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Remaining:</span>{" "}
            <span className="text-blue-500">₹{remaining.toLocaleString()}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventOverView;
