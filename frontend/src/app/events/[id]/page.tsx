import EventHeader from "@/app/Components/Events/EventHeader";
import React from "react";
import EventTabs from '../../Components/Events/EventTabComponent';

const EventDetail = () => {
  return (
    <div className="p-5 ">
      <EventHeader />
      <EventTabs />
    </div>
  );
};

export default EventDetail;
