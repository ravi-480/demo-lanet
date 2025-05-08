import dynamic from "next/dynamic";
import Testimonials from "@/app/Components/DashBoard/Testimonial";
import LoadSpinner from "@/app/Components/Shared/LoadSpinner";

const Budget = dynamic(() => import("../../Components/DashBoard/Budget"), {
  loading: () => <LoadSpinner />,
  ssr: true,
});



const DashboardSections = () => {
  return (
    <>
      <Budget />
      <Testimonials />
    </>
  );
};

export default DashboardSections;
