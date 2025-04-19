import GuestManagement from "@/app/Components/Guest/GuestManagement";

const GuestPage = async ({ params }: any) => {
  return (
    <div>
      <GuestManagement eventId={params.id} />
    </div>
  );
};

export default GuestPage;
