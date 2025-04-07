import FaqSection from "./Components/Home/FaqSection/FaqSection";
import FeatureSections2 from "./Components/Home/Feature2/FeatureSection2";
import FeatureSections from "./Components/Home/FeaturedSection/FeatureSections";
import HeroSection from "./Components/Home/Hero/HeroSection";
import Testimonials from "./Components/Home/Testimonials/Testimonial";

export default function Home() {
  "use client";

  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeatureSections />
      <Testimonials />
      <FeatureSections2 />
      <FaqSection />
    </main>
  );
}
