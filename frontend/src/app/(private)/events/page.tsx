"use client";

import AuthGuard from "../../../utils/AuthGuard/AuthGuard";

const EventPage = () => {
  return (
    <AuthGuard>
      <div>
        <h1>Event Page</h1>
        {/* Event details go here */}
      </div>
    </AuthGuard>
  );
};

export default EventPage;
