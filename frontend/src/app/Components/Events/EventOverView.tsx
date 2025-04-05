import React from "react";
import { IEvent } from "../../../Interface/interface";

const EventOverView = ({ event }: { event: IEvent }) => {
  return (
    <div>
      <div>
        <h1 className="mb-4 text-xl font-bold text-white">Event Description</h1>
        <p className="text-gray-400">
          A beautiful summer wedding celebrating Mark and Sarah's special day.
        </p>
      </div>
      <div className="bg-gray-800 mt-2 rounded-2xl p-4">
        <div className="mb-3">
          <p className="text-blue-600">Guest Summary</p>
        </div>
        <div>
          <div className="flex mb-1 justify-between items-center">
            <h1>Total Invited:</h1> <p>{event.rsvp.total}</p>
          </div>
          <div className="flex mb-1 justify-between items-center">
            <h1>Confirmed:</h1>
            <p className="text-green-700">{event.rsvp.confirmed}</p>
          </div>

          <div className="flex mb-1 justify-between items-center">
            <h1>Pending</h1>
            <p className="text-amber-400">
              {event.rsvp.total - event.rsvp.confirmed}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-green-950 rounded-2xl mt-3 p-4">
        <div className="mb-3">
          <p className="text-green-100">Budget Summary</p>
        </div>
        <div>
          <div className="flex mb-1 justify-between items-center">
            <h1>Total Budget:</h1> <p>120</p>
          </div>
          <div className="flex mb-1 justify-between items-center">
            <h1>Spent:</h1>
            <p>75</p>
          </div>

          <div className="flex mb-1 justify-between items-center">
            <h1>Remainig:</h1>
            <p className="text-blue-500">30</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventOverView;
