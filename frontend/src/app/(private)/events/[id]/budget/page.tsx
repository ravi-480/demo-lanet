import BudgetManagment from "@/app/Components/Budget/BudgetManagment";
const BudgetPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;
  return <BudgetManagment eventId={params.id} />;
};

export default BudgetPage;
