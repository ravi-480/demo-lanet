const RenderEventStatusBadge = (status?: string) => {
  if (!status)
    return (
      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
        Unknown
      </span>
    );

  const statusClasses: Record<string, string> = {
    upcoming: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    draft: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        statusClasses[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default RenderEventStatusBadge;
