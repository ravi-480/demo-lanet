import GuestManagement from "@/app/Components/Guest/GuestManagement";
type Props = {
  params: { id: string };
};

const GuestPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;
  return (
    <div>
      <GuestManagement eventId={id} />
    </div>
  );
};

export default GuestPage;
