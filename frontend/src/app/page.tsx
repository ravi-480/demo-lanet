import FaqSection from "./Components/Home/FaqSection/FaqSection";
import FeatureSections from "./Components/Home/FeaturedSection/FeatureSections";
import HeroSection from "./Components/Home/Hero/HeroSection";
import Testimonials from "./Components/Home/Testimonials/Testimonial";

export default function Home() {
  
  return (
    <main className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-grow">
        <HeroSection />
        <div className="w-full h-px bg-gray-800 mx-auto max-w-7xl opacity-50" />
        <FeatureSections />
        <div className="w-full h-px bg-gray-800 mx-auto max-w-7xl opacity-50" />
        <Testimonials />
        <div className="w-full h-px bg-gray-800 mx-auto max-w-7xl opacity-50" />
        <FaqSection />
      </div>
    </main>
  );
}
