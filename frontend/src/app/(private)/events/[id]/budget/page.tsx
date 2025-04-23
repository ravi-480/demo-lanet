import BudgetManagment from "@/app/Components/Budget/BudgetManagment";
const BudgetPage = ({ params }: { params: { id: string } }) => (
  <BudgetManagment eventId={params.id} />
);

export default BudgetPage;
