import dynamic from "next/dynamic";
import LoadingSpinner from "@/app/Components/Loader/LoadingSpinner";

// Dynamically import Budget and Testimonials components
const Budget = dynamic(() => import("../../Components/DashBoard/Budget"), {
  loading: () => <LoadingSpinner />,
  ssr: true,
});

const Testimonials = dynamic(
  () => import("../../Components/DashBoard/Testimonial"),
  {
    loading: () => <LoadingSpinner />,
    ssr: true,
  }
);

const DashboardSections = () => {
  return (
    <>
      <Budget />
      <Testimonials />
    </>
  );
};

export default DashboardSections;
