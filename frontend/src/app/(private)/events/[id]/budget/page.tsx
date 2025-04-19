import BudgetManagment from "@/app/Components/Budget/BudgetManagment";

const GuestPage = ({ params }: any) => {
  return (
    <div>
      <BudgetManagment eventId={params.id} />
    </div>
  );
};

export default GuestPage;
