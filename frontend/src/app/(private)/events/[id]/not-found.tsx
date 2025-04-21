export default function EventNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
      <p className="text-gray-600 mb-6">
        The event you're looking for doesn't exist or has been removed.
      </p>
      <a href="/events" className="text-blue-600 hover:underline">
        Browse all events
      </a>
    </div>
  );
}
