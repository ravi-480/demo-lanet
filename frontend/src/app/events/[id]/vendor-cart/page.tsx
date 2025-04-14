
import VendorsDetail from "../../../Components/Events/VendorDetail";

const VendorPAge = async ({ params }: any) => {
  const eventId = await params.id;

  return (
    <div className="p-4">
      <VendorsDetail eventId={eventId} />
    </div>
  );
};

export default VendorPAge;
