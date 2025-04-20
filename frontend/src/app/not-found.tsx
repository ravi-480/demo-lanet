export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen text-center">
      <div>
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-gray-600">
          The page you’re looking for doesn’t exist.
        </p>
      </div>
    </div>
  );
}
