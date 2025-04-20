export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <h1 className="text-3xl font-semibold mb-2">Event Not Found</h1>
      <p className="text-muted-foreground">
        We couldn’t find an event with this ID.
      </p>
    </div>
  );
}
